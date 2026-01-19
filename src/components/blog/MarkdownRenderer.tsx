"use client";

import { ReactNode } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import { getAssetUrl } from "@/lib/utils";
import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const CodeBlock = ({ language, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async () => {
    if (!children) return;
    try {
      await navigator.clipboard.writeText(String(children));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  return (
    <div className="relative group my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-[#1e1e1e]">
       {/* Set SyntaxHighlighter background to transparent or match container to avoid double padding/borders if needed */}
       <div className="flex items-center justify-between px-4 py-2 bg-[#292929] border-b border-black/20">
          <div className="flex items-center gap-2">
             <Terminal className="w-3.5 h-3.5 text-slate-400" />
             <span className="text-xs font-medium text-slate-400 lowercase">{language}</span>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            {isCopied ? (
                <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                </>
            )}
          </button>
       </div>
       
       <div className="relative">
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={language}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.9rem', lineHeight: '1.6' }}
              wrapLines={true}
              {...props}
            >
              {children}
            </SyntaxHighlighter>
       </div>
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={{
        code({ node, inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <CodeBlock language={match[1]} {...props}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        img: ({ node, ...props }: any) => {
            return <img {...props} src={getAssetUrl(props.src)} className="rounded-2xl shadow-lg my-8 w-full object-cover" />;
        },
        h1: ({ node, children, ...props }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
            return <h1 id={id} {...props} className="scroll-mt-24">{children}</h1>;
        },
        h2: ({ node, children, ...props }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
            return <h2 id={id} {...props} className="scroll-mt-24">{children}</h2>;
        },
        h3: ({ node, children, ...props }: any) => {
            const id = children?.toString().toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, '-');
            return <h3 id={id} {...props} className="scroll-mt-24">{children}</h3>;
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
