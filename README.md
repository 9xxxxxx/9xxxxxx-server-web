# 🚀 9xxxxxx.github.io

欢迎来到我的个人门户！这是一个基于 **Next.js 16** 和 **Tailwind CSS v4** 构建的高性能现代化个人网站，集成了个人介绍、项目展示、技术博客以及可扩展的管理后台。

[**🌐 访问我的主页**](https://9xxxxxx.github.io)

---

## ✨ 核心特性

- 🎨 **现代化 UI/UX**: 使用 Tailwind CSS v4 和 Framer Motion 打造丝滑的视觉体验。
- ⚡ **卓越性能**: 基于 Next.js 16 App Router 构建，提供极速的加载速度。
- 🍱 **Bento Grid 布局**: 采用简洁高效的多维矩阵布局展示核心内容。
- 📝 **动态博客**: 基于 Markdown 的轻量级博客系统，记录技术成长。
- 📱 **全平台适配**: 完美兼容从移动端到桌面端的各种显示设备。
- 🌙 **深色模式**: 内置自适应主题切换，保护视力且美观。
- 🔧 **可扩展架构**: 预留管理后台和功能模块接口，支持未来功能扩展。

## 🛠️ 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) (App Router + Standalone Mode)
- **样式**: [Tailwind CSS v4](https://tailwindcss.com/)
- **动画**: [Framer Motion](https://www.framer.com/motion/)
- **组件库**: [Lucide React](https://lucide.dev/) & Aceternity UI 原理
- **字体**: [Geist Sans](https://vercel.com/font)
- **部署**: Docker + PM2 (云服务器)

## 📁 项目结构

```
src/
├── app/
│   ├── (portal)/          # 主门户路由组
│   │   ├── page.tsx       # 主页 (/)
│   │   ├── blog/          # 博客 (/blog)
│   │   └── projects/      # 项目 (/projects)
│   ├── dashboard/         # 管理后台 (/dashboard)
│   └── layout.tsx         # 根布局
├── components/            # UI 组件
├── features/              # 功能模块 (预留)
├── providers/             # 全局状态管理 (预留)
├── hooks/                 # 自定义 Hooks (预留)
└── lib/                   # 工具函数
```

## 🚀 快速开始

### 环境准备

- Node.js 20+
- npm / yarn / pnpm

### 本地运行

1. 克隆仓库:

   ```bash
   git clone https://github.com/9xxxxxx/9xxxxxx.github.io.git
   cd 9xxxxxx.github.io
   ```

2. 安装依赖:

   ```bash
   npm install
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

访问 [http://localhost:3000](http://localhost:3000) 预览效果。

## 📦 部署方案

### 方案 1: GitHub Pages (静态部署)

通过 **GitHub Actions** 自动化部署至 **GitHub Pages**。
任何合并到 `main` 分支的代码都会自动触发构建并更新线上站点。

### 方案 2: 云服务器 (推荐)

使用 **Standalone 模式** 部署到云服务器，支持动态功能和更高性能。

#### 使用 Docker 部署

```bash
# 构建镜像
docker build -t personal-website .

# 运行容器
docker run -d -p 3000:3000 --name website personal-website
```

#### 手动部署

```bash
# 构建应用
npm run build

# 使用 PM2 运行
pm2 start .next/standalone/server.js --name website
```

#### 使用部署脚本

Windows (PowerShell):

```powershell
.\deploy.ps1
```

Linux/Mac:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔮 未来规划

- [ ] AI 对话助手集成
- [ ] 个人任务管理系统
- [ ] 内容管理后台 (CMS)
- [ ] 数据可视化仪表盘
- [ ] 用户认证系统

---

## 📄 许可证

本项目基于 MIT 许可证开源。

---

Created with ❤️ by [9xxxxxx](https://github.com/9xxxxxx)
