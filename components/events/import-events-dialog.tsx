'use client'

import { useState, useTransition, useRef, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Upload, FileJson, FileSpreadsheet, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  parseImportFile,
  validateImportEvents,
  importEvents,
  generateCSVTemplate,
  generateJSONTemplate,
  type ValidatedEvent,
} from '@/lib/actions/import-events'

type Step = 'upload' | 'preview' | 'importing' | 'complete'

export function ImportEventsDialog({
  open,
  onOpenChange,
  onImported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: () => void
}) {
  const [step, setStep] = useState<Step>('upload')
  const [validatedEvents, setValidatedEvents] = useState<ValidatedEvent[]>([])
  const [parseErrors, setParseErrors] = useState<{ row: number; error: string }[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [geocodeMissing, setGeocodeMissing] = useState(false)
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const [isParsing, startParsing] = useTransition()
  const [isImporting, startImporting] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function reset() {
    setStep('upload')
    setValidatedEvents([])
    setParseErrors([])
    setSkipDuplicates(true)
    setGeocodeMissing(false)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset()
    onOpenChange(open)
  }

  async function downloadTemplate(format: 'csv' | 'json') {
    const content = format === 'csv' ? await generateCSVTemplate() : await generateJSONTemplate()
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = format === 'csv' ? 'events-template.csv' : 'events-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const format = file.name.endsWith('.json') ? 'json' : 'csv'

    startParsing(async () => {
      try {
        const text = await file.text()
        const parsed = await parseImportFile(text, format)

        setParseErrors(parsed.errors)

        if (parsed.events.length === 0) {
          toast.error('No valid events found in file')
          return
        }

        const validated = await validateImportEvents(parsed.events)
        setValidatedEvents(validated)
        setStep('preview')
      } catch (err) {
        toast.error('Failed to parse file')
        console.error(err)
      }
    })
  }

  function handleImport() {
    startImporting(async () => {
      setStep('importing')
      try {
        const result = await importEvents(validatedEvents, {
          skipDuplicates,
          geocodeMissing,
        })
        setImportResult(result)
        setStep('complete')

        if (result.imported > 0) {
          onImported()
        }
      } catch (err) {
        toast.error('Import failed')
        console.error(err)
        setStep('preview')
      }
    })
  }

  const validCount = validatedEvents.filter(e => e.status === 'valid').length
  const duplicateCount = validatedEvents.filter(e => e.status === 'duplicate').length
  const errorCount = validatedEvents.filter(e => e.status === 'error').length

  const willImport = skipDuplicates ? validCount : validCount + duplicateCount

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Events</DialogTitle>
          <DialogDescription>
            Upload a CSV or JSON file to bulk import events.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="space-y-6 py-4">
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate('csv')}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Download CSV template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTemplate('json')}
                className="gap-2"
              >
                <FileJson className="h-4 w-4" />
                Download JSON template
              </Button>
            </div>

            <div className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 p-8">
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                Drop a CSV or JSON file here, or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isParsing}
              />
              <Button variant="secondary" disabled={isParsing}>
                {isParsing ? 'Processing…' : 'Select file'}
              </Button>
            </div>

            <div className="rounded-lg bg-white/5 p-4 text-sm text-muted-foreground">
              <p className="mb-2 font-medium text-foreground">Supported fields:</p>
              <p>
                <span className="text-foreground">Required:</span> title, start_time
              </p>
              <p>
                <span className="text-foreground">Optional:</span> end_time, venue_name, address, website,
                image_url, image_thumb_url, categories, neighborhood, dress_code, description
              </p>
              <p className="mt-2">
                Categories can be separated by semicolon or pipe (e.g., &quot;Music;Concerts&quot;)
              </p>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 rounded-md bg-green-500/20 px-3 py-1.5 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{validCount} valid</span>
              </div>
              {duplicateCount > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-yellow-500/20 px-3 py-1.5 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{duplicateCount} duplicates</span>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-2 rounded-md bg-red-500/20 px-3 py-1.5 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{errorCount} errors</span>
                </div>
              )}
            </div>

            {parseErrors.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="mb-2 text-sm font-medium text-red-500">Parse errors:</p>
                <ul className="space-y-1 text-sm text-red-400">
                  {parseErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>Row {err.row}: {err.error}</li>
                  ))}
                  {parseErrors.length > 5 && (
                    <li>…and {parseErrors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto rounded-lg border bg-background">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="w-12 px-3 py-2 text-left">Row</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Title</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {validatedEvents.map((event) => (
                    <tr key={event.rowIndex} className="border-t border-border/50">
                      <td className="px-3 py-2 text-muted-foreground">{event.rowIndex}</td>
                      <td className="px-3 py-2">
                        {event.status === 'valid' && (
                          <span className="flex items-center gap-1.5 text-green-500">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Valid
                          </span>
                        )}
                        {event.status === 'duplicate' && (
                          <span className="flex items-center gap-1.5 text-yellow-500" title={`Duplicate of: ${event.duplicateOf?.title}`}>
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Duplicate
                          </span>
                        )}
                        {event.status === 'error' && (
                          <span className="flex items-center gap-1.5 text-red-500" title={event.error}>
                            <AlertCircle className="h-3.5 w-3.5" />
                            Error
                          </span>
                        )}
                      </td>
                      <td className="max-w-48 truncate px-3 py-2">{event.input.title}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {new Date(event.input.start_time).toLocaleDateString()}
                      </td>
                      <td className="max-w-32 truncate px-3 py-2 text-muted-foreground">
                        {event.input.venue_name || event.input.address || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 rounded-lg border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="skip-duplicates"
                  checked={skipDuplicates}
                  onCheckedChange={(checked) => setSkipDuplicates(checked === true)}
                />
                <Label htmlFor="skip-duplicates" className="cursor-pointer">
                  Skip duplicates (same title + date + venue)
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="geocode-missing"
                  checked={geocodeMissing}
                  onCheckedChange={(checked) => setGeocodeMissing(checked === true)}
                />
                <Label htmlFor="geocode-missing" className="cursor-pointer">
                  Auto-geocode addresses without coordinates
                </Label>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {willImport} event{willImport !== 1 ? 's' : ''} will be imported.
            </p>
          </div>
        )}

        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Importing events…</p>
          </div>
        )}

        {step === 'complete' && importResult && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center rounded-lg bg-green-500/10 p-6 text-center">
              <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
              <p className="text-lg font-medium">Import complete!</p>
              <p className="text-muted-foreground">
                {importResult.imported} event{importResult.imported !== 1 ? 's' : ''} imported
                {importResult.skipped > 0 && `, ${importResult.skipped} skipped`}
              </p>
            </div>

            {importResult.errors.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="mb-2 text-sm font-medium text-red-500">Import errors:</p>
                <ul className="space-y-1 text-sm text-red-400">
                  {importResult.errors.slice(0, 10).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {importResult.errors.length > 10 && (
                    <li>…and {importResult.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="ghost" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === 'preview' && (
            <>
              <Button variant="ghost" onClick={reset}>
                Start over
              </Button>
              <Button onClick={handleImport} disabled={willImport === 0 || isImporting}>
                Import {willImport} event{willImport !== 1 ? 's' : ''}
              </Button>
            </>
          )}
          {step === 'complete' && (
            <Button onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
