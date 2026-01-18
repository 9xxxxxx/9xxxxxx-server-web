"use client";

import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api-client";
import { Trash2, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  guestName: string;
  createdAt: string;
  postId?: string;
  projectId?: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<{ comments: Comment[]; total: number }>("/api/comments/");
      setComments(data.comments);
    } catch (error) {
      console.error("Failed to load comments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条留言吗？")) return;
    
    setDeleting(id);
    try {
      await fetchAPI(`/api/comments/${id}`, { method: "DELETE" });
      setComments(comments.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Failed to delete comment", error);
      alert("删除失败");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">留言管理</h1>
          <p className="text-slate-500">管理网站的所有留言评论</p>
        </div>
        <button
          onClick={loadComments}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 font-medium text-slate-600"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          刷新
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{comments.length}</p>
              <p className="text-sm text-slate-500">总留言数</p>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="font-medium">暂无留言</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-6 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg">
                      {comment.guestName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.postId && (
                      <span className="text-xs text-slate-400">• 文章留言</span>
                    )}
                    {comment.projectId && (
                      <span className="text-xs text-slate-400">• 项目留言</span>
                    )}
                  </div>
                  <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(comment.id)}
                  disabled={deleting === comment.id}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  {deleting === comment.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
