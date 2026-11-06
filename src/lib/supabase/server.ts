import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createLocalClient } from "./local-adapter";
import { verifySessionToken } from "./session";

export async function createClient(): Promise<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const cookieStore = await cookies();

  if (url.includes("placeholder") || !url.startsWith("http")) {
    let currentUser: any = null;
    const sessionCookie = cookieStore.get("kadeo_session");
    if (sessionCookie?.value) {
      currentUser = await verifySessionToken(sessionCookie.value);
    }

    return createLocalClient(currentUser, (name, val) => {
      try {
        if (!val) {
          cookieStore.delete(name);
        } else {
          cookieStore.set(name, val, { path: "/", httpOnly: true });
        }
      } catch {}
    });
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The setAll method was called from a Server Component.
          }
        },
      },
    }
  );
}
