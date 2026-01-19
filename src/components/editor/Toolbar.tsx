"use client";

/**
 * 工具栏组件
 * 
 * 分组工具栏：格式、结构、列表、技术、媒体、链接
 */

import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Quote,
  Minus,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  FileCode,
  Highlighter,
  Image as ImageIcon,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { getLanguages } from './languageRegistry'
import ImageEditor from './ImageEditor'

interface ToolbarProps {
  editor: Editor | null
  /** 图片上传处理函数 */
  onImageUpload?: (file: File) => Promise<string>
}

// 工具栏按钮组件
function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`structured-editor-toolbar-btn ${isActive ? 'is-active' : ''}`}
    >
      {children}
    </button>
  )
}

// 分隔线
function Divider() {
  return <div className="structured-editor-toolbar-divider" />
}

export default function Toolbar({ editor, onImageUpload }: ToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showImageEditor, setShowImageEditor] = useState(false)

  const setLink = useCallback(() => {
    if (!editor) return
    
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl('')
  }, [editor, linkUrl])

  const unsetLink = useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetLink().run()
  }, [editor])

  // 图片插入完成
  const handleImageComplete = useCallback((imageUrl: string) => {
    if (!editor) return
    editor.chain().focus().setImage({ src: imageUrl }).run()
    setShowImageEditor(false)
  }, [editor])

  if (!editor) return null

  const languages = getLanguages()

  return (
    <>
      <div className="structured-editor-toolbar">
        {/* 撤销/重做 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="撤销"
          >
            <Undo />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
          >
            <Redo />
          </ToolbarButton>
        </div>

        <Divider />

        {/* 格式 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="粗体"
          >
            <Bold />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体"
          >
            <Italic />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="下划线"
          >
            <UnderlineIcon />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="删除线"
          >
            <Strikethrough />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            title="高亮"
          >
            <Highlighter />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="行内代码"
          >
            <Code />
          </ToolbarButton>
        </div>

        <Divider />

        {/* 标题 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="标题 1"
          >
            <Heading1 />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="标题 2"
          >
            <Heading2 />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="标题 3"
          >
            <Heading3 />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
            isActive={editor.isActive('heading', { level: 4 })}
            title="标题 4"
          >
            <Heading4 />
          </ToolbarButton>
        </div>

        <Divider />

        {/* 列表 & 引用 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="无序列表"
          >
            <List />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="有序列表"
          >
            <ListOrdered />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="引用"
          >
            <Quote />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="分隔线"
          >
            <Minus />
          </ToolbarButton>
        </div>

        <Divider />

        {/* 代码块 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            title="代码块"
          >
            <FileCode />
          </ToolbarButton>
          {editor.isActive('codeBlock') && (
            <select
              className="structured-editor-language-select"
              value={editor.getAttributes('codeBlock').language || 'plaintext'}
              onChange={(e) => {
                editor.chain().focus().updateAttributes('codeBlock', { language: e.target.value }).run()
              }}
            >
              {languages.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.label}
                </option>
              ))}
            </select>
          )}
        </div>

        <Divider />

        {/* 媒体 */}
        <div className="structured-editor-toolbar-group">
          <ToolbarButton
            onClick={() => setShowImageEditor(true)}
            title="插入图片"
          >
            <ImageIcon />
          </ToolbarButton>
        </div>

        <Divider />

        {/* 链接 */}
        <div className="structured-editor-toolbar-group" style={{ position: 'relative' }}>
          <ToolbarButton
            onClick={() => {
              if (editor.isActive('link')) {
                unsetLink()
              } else {
                setShowLinkInput(!showLinkInput)
              }
            }}
            isActive={editor.isActive('link')}
            title={editor.isActive('link') ? '移除链接' : '添加链接'}
          >
            {editor.isActive('link') ? <Unlink /> : <LinkIcon />}
          </ToolbarButton>
          
          {showLinkInput && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'var(--editor-bg)',
                border: '1px solid var(--editor-border)',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                display: 'flex',
                gap: '0.5rem',
              }}
            >
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="输入链接..."
                onKeyDown={(e) => e.key === 'Enter' && setLink()}
                style={{
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.875rem',
                  border: '1px solid var(--editor-border)',
                  borderRadius: '4px',
                  outline: 'none',
                  width: '200px',
                }}
                autoFocus
              />
              <button
                onClick={setLink}
                style={{
                  padding: '0.375rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: 'var(--editor-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                确定
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 图片编辑器弹窗 */}
      {showImageEditor && (
        <ImageEditor
          onComplete={handleImageComplete}
          onCancel={() => setShowImageEditor(false)}
          onUpload={onImageUpload}
          aspect={16 / 9}
        />
      )}
    </>
  )
}

