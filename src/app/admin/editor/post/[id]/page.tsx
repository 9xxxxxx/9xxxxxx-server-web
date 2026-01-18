"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { fetchAPI } from "@/lib/api-client";
import { getAssetUrl } from "@/lib/utils";
import {
  ArrowLeft,
  Save,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import CategorySelector from "@/components/admin/CategorySelector";
import ImageCropper from "@/components/admin/ImageCropper";
import EditorHelp from "@/components/editor/EditorHelp";

// 动态导入编辑器避免 SSR 问题
const TiptapEditor = dynamic(
  () => import("@/components/editor/TiptapEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">加载编辑器...</p>
        </div>
      </div>
    ),
  }
);

export default function PostEditorPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const isEditing = postId !== "new";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorReady, setEditorReady] = useState(!isEditing);

  // 表单状态
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Tech");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(true);
  const [visibility, setVisibility] = useState("public");

  // 图片裁剪状态
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // 加载现有文章
  useEffect(() => {
    if (isEditing) {
      fetchAPI(`/api/posts/id/${postId}`)
        .then((post: any) => {
          setTitle(post.title || "");
          setSlug(post.slug || "");
          setDescription(post.description || "");
          setCategory(post.category || "Tech");
          setTags(post.tags?.join(", ") || "");
          setCoverImage(post.coverImage || "");
          setPublished(post.published ?? true);
          setVisibility(post.visibility || "public");
          
          // 设置内容
          setContent(post.content || "");
          setEditorReady(true);
        })
        .catch((err) => {
          console.error("Failed to load post:", err);
          alert("加载文章失败，可能文章不存在");
          router.push("/admin/posts");
        })
        .finally(() => setInitialLoading(false));
    }
  }, [isEditing, postId, router]);

  // 动态更新页面标题
  useEffect(() => {
    document.title = title ? `编辑: ${title}` : (isEditing ? "加载中..." : "新建文章");
  }, [title, isEditing]);

  // 标题变化时自动生成 slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      );
    }
  };

  // 编辑器内容变化
  const handleEditorChange = useCallback((html: string) => {
    setContent(html);
  }, []);

  // 封面图上传
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
      const blob = await fetch(croppedImageUrl).then((r) => r.blob());
      const file = new File([blob], "cover.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("file", file);

      const token = JSON.parse(
        localStorage.getItem("admin-auth-storage") || "{}"
      )?.state?.accessToken;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/upload`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setCoverImage(data.url);
      setShowCropper(false);
      setTempImageUrl(null);
    } catch {
      alert("封面图上传失败");
    } finally {
      setLoading(false);
    }
  };

  // 保存文章
  const handleSave = async (publish: boolean = true) => {
    if (!title.trim()) {
      alert("请输入文章标题");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        content,
        category,
        coverImage,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        published: publish,
        visibility,
      };

      if (isEditing) {
        await fetchAPI(`/api/posts/${postId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAPI("/api/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      alert("保存失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">加载文章...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 主编辑区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/posts"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="font-bold text-lg text-slate-800">
                  {isEditing ? "编辑文章" : "新建文章"}
                </h1>
                <p className="text-xs text-slate-400">使用工具栏格式化内容</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSave(false)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                保存草稿
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-bold hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                发布
              </button>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? (
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 编辑器主体 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 标题输入 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="输入文章标题..."
                className="w-full text-3xl font-bold bg-transparent border-0 outline-none placeholder:text-slate-300"
                autoFocus={!isEditing}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="添加简短描述（可选）..."
                rows={2}
                className="w-full mt-4 text-slate-500 bg-transparent border-0 outline-none resize-none placeholder:text-slate-300"
              />
            </div>

            {/* TipTap 编辑器 */}
            {editorReady && (
              <TiptapEditor
                initialContent={content}
                onChange={handleEditorChange}
              />
            )}
          </div>
        </main>
      </div>

      {/* 侧边栏 */}
      <aside
        className={`w-80 border-l border-slate-200 bg-white flex-shrink-0 transition-all duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full absolute right-0 h-full"
        }`}
      >
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          <h3 className="font-bold text-lg text-slate-800">文章设置</h3>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:border-indigo-300 focus:ring focus:ring-indigo-100 transition-all"
              placeholder="article-slug"
            />
          </div>

          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">分类</label>
            <CategorySelector
              value={category}
              onChange={setCategory}
              placeholder="选择分类..."
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">标签</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-indigo-300 focus:ring focus:ring-indigo-100 transition-all"
              placeholder="React, Next.js, API"
            />
          </div>

          {/* 可见性 */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">可见性</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  visibility === "public"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Eye className="w-4 h-4" />
                公开
              </button>
              <button
                type="button"
                onClick={() => setVisibility("login_required")}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  visibility === "login_required"
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <EyeOff className="w-4 h-4" />
                登录可见
              </button>
            </div>
          </div>

          {/* 封面图 */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">封面图</label>
            {coverImage ? (
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                <img
                  src={getAssetUrl(coverImage)}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block w-full cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold uppercase">上传封面</span>
                </div>
              </label>
            )}
          </div>
        </div>
      </aside>

      {/* 图片裁剪器 */}
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

      {/* 编辑器帮助 */}
      <EditorHelp />
    </div>
  );
}
