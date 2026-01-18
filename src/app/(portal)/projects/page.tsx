import { getAllProjects } from "@/lib/projects";
import ProjectsClientPage from "./client";

export const metadata = {
  title: "Projects | Garry", // Updated to English
  description: "Explore my latest projects and experiments.",
};



export default function ProjectsPage() {
  // Pass empty initial data to trigger client-side fetching
  return <ProjectsClientPage initialProjects={[]} allTechStacks={[]} />;
}
