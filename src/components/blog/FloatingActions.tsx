"use client";
import React from "react";
import { Share2, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { LikeButton } from "@/components/ui/like-button";

interface FloatingActionsProps {
    likes: number;
    postId?: string;
    projectId?: string;
}

export function FloatingActions({ likes, postId, projectId }: FloatingActionsProps) {
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("链接已复制到剪贴板！");
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="flex flex-col gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
             {/* Like Button Wrapper */}
             <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-full p-2 shadow-xl hover:shadow-2xl transition-all duration-300">
                 <LikeButton 
                    initialLikes={likes} 
                    postId={postId}
                    projectId={projectId}
                    className="flex-col !px-2 !py-4 h-auto min-w-[3.5rem] gap-1 bg-transparent hover:bg-transparent" 
                 />
             </div>

             {/* Share Button */}
             <button 
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 group"
                title="分享文章"
             >
                 <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
             </button>

             {/* Mobile Scroll Top (Visible on mobile usually, but here we keep it for structure or hide on desktop if needed) */}
             <button 
                onClick={scrollToTop}
                className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all duration-300 lg:hidden"
                title="回到顶部"
             >
                 <ArrowUp className="w-5 h-5" />
             </button>
        </div>
    );
}
