import { createClient } from "@supabase/supabase-js"
import { useSession } from "@clerk/nextjs"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export function getSupabaseClient() {
  const { session } = useSession()
  
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({
          template: "supabase"
        })
        
        const headers = new Headers(options?.headers)
        headers.set("Authorization", `Bearer ${clerkToken}`)
        
        return fetch(url, {
          ...options,
          headers,
        })
      },
    },
  })
}

// For non-authenticated routes or server-side operations
export const supabase = createClient(supabaseUrl, supabaseKey)

