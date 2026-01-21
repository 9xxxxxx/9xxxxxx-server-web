#!/bin/bash

# ============================================
# 服务器管理脚本
# 项目: 9xxxxxx-server-web
# 功能: 统一管理前端、后端和 Nginx 服务
# ============================================

# --- 配置区 ---
APP_DIR="/var/www/app"
BACKEND_DIR="/var/www/app/backend"
FRONTEND_DIR="/var/www/app/app"
LOG_DIR="/var/log"
DATA_DIR="/var/www/data"
UPLOADS_DIR="/var/www/uploads"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- 工具函数 ---
print_header() {
    echo -e "${CYAN}============================================${NC}"
    echo -e "${CYAN}  🖥️  服务器管理工具${NC}"
    echo -e "${CYAN}============================================${NC}"
}

print_status() {
    local status=$1
    local service=$2
    if [ "$status" = "running" ]; then
        echo -e "  ${GREEN}●${NC} $service: ${GREEN}运行中${NC}"
    elif [ "$status" = "stopped" ]; then
        echo -e "  ${RED}●${NC} $service: ${RED}已停止${NC}"
    else
        echo -e "  ${YELLOW}●${NC} $service: ${YELLOW}未知${NC}"
    fi
}

# --- 后端管理 ---
backend_start() {
    echo -e "${BLUE}🚀 启动后端服务...${NC}"
    cd "$BACKEND_DIR" || { echo -e "${RED}❌ 无法进入后端目录${NC}"; return 1; }
    
    # 检查是否已运行
    if [ -f backend.pid ]; then
        PID=$(cat backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}⚠️  后端服务已在运行 (PID: $PID)${NC}"
            return 0
        fi
        rm backend.pid
    fi
    
    # 设置环境变量
    export UV_PYTHON_PREFERENCE=only-system
    export UPLOAD_DIR="$UPLOADS_DIR"
    export DATABASE_URL="sqlite:///$DATA_DIR/sql_app.db"
    
    # 加载 .env 文件
    if [ -f "$APP_DIR/.env" ]; then
        set -a
        source "$APP_DIR/.env"
        set +a
    fi
    
    # 启动服务
    nohup uv run uvicorn main:app --host 0.0.0.0 --port 8000 > "$LOG_DIR/backend.log" 2>&1 &
    echo $! > backend.pid
    
    sleep 2
    if ps -p $(cat backend.pid) > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 后端启动成功 (PID: $(cat backend.pid))${NC}"
    else
        echo -e "${RED}❌ 后端启动失败，请查看日志: $LOG_DIR/backend.log${NC}"
        tail -10 "$LOG_DIR/backend.log"
        return 1
    fi
}

