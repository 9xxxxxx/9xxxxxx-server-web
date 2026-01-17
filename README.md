# 🚀 Garry's Personal Website

一个现代化的个人网站，采用 **Next.js 15** + **FastAPI** 全栈架构，包含博客、项目展示和管理后台。

---

## ✨ 核心特性

- 🎨 **现代化 UI/UX** - Tailwind CSS + Framer Motion 丝滑动效
- ⚡ **高性能** - Next.js App Router + FastAPI 后端
- 📝 **博客系统** - Markdown 渲染 + 代码高亮
- 💼 **项目展示** - 动态项目管理
- 🔐 **管理后台** - 完整的 CMS 功能
- 🔍 **全局搜索** - 实时搜索文章和项目
- 🌙 **深色模式** - 自适应主题切换

## 🛠️ 技术栈

### 前端

- **Next.js 15** (App Router)
- **React 19** + TypeScript
- **Tailwind CSS**
- **Framer Motion**

### 后端

- **FastAPI** (Python)
- **SQLModel** + SQLite
- **JWT 认证**

## 📁 项目结构

```
├── src/                    # Next.js 前端
│   ├── app/
│   │   ├── (portal)/       # 公开页面 (首页/博客/项目)
│   │   └── admin/          # 管理后台
│   ├── components/         # UI 组件
│   └── lib/                # 工具函数
│
└── backend/                # FastAPI 后端
    ├── api/                # API 路由
    ├── models.py           # 数据模型
    └── main.py             # 入口文件
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- Python 3.11+
- UV (Python 包管理器)

### 安装与运行

**1. 前端**

```bash
npm install
npm run dev
```

**2. 后端**

```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

**3. 创建管理员**

```bash
cd backend
uv run python create_admin.py
```

访问:

- 🌐 前端: http://localhost:3000
- 📡 API: http://localhost:8000
- 🔧 管理后台: http://localhost:3000/admin

## 🔧 环境变量

创建 `.env` 文件:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

## 📦 API 接口

| 端点              | 方法 | 描述         |
| ----------------- | ---- | ------------ |
| `/api/posts`      | GET  | 获取文章列表 |
| `/api/projects`   | GET  | 获取项目列表 |
| `/api/search`     | GET  | 全局搜索     |
| `/api/auth/login` | POST | 管理员登录   |
| `/api/upload`     | POST | 上传图片     |

## 📄 许可证

MIT License

---

Created with ❤️ by [Garry](https://github.com/9xxxxxx)
