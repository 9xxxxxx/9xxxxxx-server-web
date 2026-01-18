"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Editor, rootCtx, defaultValueCtx, editorViewCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { nord } from "@milkdown/theme-nord";
import { Milkdown, MilkdownProvider, useEditor, useInstance } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { clipboard } from "@milkdown/plugin-clipboard";
import { history } from "@milkdown/plugin-history";
import { replaceAll } from "@milkdown/kit/utils";
import "@milkdown/theme-nord/style.css";

interface MilkdownEditorProps {
  initialContent?: string;
  onChange?: (markdown: string) => void;
  className?: string;
  autoFocus?: boolean;
}

function MilkdownEditorInner({
  initialContent = "",
  onChange,
  autoFocus = true,
}: MilkdownEditorProps) {
  const onChangeRef = useRef(onChange);
  const initialContentRef = useRef(initialContent);
  const hasInitialized = useRef(false);
  
  onChangeRef.current = onChange;

  const { get } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, initialContentRef.current || "");

        // 监听内容变化
        const listenerPlugin = ctx.get(listenerCtx);
        listenerPlugin.markdownUpdated((_, markdown) => {
          onChangeRef.current?.(markdown);
        });
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(listener)
      .use(clipboard)
      .use(history);
  }, []);

  const [loading, getInstance] = useInstance();

  // 当 initialContent 变化时更新编辑器内容
  useEffect(() => {
    if (loading) return;
    
    const editor = getInstance();
    if (!editor) return;

    // 只在初次加载或内容确实变化时更新
    if (!hasInitialized.current && initialContent) {
      hasInitialized.current = true;
      editor.action(replaceAll(initialContent));
      
      // 自动聚焦
      if (autoFocus) {
        setTimeout(() => {
          try {
            const view = editor.ctx.get(editorViewCtx);
            view.focus();
          } catch (e) {
            console.error("Focus error:", e);
          }
        }, 100);
      }
    }
  }, [loading, getInstance, initialContent, autoFocus]);

  // 首次渲染时自动聚焦（新建模式）
  useEffect(() => {
    if (loading || !autoFocus || initialContent) return;
    
    const editor = getInstance();
    if (!editor) return;

    setTimeout(() => {
      try {
        const view = editor.ctx.get(editorViewCtx);
        view.focus();
      } catch (e) {
        console.error("Focus error:", e);
      }
    }, 200);
  }, [loading, getInstance, autoFocus, initialContent]);

  return <Milkdown />;
}

export default function MilkdownEditor(props: MilkdownEditorProps) {
  return (
    <div className={`milkdown-editor-wrapper ${props.className || ""}`}>
      <MilkdownProvider>
        <MilkdownEditorInner {...props} />
      </MilkdownProvider>
      <style jsx global>{`
        /* Milkdown 美化样式 */
        .milkdown-editor-wrapper {
          position: relative;
        }
        
        .milkdown-editor-wrapper .milkdown {
          min-height: 500px;
          padding: 1.5rem 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .milkdown-editor-wrapper .editor {
          outline: none;
        }
        
        .milkdown-editor-wrapper .ProseMirror {
          min-height: 450px;
          padding: 1rem;
          background: linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        
        .milkdown-editor-wrapper .ProseMirror:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
        
        .milkdown-editor-wrapper .ProseMirror p {
          margin: 0.5em 0;
          line-height: 1.75;
          color: #374151;
        }
        
        .milkdown-editor-wrapper .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          color: #111827;
          margin: 1em 0 0.5em;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 0.3em;
        }
        
        .milkdown-editor-wrapper .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 600;
          color: #1f2937;
          margin: 0.8em 0 0.4em;
        }
        
        .milkdown-editor-wrapper .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          color: #374151;
          margin: 0.6em 0 0.3em;
        }
        
        .milkdown-editor-wrapper .ProseMirror ul,
        .milkdown-editor-wrapper .ProseMirror ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror li {
          margin: 0.25em 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror blockquote {
          border-left: 4px solid #6366f1;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
          font-style: italic;
          background: #f3f4f6;
          padding: 0.5em 1em;
          border-radius: 0 8px 8px 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror code {
          background: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-family: 'Fira Code', monospace;
          font-size: 0.9em;
          color: #e11d48;
        }
        
        .milkdown-editor-wrapper .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1em;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1em 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .milkdown-editor-wrapper .ProseMirror a {
          color: #6366f1;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        
        .milkdown-editor-wrapper .ProseMirror a:hover {
          color: #4f46e5;
        }
        
        .milkdown-editor-wrapper .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 2em 0;
        }
        
        /* 占位符样式 */
        .milkdown-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          content: "开始输入 Markdown... (例如: # 标题, - 列表, **粗体**)";
          color: #9ca3af;
          pointer-events: none;
          float: left;
          height: 0;
          font-style: italic;
        }
        
        /* 任务列表 */
        .milkdown-editor-wrapper .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding-left: 0;
        }
        
        .milkdown-editor-wrapper .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        
        .milkdown-editor-wrapper .ProseMirror ul[data-type="taskList"] input[type="checkbox"] {
          margin-top: 0.3em;
          accent-color: #6366f1;
        }
      `}</style>
    </div>
  );
}
