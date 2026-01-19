"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import Link from "next/link";
import { Plus, Edit, Trash2, ExternalLink, Search, Github, Briefcase, Eye } from "lucide-react";
import { Project } from "@/lib/projects";
import { useRouter } from "next/navigation";
import { getAssetUrl } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      // 获取所有项目,包括需登录的,包含未发布
      const data = await fetchAPI<Project[]>("/api/projects?include_login_required=true&include_unpublished=true");
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetchAPI(`/api/projects/${id}`, { method: "DELETE" });
      setProjects(projects.filter(p => p.id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    }
  }

  async function toggleStatus(project: Project, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const newStatus = !project.published;
      await fetchAPI(`/api/projects/${project.id}`, { 
        method: "PUT",
        body: JSON.stringify({ published: newStatus })
      });
      
      setProjects(projects.map(p => p.id === project.id ? { ...p, published: newStatus } : p));
      toast.success(newStatus ? "Project published" : "Project unpublished");
    } catch (error) {
       console.error(error);
      toast.error("Failed to update status");
    }
  }

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Projects</h2>
           <p className="text-slate-500 font-medium">Showcase your best work.</p>
        </div>
        <Link 
            href="/admin/editor/project/new" 
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
        >
            <Plus className="w-5 h-5" /> New Project
        </Link>
      </div>

       {/* Search Toolbar */}
       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
      </div>

      <div className="space-y-4">
          {loading ? (
             <div className="text-center py-20 text-slate-400">Loading awesome projects...</div>
          ) : filtered.length === 0 ? (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No projects found.</p>
             </div>
          ) : (
             filtered.map(project => (
                 <div key={project.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all flex flex-col sm:flex-row gap-6">
                    {/* Cover Image - 点击进入编辑 */}
                     <Link href={`/admin/editor/project/${project.id}`} className="w-full sm:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative block cursor-pointer">
                        {project.image ? (
                            <img src={getAssetUrl(project.image)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Briefcase className="w-8 h-8 opacity-50" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2 z-10">
                             <button 
                                onClick={(e) => toggleStatus(project, e)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-all ${project.published ? 'bg-green-500/90 text-white hover:bg-green-600' : 'bg-amber-400/90 text-white hover:bg-amber-500'}`}
                             >
                                {project.published ? "Live" : "Draft"}
                             </button>
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                         <div className="flex items-start justify-between gap-4">
                            <div>
                                <Link href={`/admin/editor/project/${project.id}`} className="cursor-pointer hover:text-purple-600 transition-colors">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-1">{project.title}</h3>
                                </Link>
                                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{project.description}</p>
                            </div>
                             
                             {/* Desktop Actions */}
                             <div className="hidden sm:flex items-center gap-2">
                                <Link href={`/projects/${project.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors" title="View">
                                <Eye className="w-5 h-5" />
                                </Link>
                                <Link href={`/admin/editor/project/${project.id}`} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors" title="Edit">
                                    <Edit className="w-5 h-5" />
                                </Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This project will be permanently deleted.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(project.id!)} className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                             </div>
                         </div>

                         <div className="mt-auto pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                             <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full">
                                {project.techStack.slice(0, 4).map(tech => (
                                    <span key={tech} className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded whitespace-nowrap">{tech}</span>
                                ))}
                                {project.techStack.length > 4 && <span className="text-xs text-slate-400 font-bold px-1">+{project.techStack.length - 4}</span>}
                             </div>

                             <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                  <span>{project.category}</span>
                                  {project.githubLink && <a href={project.githubLink} target="_blank" className="hover:text-slate-900"><Github className="w-4 h-4" /></a>}
                                  {project.demoLink && <a href={project.demoLink} target="_blank" className="hover:text-purple-600"><ExternalLink className="w-4 h-4" /></a>}
                             </div>
                         </div>
                         
                          {/* Mobile Actions */}
                          <div className="flex sm:hidden items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                                <Link href={`/admin/editor/project/${project.id}`} className="bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg flex-1 text-center font-bold text-sm">Edit</Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg flex-1 text-center font-bold text-sm">Delete</button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(project.id!)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                    </div>
                </div>
            ))
         )}
      </div>
    </div>
  );
}
