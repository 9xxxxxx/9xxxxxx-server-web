"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import FloatingMenuExtension from "@tiptap/extension-floating-menu";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Markdown } from "tiptap-markdown";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Underline as UnderlineIcon,
  Minus,
  FileCode,
  Check,
  Type
} from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { configureSlashCommand } from "./extensions/slashCommand";
import EditorHelp from "./EditorHelp";

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  className?: string;
}

// 浮动菜单按钮
function MenuButton({ onClick, isActive, children }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors",
                isActive ? "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30" : "text-slate-600 dark:text-slate-300"
            )}
        >
            {children}
        </button>
    )
}

// 工具栏按钮组件
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  children,
  title,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-lg transition-all duration-150 flex items-center justify-center min-w-[32px] min-h-[32px]",
        isActive
          ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

// 分隔线
function Divider() {
  return <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />;
}

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import python from 'highlight.js/lib/languages/python'
import 'highlight.js/styles/github-dark.css' // Import Highlight.js Theme

const lowlight = createLowlight(common)
lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)
lowlight.register('python', python)

export default function TiptapEditor({
  initialContent = "",
  onChange,
  className = "",
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const extensions = useMemo(() => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        dropcursor: {
             color: '#6366f1',
             width: 2
        },
        codeBlock: false, // Disable default CodeBlock
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg bg-[#0d1117] p-4 font-mono text-sm leading-relaxed my-4 shadow-inner border border-slate-800 overflow-x-auto",
        }
      }),
      BubbleMenuExtension,
      FloatingMenuExtension,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl shadow-lg my-6 max-w-full mx-auto border border-slate-100 dark:border-slate-800",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline decoration-indigo-300 underline-offset-4 hover:text-indigo-800 transition-colors cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder: "输入 '/' 打开命令菜单，或直接开始写作...",
        emptyEditorClass: "is-editor-empty",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Markdown.configure({
        html: true, 
        tightLists: true,
        tightListClass: "tight",
        transformPastedText: true,
        transformCopiedText: true,
      }),
      configureSlashCommand(),
  ], []);

  const editor = useEditor({
    extensions,
    content: initialContent,
    onCreate: ({ editor }) => {
      // @ts-ignore
      const markdown = editor.storage.markdown.getMarkdown();
      onChange?.(markdown);
    },
    onUpdate: ({ editor }) => {
      // @ts-ignore
      const markdown = editor.storage.markdown.getMarkdown();
      onChange?.(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[calc(100vh-200px)]", 
          "prose-headings:font-bold prose-headings:tracking-tight prose-indigo",
          "prose-img:rounded-xl prose-img:shadow-lg",
          "prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0", // 重置 Tailwind Typography 的 pre 样式
          className
        ),
      },
    },
    immediatelyRender: false,
  });

  // 当 initialContent 变化时更新编辑器 (仅在编辑器为空或内容差异极大时？这里简化处理，避免循环)
  // 注意：如果父组件传入的 initialContent 滞后，可能会导致光标跳变。
  // 通常 Tiptap 是非受控组件，initialContent 只用一次。但在我们的场景下，为了修复 Bug，我们暂时不监听 initialContent 变化。
  // 因为我们只在 onCreate 处理了初始值转换。如果这里监听，会重新 setContent。
  // 如果必须监听，需要 diff。
  useEffect(() => {
     if (editor && initialContent && editor.isEmpty) {
        // 只有为空时才重置，避免编辑冲突
        editor.commands.setContent(initialContent);
     }
  }, [editor, initialContent]);

  // 自动聚焦
  useEffect(() => {
    if (editor) {
      setTimeout(() => editor.commands.focus(), 100);
    }
  }, [editor]);

  // 插入链接
  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  // 插入图片
  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor.chain().focus().setImage({ src: imageUrl }).run();
    setShowImageInput(false);
    setImageUrl("");
  }, [editor, imageUrl]);

  // 图片上传逻辑
  const handleImageUpload = useCallback(async (file: File) => {
       if (!editor) return;
       try {
        const formData = new FormData();
        formData.append("file", file);

        const token = JSON.parse(
          localStorage.getItem("admin-auth-storage") || "{}"
        )?.state?.accessToken;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api/upload`,
          {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        const fullUrl = data.url;
        
        editor.chain().focus().setImage({ src: fullUrl }).run();
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("图片上传失败");
      }
  }, [editor]);

  const onImageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleImageUpload(file);
  }, [handleImageUpload]);


  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-xl">
        <div className="animate-pulse text-slate-400">Loading Editor...</div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 帮助弹窗 */}
      <EditorHelp />

      {/* 顶部固定工具栏 */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 dark:bg-slate-900/95 py-2 -mx-4 px-4 mb-8 flex flex-wrap items-center gap-1 shadow-sm transition-all">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销">
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

         {/* 标题下拉或按钮组 */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="H1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="H2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="H3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="粗体">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="斜体">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="删除线">
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Code">
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="列表">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="有序列表">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="引用">
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <Divider />
        
        {/* 图片与链接 */}
        <div className="relative group">
            <ToolbarButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive("link")} title="链接">
                <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
             {showLinkInput && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-2 z-50 flex gap-2 w-72">
                  <input
                    autoFocus
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="粘贴链接..."
                    className="flex-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-transparent outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === "Enter" && setLink()}
                  />
                  <button onClick={setLink} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700">OK</button>
                </div>
              )}
        </div>

        <div className="relative group">
            <ToolbarButton onClick={() => setShowImageInput(!showImageInput)} title="图片">
                <ImageIcon className="w-4 h-4" />
            </ToolbarButton>
            {showImageInput && (
                <div className="absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-4 z-50 w-72">
                   <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">上传或链接</p>
                   <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-6 h-6 text-slate-400 mb-1" />
                            <p className="text-xs text-slate-500">点击上传图片</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={onImageInputChange} />
                   </label>
                   <div className="relative mt-3">
                       <input 
                            type="url" 
                            placeholder="或输入图片 URL" 
                            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded bg-transparent outline-none focus:border-indigo-500"
                            value={imageUrl}
                            onChange={e => setImageUrl(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && addImage()}
                        />
                        <button onClick={addImage} className="absolute right-1 top-1 bottom-1 px-3 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">Go</button>
                   </div>
                </div>
            )}
        </div>
      </div>



      {/* 编辑器本体 */}
      <EditorContent editor={editor} />
      
      {/* 补充样式 */}
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
