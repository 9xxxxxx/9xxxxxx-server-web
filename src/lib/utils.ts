import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getAssetUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  // Remove trailing slash from apiUrl if exists
  const cleanApiUrl = apiUrl.replace(/\/$/, "");
  // Ensure path starts with slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  
  return `${cleanApiUrl}${cleanPath}`;
}
