import { prisma } from "@/lib/db";
import { Project } from "@prisma/client";

export type { Project };

export async function getAllProjects(): Promise<Project[]> {
  const projects = await prisma.project.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  return projects;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return await prisma.project.findUnique({
    where: { slug },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
}

export async function getRelatedProjects(category: string, currentSlug: string): Promise<Project[]> {
  return await prisma.project.findMany({
    where: {
      published: true,
      category,
      slug: { not: currentSlug },
    },
    take: 3,
    orderBy: { createdAt: "desc" },
  });
}
