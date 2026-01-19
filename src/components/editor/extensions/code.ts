/**
 * 代码块扩展
 * Layer 2: 技术内容
 */

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

// 导入额外的语言支持
import css from 'highlight.js/lib/languages/css'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import go from 'highlight.js/lib/languages/go'
import rust from 'highlight.js/lib/languages/rust'
import java from 'highlight.js/lib/languages/java'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import r from 'highlight.js/lib/languages/r'
import powershell from 'highlight.js/lib/languages/powershell'
import scss from 'highlight.js/lib/languages/scss'

// 创建 lowlight 实例并注册语言
const lowlight = createLowlight(common)

// 注册额外语言
lowlight.register('css', css)
lowlight.register('javascript', javascript)
lowlight.register('js', javascript)
lowlight.register('typescript', typescript)
lowlight.register('ts', typescript)
lowlight.register('python', python)
lowlight.register('py', python)
lowlight.register('sql', sql)
lowlight.register('bash', bash)
lowlight.register('sh', bash)
lowlight.register('shell', bash)
lowlight.register('json', json)
lowlight.register('yaml', yaml)
lowlight.register('yml', yaml)
lowlight.register('xml', xml)
lowlight.register('html', xml)
lowlight.register('markdown', markdown)
lowlight.register('md', markdown)
lowlight.register('go', go)
lowlight.register('golang', go)
lowlight.register('rust', rust)
lowlight.register('rs', rust)
lowlight.register('java', java)
lowlight.register('cpp', cpp)
lowlight.register('c++', cpp)
lowlight.register('csharp', csharp)
lowlight.register('cs', csharp)
lowlight.register('r', r)
lowlight.register('powershell', powershell)
lowlight.register('ps1', powershell)
lowlight.register('scss', scss)
lowlight.register('sass', scss)

/**
 * 获取代码块扩展
 */
export function getCodeExtensions() {
  return [
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'plaintext',
      HTMLAttributes: {
        class: 'editor-code-block',
        spellcheck: 'false',
      },
    }),
  ]
}

export { lowlight }
