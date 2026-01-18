import { Extension } from '@tiptap/core'
import Suggestion from '@tiptap/suggestion'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import { CommandList } from '../CommandList'
import { 
    Heading1, Heading2, Heading3, 
    List, ListOrdered, 
    Quote, Code, ImageIcon, Minus, 
    Type, Check
} from 'lucide-react'

const getSuggestionItems = ({ query }: { query: string }) => {
    return [
      {
        title: 'Text',
        description: 'Just start typing with plain text.',
        searchTerms: ['p', 'paragraph'],
        icon: Type,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run()
        },
      },
      {
        title: 'Heading 1',
        description: 'Big section heading.',
        searchTerms: ['title', 'big', 'large'],
        icon: Heading1,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run()
        },
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading.',
        searchTerms: ['subtitle', 'medium'],
        icon: Heading2,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run()
        },
      },
      {
        title: 'Heading 3',
        description: 'Small section heading.',
        searchTerms: ['subtitle', 'small'],
        icon: Heading3,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run()
        },
      },
      {
        title: 'Bullet List',
        description: 'Create a simple bullet list.',
        searchTerms: ['unordered', 'point'],
        icon: List,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBulletList().run()
        },
      },
      {
        title: 'Ordered List',
        description: 'Create a list with numbering.',
        searchTerms: ['ordered'],
        icon: ListOrdered,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleOrderedList().run()
        },
      },
      {
        title: 'Quote',
        description: 'Capture a quote.',
        searchTerms: ['blockquote'],
        icon: Quote,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleBlockquote().run()
        },
      },
      {
        title: 'Code',
        description: 'Capture a code snippet.',
        searchTerms: ['codeblock'],
        icon: Code,
        command: ({ editor, range }: any) => {
          editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
        },
      },
      {
          title: 'Divider',
          description: 'Visually divide content.',
          searchTerms: ['hr', 'line'],
          icon: Minus,
          command: ({ editor, range }: any) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run()
          },
      },
      // Image command is tricky because it usually needs a modal or file picker.
      // We can trigger the image upload logic if we can access the parent handler?
      // For now, let's skip "Image" in slash command unless we wire it to the toolbar logic.
       // Actually we can add it, but it just inserts a placeholder or does nothing if we don't have the handler.
    ].filter(item => {
      if (typeof query === 'string' && query.length > 0) {
        const search = query.toLowerCase()
        return (
          item.title.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search) ||
          (item.searchTerms && item.searchTerms.some((term: string) => term.includes(search)))
        )
      }
      return true
    }).slice(0, 10)
}

const renderItems = () => {
    let component: ReactRenderer | null = null
    let popup: any | null = null
  
    return {
      onStart: (props: any) => {
        component = new ReactRenderer(CommandList, {
          props,
          editor: props.editor,
        })
  
        if (!props.clientRect) {
          return
        }
  
        // @ts-ignore
        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },
  
      onUpdate: (props: any) => {
        component?.updateProps(props)
  
        if (!props.clientRect) {
          return
        }
  
        popup?.[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },
  
      onKeyDown: (props: any) => {
        if (props.event.key === 'Escape') {
          popup?.[0].hide()
          return true
        }
  
        // @ts-ignore
        return component?.ref?.onKeyDown(props)
      },
  
      onExit: () => {
        popup?.[0].destroy()
        component?.destroy()
      },
    }
}

export const SlashCommand = Extension.create({
    name: 'slashCommand',
  
    addOptions() {
      return {
        suggestion: {
          char: '/',
          command: ({ editor, range, props }: any) => {
            props.command({ editor, range })
          },
        },
      }
    },
  
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ]
    },
})

export const configureSlashCommand = () => {
    return SlashCommand.configure({
        suggestion: {
            items: getSuggestionItems,
            render: renderItems,
        }
    })
}
