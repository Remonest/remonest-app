import { Header, Footer } from "@/components/landing";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase is not configured (e.g. during build), render without header/footer
  if (!supabaseUrl || !supabaseAnonKey) {
    return <div className="flex flex-col flex-1 bg-background">{children}</div>;
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated user — don't show landing header/footer (dashboard has its own)
  if (user) {
    return <div className="flex flex-col flex-1 bg-background">{children}</div>;
  }

  // Unauthenticated — show landing layout
  return (
    <div className="flex flex-col flex-1 bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
