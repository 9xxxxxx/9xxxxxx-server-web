import { PostForm } from "@/components/blog/PostForm";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">新建文章</h1>
        <p className="text-muted-foreground mt-1">
          撰写一篇新的技术博客
        </p>
      </div>
      
      <PostForm />
    </div>
  );
}
