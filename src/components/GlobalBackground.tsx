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
    const [colorIndices, setColorIndices] = useState([0, 1, 2, 3]);

    useEffect(() => {
        const interval = setInterval(() => {
            setColorIndices(prev => [
                (prev[0] + 1) % 4, // 简单轮播，或者随机
                (prev[1] + 1) % 5,
                (prev[2] + 1) % 4,
                (prev[3] + 1) % 5
            ]);
        }, 4000); // 4秒变一次
        return () => clearInterval(interval);
    }, []);

    // 预定义色板
    const palettes = {
        hero: [
            "bg-emerald-300/40", "bg-purple-300/40", "bg-orange-200/50", "bg-indigo-100/40",
            "bg-teal-200/40", "bg-fuchsia-300/30", "bg-amber-200/40", "bg-violet-200/40"
        ],
        projects: [
            "bg-slate-200/50", "bg-blue-200/50", "bg-cyan-100/50", "bg-indigo-100/50",
            "bg-sky-200/40", "bg-blue-300/30"
        ],
        blog: [
            "bg-indigo-200/50", "bg-rose-200/50", "bg-slate-200/50", "bg-blue-200/50",
            "bg-red-200/30", "bg-indigo-300/30"
        ],
        about: [
             "bg-emerald-200/50", "bg-teal-200/50", "bg-amber-100/60", "bg-lime-100/50"
        ]
    };

    const getActivePalette = () => {
        if (pathname.startsWith("/projects")) return palettes.projects;
        if (pathname.startsWith("/blog")) return palettes.blog;
        if (pathname.startsWith("/about")) return palettes.about;
        
        if (pathname === "/") {
            if (homeSection === "projects") return palettes.projects;
            if (homeSection === "blog") return palettes.blog;
            return palettes.hero;
        }
        return palettes.hero;
    };

    const activePalette = getActivePalette();
    
    // 确保取模安全
    const theme = {
        blob1: activePalette[colorIndices[0] % activePalette.length],
        blob2: activePalette[(colorIndices[1] + 1) % activePalette.length],
        blob3: activePalette[(colorIndices[2] + 2) % activePalette.length],
        blob4: activePalette[(colorIndices[3] + 3) % activePalette.length],
    };

    // Helper to determine active base gradient (Keep existing logic or adjust)
    const getBaseGradient = () => {
      // Projects
      if (pathname.startsWith("/projects") || (pathname === "/" && homeSection === "projects")) {
          return "bg-gradient-to-br from-slate-50 to-blue-50/30";
      }
      // Blog
      if (pathname.startsWith("/blog") || (pathname === "/" && homeSection === "blog")) {
          return "bg-gradient-to-br from-slate-50 to-indigo-50/30";
      }
      // About
      if (pathname.startsWith("/about")) {
          return "bg-gradient-to-br from-stone-50 to-emerald-50/40";
      }
      // Hero (Green/Purple/Orange tint base)
      return "bg-[#f5f5f4]";
  };

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none transition-all duration-[3000ms] ease-in-out">
      {/* Base Gradient */}
      <div className={cn(
        "absolute inset-0 transition-colors duration-[3000ms]",
        getBaseGradient()
      )} />

      {/* Blobs with smooth color transitions */}
      <div className={cn("absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob transition-colors duration-[3000ms]", theme.blob1)} />
      
      <div className={cn("absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-2000 transition-colors duration-[3000ms]", theme.blob2)} />
      
      <div className={cn("absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-4000 transition-colors duration-[3000ms]", theme.blob3)} />
      
      <div className={cn("absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[100px] mix-blend-multiply filter animate-blob animation-delay-2000 opacity-70 transition-colors duration-[3000ms]", theme.blob4)} />
    </div>
  );
}
