"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
  initialLikes: number;
  projectId?: string;
  postId?: string;
  className?: string;
}

export function LikeButton({ initialLikes, projectId, postId, className }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (isLoading) return;
    
    // Optimistic update
    setLikes(prev => prev + 1);
    setHasLiked(true);
    setIsLoading(true);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, postId }),
      });

      if (!res.ok) {
        // Revert on failure
        setLikes(prev => prev - 1);
        setHasLiked(false);
      } else {
        const data = await res.json();
        setLikes(data.likes);
      }
    } catch (error) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || hasLiked}
      className={cn(
        "group flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300",
        hasLiked 
          ? "bg-rose-500/10 text-rose-600 cursor-default" 
          : "bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-600 dark:text-slate-300 hover:text-rose-600",
        className
      )}
    >
      <div className="relative">
        <Heart 
            className={cn(
                "w-5 h-5 transition-transform duration-300", 
                hasLiked && "fill-current scale-110",
                !hasLiked && "group-hover:scale-110"
            )} 
        />
        {hasLiked && (
            <span className="absolute inset-0 animate-ping opacity-75 rounded-full bg-rose-400"></span>
        )}
      </div>
      <span className="font-semibold tabular-nums">{likes}</span>
    </button>
  );
}