backend_stop() {
    echo -e "${BLUE}🛑 停止后端服务...${NC}"
    cd "$BACKEND_DIR" || return 1
    
    # 通过 PID 文件停止
    if [ -f backend.pid ]; then
        PID=$(cat backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID
            echo "已终止进程 PID: $PID"
        fi
        rm -f backend.pid
    fi
    
    # 清理所有相关进程
    pkill -f "uvicorn main:app" 2>/dev/null
    
    # 清理端口占用
    PID_LSOF=$(lsof -t -i:8000 2>/dev/null)
    if [ ! -z "$PID_LSOF" ]; then
        kill -9 $PID_LSOF 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ 后端服务已停止${NC}"
}

backend_status() {
    cd "$BACKEND_DIR" 2>/dev/null
    if [ -f backend.pid ]; then
        PID=$(cat backend.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo "running"
            return 0
        fi
    fi
    
    # 检查相关进程
    if pgrep -f "uvicorn main:app" > /dev/null 2>&1; then
        echo "running"
        return 0
    fi
    
    echo "stopped"
    return 1
}

# --- 前端管理 ---
frontend_start() {
    echo -e "${BLUE}🚀 启动前端服务...${NC}"
    cd "$FRONTEND_DIR" || { echo -e "${RED}❌ 无法进入前端目录${NC}"; return 1; }
    
    # 检查 PM2 是否已有此进程
    if pm2 list | grep -q "next-frontend"; then
        STATUS=$(pm2 jlist | jq -r '.[] | select(.name == "next-frontend") | .pm2_env.status')
        if [ "$STATUS" = "online" ]; then
            echo -e "${YELLOW}⚠️  前端服务已在运行${NC}"
            return 0
        fi
    fi
    
    # 启动服务
    PORT=3000 pm2 start server.js --name next-frontend
    pm2 save
    
    sleep 2
    if pm2 list | grep "next-frontend" | grep -q "online"; then
        echo -e "${GREEN}✅ 前端启动成功${NC}"
    else
        echo -e "${RED}❌ 前端启动失败${NC}"
        pm2 logs next-frontend --lines 10
        return 1
    fi
}

frontend_stop() {
    echo -e "${BLUE}🛑 停止前端服务...${NC}"
    pm2 delete next-frontend 2>/dev/null || true
    echo -e "${GREEN}✅ 前端服务已停止${NC}"
}

frontend_status() {
    if pm2 list 2>/dev/null | grep "next-frontend" | grep -q "online"; then
        echo "running"
        return 0
    fi
    echo "stopped"
    return 1
}

# --- Nginx 管理 ---
nginx_reload() {
    echo -e "${BLUE}🔄 重载 Nginx 配置...${NC}"
    sudo nginx -t && sudo systemctl reload nginx
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx 配置已重载${NC}"
    else
        echo -e "${RED}❌ Nginx 配置错误${NC}"
        return 1
    fi
}

nginx_status() {
    if systemctl is-active --quiet nginx; then
        echo "running"
        return 0
    fi
    echo "stopped"
    return 1
}

# --- 全部服务管理 ---
all_start() {
    echo -e "${CYAN}========== 启动所有服务 ==========${NC}"
    backend_start
    echo ""
    frontend_start
    echo ""
    nginx_reload
    echo ""
    echo -e "${GREEN}🎉 所有服务启动完成！${NC}"
}

all_stop() {
    echo -e "${CYAN}========== 停止所有服务 ==========${NC}"
    frontend_stop
    echo ""
    backend_stop
    echo ""
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
}

all_restart() {
    echo -e "${CYAN}========== 重启所有服务 ==========${NC}"
    all_stop
    echo ""
    sleep 2
    all_start
}

all_status() {
    print_header
    echo ""
    echo -e "${BLUE}服务状态:${NC}"
    echo ""
    
    # 后端状态
    BE_STATUS=$(backend_status)
    print_status "$BE_STATUS" "后端 (FastAPI :8000)"
    
    # 前端状态
    FE_STATUS=$(frontend_status)
    print_status "$FE_STATUS" "前端 (Next.js :3000)"
    
    # Nginx 状态
    NG_STATUS=$(nginx_status)
    print_status "$NG_STATUS" "Nginx (:80)"
    
    echo ""
    echo -e "${BLUE}快捷信息:${NC}"
    echo "  📁 应用目录: $APP_DIR"
    echo "  📁 数据目录: $DATA_DIR"
    echo "  📁 上传目录: $UPLOADS_DIR"
    echo "  📋 后端日志: $LOG_DIR/backend.log"
    echo ""
}

# --- 日志查看 ---
logs_backend() {
    echo -e "${BLUE}📋 后端日志 (最近 50 行):${NC}"
    tail -50 "$LOG_DIR/backend.log"
}

logs_frontend() {
    echo -e "${BLUE}📋 前端日志:${NC}"
    pm2 logs next-frontend --lines 50
}

logs_nginx() {
    echo -e "${BLUE}📋 Nginx 访问日志 (最近 50 行):${NC}"
    tail -50 /var/log/nginx/app_access.log
}

logs_nginx_error() {
    echo -e "${BLUE}📋 Nginx 错误日志 (最近 50 行):${NC}"
    tail -50 /var/log/nginx/app_error.log
}

# --- 帮助信息 ---
show_help() {
    print_header
    echo ""
    echo -e "${YELLOW}用法:${NC} $0 <命令> [服务]"
    echo ""
    echo -e "${BLUE}服务管理命令:${NC}"
    echo "  start [all|backend|frontend]    启动服务"
    echo "  stop [all|backend|frontend]     停止服务"
    echo "  restart [all|backend|frontend]  重启服务"
    echo "  status                          查看所有服务状态"
    echo ""
    echo -e "${BLUE}日志命令:${NC}"
    echo "  logs backend                    查看后端日志"
    echo "  logs frontend                   查看前端日志"
    echo "  logs nginx                      查看 Nginx 访问日志"
    echo "  logs nginx-error                查看 Nginx 错误日志"
    echo ""
    echo -e "${BLUE}其他命令:${NC}"
    echo "  nginx reload                    重载 Nginx 配置"
    echo "  help                            显示此帮助信息"
    echo ""
    echo -e "${CYAN}示例:${NC}"
    echo "  $0 start all          # 启动所有服务"
    echo "  $0 restart backend    # 重启后端"
    echo "  $0 logs backend       # 查看后端日志"
    echo "  $0 status             # 查看服务状态"
    echo ""
}

# --- 主入口 ---
case "$1" in
    start)
        case "$2" in
            backend) backend_start ;;
            frontend) frontend_start ;;
            all|"") all_start ;;
            *) echo -e "${RED}未知服务: $2${NC}"; show_help ;;
        esac
        ;;
    stop)
        case "$2" in
            backend) backend_stop ;;
            frontend) frontend_stop ;;
            all|"") all_stop ;;
            *) echo -e "${RED}未知服务: $2${NC}"; show_help ;;
        esac
        ;;
    restart)
        case "$2" in
            backend) backend_stop; sleep 2; backend_start ;;
            frontend) frontend_stop; sleep 2; frontend_start ;;
            all|"") all_restart ;;
            *) echo -e "${RED}未知服务: $2${NC}"; show_help ;;
        esac
        ;;
    status)
        all_status
        ;;
    logs)
        case "$2" in
            backend) logs_backend ;;
            frontend) logs_frontend ;;
            nginx) logs_nginx ;;
            nginx-error) logs_nginx_error ;;
            *) echo -e "${RED}请指定日志类型: backend, frontend, nginx, nginx-error${NC}" ;;
        esac
        ;;
    nginx)
        case "$2" in
            reload) nginx_reload ;;
            status) ng_status=$(nginx_status); print_status "$ng_status" "Nginx" ;;
            *) echo -e "${RED}未知 Nginx 命令: $2${NC}" ;;
        esac
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $1${NC}"
        show_help
        exit 1
        ;;
esac
