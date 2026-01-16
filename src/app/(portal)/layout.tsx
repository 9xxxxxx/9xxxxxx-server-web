import { Navbar } from "@/components/Navbar";
// Removed getSiteConfig to avoid build-time DB dependency
// import { getSiteConfig } from "@/lib/site-config";

// User said "don't split screen".
// Let's keep SocialSidebar for now as it's nice, but remove RightNav.

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use default config instead of querying DB at build time
  const config = {
    ownerName: "Garry",
    avatarInitial: "G",
    avatarGradient: "from-blue-600 to-indigo-600",
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-primary/20">
      <Navbar config={config} />

      <main className="pt-20 min-h-screen">
        {children}
      </main>
    </div>
  );
}
