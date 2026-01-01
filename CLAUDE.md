# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**OuonnkiTV** 是一个现代化的视频聚合搜索与播放前端应用，基于 **React 19 + Vite 6 + TypeScript** 构建。该项目在 LibreSpark/LibreTV 基础上进行了全面重构，支持多源并发搜索、HLS 视频播放、配置导入导出等功能。

## 常用命令

### 开发
```bash
pnpm dev              # 启动开发服务器 (http://localhost:3000)
pnpm build            # 生产构建 (tsc + vite build)
pnpm lint             # ESLint 代码检查
pnpm preview          # 预览构建结果
```

### Docker 部署
```bash
pnpm docker:build     # 构建 Docker 镜像
pnpm docker:up        # 启动 Docker 容器 (端口 3000)
pnpm docker:down      # 停止 Docker 容器
pnpm docker:logs      # 查看 Docker 日志
```

### 环境变量配置 (构建时)
```bash
# 全局配置 (推荐)
VITE_INITIAL_CONFIG='{"settings":{...},"videoSources":[...]}'

# 独立配置
VITE_INITIAL_VIDEO_SOURCES='[{"name":"源1","url":"..."}]'
VITE_DISABLE_ANALYTICS=true
VITE_ACCESS_PASSWORD=your_password
```

## 核心架构

### 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | 前端框架 |
| TypeScript | 5.x | 类型系统 |
| Vite | 6 | 构建工具 |
| TailwindCSS | 4 | 样式框架 |
| HeroUI | - | UI 组件库 |
| Framer Motion | - | 动画库 |
| Zustand | - | 状态管理 |
| Artplayer | - | 视频播放器 |
| React Router | 7 | 路由管理 |

### 项目结构
```
src/
├── components/           # React 组件
│   ├── settings/        # 设置页面组件
│   ├── ui/              # 通用 UI 组件 (基于 HeroUI + Radix)
│   └── layouts/         # 布局组件
├── config/              # 配置文件
│   ├── api.config.ts    # API 配置与代理 URL
│   ├── settings.config.ts # 默认设置
│   └── initialConfig.ts # 初始配置解析
├── hooks/               # 自定义 Hooks
│   ├── useSearch.ts     # 搜索逻辑
│   ├── useSearchHistory.ts
│   └── usePersonalConfig.ts # 配置导入/导出
├── middleware/          # 中间件
│   └── proxy.dev.ts     # Vite 开发代理
├── pages/               # 页面组件
│   ├── SearchResult.tsx # 搜索结果页
│   ├── Detail.tsx       # 视频详情页
│   ├── Video.tsx        # 播放页
│   └── Settings.tsx     # 设置页
├── router/              # 路由配置
│   └── MyRouter.tsx
├── services/            # API 服务层
│   └── api.service.ts   # 统一 API 调用与并发控制
├── store/               # Zustand 状态管理
│   ├── apiStore.ts      # 视频源管理
│   ├── settingStore.ts  # 应用设置
│   ├── searchStore.ts   # 搜索状态与缓存
│   ├── viewingHistoryStore.ts
│   └── versionStore.ts  # 版本更新
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
│   └── proxy.ts         # 统一代理逻辑
└── main.tsx             # 应用入口
```

### 代理架构
项目采用**多环境代理架构**：

1. **本地开发** (`src/middleware/proxy.dev.ts`)
   - Vite 插件中间件，路径 `/proxy?url=...`
   - 无需额外服务器

2. **Vercel 部署** (`api/proxy.ts`)
   - Serverless Function，路径 `/api/proxy?url=...`
   - 自动处理 CORS

3. **Docker 部署** (`proxy-server.js` + `nginx.conf`)
   - Node.js Express 代理服务 (端口 3001)
   - Nginx 反向代理到前端和代理服务
   - 使用 Supervisor 管理进程

**统一代理逻辑** (`src/utils/proxy.ts`):
- `handleProxyRequest(targetUrl)` - 发起请求
- `getTargetUrl(url)` - 解析查询参数

## 核心功能实现

### 1. 搜索流程
```
用户输入 → useSearch.searchMovie() → searchStore.addSearchHistoryItem()
  ↓
searchStore.getCachedResults() → 检查缓存有效性
  ↓
apiService.aggregatedSearch() → 并发控制 (3个并发)
  ↓
searchStore.updateCachedResults() → 增量更新缓存
  ↓
渲染结果 (支持增量渲染)
```

**关键特性**:
- **并发控制**: 限制 3 个并发请求
- **去重**: `Set` 去除重复结果
- **缓存**: 24小时过期，支持视频源状态变更检测
- **增量渲染**: `onNewResults` 回调实时更新 UI
- **AbortController**: 支持搜索中断

### 2. 视频源管理
```typescript
interface VideoApi {
  id: string
  name: string
  url: string              // 搜索 API
  detailUrl?: string       // 详情 API (可选)
  timeout?: number         // 超时时间
  retry?: number           // 重试次数
  isEnabled: boolean
  updatedAt: Date
}
```

**初始化流程**:
1. 优先使用 `VITE_INITIAL_CONFIG` (完整配置)
2. 其次使用 `VITE_INITIAL_VIDEO_SOURCES` (视频源列表)
3. 支持 URL 导入 (自动 fetch 并解析)
4. 存储在 `apiStore` (Zustand + localStorage)

