import { getAllProjects } from "@/lib/projects";
import { getAllPosts } from "@/lib/blog";
import { Hero } from "@/components/Hero";
import { Projects } from "@/components/Projects"; // We might want a simplified version or reuse this

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 60;

export default async function Home() {
  // Removed DB queries to avoid build-time dependency
  // Data will be loaded at runtime
  const projects = [];
  const allPosts = [];
  const recentPosts = allPosts.slice(0, 3);
  const featuredProjects = projects.slice(0, 3);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="min-h-screen relative">
         <Hero />
      </section>
      
      {/* Featured Projects Section */}
      <section className="min-h-screen flex flex-col justify-center py-20 px-6 max-w-7xl mx-auto w-full relative">
          <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-slate-900">Featured Projects</h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Technical explorations and case studies.</p>
          </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.slug}`} className="group block h-full">
                    <div className="bg-white rounded-[2rem] overflow-hidden h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative">
                        <div className="h-64 overflow-hidden relative">
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            {project.category && (
                                <span className="absolute top-5 left-5 px-4 py-1.5 bg-white/95 backdrop-blur text-slate-900 text-xs font-bold rounded-full shadow-sm tracking-wide uppercase">
                                    {project.category}
                                </span>
                            )}
                        </div>
                        <div className="p-8 flex flex-col">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium mb-6">{project.description}</p>
                            
                            {/* Tech Stack Pills for Home */}
                            <div className="mt-auto flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                                {project.techStack.slice(0, 3).map(tech => (
                                    <span key={tech} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        <div className="mt-16 flex justify-center">
            <Link href="/projects" className="px-8 py-4 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 hover:scale-105 transition-all shadow-lg shadow-slate-900/20 flex items-center gap-2">
                View All Projects <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="min-h-screen flex flex-col justify-center py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-200/60">
        <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter text-slate-900">Recent Writings</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Thoughts on technology and design.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group h-full">
                    <article className="flex flex-col h-full bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 group">
                        {/* Cover Image */}
                        {post.coverImage && (
                            <div className="h-48 overflow-hidden relative w-full">
                                <img 
                                    src={post.coverImage} 
                                    alt={post.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur text-indigo-600 text-xs font-bold rounded-full shadow-sm tracking-wide uppercase">
                                    {post.category || "Tech"}
                                </div>
                            </div>
                        )}
                        
                        <div className="p-8 flex flex-col flex-1">
                            {!post.coverImage && (
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 mb-6 uppercase tracking-wider">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                                        {post.category || "Tech"}
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(post.createdAt?.toISOString() || "")}
                            </div>

                            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                                {post.title}
                            </h3>
                            <p className="text-slate-500 leading-relaxed mb-6 flex-1 line-clamp-3">
                                {post.description}
                            </p>
                            <div className="text-sm font-bold text-slate-400 group-hover:text-indigo-600 mt-auto flex items-center gap-2 pt-6 border-t border-slate-50 transition-colors">
                                Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </article>
                </Link>
            ))}
        </div>

        <div className="mt-16 flex justify-center">
            <Link href="/blog" className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold border border-slate-200 hover:bg-slate-50 hover:scale-105 transition-all shadow-sm flex items-center gap-2">
                Read All Articles <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </section>


    </div>
  );
}