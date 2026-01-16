#!/bin/bash

# Ubuntu 24.04 服务器初始化脚本
# 用途: 安装 Docker, Nginx, PM2, 配置防火墙和 SSL

set -e

echo "🚀 开始 Ubuntu 24.04 服务器初始化..."

# 更新系统
echo "📦 更新系统包..."
sudo apt update && sudo apt upgrade -y

# 安装基础工具
echo "🔧 安装基础工具..."
sudo apt install -y curl wget git vim ufw

# 安装 Docker
echo "🐳 安装 Docker..."
if ! command -v docker &> /dev/null; then
    # 添加 Docker 官方 GPG 密钥
    sudo apt install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg

    # 添加 Docker 仓库
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # 安装 Docker Engine
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    # 将当前用户添加到 docker 组
    sudo usermod -aG docker $USER
    echo "✅ Docker 安装完成"
else
    echo "✅ Docker 已安装"
fi

# 安装 Nginx
echo "🌐 安装 Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    echo "✅ Nginx 安装完成"
else
    echo "✅ Nginx 已安装"
fi

# 安装 Node.js 和 PM2
echo "📦 安装 Node.js 20 和 PM2..."
if ! command -v node &> /dev/null; then
    # 使用 NodeSource 仓库安装 Node.js 20
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo "✅ Node.js 安装完成"
else
    echo "✅ Node.js 已安装"
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    pm2 startup systemd -u $USER --hp $HOME
    echo "✅ PM2 安装完成"
else
    echo "✅ PM2 已安装"
fi

# 配置防火墙
echo "🔥 配置防火墙 (UFW)..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
echo "✅ 防火墙配置完成"

# 安装 Certbot (Let's Encrypt SSL)
echo "🔒 安装 Certbot..."
if ! command -v certbot &> /dev/null; then
    sudo apt install -y certbot python3-certbot-nginx
    echo "✅ Certbot 安装完成"
else
    echo "✅ Certbot 已安装"
fi

# 创建应用目录
echo "📁 创建应用目录..."
sudo mkdir -p /var/www/app
sudo chown -R $USER:$USER /var/www/app

echo ""
echo "✅ 服务器初始化完成!"
echo ""
echo "📝 后续步骤:"
echo "1. 配置域名 DNS 指向此服务器"
echo "2. 运行: sudo certbot --nginx -d your-domain.com"
echo "3. 部署应用到 /var/www/app"
echo "4. 配置 Nginx (使用 deploy/nginx.conf)"
echo ""
echo "🔄 重要: 重新登录以使 Docker 组权限生效"
