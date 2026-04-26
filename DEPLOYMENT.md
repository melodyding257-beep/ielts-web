# 🚀 IELTS 阅读智能练习系统 - 部署指南

## 目录
1. [部署到 Zeabur（推荐）](#部署到-zeabur)
2. [部署到 GitHub Pages（仅前端）](#部署到-github-pages)
3. [本地 Docker 运行](#本地-docker-运行)
4. [环境变量配置](#环境变量配置)

---

## 部署到 Zeabur（推荐）

### 前置条件
- 注册 Zeabur 账号：https://zeabur.com
- 准备 GitHub/GitLab 仓库

### 步骤

#### 1. 创建后端服务

1. 登录 Zeabur 控制台
2. 点击「创建服务」→「从 GitHub/GitLab 导入」
3. 选择你的项目仓库
4. **配置构建**：
   - 构建目录：`backend`
   - 构建命令：无需设置（使用 Dockerfile）
   - 启动命令：无需设置（使用 Dockerfile）

5. **设置环境变量**（在「环境变量」选项卡）：
   ```
   PYTHONPATH=/app
   DEBUG=false
   ```

6. 等待部署完成，记录后端服务地址（如 `https://your-backend.zeabur.app`）

#### 2. 创建前端服务

1. 点击「创建服务」→「从 GitHub/GitLab 导入」
2. 选择同一项目仓库
3. **配置构建**：
   - 构建目录：`frontend`
   - 构建命令：`npm run build`
   - 启动命令：`npm start`

4. **设置环境变量**：
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.zeabur.app
   ```

5. 等待部署完成

#### 3. 配置域名（可选）

在 Zeabur 控制台为前端服务配置自定义域名。

---

## 部署到 GitHub Pages（仅前端）

> ⚠️ 注意：GitHub Pages 仅支持静态文件，后端需要部署到其他平台。

### 步骤

1. 在 `frontend/package.json` 中添加：
   ```json
   "scripts": {
     "deploy": "next build && next export && touch out/.nojekyll && gh-pages -d out"
   }
   ```

2. 安装依赖：
   ```bash
   npm install gh-pages --save-dev
   ```

3. 配置 `next.config.ts`：
   ```typescript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     basePath: '/your-repo-name',
   };
   ```

4. 部署：
   ```bash
   npm run deploy
   ```

---

## 本地 Docker 运行

### 启动服务

```bash
# 进入项目目录
cd ielts-web

# 启动所有服务
docker-compose up --build

# 或后台运行
docker-compose up -d --build
```

### 访问地址

- **前端**：http://localhost:3000
- **后端**：http://localhost:8001

### 停止服务

```bash
docker-compose down
```

---

## 环境变量配置

### 后端环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `8001` | 服务端口 |
| `DEBUG` | `false` | 调试模式 |
| `PYTHONPATH` | `/app` | Python 路径 |

### 前端环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8001` | 后端 API 地址 |

---

## 部署检查清单

✅ 后端服务启动：`GET /api/v1/health` 返回 `{"status": "ok"}`  
✅ 前端构建成功：`npm run build` 无错误  
✅ API 地址配置正确：`NEXT_PUBLIC_API_URL`  
✅ 文件上传功能正常：测试上传 PDF 文件  
✅ OCR 功能正常：测试上传图片文件

---

## 常见问题

### 1. Zeabur 部署失败

**问题**：构建超时或依赖安装失败  
**解决方案**：
- 检查网络连接
- 确认 `requirements.txt` 和 `package.json` 正确
- 增加构建超时时间

### 2. 前端无法连接后端

**问题**：跨域错误或连接超时  
**解决方案**：
- 确认 `NEXT_PUBLIC_API_URL` 配置正确
- 检查后端服务是否正常运行
- 确认后端配置了正确的 CORS

### 3. 文件上传失败

**问题**：文件无法上传或解析  
**解决方案**：
- 检查上传目录权限
- 确认后端服务有写入权限
- 检查文件大小限制

---

## 技术支持

如有问题，请联系开发者或查看项目文档。
