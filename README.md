# 明日方舟主题前端课程设计

[在线演示](https://arknights-frontend-coursework.pages.dev/) · [发布说明](docs/cloudflare-deployment.md)

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

详细记录见 [基础优化](docs/stage-1.md)、[视觉优化](docs/stage-1-visual.md)和[部署说明](docs/cloudflare-deployment.md)。

## 发布更新

当前站点使用直接上传部署，GitHub 推送不会自动更新线上页面。完成 Cloudflare 登录后运行 `npm run deploy`。

## 素材说明

本项目为非官方课程设计，与鹰角网络无关联。明日方舟相关名称、图片、立绘与视频版权归原权利人所有，本仓库不授予这些素材的使用权。
