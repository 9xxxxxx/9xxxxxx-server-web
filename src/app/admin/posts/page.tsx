"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api-client";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, Search, Image as ImageIcon } from "lucide-react";
import { Post } from "@/lib/blog"; 
import { useRouter } from "next/navigation";
import { formatDate, getAssetUrl } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      // 获取所有文章,包括草稿和需登录的
      const data = await fetchAPI<Post[]>("/api/posts?published_only=false&include_login_required=true");
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetchAPI(`/api/posts/${id}`, { method: "DELETE" });
      setPosts(posts.filter(p => p.id !== id));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
    }
  }

  async function toggleStatus(post: Post, e: React.MouseEvent) {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();
    
    try {
      const newStatus = !post.published;
      await fetchAPI(`/api/posts/${post.id}`, { 
        method: "PUT",
        body: JSON.stringify({ published: newStatus })
      });
      
      setPosts(posts.map(p => p.id === post.id ? { ...p, published: newStatus } : p));
      toast.success(newStatus ? "Post published" : "Post unpublished");
    } catch (error) {
       console.error(error);
      toast.error("Failed to update status");
    }
  }

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Posts</h2>
           <p className="text-slate-500 font-medium">Manage and organize your articles.</p>
        </div>
        <Link 
            href="/admin/editor/post/new" 
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
            <Plus className="w-5 h-5" /> Create Post
        </Link>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search posts by title or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:outline-none text-slate-700 font-medium placeholder:text-slate-400"
          />
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="text-center py-20 text-slate-400">Loading your masterpiece collections...</div>
        ) : filteredPosts.length === 0 ? (
             <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-500 font-bold">No posts found.</p>
                <p className="text-slate-400 text-sm mt-1">Get started by creating a new one!</p>
             </div>
        ) : (
            filteredPosts.map(post => (
                <div key={post.id} className="group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col sm:flex-row gap-6">
                    {/* Cover Image - 点击进入编辑 */}
                    <Link href={`/admin/editor/post/${post.id}`} className="w-full sm:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative block cursor-pointer">
                        {post.coverImage ? (
                            <img src={getAssetUrl(post.coverImage)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon className="w-8 h-8 opacity-50" />
                            </div>
                        )}
                        <div className="absolute top-2 left-2 z-10">
                             <button 
                                onClick={(e) => toggleStatus(post, e)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-all ${post.published ? 'bg-green-500/90 text-white hover:bg-green-600' : 'bg-amber-400/90 text-white hover:bg-amber-500'}`}
                             >
                                {post.published ? "Published" : "Draft"}
                             </button>
                        </div>
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <Link href={`/admin/editor/post/${post.id}`} className="cursor-pointer hover:text-indigo-600 transition-colors">
                                    <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2 line-clamp-2">{post.title}</h3>
                                </Link>
                                <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{post.description || "No description provided."}</p>
                            </div>
                            
                            {/* Desktop Actions */}
                            <div className="hidden sm:flex items-center gap-2">
                                <Link href={`/blog/${post.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="View">
                                    <Eye className="w-5 h-5" />
                                </Link>
                                <Link href={`/admin/editor/post/${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors" title="Edit">
                                    <Edit className="w-5 h-5" />
                                </Link>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This post will be permanently deleted from the database.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(post.id!)} className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wide">
                            <div className="flex items-center gap-4">
                                <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">{post.category}</span>
                                <span>{post.createdAt ? formatDate(post.createdAt.toString()) : '-'}</span>
                            </div>
                            
                            {/* Mobile Actions */}
                            <div className="flex sm:hidden items-center gap-2 mt-2">
                                <Link href={`/admin/editor/post/${post.id}`} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg">Edit</Link>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg">Delete</button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete post?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleDelete(post.id!)} className="bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
