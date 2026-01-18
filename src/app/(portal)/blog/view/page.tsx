"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import { Post, getRelatedPosts } from "@/lib/blog";
import BlogPostClient from "./BlogPostClient";
import { motion } from "framer-motion";

function BlogViewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [post, setPost] = useState<Post | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
        setLoading(false);
        return;
    }

    const loadData = async () => {
        try {
            // Import dynamically or use standard import if lib is client-safe
            // lib/blog uses fetchAPI which is safe.
            const { getPostBySlug } = await import("@/lib/blog");
            const fetchedPost = await getPostBySlug(slug);
            
            if (!fetchedPost) {
                setError(true);
            } else {
                setPost(fetchedPost);
                // Load related posts
                const related = await getRelatedPosts(slug, 3);
                setRelatedPosts(related);
            }
        } catch (e) {
            console.error("Failed to fetch post", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  if (error || !post) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
             <h1 className="text-2xl font-bold">Article Not Found</h1>
             <p className="text-slate-500">The article you are looking for does not exist or could not be loaded.</p>
        </div>
      );
  }

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}

export default function BlogViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BlogViewContent />
        </Suspense>
    );
}
