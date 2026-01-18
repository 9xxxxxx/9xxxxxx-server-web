# --- 配置区 ---
$SERVER_USER = "root"
$SERVER_HOST = "115.191.9.139"
$SERVER_PATH = "/var/www/app"
$KEY_PATH = "C:\Users\26375\.ssh\bytedance.pem"
# --- --- ---

Write-Host "🚀 开始部署流程 (Standalone Mode)..." -ForegroundColor Cyan

# 1. 检查环境与构建
Write-Host "📦 正在本地构建前端..." -ForegroundColor Yellow

try {
    # 设置构建时环境变量 (对于 Client Components 必须在 Build 时注入)
    # 注意: Windows PowerShell 设置环境变量语法
    $env:NEXT_PUBLIC_API_URL = "http://115.191.9.139"
    
    # 执行构建
    npm run build
    
    if ($LASTEXITCODE -ne 0) { throw "npm run build 失败" }
}
catch {
    Write-Host "❌ 构建失败: $_" -ForegroundColor Red
    exit 1
}

# 2. 准备 Standalone 构件
Write-Host "🗜️ 正在打包 Standalone 产物..." -ForegroundColor Yellow

# 清理旧的压缩包
if (Test-Path "out.tar.gz") { Remove-Item "out.tar.gz" }
if (Test-Path "backend.tar.gz") { Remove-Item "backend.tar.gz" }

# 确保目标目录结构存在 (Standalone 构建后默认会有 public，但 static 需要手动复制)
# .next/standalone 包含极简的 node_modules 和 server.js
$StandalonePath = ".next/standalone"

if (-not (Test-Path "$StandalonePath")) {
    Write-Host "❌ 未找到 .next/standalone 目录，请确保 next.config.ts 中开启了 output: 'standalone'" -ForegroundColor Red
    exit 1
}

# 复制 public 文件夹
Copy-Item -Path "public" -Destination "$StandalonePath/public" -Recurse -Force

# 复制 .next/static 文件夹 (Next.js Standalone 不自动包含 static 文件)
# 目标路径必须是 .next/standalone/.next/static
$StaticDest = "$StandalonePath/.next/static"
if (-not (Test-Path $StaticDest)) { New-Item -ItemType Directory -Path $StaticDest -Force | Out-Null }
Copy-Item -Path ".next/static/*" -Destination $StaticDest -Recurse -Force

# 压缩前端 (进入 standalone 目录打包，这样解压后直接是内容)
tar.exe -czf out.tar.gz -C "$StandalonePath" .

# 压缩后端 (排除无关文件)
Write-Host "🐍 正在打包后端..." -ForegroundColor Yellow
tar.exe -czf backend.tar.gz --exclude="database.db" --exclude="static/uploads" --exclude="__pycache__" --exclude=".venv" --exclude=".uv" -C backend .

# 3. 上传到服务器
Write-Host "📤 正在上传文件至服务器..." -ForegroundColor Yellow
scp -i $KEY_PATH -o ConnectTimeout=600 out.tar.gz "$($SERVER_USER)@$($SERVER_HOST):$($SERVER_PATH)/"
if ($LASTEXITCODE -ne 0) { throw "上传前端代码失败" }

scp -i $KEY_PATH -o ConnectTimeout=600 backend.tar.gz "$($SERVER_USER)@$($SERVER_HOST):$($SERVER_PATH)/"
if ($LASTEXITCODE -ne 0) { throw "上传后端代码失败" }

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 文件上传失败！" -ForegroundColor Red
    exit 1
}

# 同步 Nginx 配置
scp -i $KEY_PATH -r deploy/ "$($SERVER_USER)@$($SERVER_HOST):$($SERVER_PATH)/"

# 4. 远程执行部署
Write-Host "🔧 正在远程执行解压和重启服务..." -ForegroundColor Yellow

$Commands = @(
    # 创建目录结构 (包含上传子目录)
    "mkdir -p $($SERVER_PATH)/app $($SERVER_PATH)/backend /var/www/uploads/{images,data,docs} /var/www/data",
    "chmod 777 /var/www/uploads /var/www/uploads/images /var/www/uploads/data /var/www/uploads/docs /var/www/data",
    
    # 清理旧App代码 (保留 backend 的数据/uploads 不受影响，因为是 separate extract)
    # 但我们这里 backend 是覆盖式更新代码
    "cd $($SERVER_PATH)",
    "rm -rf app/*", 
    
    # 解压前端
    "tar -xzf out.tar.gz -C app",
    
    # 解压后端
    "tar -xzf backend.tar.gz -C backend",
    
    # 清理压缩包
    "rm out.tar.gz backend.tar.gz",
    
    # --- 后端重启 ---
    "cd backend",
    "chmod +x server.sh",
    "~/.local/bin/uv sync", # 确保依赖同步
    "./server.sh restart",
    
    # --- 前端重启 (PM2) ---
    "cd ../app",
    # 检查 pm2 是否安装，未安装则报错(假设已安装)
    "pm2 delete next-frontend || true",
    "PORT=3000 pm2 start server.js --name next-frontend",
    "pm2 save",
    
    # --- Nginx 重载 ---
    "sudo systemctl reload nginx"
)

$RemoteCmd = $Commands -join "; "
ssh -i $KEY_PATH "$($SERVER_USER)@$($SERVER_HOST)" $RemoteCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    # 清理本地
    Remove-Item "out.tar.gz"
    Remove-Item "backend.tar.gz"
} else {
    Write-Host "❌ 远程命令执行出错" -ForegroundColor Red
    exit 1
}
