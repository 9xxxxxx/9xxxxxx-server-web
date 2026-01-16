import { Sidebar } from "@/components/dashboard/Sidebar";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar user={session.user || { name: "", email: "" }} />
      <main className="lg:pl-64">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
