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
  Plus,
  Github,
  ExternalLink,
} from "lucide-react";
import CategorySelector from "@/components/admin/CategorySelector";
import ImageCropper from "@/components/admin/ImageCropper";
import EditorHelp from "@/components/editor/EditorHelp";

const TiptapEditor = dynamic(
  () => import("@/components/editor/TiptapEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-slate-500">加载编辑器...</p>
        </div>
      </div>
    ),
  }
);

export default function ProjectEditorPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const isEditing = projectId !== "new";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorReady, setEditorReady] = useState(!isEditing);

  // 表单状态
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

  // 数组状态
  const [techStack, setTechStack] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [newTech, setNewTech] = useState("");
  const [newFeature, setNewFeature] = useState("");

  // 图片裁剪状态
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  // 加载现有项目
  useEffect(() => {
    if (isEditing) {
      fetchAPI(`/api/projects/id/${projectId}`)
        .then((project: any) => {
          setTitle(project.title || "");
          setSlug(project.slug || "");
          setDescription(project.description || "");
          setCategory(project.category || "Web App");
          setImage(project.image || "");
          setGithubLink(project.githubLink || "");
          setDemoLink(project.demoLink || "");
          setPublished(project.published ?? true);
          setVisibility(project.visibility || "public");
          setTechStack(project.techStack || []);
          setFeatures(project.features || []);
          setFullDescription(project.fullDescription || "");
          setEditorReady(true);
        })
        .catch((err) => {
          console.error("Failed to load project:", err);
          alert("加载项目失败，可能项目不存在");
          router.push("/admin/projects");
        })
        .finally(() => setInitialLoading(false));
    }
  }, [isEditing, projectId, router]);

  // 动态更新页面标题
  useEffect(() => {
    document.title = title ? `编辑: ${title}` : (isEditing ? "加载中..." : "新建项目");
  }, [title, isEditing]);

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

  const handleEditorChange = useCallback((html: string) => {
    setFullDescription(html);
  }, []);

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
      const file = new File([blob], "project-cover.jpg", {
        type: "image/jpeg",
      });

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
      setImage(data.url);
      setShowCropper(false);
      setTempImageUrl(null);
    } catch {
      alert("封面图上传失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish: boolean = true) => {
    if (!title.trim()) {
      alert("请输入项目名称");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        fullDescription,
        category,
        image,
        githubLink,
        demoLink,
        techStack,
        features,
        published: publish,
        visibility,
      };

      if (isEditing) {
        await fetchAPI(`/api/projects/${projectId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAPI("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      alert("保存失败");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTech = () => {
    if (newTech.trim()) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech("");
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-500 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">加载项目...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* 主编辑区 */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/projects"
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="font-bold text-lg text-slate-800">
                  {isEditing ? "编辑项目" : "新建项目"}
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200"
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

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 标题输入 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="输入项目名称..."
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
                initialContent={fullDescription}
                onChange={handleEditorChange}
              />
            )}
          </div>
        </main>
      </div>

      {/* 侧边栏 */}
      <aside
        className={`w-80 border-l border-slate-200 bg-white flex-shrink-0 transition-all duration-300 overflow-y-auto ${
          sidebarOpen
            ? "translate-x-0"
            : "translate-x-full absolute right-0 h-full"
        }`}
      >
        <div className="p-6 space-y-6">
          <h3 className="font-bold text-lg text-slate-800">项目设置</h3>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">URL Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:border-purple-300 focus:ring focus:ring-purple-100 transition-all"
              placeholder="project-slug"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">分类</label>
            <CategorySelector
              value={category}
              onChange={setCategory}
              placeholder="选择分类..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">技术栈</label>
            <div className="flex flex-wrap gap-1 mb-2">
              {techStack.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  {tech}
                  <button
                    onClick={() =>
                      setTechStack(techStack.filter((_, idx) => idx !== i))
                    }
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTech())
                }
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-300"
                placeholder="添加技术..."
              />
              <button
                onClick={addTech}
                className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">功能特性</label>
            <div className="space-y-1 mb-2">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="px-3 py-2 bg-slate-100 rounded-lg text-sm flex items-center justify-between"
                >
                  {feat}
                  <button
                    onClick={() =>
                      setFeatures(features.filter((_, idx) => idx !== i))
                    }
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-1">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addFeature())
                }
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-purple-300"
                placeholder="添加特性..."
              />
              <button
                onClick={addFeature}
                className="p-2 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">GitHub</label>
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="url"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                placeholder="https://github.com/..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Demo</label>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="url"
                value={demoLink}
                onChange={(e) => setDemoLink(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">可见性</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  visibility === "public"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200"
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
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-200"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <EyeOff className="w-4 h-4" />
                登录可见
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">封面图</label>
            {image ? (
              <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-sm">
                <img
                  src={getAssetUrl(image)}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70"
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
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center justify-center text-slate-400 group-hover:text-purple-500">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold uppercase">上传封面</span>
                </div>
              </label>
            )}
          </div>
        </div>
      </aside>

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

      <EditorHelp />
    </div>
  );
}
