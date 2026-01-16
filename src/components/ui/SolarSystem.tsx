"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Hero() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Apple-like ease
  };

  return (
    <div className="min-h-[90vh] w-full flex flex-col items-center justify-center bg-background relative overflow-hidden pt-20">
      
      <div className="max-w-5xl mx-auto px-6 z-10 text-center flex flex-col items-center">
        
        {/* Eyebrow */}
        <motion.span 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-primary font-semibold text-lg md:text-xl tracking-tight mb-4 block"
        >
          Garry's Profile
        </motion.span>

        {/* Main Headline - Big, Bold, Clean */}
        <motion.h1 
           variants={fadeInUp}
           initial="initial"
           animate="animate"
           className="text-6xl md:text-9xl font-semibold tracking-tighter text-foreground mb-6 leading-[1.05]"
        >
          Data. <br/>
          <span className="text-muted-foreground">Redefined.</span>
        </motion.h1>

        {/* Subheadline - Readable */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-foreground font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Expert Python & SQL solutions. <br className="hidden md:block"/> Transforming complexity into clarity.
        </motion.p>

        {/* Apple-style Buttons */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.6, delay: 0.6 }}
           className="flex flex-col sm:flex-row gap-4 items-center"
        >
            <Link 
              href="/projects" 
              className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-lg flex items-center"
            >
                View Projects 
            </Link>
            <Link 
              href="/about" 
              className="px-8 py-3 rounded-full text-primary hover:text-primary/80 transition-colors text-lg flex items-center group"
            >
                Learn more <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </motion.div>

      </div>
      
      {/* Optional: Abstract blurry gradient at bottom (Apple style) */}
      {/* <div className="absolute -bottom-[20rem] left-1/2 -translate-x-1/2 w-[60rem] h-[60rem] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" /> */}

    </div>
  );
}
