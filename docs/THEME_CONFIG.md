# 网站配色方案配置 (Website Theme Configuration) 🎨

> **当前风格**: "暖冷撞色 & 沉浸式流光 (Warm/Cool Contrast & Immersive Flow)"
> **核心理念**: 无留白设计、全局固定渐变、基于路由的动态主题切换。

## 1. 全局背景系统 (Global Background System)

本网站使用 **固定定位 (Fixed Position)** 的背景层 (`z-index: -1`)，并保持 `body` 背景透明 (`body { background: transparent }`)，从而确保全局流光背景在所有页面都能无缝展示。

### 核心组件

- **文件路径**: `src/components/GlobalBackground.tsx`
- **逻辑**: 监听 `usePathname()` (路由变化) 和 `window.scrollY` (滚动事件) 来自动切换主题。

---

## 2. 主题色板 (动态切换)

背景光晕 (Blobs) 的颜色会根据当前页面路由自动改变。

### A. 首页 - 初始状态 (`/`) - "暖冷撞色 (Warm/Cool Contrast)"

_默认主题，充满活力与热情，用于首屏展示。_

- **底色渐变**: `from-indigo-50` via `slate-50` to `orange-50`
- **光晕 (Blobs)**:
  - **橙色**: `bg-orange-300/60` (温暖/活力)
  - **靛蓝**: `bg-indigo-300/60` (深邃/对比)
  - **粉色**: `bg-pink-200/50` (鲜艳感)
  - **青色**: `bg-cyan-200/40` (微妙点缀)

### B. 首页滚动 & 项目页 - "清爽科技蓝 (Calm Tech Blue)"

_统一的内容展示背景，用于首页项目预览及项目列表页。_

- **适用场景**: 首页滚动后、项目列表页 (`/projects`)。
- **底色渐变**: `from-slate-50` to `blue-50/30`
- **光晕 (Blobs)**:
  - `bg-slate-200/50`
  - `bg-blue-200/50`
  - `bg-cyan-100/50`
  - `bg-indigo-100/50`

### C. 博客页 (`/blog`) - "静谧阅读 (Serene Reading)"

_沉静、知性、专注，适合长文阅读。_

- **底色渐变**: `from-slate-50` to `indigo-50/30`
- **光晕 (Blobs)**:
  - **靛蓝**: `bg-indigo-200/50`
  - **玫瑰色**: `bg-rose-200/50` (柔和暖意)
  - **岩石灰**: `bg-slate-200/50`
  - **蓝色**: `bg-blue-200/50`

### D. 关于页 (`/about`) - "自然生长 (Nature & Growth)"

_有机、以人为本、价值驱动。_

- **底色渐变**: `from-stone-50` to `emerald-50/40`
- **光晕 (Blobs)**:
  - **绿宝石**: `bg-emerald-200/50` (生长)
  - **青色**: `bg-teal-200/50` (专业)
  - **琥珀色**: `bg-amber-100/60` (价值)
  - **酸橙色**: `bg-lime-100/50` (清新)

---

## 3. 布局配置 (Layout)

### 根布局 (`src/app/layout.tsx`)

- `body` 背景色设置为 `transparent` (透明)。
- 包含 `<GlobalBackground />` 组件。
- `selection` (在选中文本时的颜色): Indigo 100/900。

### 门户布局 (`src/app/(portal)/layout.tsx`)

- 背景色设置为 `transparent` (移除了原有的 `bg-background` 遮挡层)。

---

## 4. 首页区块样式 (Section Styling)

首页采用了全屏分段设计，营造高端的 "幻灯片" 浏览体验。

- **Hero (首屏)**: `min-h-screen` (全屏高度), 内容居中。
- **Featured Projects (精选项目)**: `min-h-screen`, `flex-col justify-center` (全屏垂直居中)。
- **Recent Writings (最新文章)**: `min-h-screen`, `flex-col justify-center` (全屏垂直居中)。

每个区块都占据完整的视口高度，为每个内容模块创造独立的展示空间。
