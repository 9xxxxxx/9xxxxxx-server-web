/**
 * 核心写作扩展
 * Layer 1: 基础写作能力
 */

import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'

/**
 * 获取核心写作扩展
 */
export function getCoreExtensions() {
  return [
    // StarterKit 包含大部分基础功能
    StarterKit.configure({
      // 标题配置：H1-H4
      heading: {
        levels: [1, 2, 3, 4],
      },
      // 禁用默认代码块，使用 CodeBlockLowlight 替代
      codeBlock: false,
      // 拖拽光标样式
      dropcursor: {
        color: 'var(--editor-accent)',
        width: 2,
      },
    }),

    // 链接扩展
    Link.configure({
      openOnClick: false, // 编辑器中点击不跳转
      HTMLAttributes: {
        class: 'editor-link',
        rel: 'noopener noreferrer',
      },
    }),

    // 下划线
    Underline,

    // 文本对齐
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),

    // 高亮标记
    Highlight.configure({
      multicolor: false, // 单色高亮，保持简洁
    }),

    // 排版优化（自动替换引号、破折号等）
    Typography,

    // 占位符
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return '标题'
        }
        return '输入内容，使用 / 打开命令菜单...'
      },
      emptyEditorClass: 'is-editor-empty',
      emptyNodeClass: 'is-empty',
    }),
  ]
}
