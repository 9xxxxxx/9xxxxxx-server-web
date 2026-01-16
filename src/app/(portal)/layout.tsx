import { Navbar } from "@/components/Navbar";
import { getSiteConfig } from "@/lib/site-config";

// User said "don't split screen".
// Let's keep SocialSidebar for now as it's nice, but remove RightNav.

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-primary/20">
      <Navbar config={config} />

      <main className="pt-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
