'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { setTrending, type TrendingTargetType } from '@/lib/actions/trending'

export function TrendingSwitch({
  targetType,
  targetId,
  initialEnabled,
}: {
  targetType: TrendingTargetType
  targetId: number
  initialEnabled: boolean
}) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    setEnabled(next)
    startTransition(async () => {
      const result = await setTrending(targetType, targetId, next)
      if (result?.error) {
        setEnabled(!next)
        toast.error(result.error)
      }
    })
  }

  return (
    <Switch
      checked={enabled}
      disabled={isPending}
      onCheckedChange={handleChange}
      aria-label="Trending on Home"
    />
  )
}
