# AP CSA 复习沙盘

模仿 [samwho.dev](https://samwho.dev) 的 explorable explanation 风格，把 AP Computer Science A 的 Unit 1–3 做成可交互复习页面：Unit 2 覆盖 2.1–2.9，Unit 3 覆盖 3.1–3.7。

## 本地预览

JS 使用 ES Modules，直接双击 `index.html`（`file://`）会被浏览器拦截，请启动静态服务器：

```bash
cd apcsa-review
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 分享给同学

纯静态、零依赖、零构建，整个文件夹可部署到任意静态托管：GitHub Pages / Cloudflare Pages / Netlify / Vercel 等。深色主题可用 URL 参数强制：`?theme=dark`。

## 结构

```
index.html          首页（Unit 1–3 卡片 + 试玩题）
unit1.html          Unit 1 · Primitive Types
unit2.html          Unit 2 · Using Objects
unit3.html          Unit 3 · Boolean Expressions and if Statements
assets/main.css     全局皮肤与设计 tokens
assets/sandbox.css  Unit 1–3 共用的沙盘样式
assets/js/
  components.js     共享组件：viz-code / viz-console / mem-box / quiz-card / makeControls
  home.js           首页互动与 Quiz 组件入口
  unit3.js          Unit 3 页面入口
  u1-*.js           Unit 1 各沙盘
  u2-*.js           Unit 2 各沙盘
  u3/*.js           Unit 3：Boolean、分支、逻辑、等价式、对象与 Playground
```

页面按课堂 Session 逐步建设，Quiz 以精选代表题为主，并非逐题复刻所有课件练习。Quiz 进度只保存在当前页面会话内，刷新即可重新作答。
