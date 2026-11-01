import { SharedContentPage, sharedContentMetadata, type SharedContentPageProps } from '@/app/components/shared-content-page'
export const generateMetadata = (props: SharedContentPageProps) => sharedContentMetadata('event', props)
export default function EventLink(props: SharedContentPageProps) { return <SharedContentPage kind="event" {...props} /> }
