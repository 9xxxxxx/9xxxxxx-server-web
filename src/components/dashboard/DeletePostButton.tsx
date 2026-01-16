"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      router.refresh();
    } catch (error) {
      alert("Error deleting post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="Delete"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4 text-red-500" />
      )}
    </button>
  );
}
