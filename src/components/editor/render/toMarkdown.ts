/**
 * JSON → Markdown 转换
 * 
 * 用于导出 Markdown 内容
 */

import { JSONContent } from '@tiptap/react'

/**
 * 将 ProseMirror JSON 转换为 Markdown
 */
export function jsonToMarkdown(doc: JSONContent): string {
  if (!doc || doc.type !== 'doc' || !doc.content) {
    return ''
  }
  
  return doc.content.map(node => nodeToMarkdown(node)).join('\n\n')
}

/**
 * 单个节点转 Markdown
 */
function nodeToMarkdown(node: JSONContent): string {
  switch (node.type) {
    case 'paragraph':
      return inlineContentToMarkdown(node.content)
    
    case 'heading': {
      const level = node.attrs?.level ?? 1
      const prefix = '#'.repeat(level)
      return `${prefix} ${inlineContentToMarkdown(node.content)}`
    }
    
    case 'codeBlock': {
      const language = node.attrs?.language || ''
      const code = node.content?.[0]?.text || ''
      return `\`\`\`${language}\n${code}\n\`\`\``
    }
    
    case 'blockquote': {
      const content = node.content?.map(n => nodeToMarkdown(n)).join('\n') || ''
      return content.split('\n').map(line => `> ${line}`).join('\n')
    }
    
    case 'bulletList': {
      return node.content?.map(item => {
        const text = item.content?.map(n => nodeToMarkdown(n)).join('') || ''
        return `- ${text}`
      }).join('\n') || ''
    }
    
    case 'orderedList': {
      return node.content?.map((item, i) => {
        const text = item.content?.map(n => nodeToMarkdown(n)).join('') || ''
        return `${i + 1}. ${text}`
      }).join('\n') || ''
    }
    
    case 'listItem': {
      return node.content?.map(n => nodeToMarkdown(n)).join('') || ''
    }
    
    case 'horizontalRule':
      return '---'
    
    case 'hardBreak':
      return '\n'
    
    default:
      return ''
  }
}

/**
 * 行内内容转 Markdown
 */
function inlineContentToMarkdown(content?: JSONContent[]): string {
  if (!content) return ''
  
  return content.map(node => {
    if (node.type !== 'text' || !node.text) return ''
    
    let text = node.text
    
    // 处理标记
    if (node.marks) {
      for (const mark of node.marks) {
        switch (mark.type) {
          case 'bold':
            text = `**${text}**`
            break
          case 'italic':
            text = `*${text}*`
            break
          case 'strike':
            text = `~~${text}~~`
            break
          case 'code':
            text = `\`${text}\``
            break
          case 'link':
            text = `[${text}](${mark.attrs?.href || ''})`
            break
          case 'highlight':
            text = `==${text}==` // 非标准 Markdown，但常用于导出
            break
        }
      }
    }
    
    return text
  }).join('')
}

export default jsonToMarkdown
