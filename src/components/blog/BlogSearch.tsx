"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
}

export function BlogSearch({ onSearch }: BlogSearchProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="relative max-w-md mx-auto">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索文章内容..."
        className="w-full pl-10 pr-4 py-3 rounded-full border border-border bg-card focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      />
    </div>
  );
}
