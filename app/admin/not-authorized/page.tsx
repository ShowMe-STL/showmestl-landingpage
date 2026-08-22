import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotAuthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold">Not authorized</h1>
      <p className="max-w-sm text-white/50">
        Your account is signed in but isn&apos;t on the ShowMeSTL moderator list. Ask an
        existing team admin to add you.
      </p>
      <Button render={<Link href="/admin/login" />}>Back to sign in</Button>
    </div>
  )
}
