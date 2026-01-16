import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FilterRowProps {
  label: string;
  items: string[];
  selectedItem: string;
  onSelect: (item: string) => void;
  className?: string;
}

export function FilterRow({ label, items, selectedItem, onSelect, className }: FilterRowProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex flex-wrap justify-center gap-3">
        {items.map((item) => {
          const isSelected = selectedItem === item;
          return (
            <button
              key={item}
              onClick={() => onSelect(item)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 relative overflow-hidden group",
                isSelected
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-slate-200"
              )}
            >
              <span className="relative z-10">{item}</span>
              {isSelected && (
                <motion.div
                  layoutId={`active-${label}`}
                  className="absolute inset-0 bg-indigo-600 z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
