import { getAllPosts, getAllCategories, getAllTags } from "@/lib/blog";
import BlogClientPage from "./client";

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getAllPosts();
  const categories = await getAllCategories();
  const tags = await getAllTags();

  return <BlogClientPage initialPosts={posts} allCategories={categories} allTags={tags} />;
}