import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog";
import BlogClientPage from "./client";



export default function BlogPage() {
  // Pass empty initial data to trigger client-side fetching
  return <BlogClientPage initialPosts={[]} allCategories={[]} allTags={[]} />;
}