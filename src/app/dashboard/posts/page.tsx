import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { DeletePostButton } from "@/components/dashboard/DeletePostButton";

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">博客管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的所有博客文章
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          新建文章
        </Link>
      </div>

      {/* Posts Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  文章名称
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-foreground">
                  分类/标签
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
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">
                      还没有文章,点击上方按钮创建第一篇文章
                    </p>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                         {post.coverImage && (
                          <img src={post.coverImage} alt={post.title} className="w-10 h-10 rounded object-cover border border-border" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">{post.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {post.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          post.published
                            ? "bg-green-500/10 text-green-500"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        {post.published ? "已发布" : "草稿"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                         <span className="text-xs font-bold text-foreground">{post.category}</span>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-[10px] bg-primary/10 text-primary rounded"
                            >
                              {tag}
                            </span>
                          ))}
                           {post.tags.length > 2 && (
                            <span className="px-2 py-0.5 text-[10px] text-muted-foreground">
                              +{post.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatDate(post.createdAt.toISOString())}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/posts/${post.id}/edit`}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          title="查看"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </Link>
                        <DeletePostButton postId={post.id} />
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
