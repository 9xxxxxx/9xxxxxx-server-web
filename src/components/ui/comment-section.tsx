"use client";

import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface Comment {
  id: string;
  content: string;
  guestName: string;
  createdAt: string;
}

interface CommentSectionProps {
  projectId?: string;
  postId?: string;
}

export function CommentSection({ projectId, postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [guestName, setGuestName] = useState("");

  const fetchComments = async () => {
    try {
      const slug = projectId || postId;
      if (!slug) {
        setLoading(false);
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/comments/${slug}`);
      
      if (!res.ok) {
        // Comments might not be implemented yet, that's OK
        setComments([]);
        return;
      }
      
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      // Silently fail - comments are optional
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [projectId, postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const slug = projectId || postId;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/api/comments/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          guestName: guestName || "访客",
        }),
      });

      if (res.ok) {
        setNewComment("");
        fetchComments();
      }
    } catch (error) {
      console.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-16">
      <h3 className="text-2xl font-bold mb-8 text-foreground">
        留言 ({comments.length})
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-12 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border shadow-sm">
        <div className="mb-4">
             <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="您的昵称 (选填)"
                className="w-full md:w-1/3 px-4 py-2 text-sm rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none mb-3"
             />
            <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="写下您的想法..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            required
            />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            发布留言
          </button>
        </div>
      </form>

      {/* List */}
      <div className="space-y-6">
        {loading ? (
           <div className="flex justify-center py-8">
             <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
           </div>
        ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">暂无留言，快来抢沙发吧！</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                {comment.guestName[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-foreground">{comment.guestName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: zhCN })}
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
