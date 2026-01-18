"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { Post } from "@/lib/blog";
import { useAuthStore } from "@/lib/auth-store";
import TiptapEditor from "@/components/editor/TiptapEditor";
import { ArrowLeft, Save, Settings, Loader2, Globe, Layout, Image as ImageIcon, Tag, Hash, X as XIcon } from "lucide-react";
import Link from "next/link";
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/utils";
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

export default function PostEditorPage({ params }: EditorPageProps) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;
  const isNew = postId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [post, setPost] = useState<Post | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [category, setCategory] = useState("Technology");
  const [tags, setTags] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  useEffect(() => {
    if (!accessToken) {
      router.push("/admin/login");
      return;
    }

    if (isNew) {
        document.title = "新建文章";
        setIsLoading(false);
        return;
    }

    const fetchPost = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/posts/id/${postId}`);
        if (!res.ok) throw new Error("Failed to fetch post");
        const data = await res.json();
        setPost(data);
        setTitle(data.title);
        setContent(data.content || "");
        setSlug(data.slug);
        setStatus(data.published ? "published" : "draft");
        setCategory(data.category || "Technology");
        setTags(data.tags?.join(", ") || "");
        setDescription(data.description || "");
        setCoverImage(data.coverImage || "");
        
        // Update Title dynamically
         document.title = `编辑: ${data.title}`;
      } catch (error) {
        console.error(error);
        toast.error("加载文章失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, accessToken, router, isNew]);

  // Handle title change to update document title
  useEffect(() => {
    if (title) {
        document.title = `${isNew ? '新建' : '编辑'}: ${title}`;
        if (isNew && !slug) {
            // Keep Chinese characters, replace spaces with -, remove special chars
            const autoSlug = title.toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
                .replace(/\-\-+/g, '-');
            setSlug(autoSlug);
        }
    }
  }, [title, isNew, slug]);


  const handleSave = async () => {
    if (!title) return toast.error("请输入标题");
    setIsSaving(true);

    try {
      const autoSlug = title.toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
                .replace(/\-\-+/g, '-');

      const payload = {
        title,
        content, // Content should be Markdown now thanks to TiptapEditor
        slug: slug || autoSlug,
        published: status === "published",
        category,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        description,
        coverImage,
      };

      const url = isNew ? "/api/posts/" : `/api/posts/${postId}`;
      
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save post");
      
      const savedPost = await res.json();
      
      toast.success("已保存");
      
      if (isNew) {
          // 如果是新建，跳转到列表或编辑页
          // router.push(`/admin/editor/post/${savedPost.id}`); // 可选
          router.push("/admin/posts");
          router.refresh();
      } else {
          setPost({ ...post!, ...payload, id: postId } as Post); 
      }

    } catch (error) {
      console.error(error);
      toast.error("保存失败");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const toastId = toast.loading("上传封面中...");

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
            method: "POST",
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        setCoverImage(data.url);
        toast.success("上传成功", { id: toastId });
      } catch (error) {
          console.error(error);
          toast.error("上传失败", { id: toastId });
      }
  };

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-white">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
            <Link href="/admin/posts" className="text-slate-500 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
                 <span className={status === 'published' ? 'w-2 h-2 rounded-full bg-green-500' : 'w-2 h-2 rounded-full bg-amber-500'} />
                 {status === 'published' ? '已发布' : '草稿'}
                {isSaving && <span className="opacity-50 ml-2">保存中...</span>}
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin"/> : <Save className="w-3 h-3" />}
                保存
             </button>

             <Sheet>
                 <SheetTrigger asChild>
                    <button className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                        <Settings className="w-5 h-5" />
                    </button>
                 </SheetTrigger>
                 <SheetContent className="overflow-y-auto">
                     <SheetHeader>
                         <SheetTitle>文章设置</SheetTitle>
                         <SheetDescription>配置元数据、SEO 和发布选项</SheetDescription>
                     </SheetHeader>
                     
                     <div className="mt-8 space-y-6">
                         {/* Slug */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 <Globe className="w-4 h-4" /> URL Slug
                             </label>
                             <input 
                                type="text" 
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                             />
                         </div>

                         {/* Status */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 <Layout className="w-4 h-4" /> 状态
                             </label>
                             <select 
                                value={status}
                                onChange={e => setStatus(e.target.value as any)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none"
                             >
                                 <option value="draft">草稿</option>
                                 <option value="published">发布</option>
                             </select>
                         </div>

                         {/* Cover Image */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 <ImageIcon className="w-4 h-4" /> 封面图
                             </label>
                             
                             {coverImage ? (
                                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group">
                                     <img src={getAssetUrl(coverImage)} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                         <button onClick={() => setCoverImage("")} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white">
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

                         {/* Category */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 <Hash className="w-4 h-4" /> 分类
                             </label>
                             <input 
                                type="text" 
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none"
                             />
                         </div>

                         {/* Tags */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 <Tag className="w-4 h-4" /> 标签
                             </label>
                             <input 
                                type="text" 
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="React, Next.js, Web"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none"
                             />
                             <p className="text-xs text-slate-400">用逗号分隔多个标签</p>
                         </div>

                          {/* Description */}
                          <div className="space-y-2">
                             <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                                 摘要
                             </label>
                             <textarea 
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 outline-none resize-none"
                             />
                         </div>

                         <div className="pt-4 border-t">
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                {isSaving ? "保存中..." : "保存更改"}
                            </button>
                         </div>
                     </div>
                 </SheetContent>
             </Sheet>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-4xl mx-auto py-12 px-6 sm:px-8">
        {/* 标题输入 */}
        <TextareaAutosize
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="无标题"
            className="w-full resize-none bg-transparent text-4xl sm:text-5xl font-extrabold text-slate-900 placeholder:text-slate-300 outline-none mb-8 leading-tight selection:bg-indigo-100"
            minRows={1}
        />

        {/* 编辑器: 只有在 content 加载后才渲染，避免闪烁 */}
        {!isLoading && (
             <TiptapEditor 
                initialContent={content} 
                onChange={setContent} 
                className="min-h-[60vh]"
            />
        )}
      </main>
    </div>
  );
}
