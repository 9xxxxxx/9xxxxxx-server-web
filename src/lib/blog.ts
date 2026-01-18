import { fetchAPI } from "@/lib/api-client";

export type Post = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  tags: string[];
  content: string;
  readingTime?: number;
  createdAt?: Date;
  category: string; // Made required as backend provides default
  coverImage?: string | null;
  likes?: number;
  published: boolean;
  author?: {
    name: string | null;
    email: string | null;
  };
};

// Get all published posts, optionally filtered by category
// 如果用户已登录,会自动获取需登录才能看的内容
export async function getAllPosts(category?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (category && category !== "All") {
    params.append("category", category);
  }
  
  // 检查是否有登录 token,有则获取 login_required 内容
  if (typeof window !== "undefined") {
    try {
      const storage = localStorage.getItem("admin-auth-storage");
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed.state?.accessToken) {
          params.append("include_login_required", "true");
        }
      }
    } catch (e) {}
  }
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const posts = await fetchAPI<Post[]>(`/api/posts${query}`);
  return posts.map(transformPost);
}

// Get single post
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const post = await fetchAPI<Post>(`/api/posts/${slug}`);
    return transformPost(post);
  } catch (error) {
    return null;
  }
}

export async function getAllCategories(): Promise<string[]> {
  return await fetchAPI<string[]>("/api/posts/categories");
}

// 获取所有唯一标签
export async function getAllTags(): Promise<string[]> {
  return await fetchAPI<string[]>("/api/posts/tags");
}

// 根据标签筛选文章
export async function getPostsByTag(tag: string): Promise<Post[]> {
  const posts = await fetchAPI<Post[]>(`/api/posts?tag=${encodeURIComponent(tag)}`);
  return posts.map(transformPost);
}

// 转换 API 数据到前端通用格式 (Date handling)
function transformPost(post: any): Post {
  return {
    ...post,
    createdAt: post.createdAt ? new Date(post.createdAt) : undefined,
    readingTime: calculateReadingTime(post.content || ""),
  };
}

// 搜索文章 (标题、描述、内容) - Client side filtering is often fine for small SSG blogs
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

// 获取相关文章 (基于 API)
export async function getRelatedPosts(slug: string, limit: number = 3): Promise<Post[]> {
  try {
    const posts = await fetchAPI<Post[]>(`/api/posts/${slug}/related?limit=${limit}`);
    return posts.map(transformPost);
  } catch (error) {
    return [];
  }
}
