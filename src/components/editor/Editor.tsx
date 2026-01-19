"use client";

/**
 * 结构化内容编辑器
 * 
 * 核心特性：
 * - ProseMirror JSON 为单一真相来源
 * - 支持 Markdown 导入
 * - 内容优先，低干扰设计
 */

import { useEditor, EditorContent, JSONContent } from '@tiptap/react'
import { useCallback, useEffect, useRef } from 'react'
import { createEditorExtensions } from './extensions'
import Toolbar from './Toolbar'
import { markdownToJSON } from './render/fromMarkdown'
import './editor.css'

export interface StructuredEditorProps {
  /** 初始内容：可以是 JSON 或 Markdown 字符串 */
  initialContent?: JSONContent | string
  /** 内容变化回调，返回 JSON 格式 */
  onChange?: (json: JSONContent) => void
  /** 自定义类名 */
  className?: string
  /** 自动聚焦 */
  autoFocus?: boolean
  /** 占位符文本 */
  placeholder?: string
}

/**
 * 检测内容是否为 Markdown（简单启发式）
 */
function isMarkdownString(content: unknown): content is string {
  if (typeof content !== 'string') return false
  if (!content.trim()) return false
  
  // JSON 以 { 开头
  if (content.trim().startsWith('{')) return false
  
  return true
}

/**
 * 规范化初始内容
 */
function normalizeContent(content?: JSONContent | string): JSONContent | undefined {
  if (!content) return undefined
  
  // 已经是 JSON 对象
  if (typeof content === 'object') return content
  
  // 尝试解析 JSON 字符串
  if (typeof content === 'string' && content.trim().startsWith('{')) {
    try {
      return JSON.parse(content)
    } catch {
      // 解析失败，当作 Markdown
    }
  }
  
  // Markdown 字符串，转换为 JSON
  if (isMarkdownString(content)) {
    return markdownToJSON(content)
  }
  
  return undefined
}

export default function StructuredEditor({
  initialContent,
  onChange,
  className = '',
  autoFocus = true,
}: StructuredEditorProps) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const extensions = createEditorExtensions()
  
  const normalizedContent = normalizeContent(initialContent)

  const editor = useEditor({
    extensions,
    content: normalizedContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChangeRef.current?.(json)
    },
    editorProps: {
      attributes: {
        class: 'prose-editor-content',
        spellcheck: 'false',
      },
    },
  })

  // 自动聚焦
  const hasFocused = useRef(false)
  useEffect(() => {
    if (editor && autoFocus && !hasFocused.current) {
      hasFocused.current = true
      setTimeout(() => {
        editor.commands.focus('end')
      }, 100)
    }
  }, [editor, autoFocus])

  // 当 initialContent 变化时重置内容（仅当编辑器为空时）
  useEffect(() => {
    if (editor && initialContent && editor.isEmpty) {
      const content = normalizeContent(initialContent)
      if (content) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, initialContent])

  if (!editor) {
    return (
      <div className={`structured-editor ${className}`}>
        <div style={{ 
          minHeight: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--editor-text-muted)'
        }}>
          加载编辑器...
        </div>
      </div>
    )
  }

  return (
    <div className={`structured-editor ${className}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}

// 导出类型和工具函数
export type { JSONContent }
export { markdownToJSON } from './render/fromMarkdown'
export { jsonToMarkdown } from './render/toMarkdown'
export { jsonToHTML } from './render/toHTML'
