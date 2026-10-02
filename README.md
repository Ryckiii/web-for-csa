# AP CSA 复习沙盘

模仿 [samwho.dev](https://samwho.dev) 的 explorable explanation 风格，
把 AP Computer Science A 的 Unit 1 / Unit 2 做成可交互的复习页面。

## 本地预览

JS 用了 ES Modules，直接双击 `index.html`（file://）会被浏览器拦截，
请起个静态服务器：

```bash
cd apcsa-review
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 分享给同学

纯静态、零依赖、零构建，直接整个文件夹扔到任意静态托管即可：
GitHub Pages / Cloudflare Pages / Netlify / Vercel 都行。
深色主题可以用 URL 参数强制：`?theme=dark`。

## 结构

```
index.html          首页（两张单元卡片 + 试玩题）
unit1.html          Unit 1 · Primitive Types
unit2.html          Unit 2 · Using Objects
assets/main.css     全部页面的皮肤（design tokens 在文件顶部）
assets/js/
  components.js     共享组件：viz-code / viz-console / mem-box / quiz-card / makeControls
  home.js           首页打字机小剧场
  u1-*.js           Unit 1 各沙盘（待批次 ②）
  u2-*.js           Unit 2 各沙盘（待批次 ③）
```

约定：自定义元素渲染全部 SVG/DOM；代码注释用 `//` 单行（逐行高亮需要）；
Quiz 进度存在浏览器 localStorage，按页面路径隔离。
