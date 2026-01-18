"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Helper to slugify consistent with MarkdownRenderer
const slugify = (text: string) => text.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');

interface TOCProps {
    content: string;
}

export function TableOfContents({ content }: TOCProps) {
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState("");

    useEffect(() => {
        // Parse headings from markdown
        // Regex handles standard markdown headers
        // Also handle code blocks to avoid headers inside code
        const lines = content.split('\n');
        const extracted = [];
        let inCodeBlock = false;

        for (const line of lines) {
            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            if (inCodeBlock) continue;

            const match = line.match(/^(#{1,3})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim();
                const id = slugify(text);
                extracted.push({ id, text, level });
            }
        }
        setHeadings(extracted);
    }, [content]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    if(headings.length === 0) return null;

    return (
        <nav className="space-y-1">
            <h4 className="font-bold text-sm mb-4 uppercase text-muted-foreground tracking-wider">On this page</h4>
            <ul className="space-y-2 text-sm border-l border-slate-200 dark:border-slate-800">
                {headings.map(({ id, text, level }) => (
                    <li key={id} className="relative">
                        <a 
                            href={`#${id}`}
                            className={cn(
                                "block transition-colors hover:text-indigo-600 line-clamp-2 py-1 pl-4 border-l-2 -ml-[1px]",
                                activeId === id ? "text-indigo-600 font-bold border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20" : "text-muted-foreground border-transparent hover:border-slate-300"
                            )}
                            style={{ paddingLeft: `${16 + (level - 1) * 12}px` }}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                                setActiveId(id);
                            }}
                        >
                            {text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
