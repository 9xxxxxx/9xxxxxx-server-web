import { Navbar } from "@/components/Navbar";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch config dynamically with revalidation
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
