FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建生产版本（Zeabur 会自动构建）
RUN npm run build

# 暴露端口（Zeabur 使用 $PORT 环境变量）
EXPOSE 3000

# 启动命令（支持 Zeabur 的 PORT 环境变量）
CMD ["sh", "-c", "npm start -- -p ${PORT:-3000}"]
