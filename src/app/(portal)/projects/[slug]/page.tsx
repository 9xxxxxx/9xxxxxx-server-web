"use client";

import React, { useEffect, useState } from "react";
import { use } from "react";
import { Project, getRelatedProjects, getProjectBySlug } from "@/lib/projects";
import ProjectPageClient from "./ProjectPageClient";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  
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
        const fetchedProject = await getProjectBySlug(slug);
        
        if (!fetchedProject) {
          setError(true);
        } else {
          setProject(fetchedProject);
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
