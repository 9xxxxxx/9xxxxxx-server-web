"use client";

import { useState, useMemo, useEffect } from "react";
import { Project } from "@/lib/projects";
import { BlogSearch } from "@/components/blog/BlogSearch"; // Reuse search component
import { FilterRow } from "@/components/ui/filter-row";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

interface ProjectsClientPageProps {
  initialProjects: Project[];
  allTechStacks: string[];
}

export default function ProjectsClientPage({ initialProjects, allTechStacks }: ProjectsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTech, setSelectedTech] = useState<string>("All");

  const [projects, setProjects] = useState<Project[]>(initialProjects || []);
  const [loading, setLoading] = useState(initialProjects.length === 0);


  useEffect(() => {
    if (projects.length === 0) {
        const loadData = async () => {
             try {
                const { getAllProjects } = await import("@/lib/projects");
                const fetchedProjects = await getAllProjects();
                setProjects(fetchedProjects);
             } catch (e) {
                 console.error("Failed to load projects", e);
             } finally {
                 setLoading(false);
             }
        };
        loadData();
    } else {
        setLoading(false);
    }
  }, []);

  // Compute derived state from projects
  const uniqueCategories = useMemo(() => {
    const cats = new Set(projects.map(p => p.category).filter((c): c is string => !!c));
    return ["All", ...Array.from(cats)];
  }, [projects]);

  const uniqueTechStacks = useMemo(() => {
     if (allTechStacks && allTechStacks.length > 0) return allTechStacks;
     // If initial tech stacks not provided, compute from fetched projects
     return Array.from(new Set(projects.flatMap(p => p.techStack))).sort();
  }, [allTechStacks, projects]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const displayTechs = ["All", ...uniqueTechStacks];

  // Filter Logic
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Filter by Category
    if (selectedCategory !== "All") {
        result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by Tech Stack
    if (selectedTech !== "All") {
        result = result.filter(p => p.techStack.includes(selectedTech));
    }

    // Filter by Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.techStack.some(t => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [projects, selectedCategory, selectedTech, searchQuery]);

  return (
    <div className="min-h-screen relative font-sans">
      
      {/* Header Section */}
      <header className="relative pt-40 pb-20 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900">
             Projects & <span className="text-indigo-600">Works</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
             Showcase of open source, experiments, and production apps.
          </p>

          <div className="flex justify-center">
             <BlogSearch onSearch={setSearchQuery} />
          </div>
        </div>
      </header>

      {/* Filters Container */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex flex-col items-center gap-10 z-10 relative">
         <FilterRow 
            label="Category"
            items={uniqueCategories}
            selectedItem={selectedCategory}
            onSelect={setSelectedCategory}
         />
         <FilterRow 
            label="Tech Stack"
            items={displayTechs.slice(0, 15)} 
            selectedItem={selectedTech}
            onSelect={setSelectedTech}
         />
      </div>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
{filteredProjects.map((project) => (
               <Link key={project.id} href={`/projects/${project.slug}`} className="group block h-full">

                    <div className="bg-white rounded-[2rem] overflow-hidden h-full shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative flex flex-col">
                        <div className="h-64 overflow-hidden relative">
                            <img 
                                src={getAssetUrl(project.image)} 
                                alt={project.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            {project.category && (
                                <span className="absolute top-5 left-5 px-4 py-1.5 bg-white/95 backdrop-blur text-slate-900 text-xs font-bold rounded-full shadow-sm tracking-wide uppercase">
                                    {project.category}
                                </span>
                            )}
                        </div>
                        <div className="p-8 flex flex-col flex-1">
                            <h3 className="text-2xl font-bold mb-3 text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium mb-6 flex-1">{project.description}</p>
                            
                            <div className="mt-auto flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                                {project.techStack.slice(0, 3).map((tech: string) => (
                                    <span key={tech} className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full">
                                        {tech}
                                    </span>
                                ))}
                                {project.techStack.length > 3 && (
                                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-full">
                                        +{project.techStack.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        
        {filteredProjects.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-2xl text-slate-400 font-bold mb-4">No projects found matching criteria.</p>
                <button 
                    onClick={() => {setSelectedCategory("All"); setSelectedTech("All"); setSearchQuery("")}}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </main>
    </div>
  );
}
