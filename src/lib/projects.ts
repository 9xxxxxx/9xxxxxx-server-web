import { fetchAPI } from "@/lib/api-client";

// Define Project type manually to avoid Prisma dependency
export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  fullDescription: string;
  techStack: string[];
  features: string[];
  githubLink: string | null;
  demoLink: string | null;
  image: string;
  category: string | null;
  published: boolean;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: {
    name: string | null;
    email: string | null;
  };
};

// 如果用户已登录,会自动获取需登录才能看的内容
export async function getAllProjects(): Promise<Project[]> {
  let query = "";
  
  // 检查是否有登录 token,有则获取 login_required 内容
  if (typeof window !== "undefined") {
    try {
      const storage = localStorage.getItem("admin-auth-storage");
      if (storage) {
        const parsed = JSON.parse(storage);
        if (parsed.state?.accessToken) {
          query = "?include_login_required=true";
        }
      }
    } catch (e) {}
  }
  
  const projects = await fetchAPI<Project[]>(`/api/projects${query}`);
  return projects.map(transformProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    const project = await fetchAPI<Project>(`/api/projects/${slug}`);
    return transformProject(project);
  } catch (error) {
    return null;
  }
}

export async function getRelatedProjects(category: string, currentSlug: string): Promise<Project[]> {
  // Note: Backend endpoint /api/projects/{slug}/related handles logic differently but effectively
  try {
    const projects = await fetchAPI<Project[]>(`/api/projects/${currentSlug}/related`);
    return projects.map(transformProject);
  } catch (error) {
    return [];
  }
}

function transformProject(project: any): Project {
  return {
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  };
}
