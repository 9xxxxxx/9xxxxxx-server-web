/**
 * 结构化内容编辑器
 * 
 * @example
 * ```tsx
 * import StructuredEditor, { JSONContent } from '@/components/editor'
 * 
 * function MyEditor() {
 *   const [content, setContent] = useState<JSONContent>()
 *   
 *   return (
 *     <StructuredEditor
 *       initialContent={content}
 *       onChange={setContent}
 *     />
 *   )
 * }
 * ```
 */

// 主组件
export { default as StructuredEditor } from './Editor'
export { default } from './Editor'

// 类型
export type { StructuredEditorProps, JSONContent } from './Editor'

// 转换工具
export { markdownToJSON } from './render/fromMarkdown'
export { jsonToMarkdown } from './render/toMarkdown'
export { jsonToHTML } from './render/toHTML'

// 语言注册表
export { 
  getLanguages, 
  getLanguageLabel, 
  findLanguage, 
  registerLanguage 
} from './languageRegistry'
