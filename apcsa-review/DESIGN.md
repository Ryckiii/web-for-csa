# 📐 AP CSA 复习沙盘站 · 设计与实现记录

> 目标：模仿 samwho.dev 的 explorable explanation 风格，把 Unit 1 / Unit 2 课堂笔记做成
> 「可以进去玩」的复习网站。页面当前以 `unit1.html` / `unit2.html` 的实现为准；本文件记录布局、视觉规范与内容映射。
>
> 已确认决策：✅ 首页 + 两个独立单元页 · ✅ 中文讲解 + 英文术语/代码 ·
> ✅ 每节挑精华题做交互、其余以速查收束 · ✅ 单元页沿用原生 Web Components 与共享视觉 tokens

---

## 1. 站点结构

```
apcsa-review/
├── index.html          首页：两张单元卡片 + 小动画 hero + 学习路径
├── unit1.html          Unit 1 · Primitive Types（5 节 + 5 沙盘 + 8 精华题 + 速查）
├── unit2.html          Unit 2 · Using Objects（2.1–2.9 + 多个互动沙盘 + 18 精华题 + 速查）
├── assets/main.css     设计 token 层 + 排版 + 组件样式（全部页面的皮肤）
└── assets/js/*.js      原生 Web Components，按页按需加载，无外部依赖
```

- 纯静态、零构建。可本地双击/起个服务器看，可直接扔 GitHub Pages 给同学刷。
- 首页卡片各带一个循环小动画：Unit1 = 「会撒谎的计算器」（`2/3` 敲出 `0`）；Unit2 = 「传送带上 `new Human()` 不断掉饼干」。

---

## 2. 单页内部结构（samwho 式）

```
5 色循环装饰条（Okabe–Ito 色板）
POST-META —— small-caps：AP 占比 · 课时 · 考点 Skill 编号
居中大标题 + 一句话钩子
─────────────────────────────────
§ 每节统一三段式：
   ① 讲解正文（中文 + 英文术语加粗）
   ② 主沙盘（可玩）
   ③ ⚠️ 坑点卡（橙虚线边框，宽屏 >1300px 飘到页边 margin note）
   → 「本节 Quiz」精华题卡（即时判定）
……5 节循环……
Playground（文末开放全参数的沙盘）
▸ 全部答案速查表（<details> 折叠）
[前往 Unit 2 →] 卡片
─────────────────────────────────
页脚：订阅位留空（改为"和 classmates 一起复习"签名）
```

**语言规则**：正文中文；术语首次出现 `英文原词（中文释义）`，之后保持英文；
代码一律 Java 原文；报错信息保留英文原文（考试就长这样）。

---

## 3. 视觉系统（tokens，从 samwho 移植并做中文适配）

| 层 | 规则 |
|---|---|
| 版式 | `--max-width: 780px` 单栏；正文 16px / 1.75 行高（中文密度）；标题 `padding-top: 2rem` 节奏 |
| 字体 | 标题 = 系统衬线栈（Iowan Old Style → Palatino → **Songti SC/SimSun**）；正文 = 人文无衬线栈（Seravek → Gill Sans → **PingFang SC → Microsoft YaHei → Noto Sans SC**）；代码 = ui-monospace 栈。**零 web font** |
| 色彩 | Okabe–Ito 色盲安全 8 色分类板 → 语义别名 `--viz-orange/blue/green/yellow/darkblue/red/pink/grey`；UI 灰阶用 stone 系；**双主题** light/dark，暗色统一 `color-mix(black 20%)`；支持 `?theme=dark` 参数 |
| 动效 | 4 档时长 `120/160/220/300ms` + 3 条曲线（out / in-out / bounce）；滚动触发用 IntersectionObserver，不劫持滚动 |
| 质感 | 代码块 & 坑点卡 = `1px dashed` 虚线边 + `1rem` 大圆角（手绘练习本气质，贴「复习笔记」主题） |
| 代码 | 自写 20 行 Java tokenizer：关键字紫、字符串橙、注释灰、数字绿 |
| 无障碍 | skip-link、`prefers-reduced-motion` 时动画退化为瞬时切换、沙盘离屏自动暂停、选项按钮键盘可达 |

---

## 4. Unit 1 · Primitive Types —— 内容分布与交互设计

**post-meta**：AP 占比 2.5–5% · 8–10 课时 · Skills 1.B / 2.A / 2.B / 4.B
**开篇钩子**：嵌入式迷你终端循环播放 `System.out.println(2/3)` → 输出 `0` → ❓

