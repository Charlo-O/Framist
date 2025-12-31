# VidGo 项目概览

VidGo是一个专为NAS用户和小型团队设计的本地视频管理平台，提供完整的视频内容管理解决方案，包括视频下载、智能字幕生成、视频管理与组织、用户认证和权限管理等功能。

项目提供[示例网站](https://example.vidgo.cemp.top/)供用户测试使用。

部署和使用中的问题可参考[项目文档](https://doc.vidgo.cemp.top/)。

# 核心功能

**📥1. 流媒体视频下载**
- 支持Bilibili、YouTube、Apple Podcasts等主流平台的音视频下载  
- 🔗 提供外链解析和批量下载功能 

**🎬2. 智能字幕系统**
- 🎙️ 多引擎转录支持：Faster-Whisper本地处理、ElevenLabs、阿里巴巴DashScope、OpenAI Whisper提供的API服务
- ✂️ 基于 LLM 的智能分割与断句，字幕阅读更自然流畅
- ⚡ 支持批量运行任务，提升效率
- ✏️ 高级字幕编辑器，支持实时预览，自定义字幕样式
    - 🌊 支持音频波形展示&同步
    - 🌐 支持双语字幕/字幕嵌入视频导出

**📚3. 视频管理与组织**
- 📁 分类和合集管理系统 
- ⚙️ 批量操作支持（移动、删除、字幕生成、视频合并）
- 🖼️ 缩略图管理，支持自动生成和手动上传

**👥4. 用户认证和权限管理**
- 👤 主用户/普通用户分离
- 🔐 可单独为普通用户设置权限与分类展示

**▶️5. 视频播放体验**
- ▶️ 在线播放视频
- 📺 集成字幕显示面板
- 🎯 章节导航和时间轴跳转
- 🔄 双语字幕切换和自动滚动 

**🖥️6. Electron桌面模式**
- 📱 支持本地桌面应用模式
- 💻 跨平台支持（Windows、macOS、Linux）
- 📁 本地文件系统访问

# 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Vue 3 | ^3.4.0 |
| 构建工具 | Vite | ^5.0.0 |
| UI 组件 | Element Plus | ^2.4.0 |
| 后端框架 | Django | ^6.0 |
| 数据库 | SQLite | - |
| 视频处理 | FFmpeg | - |
| 语音识别 | Faster-Whisper, Alibaba DashScope, OpenAI Whisper | - |
| 桌面框架 | Electron | ^28.0.0 |
| 开发语言 | JavaScript, Python | ES6+, 3.10 |

# 快速开始

## 环境要求

- Node.js >= 16.0.0
- Python >= 3.10
- FFmpeg (用于视频转码和音频提取)

## 克隆项目

```bash
git clone https://github.com/JaceJu-frog/vidgo.git
cd vidgo
```

## 配置文件设置

```bash
# 复制配置文件模板并修改
cp ./backend/config/config.ini.example ./backend/config/config.ini
```

编辑 `backend/config/config.ini` 文件，配置API密钥和其他设置：

```ini
[DEFAULT]
selected_model_provider = deepseek
enable_thinking = true
deepseek_api_key = your_deepseek_api_key
alibaba_api_key = your_alibaba_api_key
# 其他配置...
```

# 部署指南

## 1. Node + Python 部署

### 前端部署

```bash
cd frontend
# 安装依赖
npm install
# 开发模式运行
npm run dev
# 或构建生产版本
npm run build
```

### 后端部署

```bash
cd ../backend
# 创建虚拟环境
python -m venv venv
# 激活虚拟环境
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt
pip install faster_whisper

# 运行数据库迁移
python manage.py migrate

# 启动后端服务
python manage.py runserver
```

### Electron 模式部署

```bash
# 在frontend目录下
npm run electron:dev  # 开发模式
# 或构建生产版本
npm run electron:build
```

## 2. Docker 快速部署

### 单容器部署

```bash
sudo docker pull jaceju68/vidgo:latest

sudo docker run -d --name vidgo \
  --restart unless-stopped \
  --gpus '"device=0"' \
  -e CUDA_VISIBLE_DEVICES=0 \
  -e WHISPER_DEVICE=cuda \
  -p 8030:8000 \
  -v "$(pwd)/data/videos.db:/app/database/videos.db" \
  -v "$(pwd)/data/media:/app/media" \
  -v "$(pwd)/data/config:/app/config" \
  -v "$(pwd)/data/models:/app/models" \
  jaceju68/vidgo:latest
```

### Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  vidgo:
    image: jaceju68/vidgo:latest
    restart: unless-stopped
    ports:
      - "8030:8000"
    volumes:
      - ./data/videos.db:/app/database/videos.db
      - ./data/media:/app/media
      - ./data/config:/app/config
      - ./data/models:/app/models
    environment:
      - CUDA_VISIBLE_DEVICES=0
      - WHISPER_DEVICE=cuda
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

```bash
docker-compose up -d
```

# 配置说明

## 前端配置

前端配置文件位于 `frontend/.env`，主要配置：

```env
# 后端API端口
VITE_BACKEND_ORIGIN=8000
# 其他配置...
```

## 后端配置

后端配置文件位于 `backend/config/config.ini`，主要配置：

### API 密钥配置

```ini
# DeepSeek API
deepseek_api_key = your_deepseek_api_key

# Alibaba DashScope API (用于字幕生成)
alibaba_api_key = your_alibaba_api_key

# OpenAI API
openai_api_key = your_openai_api_key

# 其他API配置...
```

### 字幕引擎配置

```ini
[Transcription Engine]
primary_engine = alibaba  # 可选：whisper_cpp, alibaba, openai_whisper, elevenlabs
alibaba_model = paraformer-realtime-v2
# 其他引擎配置...
```

# 使用教程

## 1. 添加视频

### 方式一：URL 解析

1. 点击"添加视频"按钮
2. 选择"URL 解析"
3. 输入视频链接（支持 Bilibili、YouTube 等）
4. 点击"解析"，等待解析完成
5. 选择要下载的视频质量和格式
6. 点击"下载"

### 方式二：本地文件上传

1. 点击"添加视频"按钮
2. 选择"本地文件上传"
3. 选择要上传的视频文件
4. 等待上传和处理完成

## 2. 生成字幕

1. 在视频列表中选择要生成字幕的视频
2. 点击"批量操作"按钮
3. 选择"生成字幕"
4. 选择源语言和目标语言（可选）
5. 点击"开始生成"
6. 在"任务管理"中查看字幕生成进度

## 3. 编辑字幕

1. 打开要编辑字幕的视频
2. 点击"字幕编辑"按钮
3. 在字幕编辑器中进行编辑：
   - 调整字幕时间轴
   - 修改字幕内容
   - 添加/删除字幕
   - 调整字幕样式
4. 点击"保存"按钮保存修改

## 4. 使用 Electron 模式

### 开发模式

```bash
cd frontend
npm run electron:dev
```

### 生产模式

```bash
cd frontend
npm run electron:build
# 在dist_electron目录下找到构建好的安装包
```

# 常见问题与解决方案

## 1. 阿里巴巴API只返回一行字幕

**问题描述**：使用阿里巴巴DashScope API生成字幕时，只返回一行内容。

**解决方案**：这是由于字幕优化阶段失败导致的。系统已修复此问题，通过跳过优化阶段，直接保存原始转录结果。

## 2. Electron模式下媒体无法加载

**问题描述**：在Electron本地模式下，视频和音频无法正常加载。

**解决方案**：
- 确保后端服务正在运行
- 检查`ConfigAPI.ts`中的`BACKEND` URL配置
- 确保视频文件路径正确

## 3. 空缩略图导致404错误

**问题描述**：部分视频没有缩略图，导致请求404错误。

**解决方案**：系统已修复此问题，为没有缩略图的视频提供默认图片。

## 4. 端口冲突

**问题描述**：后端服务无法启动，提示端口被占用。

**解决方案**：
- 修改后端运行端口：`python manage.py runserver 0.0.0.0:8001`
- 修改前端配置文件`frontend/.env`中的`VITE_BACKEND_ORIGIN`为新端口

## 5. 依赖安装失败

**问题描述**：安装Python依赖时失败。

**解决方案**：
- 确保Python版本>=3.10
- 尝试使用镜像源：`pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple`
- 单独安装失败的依赖

# 开发指南

## 项目结构

```
vidgo/
├── frontend/          # 前端代码
│   ├── src/          # 源代码
│   ├── electron/     # Electron相关代码
│   ├── public/       # 静态资源
│   └── package.json  # 前端依赖
├── backend/          # 后端代码
│   ├── vid_go/       # Django项目配置
│   ├── video/        # 视频相关应用
│   ├── config/       # 配置文件
│   └── requirements.txt  # 后端依赖
└── README.md         # 项目文档
```

## 开发流程

1. 克隆项目并配置环境
2. 启动前端开发服务器：`npm run dev`
3. 启动后端开发服务器：`python manage.py runserver`
4. 在浏览器中访问 `http://localhost:5173`
5. 开始开发

## 代码规范

### 前端

- 使用ESLint和Prettier进行代码检查和格式化
- 遵循Vue 3最佳实践
- 使用TypeScript进行类型检查

### 后端

- 遵循PEP 8代码规范
- 使用Django ORM进行数据库操作
- 添加适当的注释

# 未来规划

- [x] 修复阿里巴巴API字幕生成问题
- [x] 优化Electron模式下的媒体加载
- [ ] 增加模糊搜索功能
- [ ] 优化字幕编辑页面的音频展示
- [ ] 增加AI生成视频笔记、思维导图、章节功能
- [ ] 支持更多WSR模型
- [ ] 支持更多LLM模型
- [ ] 优化移动端适配
- [ ] 增加视频直播功能

# 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

## 提交规范

- 代码提交信息使用英文
- 提交信息格式：`type(scope): description`
- 类型：feat, fix, docs, style, refactor, test, chore

# 许可证

本项目采用 GNU General Public License v3.0 许可证。详见 [LICENSE](LICENSE) 文件。

# 联系方式

- 项目地址：https://github.com/JaceJu-frog/vidgo
- 问题反馈：https://github.com/JaceJu-frog/vidgo/issues
- 示例网站：https://example.vidgo.cemp.top/
- 项目文档：https://doc.vidgo.cemp.top/

# 更新日志

## v1.0.0 (2025-12-31)

### 新增功能

- ✨ Electron 桌面模式支持
- ✨ 多语言字幕生成
- ✨ 批量操作功能

### 修复问题

- 🐛 修复阿里巴巴API只返回一行字幕的问题
- 🐛 修复Electron模式下媒体加载问题
- 🐛 修复空缩略图导致的404错误
- 🐛 修复后端URL配置问题

### 优化改进

- 🚀 优化字幕生成速度
- 🚀 改进前端性能
- 📝 更新项目文档

## 旧版本日志

详见 [CHANGELOG.md](CHANGELOG.md) 文件。

---

感谢您使用 VidGo！如果您有任何问题或建议，欢迎提交 Issue 或 Pull Request。