"use client";

import { useState, useEffect, useCallback } from "react";
import {
  HelpCircle,
  X,
  Keyboard,
  Type,
  Image,
  List,
  Code,
  Quote,
  CheckSquare,
} from "lucide-react";

interface EditorHelpProps {
  className?: string;
}

const shortcuts = [
  { icon: <Type className="w-4 h-4" />, key: "# + 空格", desc: "标题" },
  { icon: <Keyboard className="w-4 h-4" />, key: "Ctrl+B", desc: "粗体" },
  { icon: <Keyboard className="w-4 h-4" />, key: "Ctrl+I", desc: "斜体" },
  { icon: <Keyboard className="w-4 h-4" />, key: "Ctrl+Z", desc: "撤销" },
  { icon: <Keyboard className="w-4 h-4" />, key: "Ctrl+Y", desc: "重做" },
];

const blocks = [
  { icon: <Type className="w-4 h-4" />, name: "标题", tip: "# ## ###" },
  { icon: <List className="w-4 h-4" />, name: "列表", tip: "- 或 1." },
  { icon: <CheckSquare className="w-4 h-4" />, name: "待办", tip: "- [ ]" },
  { icon: <Quote className="w-4 h-4" />, name: "引用", tip: "> 文字" },
  { icon: <Code className="w-4 h-4" />, name: "代码", tip: "```" },
  { icon: <Image className="w-4 h-4" />, name: "图片", tip: "拖拽或粘贴" },
];

export default function EditorHelp({ className = "" }: EditorHelpProps) {
  const [open, setOpen] = useState(false);

  // ESC 键关闭
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  // 点击背景关闭
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* 帮助按钮 - z-index 超高 */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-[9998] p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform ${className}`}
        title="编辑器帮助"
      >
        <HelpCircle className="w-6 h-6" />
      </button>

      {/* 帮助面板 - 最高层级 */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdropClick}
        >
          <div className="bg-card rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold">Markdown 编辑指南</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  支持 Markdown 语法 · 按 ESC 关闭
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              {/* 快速开始 */}
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <h3 className="font-bold text-primary mb-2">🚀 快速开始</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  直接输入 Markdown 语法即可！例如输入{" "}
                  <kbd className="px-2 py-0.5 bg-muted rounded font-mono text-xs">
                    # 标题
                  </kbd>{" "}
                  会自动转换为一级标题。
                </p>
              </div>

              {/* 常用语法 */}
              <div>
                <h3 className="font-bold mb-3">📝 Markdown 语法</h3>
                <div className="grid grid-cols-2 gap-2">
                  {blocks.map((block) => (
                    <div
                      key={block.name}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-background border border-border">
                        {block.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{block.name}</div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {block.tip}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 快捷键 */}
              <div>
                <h3 className="font-bold mb-3">⌨️ 快捷键</h3>
                <div className="space-y-2">
                  {shortcuts.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="text-sm">{item.desc}</span>
                      </div>
                      <kbd className="px-2 py-1 bg-background border border-border rounded font-mono text-xs">
                        {item.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* 格式化示例 */}
              <div className="bg-muted/50 rounded-xl p-4">
                <h3 className="font-bold mb-2">✨ 格式化示例</h3>
                <div className="text-sm font-mono space-y-1 text-muted-foreground">
                  <p>
                    <span className="text-foreground">**粗体**</span> →{" "}
                    <strong>粗体</strong>
                  </p>
                  <p>
                    <span className="text-foreground">*斜体*</span> →{" "}
                    <em>斜体</em>
                  </p>
                  <p>
                    <span className="text-foreground">`代码`</span> →{" "}
                    <code className="px-1 bg-muted rounded">代码</code>
                  </p>
                  <p>
                    <span className="text-foreground">[链接](url)</span> →{" "}
                    <span className="text-primary underline">链接</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 底部 */}
            <div className="p-4 border-t border-border bg-muted/30">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                开始创作
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
