"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function GlobalBackground() {
  const pathname = usePathname();
  const [homeSection, setHomeSection] = useState<"hero" | "projects" | "blog">("hero");

  // Handle Scroll Effect for Home Page
  useEffect(() => {
    // Only listen on Home page
    if (pathname !== "/") {
      setHomeSection("hero");
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Logic:
      // Hero: 0 - 0.5vh
      // Projects: 0.5vh - 1.5vh
      // Blog: > 1.5vh
      if (scrollY < vh * 0.5) {
        setHomeSection("hero");
      } else if (scrollY < vh * 1.5) {
        setHomeSection("projects");
      } else {
        setHomeSection("blog");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Definition of themes based on routes & scroll state
  const getTheme = () => {
    // Theme Definitions
    const projectsTheme = {
       blob1: "bg-slate-200/50", 
       blob2: "bg-blue-200/50",
       blob3: "bg-cyan-100/50",
       blob4: "bg-indigo-100/50",
    };

    const blogTheme = {
        blob1: "bg-indigo-200/50",
        blob2: "bg-rose-200/50",
        blob3: "bg-slate-200/50",
        blob4: "bg-blue-200/50",
    };

    const aboutTheme = {
        blob1: "bg-emerald-200/50",
        blob2: "bg-teal-200/50",
        blob3: "bg-amber-100/60",
        blob4: "bg-lime-100/50",
    };

    const homeHeroTheme = {
        blob1: "bg-orange-300/60",
        blob2: "bg-indigo-300/60",
        blob3: "bg-pink-200/50",
        blob4: "bg-cyan-200/40",
    };

    // Route Matching
    if (pathname.startsWith("/projects")) return projectsTheme;
    if (pathname.startsWith("/blog")) return blogTheme;
    if (pathname.startsWith("/about")) return aboutTheme;
    
    // Home Page Logic
    if (pathname === "/") {
        if (homeSection === "projects") return projectsTheme;
        if (homeSection === "blog") return blogTheme;
        return homeHeroTheme;
    }

    // Default Fallback
    return homeHeroTheme;
  };

  const theme = getTheme();

  // Helper to determine active base gradient
  const getBaseGradient = () => {
      // Projects (Route or Home Section)
      if (pathname.startsWith("/projects") || (pathname === "/" && homeSection === "projects")) {
          return "bg-gradient-to-br from-slate-50 to-blue-50/30";
      }
      // Blog (Route or Home Section)
      if (pathname.startsWith("/blog") || (pathname === "/" && homeSection === "blog")) {
          return "bg-gradient-to-br from-slate-50 to-indigo-50/30";
      }
      // About
      if (pathname.startsWith("/about")) {
          return "bg-gradient-to-br from-stone-50 to-emerald-50/40";
      }
      // Default / Hero
      return "bg-[#f5f5f4]";
  };

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-all duration-1000 ease-in-out">
      {/* Base Gradient */}
      <div className={cn(
        "absolute inset-0 transition-colors duration-1000",
        getBaseGradient()
      )} />

      {/* Blobs with smooth color transitions */}
      <div className={cn("absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob transition-colors duration-1000", theme.blob1)} />
      
      <div className={cn("absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-2000 transition-colors duration-1000", theme.blob2)} />
      
      <div className={cn("absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-4000 transition-colors duration-1000", theme.blob3)} />
      
      <div className={cn("absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-2000 opacity-70 transition-colors duration-1000", theme.blob4)} />
    </div>
  );
}