### 3. 配置管理
**导入/导出** (`usePersonalConfig.ts`):
- **导出**: 生成 JSON，包含 settings + videoSources
- **导入**: 支持文件/文本/URL 三种方式
- **恢复默认**: 重置为环境变量定义的初始状态

**环境变量优先级**:
```
VITE_INITIAL_CONFIG > VITE_INITIAL_VIDEO_SOURCES > 默认值
```

### 4. 播放器集成
- **Artplayer**: 多功能播放器
- **HLS.js**: HLS 流媒体支持
- **广告过滤**: 基于 URL 模式过滤
- **观看历史**: 自动记录播放进度

### 5. 状态持久化
所有 Zustand store 均使用 `persist` 中间件：

| Store | 存储键名 | 持久化内容 |
|-------|---------|-----------|
| apiStore | `ouonnki-tv-api-store` | 视频源列表、广告过滤状态 |
| settingStore | `ouonnki-tv-setting-store` | 所有设置项 |
| searchStore | `ouonnki-tv-search-store` | 搜索历史、结果缓存 |
| viewingHistoryStore | `ouonnki-tv-viewing-history-store` | 观看历史 |

## 开发指南

### 代码规范
```bash
pnpm lint              # ESLint 检查
# 提交规范:
# feat: 新功能
# fix: 修复 Bug
# docs: 文档更新
# refactor: 重构
# perf: 性能优化
```

### 类型定义
主要类型文件在 `src/types/`:
- `video.ts`: 视频相关类型 (VideoItem, VideoApi, VideoDetail)
- `history.ts`: 历史记录类型
- `settings.ts`: 设置类型

### UI 组件库
- **HeroUI**: 主要组件库 (基于 Tailwind)
- **Radix UI**: 原始组件 (Dialog, Dropdown, Switch 等)
- **Framer Motion**: 动画效果
- **Lucide React**: 图标

### 测试策略
当前项目未配置单元测试。建议：
- 使用 Vitest + React Testing Library
- 测试核心业务逻辑 (apiService, store)
- 测试组件交互 (搜索、导入、播放)

## 部署说明

### Vercel
- 自动识别配置，无需额外设置
- 构建命令: `pnpm build`
- 输出目录: `dist`
- Serverless Function: `api/proxy.ts`

### Cloudflare Pages
- Framework preset: `Vite`
- Build command: `pnpm run build`
- Build output directory: `dist`

### Docker
**环境变量在构建时注入**，修改后必须使用 `--build`:
```bash
docker-compose up -d --build
```

**预构建镜像** (无法自定义初始配置):
```bash
docker pull ghcr.io/ouonnki/ouonnkitv:latest
docker run -d -p 3000:80 ghcr.io/ouonnki/ouonnkitv:latest
```

## 常见开发任务

### 添加新的视频源
```typescript
// 方式1: 应用内添加
// 设置 → 视频源 → 添加源

// 方式2: 环境变量
VITE_INITIAL_VIDEO_SOURCES='[{"name":"新源","url":"https://api.example.com"}]'

// 方式3: 导入配置
// 设置 → 关于项目 → 导入配置
```

### 修改默认设置
1. 编辑 `src/config/settings.config.ts`
2. 或使用环境变量:
   ```bash
   VITE_DEFAULT_TIMEOUT=5000
   VITE_DEFAULT_RETRY=3
   ```

### 调试代理问题
```bash
# 本地开发
pnpm dev
# 访问: http://localhost:3000/proxy?url=YOUR_API_URL

# 查看网络请求
# 浏览器开发者工具 → Network → 查看 /proxy 请求
```

### 性能优化
- **代码分割**: Vite 自动拆分 vendor chunk
- **懒加载**: React.lazy 用于路由和模态框
- **缓存**: 搜索结果缓存 + 视频源状态快照
- **并发控制**: 限制 3 个并发 API 请求

## 重要文件说明

| 文件 | 说明 |
|------|------|
| `src/services/api.service.ts` | 核心 API 服务，含并发控制和聚合搜索 |
| `src/store/apiStore.ts` | 视频源状态管理，支持初始化和导入 |
| `src/store/searchStore.ts` | 搜索状态 + 缓存 + 历史记录 |
| `src/config/initialConfig.ts` | 环境变量解析逻辑 |
| `src/utils/proxy.ts` | 统一代理逻辑 (复用在所有环境) |
| `api/proxy.ts` | Vercel Serverless 代理 |
| `proxy-server.js` | Docker Node.js 代理服务 |
| `src/middleware/proxy.dev.ts` | Vite 开发环境代理 |

## 注意事项

1. **环境变量是构建时注入**: 修改 `VITE_*` 变量后必须重新构建
2. **代理 URL**: 所有环境统一使用 `/proxy?url=...` 格式
3. **视频源去重**: 基于 `id` 或 `(name + url)` 组合
4. **缓存失效**: 视频源变更会自动使相关缓存失效
5. **并发限制**: 默认 3 个并发请求，可在 `apiService.aggregatedSearch` 调整
6. **超时处理**: 默认 10 秒，支持重试机制
7. **CORS**: 所有代理都会添加 `Access-Control-Allow-Origin: *`