### §1.1 第一个 Java 程序 | print vs println
讲解：程序骨架、`{}` 配对、分号规则、两种注释。
🎛 **沙盘 A `<viz-code-puzzle>` 代码拼图 + 虚拟控制台**
- 5 块打乱的代码块（还原课件拖拽活动），**点选按序放入凹槽**（移动端比拖拽稳）
- 拼对 → 解锁 Run → 右侧假终端逐行打字机输出 `Hi there!`
- 进阶：每行可切换 print/println，重跑立刻看到换行差异（直击 1-2-11 考点）
⚠️ 坑点卡：main 声明行不加分号；语句缺 `;` 不编译。

### §1.2 变量与数据类型
讲解：变量 = 内存位置的名字；primitive vs reference；声明 vs 初始化；camelCase。
🎛 **沙盘 B `<viz-type-game>` 类型点选游戏**
- 场景抽卡（GPA / 家庭人数 / 是否下雨 / 名字 / 钱数…，取自课件 1-3-2~1-3-6）→ 点选 `int / double / boolean / String` → 即时判定 + 连击计分
- 判对时右侧「内存抽屉」动画弹出：boolean ≥1 bit、int 32 bits、double 64 bits 的宽度标尺
- 附带「声明 vs 初始化」点哪行练习（1-3-8 / 1-3-9 变体）
⚠️ 坑点卡：`4 = score;` 方向反了；`int temperature = 70.5;` 类型不符。

### §1.3 表达式 · 整数除法 · %
讲解：`variable = expression;`、运算符、`=` vs `==`、优先级。
🎛 **沙盘 C `<viz-expression-lab>` 表达式沙盘（本页招牌）**
- 三段式积木 `〔数〕〔+ - * / %〕〔数〕`（可加一段变三元 `2+3*2`），步进/数值可调
- **求值顺序用颜色逐层高亮**：先算的部分亮起 bounce 一下再折叠成结果
- **int / double 切换开关**：int 模式下 `2/3` 的小数尾巴被截断、以向上飘散动画消失
- `%` 模式：`x < y` 时旁边弹出"原样掉出来"的批注（2%3=2）
⚠️ 坑点卡：整数除法只截断不四舍五入；口诀"至少一个操作数是 double"。

### §1.4 复合赋值运算符
讲解：`x += 1` ≡ `x = x + 1`；`x++ / x--`；对照表。
🎛 **沙盘 D `<viz-stepper>` 代码步进器（通用组件首秀）**
- 用课件 CompoundAssignment 原题：三联动面板 = 左代码行高亮 / 中内存盒（score、penalty）/ 下 console
- ◀ ▶ ⏮ 按钮 + 键盘方向键步进；变量变化瞬间盒子 bounce + 黄光脉冲
- 终点 console 输出 `0 1 2 0`——天然留下「为什么最后是 0？」的思考点（penalty/2 整数除法！）

### §1.5 Casting 与四舍五入
🎛 **沙盘 E `<viz-casting-duel>` Casting 对照台**
- 并排两条流水线，同步"逐步求值"：`5000/110`（先整除得 45 → 装箱 45.0）vs `(double)5000/110`（先变 5000.0 → 45.4545…），精度丢失用沙漏漏沙动效示意
- 下方「四舍五入工具」：滑块拖 number（可切负数），实时演示 `(int)(n+0.5)` / `(int)(n-0.5)` 变形链
- 彩蛋输入框：输整数 → `(char)` 出字符（65→A、11932→日、Unicode 转义→月）

### 🎮 Unit 1 Playground（文末）
表达式沙盘的自由模式：键盘输入任意 `a op b (op c)`，步进看求值顺序 + int/double 差异。

### 📝 精华 Quiz（交互 8 题，标准 `<quiz-card>`）
1-2-11（print 换行输出）· 1-3-5（钱→double）· 1-3-8（点选声明）· 1-3-9（点选初始化）·
1-4-10（158%10）· 1-4-11（3%8）· 1-5-3（复合赋值追踪）· 1-6-7（casting 求平均）
其余 11 题 → 文末折叠「全部答案速查表」。

---

## 5. Unit 2 · Using Objects —— 内容分布与交互设计

