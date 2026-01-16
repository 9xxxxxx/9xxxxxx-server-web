"use client";

import Link from "next/link";
import { Post } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { ArrowRight, Clock } from "lucide-react";

interface BlogCardProps {
  post: Post;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100"
    >
      {/* Card Header/Image */}
      <div className="h-64 w-full bg-slate-100 relative overflow-hidden">
        {/* Placeholder Gradient or Cover Image */}
        {post.coverImage ? (
             <img 
               src={post.coverImage} 
               alt={post.title} 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
             />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <span className="text-4xl filter drop-shadow-sm">📝</span>
            </div>
        )}
        
        {/* Date Badge - Floating Top Left */}
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-white/20">
             {formatDate(post.createdAt?.toISOString() || "")}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-8 flex-1 flex flex-col relative">
        <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
          {post.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
          {post.description}
        </p>
        
        {/* Footer - Tags/Category Pills */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex gap-2">
               {post.category && (
                   <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full">
                       {post.category}
                   </span>
               )}
           </div>
           
           <div className="flex items-center text-slate-400 text-xs font-semibold group-hover:text-indigo-500 transition-colors">
               Read Post <ArrowRight className="w-3 h-3 ml-1" />
           </div>
        </div>
      </div>
    </Link>
  );
}
