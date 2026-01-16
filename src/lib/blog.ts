import { prisma } from "@/lib/db";

export type Post = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  readingTime?: number;
  createdAt?: Date;
  category?: string;
  coverImage?: string | null;
  likes?: number;
  author?: {
    name: string | null;
    email: string | null;
  };
};

// Get all published posts, optionally filtered by category
export async function getAllPosts(category?: string): Promise<Post[]> {
  const whereClause: any = { published: true };
  if (category && category !== "All") {
    whereClause.category = category;
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  return posts.map(transformPost);
}

// Get single post
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });

  if (!post || !post.published) return null;

  return transformPost(post);
}

export async function getAllCategories(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { category: true },
    distinct: ['category']
  });
  
  // Return unique categories, filter out nulls if any
  return posts.map(p => p.category).filter(Boolean) as string[];
}

// 获取所有唯一标签
export async function getAllTags(): Promise<string[]> {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { tags: true },
  });

  const tags = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tags.add(tag));
  });
  
  return Array.from(tags).sort();
}

// 根据标签筛选文章
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      tags: { has: tag },
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, email: true } },
    },
  });

  return posts.map(transformPost);
}

// 转换 Prisma 数据到前端通用格式
function transformPost(post: any): Post {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    tags: post.tags,
    content: post.content,
    createdAt: post.createdAt,
    author: post.author,
    readingTime: calculateReadingTime(post.content),
    category: post.category || "Tech",
    coverImage: post.coverImage,
    likes: post.likes || 0,
  };
}

// 搜索文章 (标题、描述、内容)
export function searchPosts(posts: Post[], query: string): Post[] {
  const lowerQuery = query.toLowerCase();
  
  return posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

// 计算阅读时间 (分钟)
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 平均阅读速度
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
}

// 获取相关文章 (基于标签相似度)
export async function getRelatedPosts(slug: string, limit: number = 3): Promise<Post[]> {
  const currentPost = await getPostBySlug(slug);
  if (!currentPost) return [];

  const allPosts = await getAllPosts();
  const otherPosts = allPosts.filter((post) => post.slug !== slug);
  
  // 计算标签重叠度
  const postsWithScore = otherPosts.map((post) => {
    const commonTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    );
    return {
      post,
      score: commonTags.length,
    };
  });

  // 按分数排序并返回前 N 个
  return postsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.post);
}
