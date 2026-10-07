# Cloudflare Pages 发布与视频压缩

## 当前发布状态

- 正式地址：https://arknights-frontend-coursework.pages.dev/
- 项目：`arknights-frontend-coursework`，生产分支：`main`。
- 当前使用本地 Wrangler 直接上传，未连接 GitHub 自动部署。推送源码后需要运行 `npm run deploy` 更新线上页面。
- 首次发布：2026-10-07；压缩视频与整站资源已上传，首页、设定页、媒体页和视频返回 200，未知路径返回 404。

## 发布目录

```sh
npm ci
npm run build
```

`dist/` 包含独立静态网站，首页是完整的 `index.html`。仓库中的报告、测试截图、开发工具和依赖不进入发布目录。构建会检查每个资源是否小于 Cloudflare Pages 的 25 MiB 限制。

## GitHub 自动部署的备选方案

以下为另建 Git 集成项目时的配置参考，当前直接上传项目没有启用此方式。在 Cloudflare 的 Workers & Pages 中创建 **Pages** 项目，选择连接 GitHub：

| 设置 | 值 |
| --- | --- |
| 仓库 | `vell27w/arknights-frontend-coursework` |
| 生产分支 | `main` |
| 框架预设 | None |
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |
| 项目根目录 | 保持为空 |
| Node.js | 22 或更高 |

后续推送会自动部署。公开地址以 Cloudflare 实际分配的地址为准，不要在发布成功前填写虚构的在线链接。

也可用本地 Wrangler 发布：

```sh
npx wrangler login --scopes account:read user:read pages:write
npm run deploy
```

本地直接上传和 GitHub 自动部署是两种配置方式，初次创建项目时应选好维护方式。不要用部署命令创建一个同名的直接上传项目后，再期待它自动监听 GitHub。

## 视频处理结果

- 原文件：34,847,650 字节（约 34.85 MB）。
- 压缩文件：7,724,400 字节（约 7.72 MB），减少约 77.83%。
- 保留 1920 × 1080、24 fps、约 18.13 秒时长。
- 使用 H.264、CRF 25、slow 预设、兼容的 yuv420p 像素格式与 faststart。
- 原视频没有音轨，压缩不会添加音频。
- 全片 SSIM 为 0.990201。这是画面相似度指标，不代表文件无损。
- 首页使用 `video/hero-background.mp4`；原文件留在本地忽略的 `artifacts/stage2/video-original.mp4`，也可以从 `coursework-original` 标签恢复。

重新压缩：

```sh
npm run compress:video -- path/to/original.mp4
```

画质参数位于 `tools/compress-video.cjs`：CRF 越低画质越高，通常文件也越大。修改后重新构建并检查限制。

## 验证发布目录

```sh
python -m http.server 4174 --bind 127.0.0.1 --directory dist
```

打开 `http://127.0.0.1:4174/`。浏览器检查应覆盖首页、全部内部链接、图片、视频播放、响应式布局，以及未知地址的 404 页面。

测试脚本可通过 `TEST_BASE_URL=http://127.0.0.1:4174`、`TEST_SOURCE_PREFIX=/` 检查发布目录；未配置时默认检查原始开发地址。

HTML 和样式采用重新验证缓存，减少更新后仍看到旧界面的情况；图片与视频缓存一天。全站声明非官方课程设计，素材版权归原权利人。
