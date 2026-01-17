import { getAllProjects } from "@/lib/projects";
import ProjectsClientPage from "./client";

export const metadata = {
  title: "Projects | Garry", // Updated to English
  description: "Explore my latest projects and experiments.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  
  // Extract all unique tech stacks for filter
  const allTechStacks = Array.from(new Set(projects.flatMap(p => p.techStack))).sort();

  return <ProjectsClientPage initialProjects={projects} allTechStacks={allTechStacks} />;
}
