# PowerShell 部署脚本 - 用于将应用部署到云服务器

Write-Host "🚀 开始部署流程..." -ForegroundColor Green

# ============================================
# 配置区域
# ============================================
$SSH_ALIAS = "bytedance"  # SSH 配置别名
$SERVER_PATH = "/var/www/app"
$APP_NAME = "personal-website"

# ============================================
# 1. 构建应用
# ============================================
Write-Host "📦 构建 Next.js 应用..." -ForegroundColor Cyan
npm run build

# 2. 检查 standalone 目录
if (-not (Test-Path ".next\standalone")) {
    Write-Host "❌ 错误: standalone 目录不存在" -ForegroundColor Red
    Write-Host "请确保 next.config.ts 中设置了 output: 'standalone'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ 构建完成" -ForegroundColor Green

# ============================================
# 3. 创建部署包
# ============================================
Write-Host "📦 创建部署包..." -ForegroundColor Cyan

# 删除旧的部署包
if (Test-Path "deploy.tar.gz") {
    Remove-Item "deploy.tar.gz" -Force
}

# 使用 tar 创建压缩包 (需要 Windows 10 1803+ 或安装 Git Bash)
tar -czf deploy.tar.gz .next/standalone .next/static public

if (-not (Test-Path "deploy.tar.gz")) {
    Write-Host "❌ 错误: 部署包创建失败" -ForegroundColor Red
    Write-Host "请确保系统支持 tar 命令,或使用 Git Bash 执行 deploy.sh" -ForegroundColor Yellow
    exit 1
}

$fileSize = (Get-Item "deploy.tar.gz").Length / 1MB
Write-Host "✅ 部署包创建完成: deploy.tar.gz ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green

# ============================================
# 4. 上传到服务器
# ============================================
Write-Host "📤 上传到服务器..." -ForegroundColor Cyan
Write-Host "使用 SCP 上传文件到 ${SSH_ALIAS}:${SERVER_PATH}/" -ForegroundColor Yellow

scp deploy.tar.gz "${SSH_ALIAS}:${SERVER_PATH}/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 上传失败,请检查 SSH 配置" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 上传完成" -ForegroundColor Green

# ============================================
# 5. 在服务器上部署
# ============================================
Write-Host "🔧 在服务器上解压并部署..." -ForegroundColor Cyan

# 构建部署命令(使用单行命令避免换行符问题)
$cmd1 = "cd $SERVER_PATH && "
$cmd2 = "if [ -d '.next' ]; then echo '📦 备份旧版本...' && BACKUP_DIR=backups/backup-`$(date +%Y%m%d-%H%M%S) && mkdir -p `$BACKUP_DIR && cp -r .next public `$BACKUP_DIR/ 2>/dev/null || true && echo '✅ 备份完成'; fi && "
$cmd3 = "echo '📦 解压新版本...' && tar -xzf deploy.tar.gz && rm deploy.tar.gz && "
$cmd4 = "if command -v pm2 &> /dev/null; then if pm2 list | grep -q '$APP_NAME'; then echo '🔄 重启应用...' && pm2 reload $APP_NAME --update-env; else echo '🚀 启动应用...' && pm2 start .next/standalone/server.js --name $APP_NAME && pm2 save; fi && pm2 info $APP_NAME; else echo '⚠️  PM2 未安装'; fi && "
$cmd5 = "echo '✅ 部署完成'"

$deployCommand = $cmd1 + $cmd2 + $cmd3 + $cmd4 + $cmd5

ssh "${SSH_ALIAS}" $deployCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败" -ForegroundColor Red
    exit 1
}

# ============================================
# 6. 健康检查
# ============================================
Write-Host "🏥 执行健康检查..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

ssh "${SSH_ALIAS}" "curl -f http://localhost:3000/api/health > /dev/null 2>&1"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 应用运行正常!" -ForegroundColor Green
} else {
    Write-Host "⚠️  健康检查失败,请检查应用日志" -ForegroundColor Yellow
    Write-Host "运行: ssh ${SSH_ALIAS} 'pm2 logs ${APP_NAME}'" -ForegroundColor Yellow
}

# ============================================
# 7. 清理本地文件
# ============================================
Write-Host "🧹 清理本地部署包..." -ForegroundColor Cyan
Remove-Item "deploy.tar.gz" -Force

Write-Host ""
Write-Host "✅ 部署完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 后续操作:" -ForegroundColor Cyan
Write-Host "  1. 查看日志: ssh ${SSH_ALIAS} 'pm2 logs ${APP_NAME}'" -ForegroundColor White
Write-Host "  2. 查看状态: ssh ${SSH_ALIAS} 'pm2 status'" -ForegroundColor White
Write-Host "  3. 访问网站: http://115.191.9.139:3000" -ForegroundColor White
Write-Host ""
