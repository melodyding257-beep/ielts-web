# Zeabur 部署指南

本项目包含前端（Next.js）和后端（FastAPI）两个服务，需要在 Zeabur 上分别部署。

## 部署步骤

### 1️⃣ 推送代码到 GitHub

```bash
git add .
git commit -m "feat: 配置 Zeabur 部署"
git push origin main
```

### 2️⃣ 在 Zeabur 创建项目

1. 登录 [Zeabur](https://zeabur.com)
2. 点击 **New Project**
3. 连接你的 GitHub 仓库：`ielts-web`

### 3️⃣ 部署后端服务

1. 在项目中点击 **Add Service**
2. 选择 **Git Repository**
3. 选择 `ielts-web` 仓库
4. **关键步骤**：在 **Root Directory** 中输入 `backend`
5. Zeabur 会自动检测到 Python + Dockerfile
6. 点击 **Deploy**
7. 部署完成后，记录后端的 **域名**（如：`backend-xxx.zeabur.app`）

### 4️⃣ 部署前端服务

1. 在同一个项目中，再次点击 **Add Service**
2. 选择 **Git Repository**
3. 选择 `ielts-web` 仓库
4. **关键步骤**：在 **Root Directory** 中输入 `frontend`
5. Zeabur 会自动检测到 Next.js
6. **设置环境变量**：
   - 变量名：`NEXT_PUBLIC_API_URL`
   - 变量值：`https://backend-xxx.zeabur.app`（使用第3步记录的后端域名）
7. 点击 **Deploy**

### 5️⃣ 验证部署

- **后端**：访问 `https://backend-xxx.zeabur.app`，应该看到 `{"message": "IELTS Web API is running"}`
- **前端**：访问 `https://frontend-xxx.zeabur.app`，应该能正常访问网站

## 配置说明

### 根目录配置（zbpack.json）
指向前端服务，用于根目录部署时的默认行为。

### 前端配置（frontend/zbpack.json）
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "installCommand": "npm install"
}
```

### 后端配置（backend/zbpack.json）
```json
{
  "framework": "python",
  "dockerfile": "Dockerfile",
  "buildCommand": "pip install -r requirements.txt",
  "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT"
}
```

## 常见问题

### Q: Zeabur 显示"静态网站"
**A**: 确保在添加服务时正确设置了 **Root Directory**：
- 后端服务：`backend`
- 前端服务：`frontend`

### Q: 前端无法连接后端
**A**: 检查前端环境变量 `NEXT_PUBLIC_API_URL` 是否正确设置为后端域名。

### Q: 后端启动失败
**A**: 检查 Zeabur 日志，确保：
1. 所有依赖正确安装（requirements.txt）
2. 端口使用 `$PORT` 环境变量（Zeabur 会自动注入）

## 本地测试

使用 Docker Compose 测试完整部署：

```bash
docker-compose up --build
```

- 后端：http://localhost:8001
- 前端：http://localhost:3000
