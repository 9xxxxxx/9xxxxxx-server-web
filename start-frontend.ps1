# --- 前端启动脚本 ---
# 项目: 9xxxxxx-server-web
# 用途: 本地开发环境启动

Write-Host "🚀 正在准备启动前端开发服务器..." -ForegroundColor Cyan

# 1. 检查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 未检测到 node_modules，正在执行 npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install 失败，请检查网络或 Node.js 环境。" -ForegroundColor Red
        exit 1
    }
}

# 2. 设置环境变量
# 默认指向本地后端 (通常是 8000 端口)
# 如果需要连接远程后端，可以手动修改此处或在 .env.local 中覆盖
if (-not $env:NEXT_PUBLIC_API_URL) {
    $env:NEXT_PUBLIC_API_URL = "http://localhost:8000"
    Write-Host "🌐 设置默认 API 地址: $($env:NEXT_PUBLIC_API_URL)" -ForegroundColor Gray
}

# 3. 启动开发服务器
Write-Host "🏃 正在启动 Next.js 开发服务器..." -ForegroundColor Green
npm run dev
