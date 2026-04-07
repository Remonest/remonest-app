import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Session, User } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

export interface SupabaseMiddlewareResult {
  response: NextResponse;
  user: User | null;
  session: Session | null;
}

export async function updateSession(
  request: NextRequest,
): Promise<SupabaseMiddlewareResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
    );
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refresh the session — Supabase will issue new cookies if the
  // access token has expired and a valid refresh token exists.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get the current user (validates the session server-side).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user, session };
}
