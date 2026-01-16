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

interface PostFormProps {
  initialData?: {
    title: string;
    slug: string;
    description: string;
    content: string;
    tags: string[];
    category: string;
    coverImage?: string | null;
    published: boolean;
  };
  postId?: string;
}

export function PostForm({ initialData, postId }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    tags: initialData?.tags.join(", ") || "",
    category: initialData?.category || "Tech",
    coverImage: initialData?.coverImage || "",
    published: initialData?.published || false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        throw new Error("保存失败");
      }

      router.push("/dashboard/posts");
      router.refresh(); // Refresh Server Components
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
          <label className="text-sm font-medium text-foreground">标题</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleTitleBlur}
            required
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="输入文章标题"
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
            placeholder="my-post-url"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">分类</label>
            <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            >
                <option value="Tech">Tech (技术)</option>
                <option value="Life">Life (生活)</option>
                <option value="Review">Review (评论)</option>
                <option value="Game">Game (游戏)</option>
            </select>
        </div>
         <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">简介</label>
            <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="文章简述..."
            />
        </div>
      </div>

       <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            封面图
          </label>
          <ImageUpload
            value={formData.coverImage || ""}
            onChange={(url) => setFormData((prev) => ({ ...prev, coverImage: url }))}
          />
        </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">内容 (Markdown)</label>
        <div className="prose-editor">
          <SimpleMDE
            value={formData.content}
            onChange={handleContentChange}
            options={useMemo(() => ({
              spellChecker: false,
              autosave: {
                enabled: true,
                uniqueId: postId || "new-post",
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

                  if (!res.ok) {
                    throw new Error("Upload failed");
                  }

                  const data = await res.json();
                  onSuccess(data.url);
                } catch (error) {
                  console.error(error);
                  onError("Image upload failed");
                }
              },
            }), [postId])}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            标签 (逗号分隔)
          </label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Next.js, React, Tutorial"
          />
        </div>

        <div className="flex items-center space-x-3 pt-8">
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
          {loading ? "保存中..." : "保存文章"}
        </button>
      </div>
    </form>
  );
}
