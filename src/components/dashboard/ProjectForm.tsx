"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

// Dynamically import SimpleMDE to avoid SSR issues
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

interface ProjectFormProps {
  initialData?: {
    title: string;
    slug: string;
    description: string;
    fullDescription: string;
    techStack: string[];
    features: string[];
    githubLink?: string | null;
    demoLink?: string | null;
    image: string;
    category?: string | null;
    published: boolean;
  };
  projectId?: string;
}

export function ProjectForm({ initialData, projectId }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    fullDescription: initialData?.fullDescription || "",
    techStack: initialData?.techStack.join(", ") || "",
    features: initialData?.features.join("\n") || "",
    githubLink: initialData?.githubLink || "",
    demoLink: initialData?.demoLink || "",
    image: initialData?.image || "",
    category: initialData?.category || "Web App",
    published: initialData?.published || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, fullDescription: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = projectId ? `/api/projects/${projectId}` : "/api/projects";
      const method = projectId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          techStack: formData.techStack.split(",").map((t) => t.trim()).filter(Boolean),
          features: formData.features.split("\n").map((f) => f.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }

      router.push("/dashboard/projects");
      router.refresh();
    } catch (err) {
      setError("保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title if empty
  const handleTitleBlur = () => {
    if (!formData.slug && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">项目名称</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleTitleBlur}
            required
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Awesome Project"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Slug (URL路径)
          </label>
          <input
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="awesome-project"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">简单描述 (列表页显示)</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="一句话介绍这个项目..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">详细介绍 (Markdown)</label>
        <div className="prose-editor">
          <SimpleMDE
            value={formData.fullDescription}
            onChange={handleContentChange}
            options={useMemo(() => ({
              spellChecker: false,
              autosave: {
                enabled: true,
                uniqueId: projectId || "new-project",
                delay: 1000,
              },
              uploadImage: true,
              imageUploadFunction: async (file: File, onSuccess: (url: string) => void, onError: (error: string) => void) => {
                const formData = new FormData();
                formData.append("image", file);

                try {
                  const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                  });

                  if (!res.ok) throw new Error("Upload failed");
                  const data = await res.json();
                  onSuccess(data.url);
                } catch (error) {
                  console.error(error);
                  onError("Image upload failed");
                }
              },
            }), [projectId])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            技术栈 (逗号分隔)
          </label>
          <input
            name="techStack"
            value={formData.techStack}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Next.js, TypeScript, TailwindCSS"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            项目分类
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="Web App">Web App</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Data Science">Data Science</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Tool">Tool/Library</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          主要功能 (每行一个)
        </label>
        <textarea
          name="features"
          value={formData.features}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="- 实时数据分析&#10;- 自动化报告生成"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            GitHub 链接
          </label>
          <input
            name="githubLink"
            value={formData.githubLink}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="https://github.com/..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            演示地址 (Demo)
          </label>
          <input
            name="demoLink"
            value={formData.demoLink}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="https://..."
          />
        </div>
      </div>
      
       <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            项目封面图
          </label>
          <ImageUpload
            value={formData.image}
            onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
          />
        </div>

      <div className="flex items-center space-x-3 pt-4">
        <input
          type="checkbox"
          name="published"
          id="published"
          checked={formData.published}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, published: e.target.checked }))
          }
          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="published" className="text-sm font-medium text-foreground">
          立即发布
        </label>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? "保存中..." : "保存项目"}
        </button>
      </div>
    </form>
  );
}
