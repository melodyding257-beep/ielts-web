# IELTS Reading Practice Platform

一个基于 Next.js 和 FastAPI 的雅思阅读练习平台，支持上传 PDF 和图片文件，自动解析并转换为机考模式供用户练习。

## 🚀 技术栈

### 前端
- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **状态管理**: React Hooks + localStorage

### 后端
- **框架**: FastAPI
- **语言**: Python 3.11
- **PDF 解析**: PyMuPDF (fitz)
- **OCR**: EasyOCR

## 📁 项目结构

```
ielts-web/
├── frontend/                 # Next.js 前端应用
│   ├── app/
│   │   ├── auth/            # 登录/注册页面
│   │   ├── dashboard/       # 主仪表盘页面
│   │   ├── practice/        # 阅读练习页面
│   │   ├── layout.tsx       # 全局布局
│   │   └── globals.css      # 全局样式
│   ├── public/              # 静态资源
│   ├── package.json
│   └── next.config.ts
│
├── backend/              # FastAPI 后端服务
│   ├── app/
│   │   ├── api/             # API 端点
│   │   ├── core/            # 配置文件
│   │   ├── main.py          # 应用入口
│   │   └── parser.py        # PDF/图片解析引擎
│   └── requirements.txt
│
├── docker-compose.yml       # Docker 部署配置
└── README.md
```

## 🔧 本地开发

### 启动后端服务

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

访问 `http://localhost:3000` 查看应用。

## 🚀 部署到 Zeabur

### 第一步：准备 GitHub 仓库

1. 创建新的 GitHub 仓库
2. 上传整个项目（包含 frontend 和 backend）

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/ielts-web.git
git push -u origin main
```

### 第二步：配置 Zeabur

1. 登录 [Zeabur](https://zeabur.com/)
2. 创建新项目，选择你的 GitHub 仓库
3. Zeabur 会自动检测项目类型并配置构建

### 第三步：配置环境变量

在 Zeabur 项目设置中添加以下环境变量：

```bash
# 后端环境变量
DEBUG=false
PYTHONPATH=/app

# 前端环境变量（如果需要动态配置 API 地址）
NEXT_PUBLIC_API_URL=https://your-backend-service.zeabur.app
```

### 第四步：配置服务顺序

确保后端服务先于前端服务启动：

1. 在 Zeabur 项目页面，进入服务配置
2. 设置后端服务（backend）为"启动依赖"
3. 确保前端服务（frontend）依赖于后端服务

### 第五步：测试部署

部署完成后，访问 Zeabur 分配的域名测试功能：

- 首页：`https://your-app.zeabur.app`
- API 健康检查：`https://your-backend.zeabur.app/health`

## 📡 API 接口

### 文件上传

**POST** `/api/v1/upload/upload`

上传 PDF 或图片文件进行解析。

#### 请求示例

```bash
curl -X POST "http://localhost:8000/api/v1/upload/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@example.pdf"
```

#### 响应示例

```json
{
  "source": "/path/to/example.pdf",
  "stem": "example",
  "total_pages": 10,
  "has_scan": false,
  "pages": [
    {
      "page_num": 1,
      "role": "content",
      "page_type": "text",
      "text": "文章内容...",
      "screenshot_path": null,
      "answers": []
    }
  ]
}
```

### 批量图片上传

**POST** `/api/v1/upload/multiple`

批量上传图片文件进行解析。

#### 请求示例

```bash
curl -X POST "http://localhost:8000/api/v1/upload/multiple" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

### 健康检查

**GET** `/api/v1/health`

检查服务状态。

#### 响应示例

```json
{
  "status": "ok"
}
```

## 🎯 功能特性

- ✅ 用户登录/注册系统
- ✅ 文件上传（PDF/图片）
- ✅ PDF 解析与 OCR 识别
- ✅ 机考模式练习界面
- ✅ 划词高亮与笔记功能
- ✅ 答题计时与答案解析
- ✅ 练习记录统计

## 📝 开发说明

### 添加新功能

1. 在 `frontend/app/` 中添加新页面
2. 在 `backend/app/api/` 中添加新的 API 端点
3. 更新 `docker-compose.yml` 配置（如需要）

### 更新依赖

**前端**:
```bash
cd frontend
npm update
```

**后端**:
```bash
cd backend
pip install --upgrade -r requirements.txt
```

## 📄 License

MIT License
