// Public signing identities, not credentials. Scope association narrowly so
// ordinary landing-page links continue opening on the website.
export const dynamic = 'force-static'

export function GET() {
  return Response.json({
    applinks: {
      details: [{
        appIDs: [
          'BPWVXN85FK.com.showmestl.app',
          '23K7BSC7Q8.com.showmestl.mobilev2',
        ],
        components: [{
          '/': '/check-in',
          '?': { placeId: '?*' },
          comment: 'ShowMe physical-place check-in links; validate the ID in the app.',
        }, {
          '/': '/raffle/omen',
          comment: 'Omen Coffee raffle visit; verify proximity before saving in the app.',
        }],
      }],
    },
  }, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
