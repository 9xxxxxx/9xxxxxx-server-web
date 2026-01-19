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
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
       setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Default values if config fails loading
  const { 
    ownerName: siteOwnerName = "Garry", 
    avatarInitial: siteAvatarInitial = "G", 
    avatarGradient: siteAvatarGradient = "from-blue-600 to-indigo-600",
    avatarImage: siteAvatarImage
  } = config || {};

  const displayName = accessToken && user?.fullName ? user.fullName : siteOwnerName;
  const displayAvatar = accessToken && user ? user.avatar : siteAvatarImage;
  const displayInitial = accessToken && user?.fullName ? user.fullName.charAt(0).toUpperCase() : siteAvatarInitial;
  
  const navItems = [
    { name: "首页", path: "/", icon: House },
    { name: "项目", path: "/projects", icon: FolderKanban },
    { name: "文章", path: "/blog", icon: BookOpen },
    { name: "关于", path: "/about", icon: Sparkles },
  ];

  const SocialActions = () => (
      <>
         <a href="https://github.com/9xxxxxx" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all group" aria-label="GitHub">
            <Github className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
         </a>
         <Link href="/admin" className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group" aria-label="Admin Dashboard">
            <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
         </Link>
         <button 
            onClick={() => document.dispatchEvent(new CustomEvent("open-command-menu"))}
            className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
            aria-label="Search"
         >
            <Search className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
         </button>
         <div className="scale-90">
             <UserMenu />
         </div>
         <div className="scale-110">
            <ModeToggle />
         </div>
      </>
  );

  return (
    <>
    {/* TOP NAVBAR (Hidden on Scroll) */}
    <motion.nav 
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: isScrolled ? -100 : 0, opacity: isScrolled ? 0 : 1, pointerEvents: isScrolled ? "none" : "auto" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl"
    >
      <div className="bg-white/70 backdrop-blur-3xl border border-white/50 shadow-[0_8px_40px_rgb(0,0,0,0.06)] rounded-2xl px-4 h-20 flex items-center justify-between transition-all duration-300 hover:bg-white/80">
        
        {/* User Identity */}
        <Link href="/" className="flex items-center gap-4 pl-2 group">
          {displayAvatar ? (
             <img 
               src={getAssetUrl(displayAvatar)} 
               alt={displayName} 
               className="w-12 h-12 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-300 border-2 border-white/50"
             />
          ) : (
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg bg-gradient-to-br", siteAvatarGradient)}>
                {displayInitial}
            </div>
          )}
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">{displayName}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Portfolio</span>
          </div>
        </Link>
        
        {/* Desktop Nav - Centered */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/50 rounded-xl p-2 border border-slate-200/50 absolute left-1/2 -translate-x-1/2 shadow-inner">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} className={cn("px-6 py-2.5 rounded-xl text-base font-bold transition-all duration-300 relative flex items-center gap-2 border border-transparent hover:bg-white hover:text-indigo-600", isActive ? "text-indigo-600 bg-white shadow-sm" : "text-slate-500")}>
                <Icon className={cn("w-4 h-4 transition-transform", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pr-2">
             <SocialActions />
        </div>
      </div>
    </motion.nav>

    {/* SIDE NAVBAR (Visible on Scroll) */}
    <motion.nav
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: isScrolled ? 0 : -100, opacity: isScrolled ? 1 : 0, pointerEvents: isScrolled ? "auto" : "none" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-6"
    >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-slate-800 shadow-2xl rounded-2xl p-3 flex flex-col items-center gap-4">
            {/* Mini Avatar */}
            <Link href="/" className="group relative">
                {displayAvatar ? (
                    <img src={getAssetUrl(displayAvatar)} className="w-10 h-10 rounded-xl object-cover shadow-sm group-hover:scale-110 transition-transform" />
                ) : (
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold bg-gradient-to-br shadow-sm", siteAvatarGradient)}>{displayInitial}</div>
                )}
            </Link>
            
            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />

            {/* Vertical Nav Items */}
            {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path));
                const Icon = item.icon;
                return (
                    <Link key={item.path} href={item.path} className={cn("p-3 rounded-xl transition-all relative group", isActive ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800")}>
                        <Icon className="w-5 h-5" />
                        <span className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {item.name}
                        </span>
                    </Link>
                );
            })}

            <div className="w-8 h-px bg-slate-200 dark:bg-slate-700" />
            
            <div className="flex flex-col gap-2">
                <Link href="/admin" className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all" aria-label="Admin Dashboard">
                    <Settings className="w-5 h-5" />
                </Link>
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent("open-command-menu"))} 
                  className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
                >
                   <Search className="w-5 h-5" />
                </button>
                <div className="scale-90"><ModeToggle /></div>
            </div>
        </div>
    </motion.nav>
    </>
  );
}
