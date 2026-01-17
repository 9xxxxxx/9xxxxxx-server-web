"use client";

import { useEffect, useState, use } from "react";
import PostEditor from "@/components/admin/PostEditor";
import { fetchAPI } from "@/lib/api-client";
import { Post } from "@/lib/blog";
import { Loader2 } from "lucide-react";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  // Use `use` unwrapping for params in Next.js 15+ (if applicable, or just await in server comp, but this is client comp)
  // In Next.js 13/14 client comp, params is prop. But types say Promise?
  // Recent Next.js versions made params async in some contexts. 
  // Let's assume params is usable directly or use `use` hook.
  // Standard Client Comp pattern: params are passed as prop, but if strict mode enabled, might need `use`.
  // Let's safe wrapper.
  const resolvedParams = use(params);

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resolvedParams?.id) return;
    
    // Use the explicit ID endpoint
    console.log("Fetching post ID:", resolvedParams.id);
    fetchAPI<Post>(`/api/posts/id/${resolvedParams.id}`)
      .then(setPost)
      .catch((e) => {
          console.error("Load post error:", e);
          alert("Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;
  if (!post) return <div>Post not found</div>;

  return <PostEditor initialPost={post} isEditing />;
}