**post-meta**：AP 占比 5–7.5% · Skills 1.C / 2.C / 3.A / 5.A · 本页覆盖 2.1–2.9
**开篇钩子**：传送带动画——模具每 stamping 一次，饼干对象多一块：`new Human()`。

### §2.1 类是蓝图，对象是实例
讲解：class/object/attribute/behavior 四件套定义卡（课件配对题内置）。
🎛 **沙盘 A `<viz-instantiator>` 饼干模具**
- 左侧 Class 卡片：属性表单可填（name / age / eyeColor）
- 点大按钮 `new Human()` → 右侧桌面**哐当落下**一块对象卡（300ms bounce 入场），属性按表单烘焙
- 连点 N 次排一排——直观回答 2-1-4「一个类能造多少对象？要多少都行」
- 点某对象上的 `walk()` → console 打印 `{name} is walking`（每个对象调的是自己）
⚠️ 坑点卡：实例变量要写在所有方法**外面**（Calculator 反例）。

### §2.2 构造器 · 签名 · 栈与堆
讲解：构造器四条规则（同名/无返回类型/自动调用/可重载）、signature、formal vs actual parameter、call by value、this。
🎛 **沙盘 B `<viz-stack-heap>` 栈与堆 ⭐本页招牌**
- 左 Stack 右 Heap 双区；逐行执行：
  `Human a = new Human("Akash", 37, 5.5);` → 堆里 scale-in 长出对象（带属性清单），栈里出现引用格 `a`，**绿色箭头**拉过去
  `Human d = new Human("David", 17, 5.7);` → 第二个对象，各自一份实例变量
  `a = null;` → 箭头**断裂抽动**消失
  `a.displayInformation();` → **爆红 NullPointerException 面板**，完整复刻控制台
  `Exception in thread "main" java.lang.NullPointerException at Human.main(Human.java:24)`
🎛 **沙盘 C `<viz-signature-quiz>` 签名匹配判定**
- 给出 Cat / Movie 构造器签名列表 → 判定各 new 调用能否编译（含顺序错 `new Human(32,"Adam",75)`）
- 错的气泡里给**真实编译器报错文案**（incompatible types / cannot find symbol）

### §2.3 调用 void 方法
讲解：点运算；**方法调用打断顺序执行**——跳进去、return、回来下一行。
🎛 **沙盘 D `<viz-call-flow>` 执行流步进器**
- 三面板：代码区 / 调用栈（栈帧推入弹出动画）/ console
- 调 `rin.displayInformation()` 时高亮行"飞"进方法体，栈帧 +1；执行完飞回调用点下一行
- 结尾彩蛋：`rin = null;` 再调 → 复用沙盘 B 的 NPE 红面板（知识点循环出现）

### §2.4 带参 void 方法与重载
讲解：签名 = 方法名 + 参数**类型**列表；顺序与类型必须匹配；重载三例。
🎛 沙盘 C 复用（方法版）：`add(String,int,int)` / `add(int,int,int)` / `add(double,int)` 签名墙，
判定调用是否编译，报错用原文 `possible lossy conversion from double to int` 等。

### §2.5 non-void 方法 · static
讲解：返回值要变量接住；类内互调不需要对象；static = 类级，全类共享一份。
🎛 **沙盘 E `<viz-static-lab>` static 对照实验 ⭐本页招牌**
- 4 个对象卡排开，各自内存格 `x=0`；连点 4 次 `count()`：每个对象 x 各 0→1，console `1 1 1 1`
- 切到 `count_static()`：上方出现「Class 级共享」的 num 盒子（从 4 个对象里"抽离"飘到顶部），连点 4 次 → `1 2 3 4`
- 静态图 + 一句话点题：instance variable 每对象一份，static variable 全类一份

### §2.6 String Objects · Literals · Concatenation
讲解：String 是 reference type；字面量与 constructor；immutable；`+` / `+=` / `concat`；字符串拼接顺序与 escape sequences。
🎛 **沙盘 F `<u2-string-life>` String 生命周期**
- 逐行追踪 `s1 = "xy"; s2 = s1; s1 = s1 + s2 + "z";`，分别显示 reference 与 immutable heap object
- 切换 `concat` 返回值是被丢弃还是赋回；点选 `\"` / `\\` / `\n` 看源码与 console 输出

