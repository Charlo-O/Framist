# Framist
> **Frame the content, get the Gist.** (定格画面，汲取真知。)

## 📖 软件简介 (Product Introduction)

**Framist** 是一款为现代终身学习者打造的“视频知识降噪”工具。

在这个视频信息爆炸的时代，Framist 拒绝让你在漫长的进度条中迷失。它利用先进的多模态 AI 技术，将冗长、难以检索的视频内容，瞬间重塑为一份排版精美、结构清晰的图文笔记。

不同于冰冷的字幕提取工具，Framist 注重**“阅读的愉悦感”**。我们采用独特的**纸张白（Off-white）**作为阅读底色，配合**薄荷绿（Mint）**的智能高亮，让原本噪杂的视频变成一本安静、优雅的书。

无论你是需要快速消化网课的学生，还是要从行业峰会中提取干货的职场人，Framist 都能帮你把“由眼入脑”的效率提升 10 倍。

## ✨ 核心功能亮点 (Key Features)

我们将功能分为三个维度：捕捉（Frame）、提炼（Gist）与 沉浸（Flow）。

### 1. 捕捉 (Frame) - 智能图文重组
这是 Framist 的核心魔法。
- **多平台视频支持**：支持 Bilibili、YouTube 等主流平台的视频下载与解析。
- **本地/云端双引擎**：集成 Whisper (本地) 与 DashScope (云端) 语音识别，精准还原内容。
- **智能关键帧**：AI 自动识别视频中的关键帧（PPT、板书），自动高清截图并插入文稿（*部分实现*）。

### 2. 提炼 (Gist) - 核心摘要与笔记
- **AI 智能笔记**：一键生成一分钟速览（TL;DR）、章节分段与核心观点提取。
- **思维导图生成**：将视频内容转化为可视化的思维导图（Mind Map），梳理知识脉络。
- **口语转书面语**：自动剔除废话口癖，将口语化演讲润色为通顺文章。

### 3. 沉浸 (Flow) - 沉浸式阅读
- **“纸张白”护眼模式**：模拟高级米色道林纸 (`#F7F7F5`) 背景与深灰文字，降低阅读疲劳。
- **薄荷绿流体高亮**：播放时文稿随进度滚动，重要金句高亮标记。
- **点击即播**：点击文稿中的任意文字或图片，视频画面立即跳转到对应时间点。

## 🎯 使用场景 (User Scenarios)

| 场景 | 痛点 | Framist 解法 |
|------|------|--------------|
| **考研/考证党** | 网课太长，不想二倍速重看 | 上传网课，生成带板书截图的详细讲义。只看文字，不懂处点击跳转回看。 |
| **产品经理/开发者** | 没时间看长英文发布会 | 粘贴链接，生成中文图文版技术文档，代码片段直接提取。 |
| **自媒体创作者** | 需要拆解爆款视频逻辑 | 导入视频，提取脚本结构和金句，快速把视频转化为文章草稿。 |

## 🎨 界面设计 (UI Concept)

**Framist，让视频静止下来，让知识流动起来。**

- **主色调**：Off-white (`#F7F7F5`) 背景，营造“书房”的静谧感。
- **强调色**：Mint Green (`#98FF98`) 用于按钮、高亮、加载进度条。
- **交互**：细腻的微交互，如鼠标滑过文本时的磁吸感反馈。

## 界面预览

<div align="center">
  <img src="doc/img/screenshot_01.png" width="100%" />
  <img src="doc/img/screenshot_02.png" width="100%" />
  <img src="doc/img/screenshot_03.png" width="100%" />
  <img src="doc/img/screenshot_04.png" width="100%" />
</div>

## �📋 目录

