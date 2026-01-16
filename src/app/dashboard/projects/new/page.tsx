import { ProjectForm } from "@/components/dashboard/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">新建项目</h1>
        <p className="text-muted-foreground mt-1">展示您的最新作品</p>
      </div>

      <ProjectForm />
    </div>
  );
}
