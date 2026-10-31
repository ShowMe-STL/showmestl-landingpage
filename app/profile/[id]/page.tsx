import { SharedContentPage, sharedContentMetadata, type SharedContentPageProps } from '@/app/components/shared-content-page'
export const generateMetadata = (props: SharedContentPageProps) => sharedContentMetadata('profile', props)
export default function ProfileLink(props: SharedContentPageProps) { return <SharedContentPage kind="profile" {...props} /> }
