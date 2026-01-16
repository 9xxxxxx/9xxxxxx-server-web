import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog";
import BlogClientPage from "./client";

export const dynamic = 'force-dynamic';

export default async function BlogPage() {
  // Removed DB query to avoid build-time dependency
  const posts: any[] = [];
  const categories = await getAllCategories();
  const tags = await getAllTags();

  return <BlogClientPage initialPosts={posts} allCategories={categories} allTags={tags} />;
}