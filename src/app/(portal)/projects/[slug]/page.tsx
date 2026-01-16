import React from "react";
import { getAllProjects, getProjectBySlug, getRelatedProjects } from "@/lib/projects";
import { notFound } from "next/navigation";
import ProjectPageClient from "./client";

// Generate static params (SSG) - Disabled for deployment without build-time DB access
// export async function generateStaticParams() {
//   const projects = await getAllProjects();
//   return projects.map((project) => ({
//     slug: project.slug,
//   }));
// }

// Page Component (Server Component)
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return notFound();
  }

  // Fetch related projects
  const relatedProjects = await getRelatedProjects(project.category || "Web App", project.slug);

  return <ProjectPageClient project={project} relatedProjects={relatedProjects} />;
}