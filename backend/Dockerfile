FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖（用于 EasyOCR 和 PyMuPDF）
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 设置环境变量
ENV PYTHONPATH=/app
ENV DEBUG=false

# 暴露端口（Zeabur 使用 $PORT 环境变量）
EXPOSE 8001

# 启动命令（支持 Zeabur 的 PORT 环境变量）
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8001}"]
