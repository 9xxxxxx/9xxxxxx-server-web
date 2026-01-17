"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api-client";
import { ChevronDown, Plus, Check } from "lucide-react";

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CategorySelector({ 
  value, 
  onChange, 
  placeholder = "Select or type category...",
  className = ""
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  async function loadCategories() {
    try {
      const cats = await fetchAPI<string[]>("/api/categories");
      setCategories(cats);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }

  async function handleAddCategory(newCategory: string) {
    if (!newCategory.trim()) return;
    
    const trimmed = newCategory.trim();
    
    // Check if already exists
    if (categories.includes(trimmed)) {
      onChange(trimmed);
      setInputValue(trimmed);
      setIsOpen(false);
      return;
    }

    // Add to backend
    setIsLoading(true);
    try {
      const updated = await fetchAPI<string[]>("/api/categories", {
        method: "POST",
        body: JSON.stringify(trimmed),
        headers: { "Content-Type": "application/json" }
      });
      setCategories(updated);
      onChange(trimmed);
      setInputValue(trimmed);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to add category", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    onChange(val);
    setIsOpen(true);
  };

  const handleSelectCategory = (cat: string) => {
    setInputValue(cat);
    onChange(cat);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue && !categories.includes(inputValue.trim())) {
        handleAddCategory(inputValue);
      } else {
        setIsOpen(false);
      }
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showAddButton = inputValue.trim() && !categories.includes(inputValue.trim());

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
            {filteredCategories.length > 0 && (
              <div className="py-1">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <span className="font-medium text-slate-700">{cat}</span>
                    {value === cat && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
            
            {showAddButton && (
              <button
                type="button"
                onClick={() => handleAddCategory(inputValue)}
                disabled={isLoading}
                className="w-full px-4 py-3 text-left border-t border-slate-100 hover:bg-indigo-50 flex items-center gap-2 text-indigo-600 font-bold disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add "{inputValue.trim()}"
              </button>
            )}

            {filteredCategories.length === 0 && !showAddButton && (
              <div className="px-4 py-3 text-sm text-slate-400 text-center">
                No categories found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
