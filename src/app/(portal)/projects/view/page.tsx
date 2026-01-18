"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Project, getRelatedProjects } from "@/lib/projects"; // Check imports
import ProjectPageClient from "./ProjectPageClient";
import { motion } from "framer-motion";

function ProjectViewContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
        setLoading(false);
        return;
    }

    const loadData = async () => {
        try {
            const { getProjectBySlug } = await import("@/lib/projects");
            const fetchedProject = await getProjectBySlug(slug);
            
            if (!fetchedProject) {
                setError(true);
            } else {
                setProject(fetchedProject);
                // Load related projects
                // Note: getRelatedProjects in lib/projects might need category.
                // It takes (category, currentSlug).
                const related = await getRelatedProjects(fetchedProject.category || "Web App", slug);
                setRelatedProjects(related);
            }
        } catch (e) {
            console.error("Failed to fetch project", e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
    );
  }

  if (error || !project) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
             <h1 className="text-2xl font-bold">Project Not Found</h1>
             <p className="text-slate-500">The project you are looking for does not exist or could not be loaded.</p>
        </div>
      );
  }

  return <ProjectPageClient project={project} relatedProjects={relatedProjects} />;
}

export default function ProjectViewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectViewContent />
        </Suspense>
    );
}
