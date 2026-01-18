import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, 
  Quote, Code, ImageIcon, Minus, 
  Type, Check
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CommandItemProps {
  title: string
  description?: string
  icon: React.ElementType
  command: (params: { editor: any, range: any }) => void
}

export const CommandList = forwardRef((props: {
    items: CommandItemProps[];
    command: any;
}, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)
  
    const selectItem = useCallback((index: number) => {
      const item = props.items[index]
      if (item) {
        props.command(item)
      }
    }, [props])
  
    useEffect(() => {
      setSelectedIndex(0)
    }, [props.items])
  
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
          return true
        }
        if (event.key === 'ArrowDown') {
          setSelectedIndex((selectedIndex + 1) % props.items.length)
          return true
        }
        if (event.key === 'Enter') {
          selectItem(selectedIndex)
          return true
        }
        return false
      },
    }))
  
    return (
      <div className="z-50 min-w-[300px] h-auto max-h-[330px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-950 animate-in fade-in zoom-in-95 duration-200">
        <div className="grid grid-cols-1 gap-0.5">
            {props.items.length ? (
            props.items.map((item, index) => (
                <button
                key={index}
                className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors select-none",
                    index === selectedIndex ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-100" : "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                )}
                onClick={() => selectItem(index)}
                >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <item.icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.description}</span>
                </div>
                </button>
            ))
            ) : (
            <div className="p-4 text-center text-sm text-slate-500">
                No result
            </div>
            )}
        </div>
        <div className="mt-2 border-t border-slate-100 px-2 py-1.5 text-[10px] text-slate-400 dark:border-slate-800">
            Current: {selectedIndex + 1} / {props.items.length} · Use arrows to navigate
        </div>
      </div>
    )
})

CommandList.displayName = 'CommandList'
