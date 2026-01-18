"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, getAssetUrl } from "@/lib/utils";
import { ModeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { House, FolderKanban, BookOpen, Sparkles, Settings, Search, Github } from "lucide-react";
import { UserMenu } from "@/components/LoginModal";
import { useAuthStore } from "@/lib/auth-store";

interface NavbarProps {
  config?: {
    ownerName: string;
    avatarInitial: string;
    avatarGradient: string;
    avatarImage?: string | null;
  };
}

export function Navbar({ config }: NavbarProps) {
  const pathname = usePathname();
  const { user, accessToken } = useAuthStore();
  
  // Default values if config fails loading
  const { 
    ownerName: siteOwnerName = "Garry", 
    avatarInitial: siteAvatarInitial = "G", 
    avatarGradient: siteAvatarGradient = "from-blue-600 to-indigo-600",
    avatarImage: siteAvatarImage
  } = config || {};

  // If user is logged in, use their profile. Otherwise use site config.
  const displayName = accessToken && user?.fullName ? user.fullName : siteOwnerName;
  const displayAvatar = accessToken && user ? user.avatar : siteAvatarImage;
  const displayInitial = accessToken && user?.fullName ? user.fullName.charAt(0).toUpperCase() : siteAvatarInitial;
  
  const navItems = [
    { name: "首页", path: "/", icon: House },
    { name: "项目", path: "/projects", icon: FolderKanban },
    { name: "文章", path: "/blog", icon: BookOpen },
    { name: "关于", path: "/about", icon: Sparkles },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
    >
      <div className="bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-2xl px-4 h-20 flex items-center justify-between transition-all duration-300 hover:bg-white/80">
        
        {/* User Identity (Left) */}
        <Link href="/" className="flex items-center gap-4 pl-2 group">
          {displayAvatar ? (
             <img 
               src={getAssetUrl(displayAvatar)} 
               alt={displayName} 
               className="w-12 h-12 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-white/50"
               onError={(e) => {
                 // If avatar fails to load, show gradient with initial
                 (e.target as HTMLImageElement).style.display = 'none';
               }}
             />
          ) : null}
          {(!displayAvatar) && (
            <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-300 bg-gradient-to-br",
                siteAvatarGradient
            )}>
                {displayInitial}
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              {displayName}
            </span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {accessToken && user ? "User Profile" : "Portfolio"}
            </span>
          </div>
        </Link>
        
        {/* Desktop Nav - Centered & Larger */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 rounded-xl p-2 border border-slate-200/50 absolute left-1/2 -translate-x-1/2 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-base font-bold transition-all duration-300 relative flex items-center gap-2 border border-transparent",
                  // Hover Effects
                  "hover:-translate-y-1 hover:border-indigo-200/50 hover:bg-white hover:shadow-[0_8px_20px_-6px_rgba(79,70,229,0.15)] hover:text-indigo-600",
                  // Active State
                  isActive 
                    ? "text-indigo-600 bg-white shadow-sm ring-1 ring-slate-100" 
                    : "text-slate-500"
                )}
              >
                <Icon className={cn("w-4 h-4 transition-transform duration-300 group-hover:scale-110", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-2 pr-2">
             <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all group" aria-label="GitHub">
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
             </a>
             <button 
                onClick={() => document.dispatchEvent(new CustomEvent("open-command-menu"))}
                className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
                aria-label="Search"
             >
                <Search className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
             </button>
             <UserMenu />
             <Link href="/admin" className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group" aria-label="Dashboard">
                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
             </Link>
             <div className="w-px h-6 bg-slate-200 mx-2" />
             <div className="scale-110">
                <ModeToggle />
             </div>
        </div>
      </div>
    </motion.nav>
  );
}
