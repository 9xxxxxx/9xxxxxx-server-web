"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
// import { Dialog, DialogContent } from "@/components/ui/dialog"; // Unused
// Actually, let's build it using cmdk primitives directly for maximum control if shadcn dialog isn't available,
// BUT for this project we want a custom glassmorphism modal.
// I'll implementation a clean custom overlay using cmdk + framer motion or just stardard CSS.
// To keep it simple and robust, I'll use standard fixed positioning.

import { FileText, FolderKanban, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "Blog" | "Project";
  title: string;
  description: string;
  url: string;
  category: string;
}

export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [data, setData] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Toggle function exposed to window for Navbar to call if needed, 
  // or we can use a custom event listener.
  // Let's use a custom event "open-command-menu".

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }

      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    const openHandler = () => setOpen(true);

    document.addEventListener("keydown", down);
    document.addEventListener("open-command-menu", openHandler);
    
    // Prefetch data when mounted to be instant
    fetchData();

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("open-command-menu", openHandler);
    };
  }, []);

  const fetchData = async () => {
    try {
        setLoading(true);
        const res = await fetch("/api/search");
        const json = await res.json();
        if(Array.isArray(json)) {
            setData(json);
        }
    } catch(e) {
        console.error("Search fetch error", e);
    } finally {
        setLoading(false);
    }
  }

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  if (!open) return null;

  return (
    <div 
        className="fixed inset-0 z-[99999] bg-slate-950/50 backdrop-blur-sm px-4 transition-all duration-200 fade-in-0"
        onClick={(e) => {
            if (e.target === e.currentTarget) {
                setOpen(false);
            }
        }}
    >
      <div className="fixed left-[50%] top-[20%] w-full max-w-2xl -translate-x-1/2 rounded-xl bg-white shadow-2xl dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        <Command label="Global Search" className="w-full">
            <div className="flex items-center border-b px-3">
                <Search className="mr-2 h-5 w-5 shrink-0 opacity-50" />
                <Command.Input 
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search projects, posts, or commands..." 
                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button onClick={() => setOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 transition-colors">
                    <X className="w-4 h-4 text-slate-500" />
                </button>
            </div>
            
            <Command.List className="max-h-[60vh] overflow-y-auto overflow-x-hidden p-2">
                <Command.Empty className="py-6 text-center text-sm text-slate-500">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Projects" className="text-xs font-medium text-slate-500 px-2 py-1.5">
                    {data.filter(i => i.type === 'Project').map((item) => (
                        <Command.Item
                            key={item.url}
                            value={`${item.title} ${item.description} ${item.category}`}
                            onSelect={() => runCommand(() => router.push(item.url))}
                            className="relative flex items-center gap-3 rounded-lg px-2 py-3 text-sm aria-selected:bg-indigo-50 dark:aria-selected:bg-indigo-900/20 aria-selected:text-indigo-600 cursor-pointer group select-none transition-colors"
                        >   
                             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600">
                                <FolderKanban className="h-5 w-5" />
                             </div>
                             <div className="flex flex-col gap-0.5 flex-1">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 group-aria-selected:text-indigo-700 dark:group-aria-selected:text-indigo-300">{item.title}</span>
                                <span className="text-xs text-slate-500 line-clamp-1">{item.description}</span>
                             </div>
                             <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-400">
                                {item.category}
                             </span>
                        </Command.Item>
                    ))}
                </Command.Group>

                <div className="h-px bg-slate-100 dark:bg-slate-800 mx-2 my-2" />

                <Command.Group heading="Blog Posts" className="text-xs font-medium text-slate-500 px-2 py-1.5">
                    {data.filter(i => i.type === 'Blog').map((item) => (
                        <Command.Item
                            key={item.url}
                            value={`${item.title} ${item.description} ${item.category}`}
                            onSelect={() => runCommand(() => router.push(item.url))}
                            className="relative flex items-center gap-3 rounded-lg px-2 py-3 text-sm aria-selected:bg-blue-50 dark:aria-selected:bg-blue-900/20 aria-selected:text-blue-600 cursor-pointer group select-none transition-colors"
                        >
                             <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100/50 dark:bg-blue-900/30 text-blue-600">
                                <FileText className="h-5 w-5" />
                             </div>
                             <div className="flex flex-col gap-0.5 flex-1">
                                <span className="font-semibold text-slate-900 dark:text-slate-100 group-aria-selected:text-blue-700 dark:group-aria-selected:text-blue-300">{item.title}</span>
                                <span className="text-xs text-slate-500 line-clamp-1">{item.description}</span>
                             </div>
                             <span className="text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-400">
                                {item.category}
                             </span>
                        </Command.Item>
                    ))}
                </Command.Group>

            </Command.List>
            
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 text-[10px] text-slate-400 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                 <div className="flex gap-2">
                    <span><strong>↑↓</strong> to navigate</span>
                    <span><strong>↵</strong> to select</span>
                    <span><strong>esc</strong> to close</span>
                 </div>
                 <span>Search powered by cmdk</span>
            </div>
        </Command>
      </div>
    </div>
  );
}
