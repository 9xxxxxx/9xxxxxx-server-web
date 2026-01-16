import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FileText, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  // 获取统计数据
  const [postsCount, projectsCount] = await Promise.all([
    prisma.post.count(),
    prisma.project.count(),
  ]);

  const stats = [
    {
      name: "博客文章",
      value: postsCount,
      icon: FileText,
      href: "/dashboard/posts",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      name: "项目",
      value: projectsCount,
      icon: Briefcase,
      href: "/dashboard/projects",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      name: "总访问量",
      value: "N/A",
      icon: TrendingUp,
      href: "#",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          欢迎回来, {session?.user?.name || session?.user?.email}!
        </h1>
        <p className="text-muted-foreground mt-2">
          这是您的内容管理系统仪表盘
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href}
            className="p-6 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">快捷操作</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/posts/new"
              className="block px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity text-center"
            >
              创建新博客
            </Link>
            <Link
              href="/dashboard/projects/new"
              className="block px-4 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors text-center"
            >
              添加新项目
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card">
          <h2 className="text-xl font-bold text-foreground mb-4">系统信息</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据库状态</span>
              <span className="text-green-500 font-medium">● 正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">最后登录</span>
              <span className="text-foreground font-medium">刚刚</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本</span>
              <span className="text-foreground font-medium">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
