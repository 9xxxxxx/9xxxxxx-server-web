"use client";

import { useEffect, useState, use } from "react";
import ProjectEditor from "@/components/admin/ProjectEditor";
import { fetchAPI } from "@/lib/api-client";
import { Project } from "@/lib/projects";
import { Loader2 } from "lucide-react";

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI<Project>(`/api/projects/id/${resolvedParams.id}`)
      .then(setProject)
      .catch((e) => alert("Failed to load project"))
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600"/></div>;
  if (!project) return <div>Project not found</div>;

  return <ProjectEditor initialProject={project} isEditing />;
}
