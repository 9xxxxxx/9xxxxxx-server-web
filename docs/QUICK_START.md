# 服务器部署快速指南

## 服务器信息

- **IP 地址**: 115.191.9.139
- **操作系统**: Ubuntu 24.04
- **SSH 用户**: root (请根据实际情况修改)

---

## 🚀 快速部署步骤

### 1. 初始化服务器 (首次部署)

将服务器初始化脚本上传到服务器:

```powershell
# 在 Windows PowerShell 中执行
scp scripts/server-setup.sh root@115.191.9.139:~/
```

SSH 登录服务器并执行初始化:

```bash
ssh root@115.191.9.139

# 在服务器上执行
chmod +x server-setup.sh
./server-setup.sh
```

初始化脚本会自动安装:

- Docker 和 Docker Compose
- Nginx
- Node.js 20 和 PM2
- Certbot (SSL 证书)
- 配置防火墙

**重要**: 脚本执行完成后,重新登录以使 Docker 组权限生效。

---

### 2. 创建应用目录

```bash
ssh root@115.191.9.139

# 创建应用目录
sudo mkdir -p /var/www/app
sudo chown -R $USER:$USER /var/www/app
```

---

### 3. 部署应用

#### 方式 A: 使用 PowerShell 脚本 (Windows)

```powershell
# 在项目根目录执行
.\deploy.ps1
```

#### 方式 B: 使用 Bash 脚本 (Git Bash/WSL)

```bash
chmod +x deploy.sh
./deploy.sh
```

部署脚本会自动:

1. 构建 Next.js 应用
2. 创建部署包
3. 上传到服务器
4. 解压并使用 PM2 启动/重启应用
5. 执行健康检查

---

### 4. 验证部署

访问应用:

```
http://115.191.9.139:3000
```

检查健康端点:

```bash
curl http://115.191.9.139:3000/api/health
```

查看应用日志:

```bash
ssh root@115.191.9.139 'pm2 logs personal-website'
```

查看应用状态:

```bash
ssh root@115.191.9.139 'pm2 status'
```

---

## 🔧 配置 Nginx (可选,用于域名访问)

如果您有域名,可以配置 Nginx 反向代理:

### 1. 配置 DNS

在域名服务商处添加 A 记录:

```
类型: A
主机: @
值: 115.191.9.139
TTL: 3600
```

### 2. 上传 Nginx 配置

```powershell
scp deploy/nginx.conf root@115.191.9.139:/tmp/
```

### 3. 在服务器上配置 Nginx

```bash
ssh root@115.191.9.139

# 修改配置文件中的域名
sudo nano /tmp/nginx.conf
# 将 your-domain.com 替换为您的实际域名

# 复制配置文件
sudo cp /tmp/nginx.conf /etc/nginx/sites-available/app
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

### 4. 配置 SSL 证书

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🐳 使用 Docker Compose 部署 (可选)

如果需要使用数据库和 Redis:

### 1. 上传 docker-compose.yml

```powershell
scp docker-compose.yml root@115.191.9.139:/var/www/app/
scp .env.example root@115.191.9.139:/var/www/app/
```

### 2. 配置环境变量

```bash
ssh root@115.191.9.139
cd /var/www/app

# 创建 .env 文件
cp .env.example .env
nano .env  # 修改配置

# 生成 NEXTAUTH_SECRET
openssl rand -base64 32
```

### 3. 启动服务

```bash
docker-compose up -d
```

### 4. 查看日志

```bash
docker-compose logs -f app
```

---

## 📊 常用命令

### PM2 管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs personal-website

# 重启应用
pm2 restart personal-website

# 停止应用
pm2 stop personal-website

# 删除应用
pm2 delete personal-website
```

### Docker 管理

```bash
# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart app

# 停止所有服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启 Nginx
sudo systemctl restart nginx

# 查看日志
sudo tail -f /var/log/nginx/app_error.log
```

---

## 🔍 故障排查

### 1. 无法连接到服务器

检查 SSH 配置:

```powershell
ssh -v root@115.191.9.139
```

### 2. 应用无法启动

查看 PM2 日志:

```bash
ssh root@115.191.9.139 'pm2 logs personal-website --lines 100'
```

### 3. 端口被占用

检查端口占用:

```bash
ssh root@115.191.9.139 'sudo lsof -i :3000'
```

### 4. Nginx 502 错误

检查应用是否运行:

```bash
ssh root@115.191.9.139 'curl http://localhost:3000'
```

---

## 🔄 更新部署

后续更新只需执行:

```powershell
.\deploy.ps1
```

或

```bash
./deploy.sh
```

脚本会自动备份旧版本并执行零停机部署。

---

## 📝 注意事项

1. **SSH 密钥**: 建议配置 SSH 密钥认证,避免每次输入密码
2. **防火墙**: 确保服务器防火墙允许 3000 端口(或 80/443 端口)
3. **备份**: 部署脚本会自动备份,备份位于 `/var/www/app/backups/`
4. **环境变量**: 生产环境记得修改 `.env` 中的敏感信息
5. **SSL 证书**: 使用域名时建议配置 SSL 证书

---

更多详细信息请参考 [DEPLOYMENT.md](file:///c:/Dev/9xxxxxx-server-web/docs/DEPLOYMENT.md)
