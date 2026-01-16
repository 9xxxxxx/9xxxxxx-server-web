import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import BlogPostClient from "./client";

export const revalidate = 60;

// Generate static params (SSG) - Disabled for deployment without build-time DB access
// export async function generateStaticParams() {
//   const posts = await getAllPosts();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "文章未找到" };
  }
  return {
    title: `${post.title} | Garry-9xxxxxx 博客`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, 3);

  return <BlogPostClient post={post} relatedPosts={relatedPosts} />;
}