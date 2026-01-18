"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import { 
  FileText, 
  Briefcase, 
  Eye,
  Plus,
  ArrowRight,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  postsCount: number;
  projectsCount: number;
  visitsCount: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchAPI<DashboardStats>("/api/stats/stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500"/></div>;

  const statCards = [
    { name: 'Published Posts', value: stats?.postsCount || 0, icon: FileText, color: 'from-indigo-500 to-blue-600', href: '/admin/posts' },
    { name: 'Projects', value: stats?.projectsCount || 0, icon: Briefcase, color: 'from-purple-500 to-pink-600', href: '/admin/projects' },
    { name: 'Page Views', value: stats?.visitsCount || 0, icon: Eye, color: 'from-orange-500 to-red-500', href: '#' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-black mb-2">Welcome back! 👋</h1>
        <p className="text-indigo-100">Here's what's happening with your site.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={stat.href} className="block group">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-4xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/admin/editor/post/new" 
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <Plus className="w-5 h-5 text-indigo-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">New Post</p>
              <p className="text-sm text-slate-500">Write a new blog article</p>
            </div>
          </Link>
          
          <Link 
            href="/admin/editor/project/new" 
            className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
              <Plus className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900">New Project</p>
              <p className="text-sm text-slate-500">Add a new portfolio project</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Note */}
      <div className="bg-slate-50 rounded-xl p-4 text-center">
        <p className="text-sm text-slate-500">
          📊 Page views are tracked automatically when users visit your site.
        </p>
      </div>
    </div>
  );
}
