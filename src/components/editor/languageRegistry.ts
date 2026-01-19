/**
 * 编程语言注册表
 * 
 * 可配置的语言列表，便于扩展新语言而无需修改编辑器核心
 * 
 * @example 添加新语言
 * ```ts
 * import { registerLanguage } from './languageRegistry'
 * registerLanguage('kotlin', { label: 'Kotlin', aliases: ['kt'] })
 * ```
 */

export interface LanguageConfig {
  label: string
  aliases?: string[]
  // 未来扩展: icon?: string
}

// 核心语言注册表
const registry: Record<string, LanguageConfig> = {
  // 通用编程语言
  python: { label: 'Python', aliases: ['py'] },
  javascript: { label: 'JavaScript', aliases: ['js'] },
  typescript: { label: 'TypeScript', aliases: ['ts'] },
  rust: { label: 'Rust', aliases: ['rs'] },
  go: { label: 'Go', aliases: ['golang'] },
  java: { label: 'Java' },
  cpp: { label: 'C++', aliases: ['c++'] },
  c: { label: 'C' },
  csharp: { label: 'C#', aliases: ['cs'] },
  
  // 数据分析
  sql: { label: 'SQL' },
  r: { label: 'R' },
  
  // Web
  html: { label: 'HTML' },
  css: { label: 'CSS' },
  scss: { label: 'SCSS', aliases: ['sass'] },
  
  // Shell & 配置
  bash: { label: 'Bash', aliases: ['sh', 'shell', 'zsh'] },
  powershell: { label: 'PowerShell', aliases: ['ps1'] },
  
  // 数据格式
  json: { label: 'JSON' },
  yaml: { label: 'YAML', aliases: ['yml'] },
  toml: { label: 'TOML' },
  xml: { label: 'XML' },
  
  // 其他
  markdown: { label: 'Markdown', aliases: ['md'] },
  plaintext: { label: 'Plain Text', aliases: ['text', 'txt'] },
}

/**
 * 获取所有已注册的语言
 */
export function getLanguages(): Array<{ id: string; label: string }> {
  return Object.entries(registry).map(([id, config]) => ({
    id,
    label: config.label,
  }))
}

/**
 * 根据ID或别名查找语言
 */
export function findLanguage(idOrAlias: string): string | null {
  const normalized = idOrAlias.toLowerCase()
  
  // 直接匹配ID
  if (registry[normalized]) {
    return normalized
  }
  
  // 查找别名
  for (const [id, config] of Object.entries(registry)) {
    if (config.aliases?.includes(normalized)) {
      return id
    }
  }
  
  return null
}

/**
 * 获取语言标签
 */
export function getLanguageLabel(id: string): string {
  return registry[id]?.label ?? id
}

/**
 * 注册新语言（运行时扩展）
 */
export function registerLanguage(id: string, config: LanguageConfig): void {
  registry[id] = config
}

/**
 * 获取所有语言 ID（用于 lowlight 注册）
 */
export function getLanguageIds(): string[] {
  return Object.keys(registry)
}

export default registry
