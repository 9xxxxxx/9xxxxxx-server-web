import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DeleteProjectButton } from "@/components/dashboard/DeleteProjectButton";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">项目管理</h1>
          <p className="text-muted-foreground mt-1">
            展示您的精彩作品与案例
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          新建项目
        </Link>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  项目名称
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  分类/技术栈
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  创建时间
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-foreground">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">
                      还没有项目,点击上方按钮创建第一个项目
                    </p>
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         {project.image && (
                          <img src={project.image} alt={project.title} className="w-10 h-10 rounded object-cover border border-border" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          project.published
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {project.published ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-xs font-bold text-foreground">{project.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {project.techStack.slice(0, 2).map((tech) => (
                            <span
                              key={tech}
                              className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(project.createdAt.toISOString())}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/projects/${project.id}/edit`}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <DeleteProjectButton projectId={project.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
