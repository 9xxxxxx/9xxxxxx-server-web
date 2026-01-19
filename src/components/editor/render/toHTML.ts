/**
 * JSON → HTML 转换
 * 
 * 用于前台文章展示
 */

import { generateHTML } from '@tiptap/html'
import { JSONContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from '../extensions/code'

// 用于 HTML 生成的扩展配置（与编辑器一致）
const htmlExtensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3, 4] },
    codeBlock: false,
  }),
  Link,
  Underline,
  Highlight,
  CodeBlockLowlight.configure({
    lowlight,
  }),
]

/**
 * 将 ProseMirror JSON 转换为 HTML
 */
export function jsonToHTML(doc: JSONContent): string {
  if (!doc || doc.type !== 'doc') {
    return ''
  }
  
  try {
    return generateHTML(doc, htmlExtensions)
  } catch (error) {
    console.error('Failed to generate HTML:', error)
    return ''
  }
}

export default jsonToHTML
