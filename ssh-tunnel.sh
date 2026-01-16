# SSH 隧道连接脚本
# 用于本地开发连接服务器数据库

# PostgreSQL 隧道 (本地 5432 -> 服务器 5432)
ssh -N -L 5432:localhost:5432 bytedance

# Redis 隧道 (本地 6379 -> 服务器 6379)
# ssh -N -L 6379:localhost:6379 bytedance

# 使用方法:
# 1. 在新的 PowerShell 窗口运行此脚本
# 2. 保持窗口打开
# 3. 本地应用即可通过 localhost:5432 连接服务器数据库