### §2.7 String Methods · 索引与返回值
讲解：`length`、`charAt`、两种 `substring`、`indexOf`、`equals`、`compareTo`、`toString`；`java.lang` 默认可用。
🎛 **沙盘 G `<u2-string-methods>` String 显微镜**
- 可编辑 String、逐字显示 0-based index；切换方法并调整参数，实时看到返回值或越界异常
- `equals` 以内容判断；`compareTo` 聚焦负 / 零 / 正；`substring(from,to)` 显示终点排除

### §2.8 Wrapper Classes · Boxing / Unboxing
讲解：`Integer` / `Double`；显式 boxing/unboxing 与 autoboxing/auto-unboxing 并列；32-bit `int` 边界。
🎛 **沙盘 H `<u2-wrapperlab>` 双转换轨道**
- 选择 `int ↔ Integer` 或 `double ↔ Double`，并排步进显式与自动路径
- 展示 `Integer.MIN_VALUE` / `MAX_VALUE`；点按边界运算观察 overflow 回绕，并配找错题

### §2.9 Using the Math Class
讲解：static class method 调用；`abs`、`pow`、`sqrt`、`random`、`min`、`max`。
🎛 **沙盘 I `<u2-mathlab>` Math 实验台**
- 参数可调地运行六类 Math 方法
- 设定 min/max 并 roll，逐次显示 `Math.random()` 与闭区间整数生成公式

### 🎮 Unit 2 Playground（文末）
签名综合判定场：constructor 与 method 调用混合练习，点选调用看 signature 匹配与编译结果（以当前 `unit2.html` 实现为准）。

### 📝 精华 Quiz（交互 19 题）
2-1-3（定义配对）· 2-1-4 · 2-2-14（Cat 构造器 I/II/III）· 2-2-15（Movie 构造）·
2-3-8（合法调用）· 2-3-9（Meow purr）· 2-4-6（square+divide 输出）·
2-5-4（square(2)+divide(6,2)）· 2-5-5（编译判定）· 2-13-5（liquid.freeze()）
2-6 String 不可变 / 拼接 · 2-7 charAt / substring · 2-8 显式与自动转换 / 溢出 / Find-and-Fix · 2-9 Math.min/max / random 范围。速查表逐题链接。

---

## 6. 共享组件清单（原生 Web Components）

| 组件 | 用途 | 核心交互 |
|---|---|---|
| `<quiz-card>` | 两单元全部精华题 | 点选 → ✓/✗ 即时反馈 → 展开解析；页顶汇总进度 x/N，错题标红待重刷 |
| `<viz-stepper>`（基类） | §1.4 / §2.3 / §2.5 | 预计算快照数组 + index 步进；行高亮/内存盒/console 三联动；键盘 ◀▶ |
| `<viz-console>` | 各处复用 | 行逐条 fade-slide 入场；NPE 红色变体 |
| `<viz-code>` | 所有代码块 | 20 行 Java tokenizer 轻量高亮 |
| `<u2-string-life>` | §2.6 String 引用 / immutable / escape | 引用与新对象步进、concat 返回值切换、转义输出 |
| `<u2-string-methods>` | §2.7 String API | 可编辑 String、索引带、方法参数与结果 / 异常 |
| `<u2-wrapperlab>` | §2.8 Integer / Double | 显式与自动 boxing/unboxing 双轨、int 边界实验 |
| `<u2-mathlab>` | §2.9 Math | 六类静态方法试算与 random 区间滚动 |
| 坑点卡 `<warn-note>` | 每节 | 橙虚线圆角卡；>1300px 飘页边 margin note |
| 速查 `<details>` | 文末 | 原生折叠，零 JS |

渲染策略：**全 SVG/DOM**（samwho V2 路线，不需要 Pixi/图表库）；
动画以 CSS transition 为主，步进器自动播放才用 requestAnimationFrame。

---

## 7. 交付顺序

| 批次 | 内容 | 你验收什么 |
|---|---|---|
| ① | 首页 + 全局皮肤 + 组件基座（quiz-card / stepper 雏形） | 风格像不像、动效顺不顺 |
| ② | unit1.html 全量（5 沙盘 + 8 题 + 速查 + Playground） | 内容准确性 + 沙盘手感 |
| ③ | unit2.html 全量 | 同上 |
| ④ | 打磨：dark mode、手机 60ch 断点、reduced-motion、错题标记持久化 | 整体验收 |

---

**请确认或批注**：设计里有没有要改的地方（比如某节讲解要不要更详细、沙盘优先级调整、
Quiz 选题更换、加/删小节）？确认后我按批次 ①→④ 开始创作。
