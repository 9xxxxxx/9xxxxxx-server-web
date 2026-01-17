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
    nohup ~/.local/bin/uv run uvicorn main:app --port $PORT --host 0.0.0.0 > $LOG_FILE 2>&1 &
    echo $! > $PID_FILE
    echo "✅ 启动成功！日志保存至 $LOG_FILE"
}

stop() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        echo "🛑 正在停止 $APP_NAME (PID: $PID)..."
        kill $PID
        rm $PID_FILE
        echo "✅ 已停止"
    else
        echo "❓ 未发现运行中的 $APP_NAME"
        # 兼容性清理：如果没 PID 文件但端口占用了
        PID=$(lsof -t -i:$PORT)
        if [ ! -z "$PID" ]; then
            echo "发现端口 $PORT 被占用，正在清理..."
            kill $PID
        fi
    fi
}

status() {
    if [ -f $PID_FILE ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            echo "🟢 $APP_NAME 正在运行 (PID: $PID)"
            return
        fi
    fi
    echo "🔴 $APP_NAME 未运行"
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
