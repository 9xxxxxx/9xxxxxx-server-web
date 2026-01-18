"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, LogIn, LogOut, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { fetchAPI } from "@/lib/api-client";
import { getAssetUrl } from "@/lib/utils";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  
  const { setToken, setUser } = useAuthStore();

  // 确保在客户端挂载后才使用 Portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 按 ESC 键关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden"; // 防止背景滚动
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      const response = await fetch(`${apiUrl}/api/auth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error("邮箱或密码错误");
      }

      const data = await response.json();
      setToken(data.access_token);
      
      // 获取完整用户资料
      const profileRes = await fetch(`${apiUrl}/api/users/me`, {
        headers: { "Authorization": `Bearer ${data.access_token}` }
      });
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUser(profile);
      } else {
        setUser({ email });
      }
      
      onClose();
      
      // 刷新页面以显示需登录的内容
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop - 点击关闭 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />
      
      {/* Modal - 阻止点击事件冒泡 */}
      <div 
        className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">登录</h2>
          <p className="text-slate-500 text-sm mt-1">登录后可查看更多内容</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                登录中...
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>
      </div>
    </div>
  );

  // 使用 Portal 将模态框渲染到 body，避免 Navbar z-index 问题
  return createPortal(modalContent, document.body);
}

// 用户菜单组件
export function UserMenu() {
  const { accessToken, user, logout } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  if (accessToken) {
    return (
      <button
        onClick={handleLogout}
        className="p-3 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group flex items-center gap-2"
        title={`退出登录 (${user?.fullName || user?.email})`}
      >
        {user?.avatar ? (
          <img src={getAssetUrl(user.avatar)} alt="Avatar" className="w-5 h-5 rounded-full object-cover group-hover:scale-110 transition-transform" />
        ) : (
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
        )}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="p-3 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
        title="登录"
      >
        <User className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
      </button>
      <LoginModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
}
