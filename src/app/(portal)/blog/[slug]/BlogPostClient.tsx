"use client";

import React, { useEffect } from "react";
import { Post } from "@/lib/blog"; // You might need to check where Post type is defined
import Link from "next/link";
import { ArrowLeft, Clock, User, UserCircle2, Hash } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";
import { formatDate, getAssetUrl } from "@/lib/utils";
import { LikeButton } from "@/components/ui/like-button";
import { CommentSection } from "@/components/ui/comment-section";
import { jsonToHTML } from "@/components/editor/render/toHTML";

interface BlogPostClientProps {
  post: Post;
  relatedPosts: Post[];
}

import { TableOfContents } from "@/components/blog/TableOfContents";
import { FloatingActions } from "@/components/blog/FloatingActions";

// ... previous imports

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Dynamically set page title and meta tags
  useEffect(() => {
    document.title = `${post.title} | Garry-9xxxxxx 博客`;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', post.description || '');
    }
  }, [post.title, post.description]);

  // Use cover image or fallback
  const coverImage = post.coverImage ? getAssetUrl(post.coverImage) : "/seed-assets/blog_future_city.png"; // Default fallback if none

  return (
    <article className="min-h-screen bg-background text-foreground relative -mt-20">
      
      {/* Immersive Hero Section */}
      <div className="h-[60vh] md:h-[70vh] w-full relative overflow-hidden flex items-center justify-center">
        <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 z-0"
        >
            <div className="absolute inset-0 bg-indigo-950/40 dark:bg-slate-950/70 z-10 mix-blend-multiply" />
             {/* If we have a cover image, show it. Otherwise show a gradient. */}
             {coverImage ? (
                <img 
                    src={coverImage} 
                    alt={post.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                />
             ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600" />
             )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
        </motion.div>

        <div className="relative z-30 text-center px-4 max-w-4xl mx-auto mt-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="flex justify-center flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-bold bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full shadow-lg">
                        {tag}
                    </span>
                    ))}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-xl leading-tight text-balance">
                    {post.title}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-white/90 font-medium">
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                         <UserCircle2 className="w-4 h-4" />
                         <span>{post.author?.name || "Garry"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                         <Clock className="w-4 h-4" />
                         <span>{post.readingTime || 5} min read</span>
                    </div>
                     <div className="flex items-center gap-2 bg-black/20 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
                         <span>{post.createdAt ? formatDate(typeof post.createdAt === 'string' ? post.createdAt : post.createdAt.toISOString()) : ""}</span>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 relative z-40 -mt-24 pb-20">
         <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_240px] gap-8">
            
            {/* Left Sidebar: Floating Actions (Desktop) */}
            <aside className="hidden lg:block relative">
                 <div className="sticky top-32 flex justify-end pr-4">
                     <FloatingActions likes={post.likes || 0} postId={post.id || ""} />
                 </div>
            </aside>

            {/* Center: Main Content */}
            <main className="min-w-0"> {/* min-w-0 prevents flex items from overflowing */}
                <Link href="/blog" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-8 transition-colors bg-black/20 hover:bg-black/40 backdrop-blur px-4 py-2 rounded-full shadow-lg">
                    <ArrowLeft className="w-4 h-4 mr-2" /> 返回博客列表
                </Link>
                
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-12 shadow-2xl relative overflow-hidden"
                >
                    {/* Glass Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />

                     {/* Article Body */}
                     <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-indigo prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 transition-colors">
                         {(() => {
                           try {
                             const json = JSON.parse(post.content);
                             if (json && json.type === 'doc') {
                               return <div className="tiptap" dangerouslySetInnerHTML={{ __html: jsonToHTML(json) }} />;
                             }
                           } catch (e) {}
                           return <MarkdownRenderer content={post.content} />;
                         })()}
                     </div>

                     {/* Mobile Interaction Footer (Visible only on mobile/tablet) */}
                     <div className="lg:hidden mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                                <LikeButton initialLikes={post.likes || 0} postId={post.id} />
                                <span className="text-sm font-medium text-muted-foreground">点赞支持一下</span>
                          </div>
                          
                          <div className="flex gap-2">
                               {post.tags.map(tag => (
                                   <span key={tag} className="flex items-center text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                       <Hash className="w-3 h-3 mr-1" />{tag}
                                   </span>
                               ))}
                          </div>
                     </div>
                </motion.div>
                
                {/* Comment Section */}
                <div className="mt-12">
                    <CommentSection postId={post.id} />
                </div>
            </main>

            {/* Right Sidebar: TOC (Desktop) */}
            <aside className="hidden lg:block relative">
                 <div className="sticky top-32 pl-4 border-l border-slate-200/50 dark:border-slate-800/50">
                     <TableOfContents content={post.content} />
                 </div>
            </aside>
         </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="max-w-6xl mx-auto pt-20 border-t border-slate-200 dark:border-slate-800 mt-20">
            <h2 className="text-3xl font-bold mb-10 text-center">相关阅读</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                      <div className="h-48 overflow-hidden relative">
                           {/* Fallback image for related posts */}
                           <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-slate-800 dark:to-slate-900" />
                           {relatedPost.coverImage && (
                               <img src={getAssetUrl(relatedPost.coverImage)} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 relative z-10" />
                           )}
                           <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold uppercase">{relatedPost.category}</span>
                           </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                           <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                           </h3>
                           <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                            {relatedPost.description}
                           </p>
                           <span className="text-xs font-medium text-slate-400">
                               {relatedPost.createdAt ? new Date(relatedPost.createdAt).toLocaleDateString() : ""}
                           </span>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
}
