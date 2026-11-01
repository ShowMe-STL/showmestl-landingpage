// Public signing identities, not credentials. Scope association narrowly so
// ordinary landing-page links continue opening on the website.
import { appLinkAssociation } from '@/lib/app-link-association.mjs'
export const dynamic = 'force-static'

export function GET() {
  return Response.json(appLinkAssociation, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
