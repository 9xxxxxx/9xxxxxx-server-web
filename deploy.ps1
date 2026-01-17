# --- 配置区 ---
$SERVER_USER = "root" # 请根据实际修改
$SERVER_HOST = "bytedance" # 请根据实际修改
$SERVER_PATH = "/var/www/app"
# --- --- --- ---

Write-Host "🚀 开始部署流程..." -ForegroundColor Cyan

# 1. 前端构建
Write-Host "📦 正在本地构建前端..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败，请检查代码错误。" -ForegroundColor Red
    exit 1
}

# 2. 压缩构建产物
Write-Host "🗜️ 正在压缩静态文件与后端代码..." -ForegroundColor Yellow
if (Test-Path "out.tar.gz") { Remove-Item "out.tar.gz" }
if (Test-Path "backend.tar.gz") { Remove-Item "backend.tar.gz" }

# 压缩前端 (使用相对路径)
tar.exe -czf out.tar.gz -C out .

# 压缩后端 (排除本地数据库、上传的图片、字节码和环境文件夹)
tar.exe -czf backend.tar.gz --exclude="database.db" --exclude="static/uploads" --exclude="__pycache__" --exclude=".venv" --exclude=".uv" -C backend .

# 3. 上传到服务器
Write-Host "📤 正在上传文件至服务器..." -ForegroundColor Yellow
scp out.tar.gz backend.tar.gz "$($SERVER_USER)@$($SERVER_HOST):$($SERVER_PATH)/"
# 重新加上 Nginx 配置的同步
scp -r deploy/ "$($SERVER_USER)@$($SERVER_HOST):$($SERVER_PATH)/"

# 4. 远程解压与服务重启
Write-Host "🔧 正在远程执行解压和清理..." -ForegroundColor Yellow
# 将多行命令转为单行，避免 Windows 换行符 (\r) 导致 Linux 报错
# 并修正 uv 偏好设置为 only-system
$Commands = @(
    "mkdir -p $($SERVER_PATH)/out $($SERVER_PATH)/backend",
    "cd $($SERVER_PATH)",
    "rm -rf out/*",
    "tar -xzf out.tar.gz -C out",
    "tar -xzf backend.tar.gz -C backend",
    "rm out.tar.gz backend.tar.gz",
    "cd backend",
    "chmod +x server.sh",
    "~/.local/bin/uv sync",
    "./server.sh restart",
    "sudo systemctl reload nginx"
)
$RemoteCmd = $Commands -join "; "

ssh "$($SERVER_USER)@$($SERVER_HOST)" $RemoteCmd

# 5. 清理本地压缩包
Write-Host "🧹 清理本地临时文件..." -ForegroundColor Yellow
Remove-Item "out.tar.gz"

Write-Host "✅ 部署完成！" -ForegroundColor Green
