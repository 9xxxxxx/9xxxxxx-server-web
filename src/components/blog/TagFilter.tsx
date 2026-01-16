"use client";

import { Badge } from "@/components/ui/badge";

interface TagFilterProps {
  tags: string[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export function TagFilter({ tags, selectedTag, onSelectTag }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Badge
        variant={selectedTag === null ? "default" : "outline"}
        className="cursor-pointer hover:bg-primary/80 transition-colors"
        onClick={() => onSelectTag(null)}
      >
        全部
      </Badge>
      {tags.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/80 transition-colors"
          onClick={() => onSelectTag(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
