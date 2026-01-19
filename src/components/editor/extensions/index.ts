/**
 * 编辑器扩展入口
 * 
 * 统一管理所有扩展，便于 Phase 2 扩展
 */

import { Extensions } from '@tiptap/react'
import { getCoreExtensions } from './core'
import { getCodeExtensions } from './code'

// Phase 2 预留接口
// import { getTableExtensions } from './table'
// import { getLifeExtensions } from './life'
import { getSlashCommandExtension } from './slash-command'

export interface EditorConfig {
  // 未来配置项
  enableTable?: boolean
  enableRating?: boolean
}

/**
 * 创建编辑器扩展列表
 */
export function createEditorExtensions(config?: EditorConfig): Extensions {
  const extensions: Extensions = [
    ...getCoreExtensions(),
    ...getCodeExtensions(),
    getSlashCommandExtension(),
  ]

  // Phase 2: 表格扩展
  // if (config?.enableTable) {
  //   extensions.push(...getTableExtensions())
  // }

  // Phase 2: 生活写作扩展
  // if (config?.enableRating) {
  //   extensions.push(...getLifeExtensions())
  // }

  return extensions
}

// 重新导出子模块
export { getCoreExtensions } from './core'
export { getCodeExtensions, lowlight } from './code'
