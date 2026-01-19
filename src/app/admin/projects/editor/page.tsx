"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";

function ProjectEditorContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center gap-4 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <Link href="/admin/projects" className="text-slate-500 hover:text-slate-900 p-2 -ml-2 rounded-lg hover:bg-slate-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm text-slate-500">{id ? `编辑项目 #${id}` : '新建项目'}</span>
      </header>

      {/* 编辑器占位 */}
      <main className="max-w-4xl mx-auto py-20 px-6">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 py-20">
          <div className="p-4 bg-amber-100 rounded-full mb-4">
            <Construction className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">编辑器正在重新设计中</h3>
          <p className="text-sm text-slate-500 text-center max-w-md">
            新的编辑器即将上线，敬请期待！
          </p>
          <p className="text-xs text-slate-400 mt-4">
            请使用新版编辑器：
            <Link href={`/admin/editor/project/${id || 'new'}`} className="text-indigo-600 hover:underline ml-1">
              前往新版编辑器
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function AdminProjectEditorPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center text-slate-400">加载中...</div>}>
      <ProjectEditorContent />
    </Suspense>
  );
}
