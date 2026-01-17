"use client";
import React, { useState } from "react";
import Link from "next/link";
import { cn, getAssetUrl } from "@/lib/utils";
import { FilterRow } from "@/components/ui/filter-row";
import { Project } from "@/lib/projects";

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTech, setSelectedTech] = useState("All");

  // Get all unique categories
  const allCategories = ["All", ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean))) as string[]];
  
  // Get all unique tech stacks
  const allTechs = ["All", ...Array.from(new Set(projects.flatMap((p) => p.techStack)))].sort();

  const filteredProjects = projects.filter((project) => {
    const matchCategory = selectedCategory === "All" || project.category === selectedCategory;
    const matchTech = selectedTech === "All" || project.techStack.includes(selectedTech);
    return matchCategory && matchTech;
  });

  return (
    <section className="min-h-screen py-32 relative">
      {/* Global Background Handles Ambience now */}

      <div className="max-w-7xl mx-auto px-6 w-full z-10 relative">
          <div className="text-center mb-24 mt-12 scale-in-center">
            <h2 className="text-6xl md:text-7xl font-black mb-8 text-slate-900 tracking-tighter">
                Experimental <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Projects</span>
            </h2>
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed">
                Discovering the intersection of data science, visual arts, and modern web engineering.
            </p>
          </div>

          {/* Dual Filter System */}
          <div className="mb-24 flex flex-col items-center gap-10">
            <FilterRow 
                label="Category"
                items={allCategories}
                selectedItem={selectedCategory}
                onSelect={setSelectedCategory}
            />
            <FilterRow 
                label="Tech Stack"
                items={allTechs.slice(0, 8)} // Limit showing too many techs initially or show all? Let's show common ones or top 8.
                selectedItem={selectedTech}
                onSelect={setSelectedTech}
            />
          </div>

          {/* 项目网格 - UI/UX Pro Max Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((item, idx) => (
              <Link key={idx} href={`/projects/${item.slug}`} className="group block h-full">
                <div className="bg-white rounded-[2rem] overflow-hidden h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative project-card">
                   
                   <div className="h-64 overflow-hidden relative">
                        <img 
                          src={getAssetUrl(item.image)} 
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        />
                        {/* 顶部标签 */}
                        {item.category && (
                          <div className="absolute top-5 left-5">
                            <span className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-white/95 backdrop-blur text-slate-900 rounded-full shadow-sm">
                              {item.category}
                            </span>
                          </div>
                        )}
                   </div>

                   <div className="p-8 flex flex-col">
                        <div className="mb-4">
                            <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {item.title}
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                {item.description}
                            </p>
                        </div>
                        
                        {/* Tech Stack Badges - Bottom */}
                        <div className="mt-auto flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                             {item.techStack.slice(0, 3).map(tech => (
                                 <span key={tech} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                                     {tech}
                                 </span>
                             ))}
                             {item.techStack.length > 3 && (
                                 <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full">
                                     +{item.techStack.length - 3}
                                 </span>
                             )}
                        </div>
                   </div>
                </div>
              </Link>
            ))}
          </div>

          {/* 空状态 */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 text-lg">
                No projects found in this category.
              </p>
            </div>
          )}
      </div>
    </section>
  );
}
