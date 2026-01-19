"use client";
import React from "react";
import { Project } from "@/lib/projects";
import { Home as HomeIcon, ArrowLeft, Github, ExternalLink, Calendar, Code2, Layers } from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { LikeButton } from "@/components/ui/like-button";
import { CommentSection } from "@/components/ui/comment-section";
import { MarkdownRenderer } from "@/components/blog/MarkdownRenderer";

import { TableOfContents } from "@/components/blog/TableOfContents";
import { FloatingActions } from "@/components/blog/FloatingActions";

// ... imports

export default function ProjectPageClient({ project, relatedProjects }: { project: Project; relatedProjects: Project[] }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Use cover image or fallback
  const heroImage = project.image || "/seed-assets/project_default.png";

  return (
    <main className="min-h-screen text-foreground relative -mt-20">
      
      {/* Immersive Hero Section */}
      <div className="h-[70vh] w-full relative overflow-hidden flex items-center justify-center">
        {/* Parallax Background */}
        <motion.div 
            style={{ y, opacity }}
            className="absolute inset-0 z-0"
        >
            <div className="absolute inset-0 bg-slate-900/30 dark:bg-slate-950/60 z-10 mix-blend-multiply" />
            <img 
                src={heroImage} 
                alt={project.title} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
        </motion.div>

        {/* Content */}
        <div className="relative z-30 text-center px-4 max-w-5xl mx-auto mt-20">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
           >
               <span className="inline-block px-3 py-1 mb-6 text-sm font-medium tracking-wider uppercase bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white shadow-lg">
                  {project.category || "Project"}
               </span>
               <h1 className="text-5xl md:text-7xl font-black text-white mb-6 drop-shadow-lg tracking-tight">
                 {project.title}
               </h1>
               <div className="flex justify-center flex-wrap gap-4">
                   {project.techStack.slice(0, 3).map(tech => (
                       <span key={tech} className="px-3 py-1 bg-black/30 backdrop-blur-sm text-slate-200 text-sm font-medium rounded-full border border-white/10">
                           {tech}
                       </span>
                   ))}
               </div>
           </motion.div>
        </div>
      </div>

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 relative z-40 -mt-32 pb-20">
        

        <div className="grid grid-cols-1 lg:grid-cols-[80px_1fr_360px] gap-8">
            
            {/* Left Actions */}
            <div className="hidden lg:flex flex-col gap-4">
                 <div className="sticky top-32 flex justify-end pr-2">
                     <FloatingActions likes={project.likes || 0} projectId={project.id} />
                 </div>
            </div>

            {/* Main Content Column */}
            <div className="min-w-0">
                <Link href="/projects" className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-8 transition-colors bg-black/20 hover:bg-black/40 backdrop-blur px-4 py-2 rounded-full">
                    <ArrowLeft className="w-4 h-4 mr-2" /> 返回项目列表
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl"
                >
                    <div className="prose dark:prose-invert max-w-none prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-headings:scroll-mt-24 prose-indigo">
                        <h2 className="flex items-center gap-3 !mt-0 !mb-8 text-3xl">
                            <Layers className="w-8 h-8 text-indigo-500" />
                            项目概述
                        </h2>
                        <div className="text-xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium my-8">
                            {project.description}
                        </div>

                        <hr className="my-10 border-slate-200 dark:border-slate-800" />

                        <h3 className="flex items-center gap-3 mb-6">
                           <Code2 className="w-6 h-6 text-pink-500" />
                           详细方案
                        </h3>
                        <div className="text-slate-600 dark:text-slate-400">
                            <MarkdownRenderer content={project.fullDescription || ""} />
                        </div>
                    </div>

                    {/* Interaction Area Mobile */}
                    <div className="lg:hidden mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <LikeButton initialLikes={project.likes || 0} projectId={project.id} />
                             <span className="text-sm text-muted-foreground">觉得不错？给个赞吧！</span>
                         </div>
                    </div>
                </motion.div>

                {/* Comment Section */}
                <CommentSection projectId={project.id} />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
                {/* TOC Stick */}
                 <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-xl sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto"
                >
                    <TableOfContents content={project.fullDescription || ""} />
                    
                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800" >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            项目信息
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                                    <Calendar className="w-4 h-4" /> 发布日期
                                </div>
                                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {new Date(project.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {project.githubLink && (
                                    <a href={project.githubLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-medium hover:scale-[1.02] hover:shadow-lg transition-all">
                                        <Github className="w-5 h-5" /> GitHub 仓库
                                    </a>
                                )}
                                {project.demoLink && (
                                    <a href={project.demoLink} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                                        <ExternalLink className="w-5 h-5" /> 在线演示
                                    </a>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-3 ml-1">技术全家桶</h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech) => (
                                        <span key={tech} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-3 ml-1">功能亮点</h4>
                                <ul className="space-y-2">
                                    {project.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <span className="text-green-500 mt-0.5">●</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
      
       {/* Related Projects Section */}
       {relatedProjects.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 pt-20 pb-40 border-t border-slate-200 dark:border-slate-800">
             <h2 className="text-3xl font-bold mb-10">相关项目</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProjects.map((item) => (
                    <Link key={item.id} href={`/projects/${item.slug}`} className="group block h-full">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 dark:border-slate-800 relative">
                             <div className="h-48 overflow-hidden relative">
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                />
                                {item.category && (
                                  <div className="absolute top-4 left-4">
                                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur text-slate-900 rounded-full shadow-sm">
                                      {item.category}
                                    </span>
                                  </div>
                                )}
                             </div>
                             <div className="p-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>
                             </div>
                        </div>
                    </Link>
                ))}
             </div>
          </div>
       )}
    </main>
  );
}
