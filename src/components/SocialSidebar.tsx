"use client";
import React from "react";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import Link from "next/link";

export const SocialSidebar = () => {
  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/9xxxxxx",
      icon: <Github className="w-5 h-5" />,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com",
      icon: <Linkedin className="w-5 h-5" />,
    },
    {
      name: "Email",
      href: "mailto:huangqiannb@gmail.com",
      icon: <Mail className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-4">
      {socials.map((item, idx) => (
        <Link
          key={idx}
          href={item.href}
          target={item.name !== "Email" ? "_blank" : undefined}
          className="relative group flex items-center gap-3 p-2"
        >
          {/* 图标容器 */}
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-border bg-card/50 backdrop-blur-sm text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-all duration-300">
            {item.icon}
          </div>

          {/* 文字标签：悬浮时更有活力 */}
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 pointer-events-none">
            {item.name}
          </span>
        </Link>
      ))}
      <div className="h-20 w-[1px] bg-gradient-to-b from-border to-transparent ml-7 mt-2"></div>
    </div>
  );
};
