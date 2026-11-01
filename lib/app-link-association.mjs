// Public production/development signing identities; preserve the existing NFC
// routes while adding only the four explicit content-sharing path families.
export const appLinkAssociation = {
  applinks: {
    details: [{
      appIDs: [
        'BPWVXN85FK.com.showmestl.app',
        '23K7BSC7Q8.com.showmestl.mobilev2',
      ],
      components: [
        { '/': '/check-in', '?': { placeId: '?*' } },
        { '/': '/raffle/omen' },
        ...['profile', 'place', 'event', 'playlist'].map(kind => ({ '/': `/${kind}/*` })),
      ],
    }],
  },
}
