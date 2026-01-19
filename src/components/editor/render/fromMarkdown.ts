/**
 * Markdown → JSON 转换
 * 
 * 用于导入 Markdown 内容
 */

import { JSONContent } from '@tiptap/react'

/**
 * 将 Markdown 转换为 ProseMirror JSON
 * 
 * 这是一个简化实现，处理常见的 Markdown 语法
 */
export function markdownToJSON(markdown: string): JSONContent {
  const lines = markdown.split('\n')
  const content: JSONContent[] = []
  
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // 空行跳过
    if (!trimmed) {
      i++
      continue
    }
    
    // 代码块
    if (trimmed.startsWith('```')) {
      const language = trimmed.slice(3).trim() || 'plaintext'
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // 跳过结束的 ```
      
      content.push({
        type: 'codeBlock',
        attrs: { language },
        content: [{ type: 'text', text: codeLines.join('\n') }],
      })
      continue
    }
    
    // 标题
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4
      content.push({
        type: 'heading',
        attrs: { level },
        content: parseInlineContent(headingMatch[2]),
      })
      i++
      continue
    }
    
    // 引用
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''))
        i++
      }
      content.push({
        type: 'blockquote',
        content: [
          {
            type: 'paragraph',
            content: parseInlineContent(quoteLines.join(' ')),
          },
        ],
      })
      continue
    }
    
    // 水平线
    if (/^[-*_]{3,}$/.test(trimmed)) {
      content.push({ type: 'horizontalRule' })
      i++
      continue
    }
    
    // 无序列表
    if (/^[-*+]\s/.test(trimmed)) {
      const items: JSONContent[] = []
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*+]\s+/, '')
        items.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseInlineContent(itemText),
            },
          ],
        })
        i++
      }
      content.push({
        type: 'bulletList',
        content: items,
      })
      continue
    }
    
    // 有序列表
    if (/^\d+\.\s/.test(trimmed)) {
      const items: JSONContent[] = []
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '')
        items.push({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: parseInlineContent(itemText),
            },
          ],
        })
        i++
      }
      content.push({
        type: 'orderedList',
        content: items,
      })
      continue
    }
    
    // 普通段落
    content.push({
      type: 'paragraph',
      content: parseInlineContent(trimmed),
    })
    i++
  }
  
  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  }
}

/**
 * 解析行内内容（加粗、斜体、代码、链接）
 */
function parseInlineContent(text: string): JSONContent[] {
  if (!text) return []
  
  const result: JSONContent[] = []
  let remaining = text
  
  // 简化实现：按顺序处理特殊格式
  // 完整实现需要用正则分割并递归处理
  
  // 处理链接 [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let lastIndex = 0
  let match
  
  while ((match = linkRegex.exec(text)) !== null) {
    // 链接前的文本
    if (match.index > lastIndex) {
      result.push(...parseBasicFormatting(text.slice(lastIndex, match.index)))
    }
    
    // 链接
    result.push({
      type: 'text',
      marks: [{ type: 'link', attrs: { href: match[2] } }],
      text: match[1],
    })
    
    lastIndex = match.index + match[0].length
  }
  
  // 剩余文本
  if (lastIndex < text.length) {
    result.push(...parseBasicFormatting(text.slice(lastIndex)))
  }
  
  return result.length > 0 ? result : [{ type: 'text', text }]
}

/**
 * 解析基本格式（加粗、斜体、代码）
 */
function parseBasicFormatting(text: string): JSONContent[] {
  if (!text) return []
  
  const result: JSONContent[] = []
  
  // 行内代码
  const codeRegex = /`([^`]+)`/g
  // 加粗
  const boldRegex = /\*\*([^*]+)\*\*/g
  // 斜体
  const italicRegex = /\*([^*]+)\*/g
  
  let remaining = text
  let processed = false
  
  // 简化处理：只处理最简单的情况
  // 实际应该用更复杂的解析器
  
  // 处理行内代码
  if (remaining.includes('`')) {
    const parts = remaining.split(/`([^`]+)`/)
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) {
          result.push({ type: 'text', text: parts[i] })
        }
      } else {
        result.push({
          type: 'text',
          marks: [{ type: 'code' }],
          text: parts[i],
        })
      }
    }
    processed = true
  }
  
  if (!processed) {
    result.push({ type: 'text', text: remaining })
  }
  
  return result
}

export default markdownToJSON
