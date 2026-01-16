"use client";

import { useState, useMemo } from "react";
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

  const displayCategories = ["All", ...allCategories];
  const displayTags = ["All", ...allTags];

  // 过滤文章
  const filteredPosts = useMemo(() => {
    let posts = initialPosts;

    // 按分类筛选
    if (selectedCategory !== "All") {
        posts = posts.filter(post => post.category === selectedCategory);
    }

    // 按标签筛选
    if (selectedTag !== "All") {
      posts = posts.filter((post) => post.tags.includes(selectedTag));
    }

    // 按搜索关键词筛选
    if (searchQuery.trim()) {
      posts = searchPosts(posts, searchQuery);
    }

    return posts;
  }, [initialPosts, selectedCategory, selectedTag, searchQuery]);

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
             Exploring code, design, and the spaces in between.
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
