# 明日方舟主题前端课程设计

[在线演示](https://arknights-frontend-coursework.pages.dev/)

基于 HTML、CSS 和原生 JavaScript 的非官方学习项目，参考明日方舟游戏官网制作，保留课程设计原始版本，并分阶段改进布局、交互、资源体积和部署方式。

## 已完成

- 首页背景视频、情报列表、四位干员切换、世界设定、媒体和更多内容页面。
- 响应式布局、统一导航与底部说明、键盘交互和移动端菜单。
- 大图转换为 WebP；背景视频由 34.85 MB 压缩至 7.72 MB，保留 1080p。
- Cloudflare Pages 在线部署、独立 404 页面和缓存配置。

登录页仅展示前端交互，没有账户服务或真实身份认证。部分内容与交互采用课程设计的简化实现。

## 本地运行

```sh
npm ci
npm run build
python -m http.server 4174 --directory dist
```

打开 http://localhost:4174/。修改网站源文件请使用 `demo2/`，`dist/` 是自动生成的发布目录。

## 阶段记录

| 标签 | 内容 |
| --- | --- |
| `coursework-original` | 原始课程设计 |
| `stage-1` | 第一阶段基础优化 |
| `stage-1-visual` | 官网风格与视觉调整 |
| `stage-2-ready` | 视频压缩与发布准备 |

阶段版本通过 Git 标签保留，可切换标签查看当时的源码；后续修改继续通过提交记录追踪。

## 发布更新

当前站点使用直接上传部署，GitHub 推送不会自动更新线上页面。完成 Cloudflare 登录后运行 `npm run deploy`。

```sh
npx wrangler login --scopes account:read user:read pages:write
npm run deploy
```

构建只发布 `dist/` 中的网站文件，并检查单个资源不超过 25 MiB。报告、依赖和测试截图不会上传到演示站点。

手机与桌面均尝试自动静音播放背景视频；浏览器限制播放、开启减少动态效果或省流量时保留封面。原视频没有音轨。需要重新压缩时运行 `npm run compress:video -- path/to/original.mp4`，原素材也可从 `coursework-original` 标签恢复。

## 验证

已通过 15 个页面在 320、390、768、1440 像素宽度下的 60 组页面检查，以及导航、干员切换、情报分类、世界设定和演示表单等交互检查。手机视频覆盖自动播放、播放被拒绝和减少动态效果三种场景；尚未在真实 iOS / Android 设备上验收。

在本地发布目录服务器运行时，使用以下环境变量指定测试地址：

```powershell
$env:TEST_BASE_URL = 'http://127.0.0.1:4174'
$env:TEST_SOURCE_PREFIX = '/'
npm test
node tools/check_mobile_video.cjs
```

检查默认使用本机 Microsoft Edge，截图保存在忽略的 `artifacts/` 目录。

## 素材说明

本项目为非官方课程设计，与鹰角网络无关联。明日方舟相关名称、图片、立绘与视频版权归原权利人所有，本仓库不授予这些素材的使用权。
