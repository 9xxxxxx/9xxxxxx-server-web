"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Settings, 
  LogOut, 
  Menu,
  X,
  User,
  Home,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Auth Check
  useEffect(() => {
    // If we are on login page, don't redirect
    if (pathname === "/admin/login") return;

    if (!accessToken) {
      router.push("/admin/login");
    }
  }, [accessToken, pathname, router]);

  // Handle Mobile Resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsSidebarOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Allow public access to login page without layout wrapper (or simple wrapper)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Immersive Editor Mode: Skip Admin Layout
  if (pathname.includes("/admin/editor/")) {
    return <>{children}</>;
  }

  // Prevent flash of content if not auth
  if (!accessToken) return null;

  const menuItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Posts", href: "/admin/posts", icon: FileText },
    { name: "Projects", href: "/admin/projects", icon: Briefcase },
    { name: "Comments", href: "/admin/comments", icon: MessageSquare },
    { name: "Users", href: "/admin/users", icon: User },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white flex flex-col shadow-2xl overflow-hidden ${isMobile ? 'w-full max-w-[280px]' : ''}`}
          >
            <div className="p-8 flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 from-indigo-500 to-purple-600 bg-gradient-to-br flex items-center justify-center text-white font-bold">G</div>
                Garry Admin
              </h2>
              {isMobile && (
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    onClick={() => isMobile && setIsSidebarOpen(false)}
                    className={clsx(
                      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium",
                      isActive 
                        ? "bg-white/10 text-white shadow-lg shadow-black/10 border border-white/5" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className={clsx("w-5 h-5", isActive ? "text-indigo-400" : "")} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Public Pages Links */}
            <div className="px-4 py-4 border-t border-white/10">
              <p className="text-xs font-bold uppercase text-slate-500 px-4 mb-3">Visit Site</p>
              <div className="space-y-1">
                <Link href="/" target="_blank" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                  <Home className="w-4 h-4" /> Homepage <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </Link>
                <Link href="/blog" target="_blank" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                  <FileText className="w-4 h-4" /> Blog <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </Link>
                <Link href="/projects" target="_blank" className="flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm">
                  <Briefcase className="w-4 h-4" /> Projects <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                </Link>
              </div>
            </div>

            <div className="p-4 mt-auto">
              <button 
                onClick={() => {
                  logout();
                  router.push("/admin/login");
                }}
                className="flex items-center gap-4 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-[280px]' : ''}`}>
        {/* Topbar */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/50">
           <div className="flex items-center gap-4">
             {!isSidebarOpen && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
             )}
             <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 capitalize">
                    {pathname.split('/').pop() || 'Overview'}
                </h1>
             </div>
           </div>

           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
                 <img src="https://github.com/shadcn.png" alt="User" />
              </div>
           </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">
            {children}
        </main>
      </div>
    </div>
  );
}
