"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

export function Hero() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  return (
    <div className="min-h-[85vh] w-full flex flex-col items-center justify-center relative overflow-hidden pt-20">
      
      {/* Local blobs removed in favor of Global Layout Background */}

      <div className="max-w-5xl mx-auto px-6 z-10 text-center flex flex-col items-center">
        
        {/* Eyebrow - Colorful Pill */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/60 backdrop-blur-sm border border-white/50 px-4 py-1.5 rounded-full shadow-sm mb-6 inline-flex items-center"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
          <span className="text-slate-600 text-sm font-medium">Hello, I'm Garry</span>
        </motion.div>

        {/* Main Headline - Not Flat */}
        <motion.h1 
           variants={fadeInUp}
           initial="initial"
           animate="animate"
           className="text-6xl md:text-8xl font-black tracking-tight text-slate-900 mb-10 drop-shadow-sm flex flex-col items-center gap-4 -skew-x-12 transform"
        >
          <div className="-ml-12 md:-ml-24 transition-transform hover:skew-x-12 duration-500">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">数据</span> 驱动
          </div>
          <div className="ml-12 md:ml-24 transition-transform hover:skew-x-12 duration-500">
            洞见 <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">未来</span>
          </div>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
        >
         Blending technical precision with human-centric design.
        </motion.p>

        {/* Buttons - Colorful & distinct */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.4 }}
           className="flex flex-col sm:flex-row gap-5 items-center"
        >
            <Link 
              href="/projects" 
              className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-1 flex items-center"
            >
                View Projects 
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-4 rounded-2xl bg-white text-slate-700 font-bold border border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all flex items-center shadow-sm"
            >
                About Me <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
        </motion.div>

      </div>
    </div>
  );
}