- [技术架构](#技术架构)
- [目录结构](#目录结构)
- [环境要求](#环境要求)
- [依赖安装](#依赖安装)
- [开发启动](#开发启动)
- [端口配置](#端口配置)
- [构建部署](#构建部署)
- [常见问题](#常见问题)

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Electron 主进程                           │
│                      (electron/main.cjs)                        │
│  - 创建 BrowserWindow                                            │
│  - 加载 Vite 开发服务器 / 生产构建文件                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Electron 渲染进程                           │
│                    (Vue 3 + TypeScript)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Home.vue  │  │ WatchVideo  │  │  Settings   │              │
│  │  (媒体库)   │  │  (播放器)   │  │   (设置)    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  Vite Dev Server: http://127.0.0.1:8080                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API (fetch)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Django 后端服务                              │
│                   (Python 3.11+ / Django 6.0)                   │
│                                                                  │
│  API 端口: http://0.0.0.0:9000                                   │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  视频管理   │  │  字幕生成   │  │  TTS 配音   │              │
│  │  /api/videos│  │ /api/tasks  │  │  /api/tts   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  转录引擎: Whisper.cpp / Alibaba DashScope / Remote VidGo       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SQLite 数据库                              │
│                      (backend/db.sqlite3)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 核心技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **桌面框架** | Electron | 36.x | 跨平台桌面应用 |
| **前端框架** | Vue 3 | 3.5+ | Composition API + TypeScript |
| **构建工具** | Vite | 5.4+ | 快速开发服务器和构建 |
| **CSS** | TailwindCSS | 4.x | 原子化 CSS 框架 |
| **UI 组件** | Element Plus | 2.x | Vue 3 组件库 |
| **后端框架** | Django | 6.0 | Python Web 框架 |
| **数据库** | SQLite | - | 嵌入式数据库 |
| **转录引擎** | Whisper / DashScope | - | 语音识别 |

---

## 📁 目录结构

```
vidgo32/
├── frontend/                    # 前端 Vue 3 + Electron 项目
│   ├── electron/                # Electron 相关文件
│   │   └── main.cjs             # Electron 主进程入口 (CommonJS)
│   ├── src/                     # Vue 源码
│   │   ├── components/          # Vue 组件
│   │   ├── composables/         # 组合式 API 函数
│   │   ├── views/               # 页面视图
│   │   └── assets/              # 静态资源
│   ├── .env                     # 环境变量配置
│   ├── package.json             # 前端依赖和脚本
│   ├── vite.config.ts           # Vite 配置
│   └── tailwind.config.js       # TailwindCSS 配置
│
├── backend/                     # Django 后端项目
│   ├── venv/                    # Python 虚拟环境
│   ├── vid_go/                  # Django 项目配置
│   │   ├── settings.py          # Django 设置
│   │   └── urls.py              # URL 路由
│   ├── video/                   # 视频管理应用
│   ├── utils/                   # 工具函数
│   │   └── wsr/                 # 语音识别引擎
│   │       ├── ali_wsr.py       # 阿里云 DashScope
│   │       └── transcription_engine.py
│   ├── media/                   # 媒体文件存储
│   │   ├── saved_video/         # 视频文件
│   │   ├── saved_audio/         # 音频文件
│   │   ├── saved_srt/           # 字幕文件
│   │   └── thumbnail/           # 缩略图
│   ├── requirements.txt         # Python 依赖
│   ├── manage.py                # Django 管理命令
│   └── db.sqlite3               # SQLite 数据库
│
├── docker-compose.yml           # Docker 配置
└── README.md                    # 本文档
```

---

## ⚙️ 环境要求

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| **Node.js** | 18.x+ | 前端运行环境 |
| **Python** | 3.11+ | 后端运行环境 |
| **FFmpeg** | 6.x+ | 音视频处理 |
| **Git** | 2.x+ | 版本控制 |

### 可选依赖

| 软件 | 说明 |
|------|------|
| **whisper.cpp** | 本地语音识别（如果不使用云端 API） |
| **CUDA** | GPU 加速（Windows/Linux） |

---

## 📦 依赖安装

### 1. 后端依赖安装

```powershell
# 进入后端目录
cd backend

# 创建虚拟环境（如果不存在）
python -m venv venv

# 激活虚拟环境 (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# 安装依赖
pip install -r requirements.txt
```

**requirements.txt 核心依赖：**
```
django>=6.0
django-cors-headers
yt-dlp
openai
dashscope          # 阿里云语音识别
ffmpeg-python
opencv-python-headless
Pillow
librosa>=0.10.0
soundfile>=0.12.0
gunicorn
```

### 2. 前端依赖安装

```powershell
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

**package.json 核心依赖：**
```json
{
  "dependencies": {
    "vue": "^3.5.13",
    "vue-router": "^4.5.0",
    "element-plus": "^2.9.8",
    "axios": "^1.9.0",
    "vue-i18n": "^11.1.3"
  },
  "devDependencies": {
    "electron": "^36.4.0",
    "vite": "^5.4.21",
    "@vitejs/plugin-vue": "^5.2.1",
    "tailwindcss": "^4.1.8"
  }
}
```

---

## 🚀 开发启动

### 启动顺序（重要！）

1. **先启动后端** → 2. **再启动前端/Electron**

### 1. 启动 Django 后端

```powershell
# 进入后端目录
cd backend

# 激活虚拟环境
.\venv\Scripts\Activate.ps1

# 启动开发服务器 (端口 9000)
python manage.py runserver 0.0.0.0:8000
```

看到以下输出表示启动成功：
```
Starting development server at http://0.0.0.0:9000/
Quit the server with CTRL-BREAK.
```

### 2. 启动前端 + Electron

```powershell
# 进入前端目录
cd frontend

# 开发模式启动 (Vite + Electron)
npm run electron:dev
```

**该命令做了什么：**
1. 启动 Vite 开发服务器 (`http://127.0.0.1:8080`)
2. 等待 Vite 服务器就绪
3. 启动 Electron，加载 Vite 服务器页面

### npm scripts 说明

```json
{
  "scripts": {
    "dev": "vite",                           // 仅启动 Vite
    "electron:dev": "npm run dev & electron .",  // Vite + Electron
    "build": "vite build",                   // 构建生产版本
    "electron:build": "vite build && electron-builder"  // 打包 Electron
  }
}
```

---

## 🔌 端口配置

### 默认端口

| 服务 | 端口 | 用途 |
|------|------|------|
| **Django 后端** | `9000` | API 服务、媒体文件访问 |
| **Vite 开发服务器** | `8080` | 前端热重载开发 |

### 修改端口

#### 1. 修改后端端口

```powershell
# 启动时指定端口
python manage.py runserver 0.0.0.0:YOUR_PORT
```

同时需要修改以下文件：

**`frontend/.env`**
```env
VITE_BACKEND_ORIGIN=YOUR_PORT
```

**`backend/vid_go/settings.py`**
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:YOUR_PORT",
]
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:YOUR_PORT",
]
```

#### 2. 修改前端端口

**`frontend/vite.config.ts`**
```typescript
export default defineConfig({
  server: {
    port: 8080,  // 修改此处
  }
})
```

### CORS 配置

后端已配置 CORS 支持前端跨域请求：

```python
# backend/vid_go/settings.py

INSTALLED_APPS = [
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:9000",
    "http://127.0.0.1:9000",
]

CORS_ALLOW_CREDENTIALS = True
```

---

## 📦 构建部署

### 生产构建

#### 1. 构建前端

```powershell
cd frontend
npm run build
```

输出目录：`frontend/dist/`

#### 2. 打包 Electron

```powershell
npm run electron:build
```

输出目录：`frontend/dist-electron/`

### Docker 部署

```powershell
# 仅 CPU
docker-compose -f docker-compose-cpu-only.yml up -d

# 带 GPU 支持
docker-compose up -d
```

---

## 🔧 Electron 配置详解

### electron/main.cjs

```javascript
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 开发模式：加载 Vite 开发服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://127.0.0.1:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // 生产模式：加载构建后的 HTML
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### package.json Electron 配置

```json
{
  "main": "electron/main.cjs",
  "build": {
    "appId": "com.vidgo.app",
    "productName": "VidGo",
    "directories": {
      "output": "dist-electron"
    },
    "files": [
      "dist/**/*",
      "electron/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "mac": {
      "target": "dmg",
      "icon": "public/icon.icns"
    }
  }
}
```

---

## 🐛 常见问题

### 1. 后端启动失败：端口被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :9000

# 结束进程
taskkill /PID <进程ID> /F
```

### 2. 前端无法连接后端

检查：
1. 后端是否已启动 (`http://localhost:9000`)
2. `frontend/.env` 中的 `VITE_BACKEND_ORIGIN` 是否正确
3. 浏览器控制台是否有 CORS 错误

### 3. 字幕生成失败：No module named 'dashscope'

```powershell
cd backend
.\venv\Scripts\pip.exe install dashscope
```

### 4. 缩略图不显示

确认缩略图路径配置正确，文件存储在 `backend/media/thumbnail/` 目录。

### 5. Electron 启动白屏

1. 确认 Vite 开发服务器已启动
2. 检查 `http://127.0.0.1:8080` 是否可访问
3. 查看 Electron 开发者工具控制台错误

---

## 📝 开发注意事项

### 热重载

- **前端**: Vite HMR 自动刷新
- **后端**: Django `runserver` 自动检测代码变化并重载

### 数据库迁移

```powershell
cd backend
.\venv\Scripts\python.exe manage.py makemigrations
.\venv\Scripts\python.exe manage.py migrate
```

### 日志查看

- **后端日志**: 终端控制台输出
- **前端日志**: 浏览器/Electron DevTools 控制台

---

## 📄 License

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！