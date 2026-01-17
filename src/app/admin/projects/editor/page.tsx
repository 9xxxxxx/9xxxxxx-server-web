"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectEditor from "@/components/admin/ProjectEditor";
import { fetchAPI } from "@/lib/api-client";
import { Project } from "@/lib/projects";
import { Loader2 } from "lucide-react";

function ProjectEditorWrapper() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchAPI<Project>(`/api/projects/id/${id}`)
      .then(setProject)
      .catch((e) => alert("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600"/></div>;
  
  if (id && !project) return <div>Project not found</div>;

  return <ProjectEditor initialProject={project || undefined} isEditing={!!id} />;
}

export default function AdminProjectEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600"/></div>}>
      <ProjectEditorWrapper />
    </Suspense>
  );
}
