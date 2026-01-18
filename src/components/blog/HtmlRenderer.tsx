"use client";

import { useEffect, useRef } from "react";
import { getAssetUrl } from "@/lib/utils";

interface HtmlRendererProps {
  content: string;
}

export function HtmlRenderer({ content }: HtmlRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 处理图片 URL
    const images = containerRef.current.getElementsByTagName("img");
    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = img.getAttribute("src");
        if (src && !src.startsWith("http") && !src.startsWith("data:")) {
            img.src = getAssetUrl(src);
        }
        // 添加样式类
        img.classList.add("rounded-2xl", "shadow-lg", "my-8", "w-full", "object-cover");
    }

    // 可以添加其他后处理，例如代码高亮
  }, [content]);

  return (
    <div 
        ref={containerRef}
        className="prose-content"
        dangerouslySetInnerHTML={{ __html: content }} 
    />
  );
}
