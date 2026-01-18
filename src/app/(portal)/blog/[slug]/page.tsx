"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { Post, getRelatedPosts, getPostBySlug } from "@/lib/blog";
import BlogPostClient from "./BlogPostClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogPostPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
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
        const fetchedPost = await getPostBySlug(slug);
        
        if (!fetchedPost) {
          setError(true);
        } else {
          setPost(fetchedPost);
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
