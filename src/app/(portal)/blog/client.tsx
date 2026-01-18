"use client";

import { useState, useMemo, useEffect } from "react";
import { Post, searchPosts } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { FilterRow } from "@/components/ui/filter-row";

interface BlogClientPageProps {
  initialPosts: Post[];
  allTags: string[];
  allCategories: string[];
}

export default function BlogClientPage({ initialPosts, allTags, allCategories }: BlogClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [loading, setLoading] = useState(initialPosts.length === 0);
  const [tags, setTags] = useState<string[]>(allTags || []);
  const [categories, setCategories] = useState<string[]>(allCategories || []);

  useEffect(() => {
    // If we have no posts (SSR disabled/failed), fetch them on client
    if (posts.length === 0) {
        const loadData = async () => {
             try {
                // Determine API URL - ensure we use client-side fetch from api-client
                const { getAllPosts, getAllCategories, getAllTags } = await import("@/lib/blog");
                const [fetchedPosts, fetchedCats, fetchedTags] = await Promise.all([
                    getAllPosts(),
                    getAllCategories(),
                    getAllTags()
                ]);
                setPosts(fetchedPosts);
                setCategories(fetchedCats);
                setTags(fetchedTags);
             } catch (e) {
                 console.error("Failed to load blog data", e);
             } finally {
                 setLoading(false);
             }
        };
        loadData();
    } else {
        setLoading(false);
    }
  }, []);

  const displayCategories = ["All", ...categories];
  const displayTags = ["All", ...tags];

  // 过滤文章
  const filteredPosts = useMemo(() => {
    let result = posts;

    // 按分类筛选
    if (selectedCategory !== "All") {
        result = result.filter(post => post.category === selectedCategory);
    }

    // 按标签筛选
    if (selectedTag !== "All") {
      result = result.filter((post) => post.tags.includes(selectedTag));
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      result = searchPosts(result, searchQuery);
    }

    return result;
  }, [posts, selectedCategory, selectedTag, searchQuery]);

  return (
    <div className="min-h-screen relative font-sans">
      
      {/* Global Background Handles Ambience now */}

      {/* Header Section */}
      <header className="relative pt-40 pb-20 px-6 text-center z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-slate-900">
             Writings & <span className="text-indigo-600">Thoughts</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 mb-12 font-medium max-w-2xl mx-auto leading-relaxed">
             Exploring life, movies, and songs.
          </p>

          <div className="flex justify-center">
             <BlogSearch onSearch={setSearchQuery} />
          </div>
        </div>
      </header>

      {/* Filters Container */}
      <div className="max-w-7xl mx-auto px-6 pb-20 flex flex-col items-center gap-10 z-10 relative">
         <FilterRow 
            label="Category"
            items={displayCategories}
            selectedItem={selectedCategory}
            onSelect={setSelectedCategory}
         />
         <FilterRow 
            label="Topic"
            items={displayTags.slice(0, 10)} 
            selectedItem={selectedTag}
            onSelect={setSelectedTag}
         />
      </div>

      {/* Blog Grid */}
      <main className="max-w-7xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredPosts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
        </div>
        
        {filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-2xl text-slate-400 font-bold mb-4">No articles found matching criteria.</p>
                <button 
                    onClick={() => {setSelectedCategory("All"); setSelectedTag("All"); setSearchQuery("")}}
                    className="text-indigo-600 font-bold hover:underline"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </main>
    </div>
  );
}
