"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("确定要删除这个项目吗？此操作无法撤销。")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("删除失败");
      }

      router.refresh();
    } catch (error) {
      alert("删除项目出错");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
      title="删除"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4 text-red-500" />
      )}
    </button>
  );
}
