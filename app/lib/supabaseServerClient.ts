import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function getServerUser() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper to check if user is authenticated
export async function isAuthenticated() {
  const user = await getServerUser()
  return !!user
}

// Helper to get user ID
export async function getUserId() {
  const user = await getServerUser()
  return user?.id
} 