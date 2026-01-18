"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Project } from "@/lib/projects";
import { fetchAPI } from "@/lib/api-client";
import { Loader2, Save, Image as ImageIcon, ArrowLeft, Plus, X } from "lucide-react";
import Link from "next/link";
import { getAssetUrl } from "@/lib/utils";
import CategorySelector from "@/components/admin/CategorySelector";
import ImageCropper from "@/components/admin/ImageCropper";
import "easymde/dist/easymde.min.css";

const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

interface ProjectEditorProps {
  initialProject?: Project;
  isEditing?: boolean;
}

export default function ProjectEditor({ initialProject, isEditing = false }: ProjectEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // State
  const [title, setTitle] = useState(initialProject?.title || "");
  const [slug, setSlug] = useState(initialProject?.slug || "");
  const [description, setDescription] = useState(initialProject?.description || "");
  const [fullDescription, setFullDescription] = useState(initialProject?.fullDescription || "");
  const [category, setCategory] = useState(initialProject?.category || "Web App");
  const [image, setImage] = useState(initialProject?.image || "");
  const [githubLink, setGithubLink] = useState(initialProject?.githubLink || "");
  const [demoLink, setDemoLink] = useState(initialProject?.demoLink || "");
  const [published, setPublished] = useState(initialProject ? (initialProject as any).published : true);
  const [visibility, setVisibility] = useState((initialProject as any)?.visibility || "public"); // "public" or "login_required"
  
  // Array State
  const [techStack, setTechStack] = useState<string[]>(initialProject?.techStack || []);
  const [features, setFeatures] = useState<string[]>(initialProject?.features || []);
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");
  
  // Image cropping state
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && !slug) {
       setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
    setShowCropper(true);
  };
  
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
        setLoading(true);
        const blob = await fetch(croppedImageUrl).then(r => r.blob());
        const file = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
        
        const formData = new FormData();
        formData.append("file", file);
        
        const token = JSON.parse(localStorage.getItem("admin-auth-storage") || '{}')?.state?.accessToken;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/upload`, {
            method: "POST",
            headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
            body: formData
        });
        
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setImage(data.url);
        setShowCropper(false);
        setTempImageUrl(null);
    } catch (err) {
        alert("Image upload failed");
    } finally {
        setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        const payload = {
            title,
            slug,
            description,
            fullDescription,
            category,
            image,
            githubLink,
            demoLink,
            techStack,
            features,
            published: Boolean(published),
            visibility,
        };

        if (isEditing && initialProject?.id) {
            await fetchAPI(`/api/projects/${initialProject.id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await fetchAPI("/api/projects", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }
        
        router.push("/admin/projects");
        router.refresh();
    } catch (error) {
        alert("Failed to save project");
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/projects" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
                <h1 className="text-2xl font-black text-slate-900">{isEditing ? "Edit Project" : "New Project"}</h1>
                <p className="text-slate-500 text-sm">{isEditing ? "Update project details" : "Add a new project"}</p>
            </div>
         </div>
         <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-70"
         >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Project
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
                    <input type="text" value={title} onChange={handleTitleChange} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10 font-bold text-lg" placeholder="Project Name" autoFocus={!isEditing} />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                    <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10 font-mono text-sm text-slate-500" placeholder="project-slug" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Short Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10" placeholder="Brief elevator pitch..." />
                </div>
                
                 {/* Tech Stack */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tech Stack</label>
                    <div className="flex flex-wrap gap-2 mb-3">
                        {techStack.map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold flex items-center gap-2">
                                {tech}
                                <button type="button" onClick={() => setTechStack(techStack.filter((_, idx) => idx !== i))}><X className="w-3 h-3 hover:text-red-500" /></button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newTech}
                            onChange={(e) => setNewTech(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if(newTech.trim()) { setTechStack([...techStack, newTech.trim()]); setNewTech(""); }
                                }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10" 
                            placeholder="Add tech (e.g. React) + Enter" 
                        />
                         <button type="button" onClick={() => { if(newTech.trim()) { setTechStack([...techStack, newTech.trim()]); setNewTech(""); } }} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"><Plus className="w-5 h-5" /></button>
                    </div>
                </div>
                
                {/* Features */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Features</label>
                    <div className="space-y-2 mb-3">
                        {features.map((feat, i) => (
                             <div key={i} className="px-4 py-2 bg-slate-50 rounded-lg text-sm flex items-center justify-between">
                                {feat}
                                <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                             onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if(newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(""); }
                                }
                            }}
                            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10" 
                            placeholder="Add feature + Enter" 
                        />
                         <button type="button" onClick={() => { if(newFeature.trim()) { setFeatures([...features, newFeature.trim()]); setNewFeature(""); } }} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200"><Plus className="w-5 h-5" /></button>
                    </div>
                </div>
            </div>

             <div className="bg-white p-1 rounded-3xl border border-slate-100 shadow-sm overflow-hidden prose-editor">
                 <h3 className="p-4 font-bold text-slate-700 border-b border-slate-100">Full Case Study</h3>
                 <SimpleMDE 
                    value={fullDescription} 
                    onChange={setFullDescription} 
                    options={{ 
                        placeholder: "Detailed project breakdown...", 
                        status: false, 
                        spellChecker: false,
                        autofocus: false, // Disabled to prevent focus stealing from other inputs
                        uploadImage: true,
                        imageUploadFunction: async (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => {
                            const formData = new FormData();
                            formData.append("file", file);
                            const token = JSON.parse(localStorage.getItem("admin-auth-storage") || '{}')?.state?.accessToken;
                            
                            try {
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/upload`, {
                                    method: "POST",
                                    headers: { ...(token ? { "Authorization": `Bearer ${token}` } : {}) },
                                    body: formData
                                });
                                if (!res.ok) throw new Error("Upload failing");
                                const data = await res.json();
                                onSuccess(getAssetUrl(data.url));
                            } catch (e) {
                                onError("Image upload failed");
                            }
                        }
                    }}
                 />
            </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select value={published ? "true" : "false"} onChange={(e) => setPublished(e.target.value === "true")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10">
                        <option value="false">Draft</option>
                        <option value="true">Published</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10">
                        <option value="public">Public (公开)</option>
                        <option value="login_required">Login Required (需登录)</option>
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                     <CategorySelector
                        value={category || ""}
                        onChange={setCategory}
                        placeholder="Select or create category..."
                     />
                </div>
             </div>

             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">GitHub URL</label>
                     <input type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10 text-sm" placeholder="https://github.com/..." />
                </div>
                 <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Demo URL</label>
                     <input type="url" value={demoLink} onChange={(e) => setDemoLink(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10 text-sm" placeholder="https://..." />
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Project Image</h3>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setImageMode("upload")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                                imageMode === "upload" 
                                    ? "bg-purple-600 text-white" 
                                    : "bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setImageMode("url")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                                imageMode === "url" 
                                    ? "bg-purple-600 text-white" 
                                    : "bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            URL
                        </button>
                    </div>
                 </div>
                 
                 {image && (
                    <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 relative group">
                        <img src={getAssetUrl(image)} alt="Cover" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setImage("")}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                 )}

                 {imageMode === "upload" ? (
                    <label className="block w-full cursor-pointer group">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center justify-center text-slate-400 group-hover:text-purple-500">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold uppercase">Click to upload</span>
                        </div>
                    </label>
                 ) : (
                    <div>
                        <input 
                            type="url" 
                            value={image} 
                            onChange={(e) => setImage(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/10 text-sm"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                 )}
             </div>
         </div>
      </div>
      
      {/* Image Cropper Modal */}
      {showCropper && tempImageUrl && (
        <ImageCropper
          imageSrc={tempImageUrl}
          onComplete={handleCropComplete}
          onCancel={() => {
            setShowCropper(false);
            setTempImageUrl(null);
          }}
          aspect={16 / 9}
          shape="rect"
        />
      )}
    </form>
  );
}
