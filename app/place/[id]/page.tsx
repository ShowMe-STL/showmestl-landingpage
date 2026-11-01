import { SharedContentPage, sharedContentMetadata, type SharedContentPageProps } from '@/app/components/shared-content-page'

export const revalidate = 300
export const generateMetadata = (props: SharedContentPageProps) => sharedContentMetadata('place', props)
export default function PlaceLink(props: SharedContentPageProps) { return <SharedContentPage kind="place" {...props} /> }
