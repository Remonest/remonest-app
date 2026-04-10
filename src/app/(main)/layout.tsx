import { Header, Footer } from "@/components/landing";
import { TranslationProvider } from "@/lib/translations";
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
    return (
      <TranslationProvider>
        <div className="flex flex-col flex-1 bg-background">{children}</div>
      </TranslationProvider>
    );
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Authenticated user — show content with footer
  if (user) {
    return (
      <TranslationProvider>
        <div className="flex flex-col flex-1 bg-background">
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </TranslationProvider>
    );
  }

  // Unauthenticated — show landing layout
  return (
    <TranslationProvider>
      <div className="flex flex-col flex-1 bg-background">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </TranslationProvider>
  );
}
