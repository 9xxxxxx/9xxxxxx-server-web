import { prisma } from "@/lib/db";
import { PostForm } from "@/components/blog/PostForm";
import { notFound } from "next/navigation";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">编辑文章</h1>
        <p className="text-muted-foreground mt-1">修改您的文章内容</p>
      </div>

      <PostForm initialData={post} postId={post.id} />
    </div>
  );
}
