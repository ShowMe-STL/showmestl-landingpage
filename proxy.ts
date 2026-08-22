import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/not-authorized']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => path.startsWith(p))

  if (!user && !isPublicAdminPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublicAdminPath) {
    // moderators has a self-select-only RLS policy, so this checks the
    // signed-in user's own row and nothing else.
    const { data: moderator } = await supabase
      .from('moderators')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!moderator) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/not-authorized'
      return NextResponse.redirect(url)
    }
  }

  if (user && path === '/admin/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
