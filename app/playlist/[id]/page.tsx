import { SharedContentPage, sharedContentMetadata, type SharedContentPageProps } from '@/app/components/shared-content-page'
export const generateMetadata = (props: SharedContentPageProps) => sharedContentMetadata('playlist', props)
export default function PlaylistLink(props: SharedContentPageProps) { return <SharedContentPage kind="playlist" {...props} /> }
