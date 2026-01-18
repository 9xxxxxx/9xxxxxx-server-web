"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useCallback, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  FileCode,
} from "lucide-react";

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  className?: string;
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
      className={`p-2 rounded-lg transition-all duration-150 ${
        isActive
          ? "bg-indigo-100 text-indigo-600"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );
}

// 分隔线
function Divider() {
  return <div className="w-px h-6 bg-slate-200 mx-1" />;
}

export default function TiptapEditor({
  initialContent = "",
  onChange,
  className = "",
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full mx-auto my-4 shadow-md",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-600 underline hover:text-indigo-800",
        },
      }),
      Placeholder.configure({
        placeholder: "开始编写内容... 使用工具栏格式化文本",
        emptyEditorClass: "is-editor-empty",
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[500px] p-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    immediatelyRender: false,
  });

  // 当 initialContent 变化时更新编辑器
  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
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

  // 图片上传
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !editor) return;

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

        // 构建完整 URL
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const fullUrl = data.url.startsWith("http")
          ? data.url
          : `${baseUrl}${data.url}`;

        editor.chain().focus().setImage({ src: fullUrl }).run();
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("图片上传失败");
      }
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-50 rounded-xl">
        <div className="animate-pulse text-slate-400">加载编辑器...</div>
      </div>
    );
  }

  return (
    <div className={`tiptap-editor-wrapper bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {/* 工具栏 */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-0.5">
        {/* 撤销/重做 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 文本样式 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="粗体 (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="斜体 (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="下划线 (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="删除线"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 标题 */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="标题 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="标题 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="标题 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 列表 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 对齐 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="左对齐"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="居中"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="右对齐"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 块元素 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="行内代码"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="代码块"
        >
          <FileCode className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分隔线"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* 链接 */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            isActive={editor.isActive("link")}
            title="插入链接"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-20 flex gap-2">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="px-2 py-1 text-sm border border-slate-200 rounded w-48"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
              <button
                onClick={setLink}
                className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
              >
                添加
              </button>
            </div>
          )}
        </div>

        {/* 图片 */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowImageInput(!showImageInput)}
            title="插入图片"
          >
            <ImageIcon className="w-4 h-4" />
          </ToolbarButton>
          {showImageInput && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-3 z-20 w-64">
              <div className="space-y-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    上传图片
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1 block w-full text-sm"
                  />
                </label>
                <div className="text-xs text-slate-400 text-center">或</div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="图片 URL"
                    className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
                    onKeyDown={(e) => e.key === "Enter" && addImage()}
                  />
                  <button
                    onClick={addImage}
                    className="px-2 py-1 bg-indigo-600 text-white text-sm rounded"
                  >
                    添加
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 编辑器内容区 */}
      <EditorContent editor={editor} />

      {/* 样式 */}
      <style jsx global>{`
        .tiptap-editor-wrapper .ProseMirror {
          min-height: 500px;
          outline: none;
        }

        .tiptap-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
        }

        .tiptap-editor-wrapper .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 1em 0 0.5em;
          color: #1e293b;
        }

        .tiptap-editor-wrapper .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.8em 0 0.4em;
          color: #334155;
        }

        .tiptap-editor-wrapper .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          margin: 0.6em 0 0.3em;
          color: #475569;
        }

        .tiptap-editor-wrapper .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.75;
        }

        .tiptap-editor-wrapper .ProseMirror ul,
        .tiptap-editor-wrapper .ProseMirror ol {
          padding-left: 1.5em;
        }

        .tiptap-editor-wrapper .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1em;
          margin: 1em 0;
          color: #64748b;
          font-style: italic;
          background: #f8fafc;
          padding: 0.5em 1em;
          border-radius: 0 8px 8px 0;
        }

        .tiptap-editor-wrapper .ProseMirror code {
          background: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: "Fira Code", monospace;
          font-size: 0.9em;
          color: #e11d48;
        }

        .tiptap-editor-wrapper .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }

        .tiptap-editor-wrapper .ProseMirror pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }

        .tiptap-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 2em 0;
        }

        .tiptap-editor-wrapper .ProseMirror img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
