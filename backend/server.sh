#!/bin/bash

# --- 配置 ---
APP_NAME="fastapi_backend"
PORT=8000
LOG_FILE="../backend.log"
PID_FILE="backend.pid"
# --- --- ---

start() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            echo "⚠️  $APP_NAME 已经在运行 (PID: $PID)"
            return
        fi
        rm $PID_FILE
    fi

    echo "🚀 正在启动 $APP_NAME..."
    # 使用 uv 运行 uvicorn，并将进程 ID 存入文件
    export UV_PYTHON_PREFERENCE=only-system
    export UPLOAD_DIR="/var/www/uploads"
    
    # 从 .env 文件加载环境变量
    if [ -f /var/www/app/.env ]; then
        set -a
        source /var/www/app/.env
        set +a
        echo "✅ 已加载 /var/www/app/.env"
    fi
    
    # 确保日志文件存在
    touch $LOG_FILE
    
    export DATABASE_URL=sqlite:////var/www/data/sql_app.db
    nohup uv run uvicorn main:app --host 0.0.0.0 --port $PORT > $LOG_FILE 2>&1 &
    NEW_PID=$!
    echo $NEW_PID > $PID_FILE
    
    # 等待几秒并验证是否成功
    sleep 2
    if ps -p $NEW_PID > /dev/null; then
       echo "✅ 启动成功！(PID: $NEW_PID)"
       echo "日志保存至 $LOG_FILE"
    else
       echo "❌ 启动失败！请查看日志："
       tail -n 10 $LOG_FILE
    fi
}

stop() {
    echo "🛑 正在停止 $APP_NAME..."
    
    # 1. 尝试通过 PID 文件停止
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            kill $PID
            echo "已终止进程 PID: $PID"
        fi
        rm $PID_FILE
    fi

    # 2. 暴力清理所有相关进程 (防止残留)
    # 匹配命令行包含 uvicorn main:app 的进程
    pkill -f "uvicorn main:app"
    
    # 3. 再次检查端口占用
    PID_LSOF=$(lsof -t -i:$PORT)
    if [ ! -z "$PID_LSOF" ]; then
        echo "清理占用端口 $PORT 的残留进程 (PID: $PID_LSOF)..."
        kill -9 $PID_LSOF
    fi
    
    echo "✅ 已停止所有相关服务"
}

status() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            echo "🟢 $APP_NAME 正在运行 (PID: $PID)"
            return
        fi
    fi
    
    # 检查是否有其它相关进程在运行
    COUNT=$(pgrep -f "uvicorn main:app" | wc -l)
    if [ "$COUNT" -gt 0 ]; then
         echo "🟡 $APP_NAME 貌似正在运行 (未找到PID文件，但发现 $COUNT 个相关进程)"
    else
         echo "🔴 $APP_NAME 未运行"
    fi
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
esac
