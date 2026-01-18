"use client";
import React from "react";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export const SocialLinks = () => {
  return (
    <div className="w-full flex justify-center items-center py-6 gap-6 relative z-50">
      <Link 
        href="https://github.com/9xxxxxx" 
        target="_blank" 
        className="p-3 rounded-full bg-card border border-border shadow-sm hover:scale-110 hover:border-primary transition-all duration-200 group"
        aria-label="GitHub"
      >
        <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
      <Link 
        href="https://linkedin.com" 
        target="_blank" 
        className="p-3 rounded-full bg-card border border-border shadow-sm hover:scale-110 hover:border-primary transition-all duration-200 group"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
      <Link 
        href="mailto:huangqiannb@gmail.com" 
        className="p-3 rounded-full bg-card border border-border shadow-sm hover:scale-110 hover:border-primary transition-all duration-200 group"
        aria-label="Email"
      >
        <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </Link>
    </div>
  );
};
