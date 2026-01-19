"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api-client";
import { getAssetUrl } from "@/lib/utils";
import { ArrowLeft, Save, Settings, Loader2, Image as ImageIcon, Briefcase, Github, ExternalLink, Plus, X as XIcon, Construction } from "lucide-react";
import Link from "next/link";
import TextareaAutosize from 'react-textarea-autosize';
import ImageCropper from "@/components/admin/ImageCropper";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectEditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const isNew = projectId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Data State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [category, setCategory] = useState("Web App");
  const [image, setImage] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [published, setPublished] = useState(true);
  const [visibility, setVisibility] = useState("public");
  
  // Array State
  const [techStack, setTechStack] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");

  // Image Cropping
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (!isNew) {
        fetchAPI(`/api/projects/id/${projectId}`)
        .then((data: any) => {
            setTitle(data.title);
            setSlug(data.slug);
            setDescription(data.description || "");
            setFullDescription(data.fullDescription || "");
            setCategory(data.category || "Web App");
            setImage(data.image || "");
            setGithubLink(data.githubLink || "");
            setDemoLink(data.demoLink || "");
            setPublished(data.published ?? true);
            setVisibility(data.visibility || "public");
            setTechStack(data.techStack || []);
            setFeatures(data.features || []);
            document.title = `编辑: ${data.title}`;
        })
        .catch(err => {
            console.error(err);
            toast.error("加载项目失败");
            router.push("/admin/projects");
        })
        .finally(() => setIsLoading(false));
    } else {
        document.title = "新建项目";
    }
  }, [projectId, isNew, router]);

  // Sync title
  useEffect(() => {
      if (title && isNew && !slug) {
         setSlug(title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-\u4e00-\u9fa5]+/g, '').replace(/\-\-+/g, '-'));
      }
      if (title) document.title = `${isNew ? '新建' : '编辑'}: ${title}`;
  }, [title, isNew, slug]);

  const handleSave = async (publishStatus: boolean) => {
      if (!title) return toast.error("请输入项目名称");
      setIsSaving(true);
      try {
        const payload = {
            title,
            slug: slug || title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-\u4e00-\u9fa5]+/g, '').replace(/\-\-+/g, '-'),
            description,
            fullDescription, // Markdown content
            category,
            image,
            githubLink,
            demoLink,
            techStack,
            features,
            published: publishStatus,
            visibility,
        };

        const url = isNew ? "/api/projects/" : `/api/projects/${projectId}`;
        const method = isNew ? "POST" : "PUT";
        
        await fetchAPI(url, { method, body: JSON.stringify(payload) });
        toast.success(publishStatus ? "已发布！" : "草稿已保存");
        
        if (isNew) {
             router.push("/admin/projects");
             router.refresh();
        } else {
            router.refresh();
        }
      } catch(e) {
          console.error(e);
          toast.error("保存失败");
      } finally {
          setIsSaving(false);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const objectUrl = URL.createObjectURL(file);
          setTempImageUrl(objectUrl);
          setShowCropper(true);
      }
  };
  
  const handleCropComplete = async (croppedUrl: string) => {
      try {
         const blobRes = await fetch(croppedUrl);
         const blob = await blobRes.blob();
         
         const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
         const formData = new FormData();
         formData.append("file", file);
         
         const token = JSON.parse(localStorage.getItem("admin-auth-storage") || "{}")?.state?.accessToken;
         const res = await fetch("/api/upload", {
             method: "POST",
             headers: token ? { Authorization: `Bearer ${token}` } : {},
             body: formData
         });
         
         if (!res.ok) {
           const errorText = await res.text();
           throw new Error("Upload failed: " + errorText);
         }
         
         const data = await res.json();
         setImage(data.url);
         setShowCropper(false);
         toast.success("封面图已更新");
      } catch(e) {
          console.error(e);
          toast.error("封面图上传失败");
      }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
         <div className="flex items-center gap-4">
            <Link href="/admin/projects" className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
                 {isNew ? '新建项目' : (published ? <span className="text-green-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/>已发布</span> : <span className="text-amber-600 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/>草稿</span>)}
            </div>
        </div>

        <div className="flex items-center gap-3">
             <button onClick={() => handleSave(false)} disabled={isSaving} className="text-slate-500 hover:text-slate-900 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50">保存草稿</button>
             <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg disabled:opacity-50"
             >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3" />}
                发布
             </button>

             <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                 <SheetTrigger asChild>
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                 </SheetTrigger>
                 <SheetContent className="overflow-y-auto sm:max-w-md p-6">
                     <SheetHeader>
                         <SheetTitle>项目设置</SheetTitle>
                         <SheetDescription>配置项目元数据</SheetDescription>
                     </SheetHeader>
                     
                     <div className="mt-6 space-y-6">
                         {/* Slug */}
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">URL Slug</label>
                             <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" />
                         </div>
                         
                         {/* Category */}
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">类别</label>
                             <input type="text" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" />
                         </div>

                         {/* Image */}
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">封面图</label>
                             {image ? (
                                 <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                                     <img src={getAssetUrl(image)} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <button onClick={() => setImage("")} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white">
                                             <XIcon className="w-4 h-4"/>
                                         </button>
                                          <label className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white cursor-pointer">
                                             <ImageIcon className="w-4 h-4"/>
                                             <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                         </label>
                                     </div>
                                 </div>
                             ) : (
                                 <label className="block w-full h-32 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-all group">
                                     <div className="p-3 bg-slate-100 rounded-full mb-2 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                         <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-indigo-600"/>
                                     </div>
                                     <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600">点击上传封面</span>
                                     <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                 </label>
                             )}
                         </div>

                         {/* Tech Stack */}
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">技术栈</label>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={newTech} onChange={e => setNewTech(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newTech.trim() && (setTechStack([...techStack, newTech]), setNewTech(""))) } className="flex-1 px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" placeholder="添加技术..." />
                                 <button onClick={() => newTech.trim() && (setTechStack([...techStack, newTech]), setNewTech(""))} className="p-2 bg-slate-100 rounded-lg"><Plus className="w-4 h-4"/></button>
                             </div>
                             <div className="flex flex-wrap gap-1">
                                 {techStack.map((t, i) => (
                                     <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-md flex items-center gap-1">
                                         {t} <XIcon className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setTechStack(techStack.filter((_, idx) => idx !== i))}/>
                                     </span>
                                 ))}
                             </div>
                         </div>
                         
                         {/* Features */}
                         <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">功能特性</label>
                             <div className="flex gap-2 mb-2">
                                 <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), newFeature.trim() && (setFeatures([...features, newFeature]), setNewFeature(""))) } className="flex-1 px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" placeholder="添加特性..." />
                                 <button onClick={() => newFeature.trim() && (setFeatures([...features, newFeature]), setNewFeature(""))} className="p-2 bg-slate-100 rounded-lg"><Plus className="w-4 h-4"/></button>
                             </div>
                             <div className="space-y-1">
                                 {features.map((f, i) => (
                                     <div key={i} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md flex items-center justify-between">
                                         {f} <XIcon className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}/>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         {/* Links */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">链接</label>
                             <div className="flex items-center gap-2">
                                <Github className="w-4 h-4 text-slate-400"/>
                                <input type="url" value={githubLink} onChange={e => setGithubLink(e.target.value)} placeholder="GitHub URL" className="flex-1 px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" />
                             </div>
                             <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-slate-400"/>
                                <input type="url" value={demoLink} onChange={e => setDemoLink(e.target.value)} placeholder="Demo URL" className="flex-1 px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white outline-none" />
                             </div>
                         </div>

                         {/* Visibility */}
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase text-slate-500">可见性</label>
                             <div className="flex gap-2">
                                 <button onClick={() => setVisibility("public")} className={`flex-1 py-2 text-xs font-bold rounded-lg ${visibility === 'public' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>公开</button>
                                 <button onClick={() => setVisibility("login_required")} className={`flex-1 py-2 text-xs font-bold rounded-lg ${visibility === 'login_required' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>登录可见</button>
                             </div>
                         </div>
                     </div>
                 </SheetContent>
             </Sheet>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6 sm:px-8">
         <TextareaAutosize
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="项目名称"
            className="w-full resize-none bg-transparent text-4xl sm:text-5xl font-extrabold text-slate-900 placeholder:text-slate-300 outline-none mb-4 leading-tight"
            minRows={1}
        />
        <TextareaAutosize
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="一句话描述这个项目..."
            className="w-full resize-none bg-transparent text-xl font-medium text-slate-500 placeholder:text-slate-200 outline-none mb-10 leading-normal"
            minRows={1}
        />
        
        {/* 编辑器占位 - 等待新编辑器实现 */}
        <div className="min-h-[60vh] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="p-4 bg-amber-100 rounded-full mb-4">
            <Construction className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">编辑器正在重新设计中</h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            新的编辑器即将上线，敬请期待！<br/>
            当前内容（如有）将被保留。
          </p>
          {fullDescription && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200 max-w-2xl w-full">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">当前内容预览</p>
              <pre className="text-sm text-slate-600 whitespace-pre-wrap overflow-auto max-h-48">{fullDescription.substring(0, 500)}{fullDescription.length > 500 ? '...' : ''}</pre>
            </div>
          )}
        </div>
      </main>

      {/* Image Cropper */}
      {showCropper && tempImageUrl && (
          <ImageCropper 
            imageSrc={tempImageUrl} 
            onComplete={handleCropComplete} 
            onCancel={() => { setShowCropper(false); setTempImageUrl(null); }}
            aspect={16/9}
          />
      )}
    </div>
  );
}
