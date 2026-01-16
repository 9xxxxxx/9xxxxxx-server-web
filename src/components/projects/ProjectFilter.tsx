"use client";

import { Badge } from "@/components/ui/badge";

interface ProjectFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export function ProjectFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      <Badge
        variant={selectedCategory === null ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80 transition-colors px-4 py-2"
        onClick={() => onSelectCategory(null)}
      >
        全部项目
      </Badge>
      {categories.map((category) => (
        <Badge
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors px-4 py-2"
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Badge>
      ))}
    </div>
  );
}
