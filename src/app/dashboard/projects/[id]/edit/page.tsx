import { prisma } from "@/lib/db";
import { ProjectForm } from "@/components/dashboard/ProjectForm";
import { notFound } from "next/navigation";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">编辑项目</h1>
        <p className="text-muted-foreground mt-1">更新您的项目信息</p>
      </div>

      <ProjectForm initialData={project} projectId={project.id} />
    </div>
  );
}
