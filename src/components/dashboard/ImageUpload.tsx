"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [inputType, setInputType] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      onChange(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="space-y-4 w-full">
      {/* Input Type Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setInputType("upload")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            inputType === "upload" 
              ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setInputType("url")}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-all",
            inputType === "url" 
              ? "bg-white dark:bg-slate-700 shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          URL
        </button>
      </div>

      {value ? (
        <div className="relative aspect-video w-full max-w-sm rounded-xl overflow-hidden border border-border group bg-slate-100 dark:bg-slate-900">
          <img
            src={value}
            alt="Upload"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <button
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            type="button"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {inputType === "upload" ? (
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer min-h-[200px] bg-slate-50/50 dark:bg-slate-900/50",
                isDragOver ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-800 hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
                disabled={disabled}
              />
              <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {isUploading ? "Uploading..." : "Click to upload or drag & drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  SVG, PNG, JPG or GIF (max 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="Enter image URL..."
                  disabled={disabled}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-card border border-border focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <p className="text-xs text-muted-foreground pl-1">
                Paste a direct link to an image (e.g. https://example.com/image.png)
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
