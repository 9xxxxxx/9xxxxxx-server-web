#!/bin/bash

# 增强版部署脚本 - 支持零停机部署
# 用途: 从 Windows 开发机部署到 Ubuntu 服务器

set -e

# ============================================
# 配置区域 - 请修改为您的服务器信息
# ============================================
SERVER_USER="root"  # 请修改为您的 SSH 用户名
SERVER_HOST="115.191.9.139"
SERVER_PATH="/var/www/app"
APP_NAME="personal-website"

# ============================================
# 颜色输出
# ============================================
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 开始部署流程...${NC}"

# ============================================
# 1. 本地构建
# ============================================
echo -e "${CYAN}📦 构建 Next.js 应用...${NC}"
npm run build

# 检查 standalone 目录
if [ ! -d ".next/standalone" ]; then
    echo -e "${RED}❌ 错误: standalone 目录不存在${NC}"
    echo -e "${YELLOW}请确保 next.config.ts 中设置了 output: 'standalone'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建完成${NC}"

# ============================================
# 2. 创建部署包
# ============================================
echo -e "${CYAN}📦 创建部署包...${NC}"
tar -czf deploy.tar.gz .next/standalone .next/static public

echo -e "${GREEN}✅ 部署包创建完成: deploy.tar.gz ($(du -h deploy.tar.gz | cut -f1))${NC}"

# ============================================
# 3. 检查服务器连接
# ============================================
echo -e "${CYAN}🔍 检查服务器连接...${NC}"
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo 'Connected'" &> /dev/null; then
    echo -e "${RED}❌ 无法连接到服务器 $SERVER_HOST${NC}"
    echo -e "${YELLOW}请检查 SSH 配置和服务器地址${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 服务器连接正常${NC}"

# ============================================
# 4. 上传到服务器
# ============================================
echo -e "${CYAN}📤 上传到服务器...${NC}"
scp deploy.tar.gz $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

echo -e "${GREEN}✅ 上传完成${NC}"

# ============================================
# 5. 在服务器上部署
# ============================================
echo -e "${CYAN}🔧 在服务器上解压并部署...${NC}"
ssh $SERVER_USER@$SERVER_HOST << EOF
  set -e
  cd $SERVER_PATH
  
  # 备份旧版本
  if [ -d ".next" ]; then
    echo "📦 备份旧版本..."
    BACKUP_DIR="backups/backup-\$(date +%Y%m%d-%H%M%S)"
    mkdir -p \$BACKUP_DIR
    cp -r .next public \$BACKUP_DIR/ 2>/dev/null || true
    echo "✅ 备份完成: \$BACKUP_DIR"
  fi
  
  # 解压新版本
  echo "📦 解压新版本..."
  tar -xzf deploy.tar.gz
  rm deploy.tar.gz
  
  # 使用 PM2 重启应用 (零停机)
  if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME"; then
      echo "🔄 重启应用 (零停机)..."
      pm2 reload $APP_NAME --update-env
    else
      echo "🚀 启动应用..."
      pm2 start .next/standalone/server.js --name $APP_NAME
      pm2 save
    fi
    
    # 显示应用状态
    pm2 info $APP_NAME
  else
    echo "⚠️  PM2 未安装,请手动启动应用"
  fi
  
  echo "✅ 部署完成"
EOF

# ============================================
# 6. 健康检查
# ============================================
echo -e "${CYAN}🏥 执行健康检查...${NC}"
sleep 3

# 尝试访问应用
if ssh $SERVER_USER@$SERVER_HOST "curl -f http://localhost:3000 > /dev/null 2>&1"; then
    echo -e "${GREEN}✅ 应用运行正常!${NC}"
else
    echo -e "${YELLOW}⚠️  健康检查失败,请检查应用日志${NC}"
    echo -e "${YELLOW}运行: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs $APP_NAME'${NC}"
fi

# ============================================
# 7. 清理本地文件
# ============================================
echo -e "${CYAN}🧹 清理本地部署包...${NC}"
rm deploy.tar.gz

echo ""
echo -e "${GREEN}✅ 部署完成!${NC}"
echo ""
echo -e "${CYAN}📝 后续操作:${NC}"
echo -e "  1. 查看日志: ssh $SERVER_USER@$SERVER_HOST 'pm2 logs $APP_NAME'"
echo -e "  2. 查看状态: ssh $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo -e "  3. 访问网站: https://your-domain.com"
echo ""
