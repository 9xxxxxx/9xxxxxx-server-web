# 部署文档

本文档详细说明如何将应用部署到 Ubuntu 24.04 服务器。

## 前置要求

### 开发机 (Windows 11)

- Node.js 20+
- Git
- SSH 客户端

### 服务器 (Ubuntu 24.04)

- 公网 IP 地址
- SSH 访问权限
- 域名 (可选,但推荐用于 SSL)

---

## 部署步骤

### 1. 服务器初始化

首先,将 `scripts/server-setup.sh` 上传到服务器并执行:

```bash
# 从 Windows 上传脚本
scp scripts/server-setup.sh user@server-ip:~/

# SSH 登录服务器
ssh user@server-ip

# 执行初始化脚本
chmod +x server-setup.sh
./server-setup.sh
```

脚本会自动安装:

- Docker 和 Docker Compose
- Nginx
- Node.js 20 和 PM2
- Certbot (SSL 证书工具)
- 配置防火墙 (UFW)

**重要**: 脚本执行完成后,需要重新登录以使 Docker 组权限生效。

---

### 2. 配置域名 DNS

在域名服务商处添加 A 记录,指向服务器 IP:

```
类型: A
主机: @
值: your-server-ip
TTL: 3600
```

等待 DNS 传播 (通常 5-30 分钟)。

---

### 3. 配置 SSL 证书

```bash
# 在服务器上执行
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

按照提示完成验证,Certbot 会自动配置 Nginx。

---

### 4. 配置 Nginx

```bash
# 复制配置文件
sudo cp /var/www/app/deploy/nginx.conf /etc/nginx/sites-available/app

# 修改配置文件中的域名
sudo nano /etc/nginx/sites-available/app
# 将 your-domain.com 替换为实际域名

# 创建软链接
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

### 5. 配置环境变量

在服务器上创建 `.env` 文件:

```bash
cd /var/www/app
nano .env
```

复制 `.env.example` 的内容并修改:

```env
DATABASE_URL="postgresql://postgres:your-password@db:5432/website"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="生成一个随机密钥"
REDIS_URL="redis://redis:6379"
```

生成 NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

---

### 6. 修改部署脚本配置

在本地 Windows 机器上,编辑 `deploy.sh`:

```bash
SERVER_USER="your_username"
SERVER_HOST="your-server-ip"
SERVER_PATH="/var/www/app"
APP_NAME="personal-website"
```

---

### 7. 执行部署

#### 方案 A: 使用 Docker Compose (推荐)

```bash
# 在服务器上执行
cd /var/www/app
docker-compose up -d

# 查看日志
docker-compose logs -f app
```

#### 方案 B: 使用 PM2

在 Windows 开发机上执行:

```bash
# 使用 Git Bash 或 WSL
chmod +x deploy.sh
./deploy.sh
```

脚本会自动:

1. 构建应用
2. 创建部署包
3. 上传到服务器
4. 解压并使用 PM2 重启 (零停机)
5. 执行健康检查

---

## 验证部署

### 检查应用状态

```bash
# Docker 方式
docker-compose ps

# PM2 方式
pm2 status
pm2 logs personal-website
```

### 访问网站

打开浏览器访问:

- `https://your-domain.com`

### 检查健康端点

```bash
curl https://your-domain.com/api/health
```

应返回:

```json
{
  "status": "ok",
  "timestamp": "2026-01-14T05:00:00.000Z",
  "uptime": 123.45
}
```

---

## 常见问题

### 1. 端口 3000 被占用

```bash
# 查找占用进程
sudo lsof -i :3000

# 停止进程
pm2 stop all
# 或
docker-compose down
```

### 2. Nginx 502 错误

检查应用是否运行:

```bash
curl http://localhost:3000
```

查看 Nginx 日志:

```bash
sudo tail -f /var/log/nginx/app_error.log
```

### 3. SSL 证书问题

重新申请证书:

```bash
sudo certbot --nginx -d your-domain.com --force-renewal
```

### 4. 数据库连接失败

检查 Docker 容器:

```bash
docker-compose logs db
```

进入数据库容器:

```bash
docker-compose exec db psql -U postgres -d website
```

---

## 更新部署

后续更新只需在 Windows 开发机执行:

```bash
./deploy.sh
```

脚本会自动备份旧版本并执行零停机部署。

---

## 回滚

如果部署出现问题,可以回滚到备份版本:

```bash
# 在服务器上
cd /var/www/app
ls backups/  # 查看备份列表

# 恢复备份
cp -r backups/backup-20260114-130000/.next .
cp -r backups/backup-20260114-130000/public .

# 重启应用
pm2 restart personal-website
```

---

## 监控和维护

### 设置 PM2 开机自启

```bash
pm2 startup systemd
pm2 save
```

### 查看应用日志

```bash
pm2 logs personal-website --lines 100
```

### 重启应用

```bash
pm2 restart personal-website
```

### 更新 SSL 证书

Certbot 会自动续期,也可以手动测试:

```bash
sudo certbot renew --dry-run
```

---

## 性能优化建议

1. **启用 Nginx 缓存**: 已在配置中启用静态资源缓存
2. **使用 CDN**: 将静态资源托管到 CDN
3. **数据库优化**: 定期备份和优化 PostgreSQL
4. **监控工具**: 安装 PM2 Plus 或 New Relic

---

## 安全建议

1. **定期更新系统**: `sudo apt update && sudo apt upgrade`
2. **配置防火墙**: UFW 已在初始化脚本中配置
3. **使用强密码**: 数据库和服务器密码
4. **定期备份**: 数据库和应用文件
5. **限制 SSH 访问**: 使用密钥认证,禁用密码登录
