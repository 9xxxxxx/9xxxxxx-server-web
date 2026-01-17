"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PostEditor from "@/components/admin/PostEditor";
import { fetchAPI } from "@/lib/api-client";
import { Post } from "@/lib/blog";
import { Loader2 } from "lucide-react";

function PostEditorWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    console.log("Fetching post ID:", id);
    fetchAPI<Post>(`/api/posts/id/${id}`)
      .then(setPost)
      .catch((e) => {
          console.error("Load post error:", e);
          alert("Failed to load post");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;
  
  // If id is provided but post not found
  if (id && !post) return <div>Post not found</div>;

  return <PostEditor initialPost={post || undefined} isEditing={!!id} />;
}

export default function AdminPostEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>}>
      <PostEditorWrapper />
    </Suspense>
  );
}
