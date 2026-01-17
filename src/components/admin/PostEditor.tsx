"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Post } from "@/lib/blog";
import { fetchAPI } from "@/lib/api-client";
import { Loader2, Save, Image as ImageIcon, ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { getAssetUrl } from "@/lib/utils";
import CategorySelector from "@/components/admin/CategorySelector";
import ImageCropper from "@/components/admin/ImageCropper";
import "easymde/dist/easymde.min.css";

// Dynamic import to avoid SSR issues with EasyMDE
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), { ssr: false });

interface PostEditorProps {
  initialPost?: Post;
  isEditing?: boolean;
}

export default function PostEditor({ initialPost, isEditing = false }: PostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [description, setDescription] = useState(initialPost?.description || "");
  const [content, setContent] = useState(initialPost?.content || "");
  const [category, setCategory] = useState(initialPost?.category || "Tech");
  const [tags, setTags] = useState(initialPost?.tags?.join(", ") || "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage || "");
  const [published, setPublished] = useState(initialPost ? (initialPost as any).published : true); // Default to published for new posts
  
  // Image cropping state
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [coverImageMode, setCoverImageMode] = useState<"upload" | "url">("upload");

  // Auto-generate slug from title if new
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && !slug) {
       setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create temporary URL for cropping
    const tempUrl = URL.createObjectURL(file);
    setTempImageUrl(tempUrl);
    setShowCropper(true);
  };
  
  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
        setLoading(true);
        
        // Convert blob URL to file
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
        setCoverImage(data.url);
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
            content,
            category,
            coverImage,
            tags: tags.split(",").map(t => t.trim()).filter(Boolean),
            published: Boolean(published),
            // Update Date? Backend handles updatedAt automatically usually, or we can send it.
        };

        if (isEditing && initialPost?.id) {
            await fetchAPI(`/api/posts/${initialPost.id}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await fetchAPI("/api/posts", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }
        
        router.push("/admin/posts");
        router.refresh();
    } catch (error) {
        alert("Failed to save post");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };
  
  // Custom toolbar for SimpleMDE later if needed, default is okay.

  return (
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <Link href="/admin/posts" className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
                <h1 className="text-2xl font-black text-slate-900">{isEditing ? "Edit Post" : "New Post"}</h1>
                <p className="text-slate-500 text-sm">{isEditing ? "Update existing content" : "Create a new article"}</p>
            </div>
         </div>
         <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-70"
         >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Post
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={handleTitleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-lg"
                        placeholder="Article Title"
                        required 
                        autoFocus={!isEditing}
                    />
                </div>
                
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Slug</label>
                    <input 
                        type="text" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono text-sm text-slate-500"
                        placeholder="article-slug"
                        required 
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                        placeholder="Short summary for SEO and cards..."
                        required 
                    />
                </div>
            </div>

            <div className="bg-white p-1 rounded-3xl border border-slate-100 shadow-sm overflow-hidden prose-editor">
                 <SimpleMDE 
                    value={content} 
                    onChange={setContent} 
                    options={useMemo(() => ({
                        placeholder: "Write your masterpiece...",
                        status: false,
                        spellChecker: false,
                        autofocus: isEditing,
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
                    }), [isEditing])}
                 />
            </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                    <select 
                        value={published ? "true" : "false"} 
                        onChange={(e) => setPublished(e.target.value === "true")}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                    >
                        <option value="false">Draft</option>
                        <option value="true">Published</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                     <CategorySelector 
                        value={category}
                        onChange={setCategory}
                        placeholder="Select or create category..."
                     />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tags (comma separated)</label>
                     <input 
                        type="text" 
                        value={tags} 
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10"
                        placeholder="React, Next.js, API"
                    />
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-700">Cover Image</h3>
                    <div className="flex rounded-lg overflow-hidden border border-slate-200">
                        <button
                            type="button"
                            onClick={() => setCoverImageMode("upload")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                                coverImageMode === "upload" 
                                    ? "bg-indigo-600 text-white" 
                                    : "bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            Upload
                        </button>
                        <button
                            type="button"
                            onClick={() => setCoverImageMode("url")}
                            className={`px-3 py-1 text-xs font-bold transition-colors ${
                                coverImageMode === "url" 
                                    ? "bg-indigo-600 text-white" 
                                    : "bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                            URL
                        </button>
                    </div>
                 </div>
                 
                 {coverImage && (
                    <div className="rounded-xl overflow-hidden aspect-video border border-slate-200 relative group">
                        <img src={getAssetUrl(coverImage)} alt="Cover" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => setCoverImage("")}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                 )}

                 {coverImageMode === "upload" ? (
                    <label className="block w-full cursor-pointer group">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500">
                            <ImageIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-bold uppercase">Click to upload</span>
                        </div>
                    </label>
                 ) : (
                    <div>
                        <input 
                            type="url" 
                            value={coverImage} 
                            onChange={(e) => setCoverImage(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm"
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
