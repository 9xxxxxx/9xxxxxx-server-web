
import React, { useEffect, useRef } from "react";
import { Check, Copy } from "lucide-react";
import { createRoot } from "react-dom/client";
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';

// Register languages manually to ensure tree-shaking efficacy if needed, or just specific ones
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('markdown', markdown);
import { Post } from "@/lib/blog"; // You might need to check where Post type is defined
import Link from "next/link";
import { ArrowLeft, Clock, User, UserCircle2, Hash, ExternalLink } from "lucide-react";
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
      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-40 -mt-24 pb-20">
         <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
            
            {/* Main Content */}
            <main className="min-w-0">
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
                     <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-32 prose-indigo prose-img:rounded-2xl prose-img:shadow-lg prose-a:text-indigo-600 dark:prose-a:text-indigo-400 hover:prose-a:text-indigo-500 transition-colors">
                         {(() => {
                           try {
                             const json = JSON.parse(post.content);
                             if (json && json.type === 'doc') {
                               return (
                                 <div className="structured-editor bg-transparent p-0">
                                   <div className="ProseMirror" dangerouslySetInnerHTML={{ __html: jsonToHTML(json) }} />
                                   <EditorEnhancer />
                                 </div>
                               );
                             }
                           } catch (e) {}
                           return <MarkdownRenderer content={post.content} />;
                         })()}
                     </div>

                     {/* Mobile Interaction Footer */}
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

            {/* Right Sidebar: TOC & Interaction */}
            <aside className="hidden lg:block space-y-8">
                 <div className="sticky top-32 space-y-6">
                     {/* Interaction Card */}
                     <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                             <span>喜欢这篇文章？</span>
                             <LikeButton initialLikes={post.likes || 0} postId={post.id} className="bg-white dark:bg-slate-800 py-1.5 px-3 shadow-sm text-sm" />
                         </div>
                         <button 
                             onClick={() => {
                                 const url = window.location.href;
                                 const handleCopy = () => {
                                     if (navigator.clipboard && window.isSecureContext) {
                                         navigator.clipboard.writeText(url);
                                     } else {
                                         const textArea = document.createElement("textarea");
                                         textArea.value = url;
                                         textArea.style.position = "fixed";
                                         textArea.style.left = "-9999px";
                                         document.body.appendChild(textArea);
                                         textArea.focus();
                                         textArea.select();
                                         try { document.execCommand('copy'); } catch (e) {}
                                         document.body.removeChild(textArea);
                                     }
                                     alert("文章链接已复制！"); 
                                 };
                                 handleCopy();
                             }}
                             className="p-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                             title="分享文章"
                         >
                             <ExternalLink className="w-4 h-4" />
                         </button>
                     </div>

                     {/* TOC */}
                     <div className="pl-4 border-l border-slate-200/50 dark:border-slate-800/50">
                        <TableOfContents content={post.content} />
                     </div>
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

const EditorEnhancer = () => {
    useEffect(() => {
        // 1. Highlight Code Blocks
        const codeBlocks = document.querySelectorAll('.structured-editor pre code');
        codeBlocks.forEach((block) => {
            if (block.getAttribute('data-highlighted') === 'yes') return;
            hljs.highlightElement(block as HTMLElement);
            block.setAttribute('data-highlighted', 'yes');
        });

        // 2. Inject Copy Buttons
        const preBlocks = document.querySelectorAll('.structured-editor pre');
        preBlocks.forEach((element) => {
            const block = element as HTMLElement;
            if (block.querySelector('.copy-btn-root')) return;

            // Ensure relative positioning
            if (window.getComputedStyle(block).position === 'static') {
              block.style.position = 'relative'; 
            }

            const btnContainer = document.createElement('div');
            btnContainer.className = 'copy-btn-root absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10';
            block.classList.add('group'); // Add group for hover effect
            block.appendChild(btnContainer);

            const root = createRoot(btnContainer);
            root.render(<CopyButton text={block.textContent || ''} />);
        });
    });
    return null;
};

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for HTTP
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback copy failed', err);
                }
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed', err);
        }
    };

    return (
        <button 
            onClick={handleCopy}
            className="p-1.5 rounded-md text-white/70 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all border border-white/10"
            title="Copy code"
        >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};
