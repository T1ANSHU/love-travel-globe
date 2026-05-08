# UI / Animation Polish Backlog

This file records deferred UI/animation requirements.
Do NOT implement anything here until the user explicitly starts the UI Polish phase.

---

## [BACKLOG-01] 首屏云雾开场动画 + 功能介绍页

### 触发时机
用户刚进入网站（访问根路径），尚未登录。

### 当前行为
直接显示登录页 (`/login`)。

### 目标行为

**Step 1 — 云雾开场动画**
- 粉色梦幻云雾覆盖整个页面
- 云雾有体积感（volumetric cloud 风格），缓慢流动、呼吸、漂浮
- 云雾逐渐被拨开/散开
- 页面内容从朦胧到清晰逐渐浮现

**Step 2 — 功能介绍页（云雾消散后）**
- 采用全屏上下滑动（vertical scroll snap）方式浏览
- 提示用户继续下滑，例如："向下滑动，开启我们的旅行回忆" / "Scroll down to explore"
- 有向下箭头 + bouncing 动画或滚动提示

**各屏功能介绍内容（顺序参考）：**
1. 3D 地球旅行地图
2. 去过的国家和城市被点亮
3. 城市和地标相册
4. 上传照片并记录年月日
5. 情侣旅行时间线
6. 背景音乐和交互音效
7. 自动播放旅行路线
8. 未来功能预告：爱心轨迹线 + 年度回顾

**Step 3 — 登录页（滑到最底部）**
- 登录页不突然出现，通过柔和动画（fade/blur/scale）逐渐浮现
- 登录页背景动画与前面介绍页背景保持一致

### 视觉风格要求
- 背景：粉色、梦幻、迷幻艳美、柔光、玻璃拟态、漂浮光斑、轻微 noise 纹理
- 鼠标移动时背景光晕跟随
- 每屏滑动时背景可轻微变化，但整体视觉统一
- 转场动画元素：fade、blur、scale、slide、floating elements、soft glow

### 实现约束
- 属于后期 UI / Animation Polish 阶段，不要在 Phase 4 及之前实现
- 实现时注意性能，首屏动画不能过重
- 不能影响登录、注册、Supabase Auth、3D 地球、照片上传等核心功能
- 路由结构需要在不破坏 `ProtectedRoute` 和现有 auth 流程的前提下插入此动画页

---

## [BACKLOG-03] 简约卡通地球模型重设计

> **优先级**: UI Polish 阶段核心需求之一。
> **状态**: 规划中，未开始实现。开始实现前需先完成风格讨论（见"实现前置条件"）。

### 问题描述

当前地球使用拟真卫星贴图，放大后视觉噪声大、国家轮廓模糊、与网站粉色梦幻风格割裂。

### 目标

将地球改为**简约卡通风格**：清晰、轻量、可读性强、与整体 UI 风格协调。

### 视觉设计要求

| 区域 | 目标效果 |
|---|---|
| 海洋 | 干净的分层蓝色，无高噪声纹理 |
| 陆地 | 块面化、卡通化，绿色 / 棕色 / 米色等自然色系，低噪声 |
| 国家边界 | 细而清晰的描边线 |
| 海岸线 | 比国家边界略粗 / 略明显 |
| 极地 / 雪山 | 适度保留浅色区域 |
| 整体明暗 | 轻微柔和层次感，但不追求拟真卫星图 |

### 功能兼容要求

- 城市点位、标签、hover 卡片、弧线、高亮效果须在新地球上保持协调
- 放大到城市级别，国家轮廓和海岸线依然清晰可辨，不出现"放大后反而更糊"
- 粉色梦幻整体 UI 风格兼容

### 性能要求

- 比当前方案更轻量：减少高噪声纹理，优先清晰可读而不是拟真
- 贴图文件尽量压缩（WebP / 适当分辨率），不影响首屏加载速度

### 实现前置条件（进入 UI Polish 阶段前先做）

在正式实现前，需要先完成以下讨论和准备：

1. **风格参考收集**：找几个适合 vibe-coding 前端设计风格的参考网站
2. **各功能区域讨论**：确认参考风格如何对应到以下各模块：
   - 登录 / 注册页
   - 地图主页（3D 地球 + 整体布局）
   - 云雾开场动画（BACKLOG-01）
   - 功能介绍页（BACKLOG-01）
   - 天书向导角色（BACKLOG-04）
   - Hover 动画、成就动画
   - 音频美化（背景音乐 + 音效）
3. **素材来源确认**：贴图素材版权（CC0 或自制）、3D 模型格式（GLTF + Draco 压缩）

### 实现约束

- 不能修改 Auth、Supabase client、RLS、Storage 配置、database schema
- 不能影响 Phase 1–6 已实现的功能（城市点位、弧线、hover、相册等）
- 属于 UI Polish 阶段，不在 Phase 6 及之前实现

---

## [BACKLOG-04] 天书向导角色系统 / Tianshu Guide Companion

> **优先级**: UI / Animation / Audio Polish 阶段大型功能模块。
> **状态**: 规划中，未开始实现。正式实现前需先完成角色视觉、动效、音效参考讨论。

### 功能概述

网站加入一个可爱的"天书"向导角色（小精灵 / 书本灵体 / 云朵书灵风格），让 Love Travel Globe 的互动体验更有陪伴感、更像浪漫旅行记忆游戏。

---

### 分阶段功能规划

#### Guide Step 1 — 静态天书角色 + 对话气泡
- 天书角色以 SVG / Lottie / Canvas sprite 形式存在于页面
- 带有一个简洁对话气泡（不遮挡主内容）
- 气泡文案风格：可爱、温柔、梦幻，符合 Love Travel Globe 氛围
  - 示例："欢迎来到你们的旅行地球。"
  - 示例："每一座城市，都会收藏一段回忆。"
  - 示例："向下滑动，我带你看看这里能做什么。"

#### Guide Step 2 — 介绍页跟随滑动飞行
- 与 BACKLOG-01（首屏云雾开场 + 上下滑动介绍页）联动
- 用户打开网站、云雾拨开后天书出现
- 随用户向下滑动介绍页，天书跟随页面节奏向下飞行

#### Guide Step 3 — 登录 / 注册页提示
- 进入登录页，天书飞到旁边提示登录
- 进入注册页，天书提示注册
- 注册页切换时加入"云朵聚拢 → 拨开消散"加载动画，与 BACKLOG-01 云雾风格统一

#### Guide Step 4 — 地图首次进入功能教程
- 用户第一次进入地球地图时，天书逐项飞到各功能旁进行简短介绍：
  - 地球拖拽 / 缩放
  - 添加国家 / 城市
  - 上传照片
  - 所有相册
  - 筛选 / Tag 筛选
  - 时间线
  - 路线回放
  - 音乐 / 音效控制
- 每项介绍简洁，不啰嗦，可配合手势 / 指向动作
- 教程结束后天书飞回左下角，此后常驻

#### Guide Step 5 — 城市 / 国家解锁祝贺
- 用户解锁城市或国家时，天书说贺词
  - 示例："新的城市被点亮啦！"
  - 示例："这段回忆已经被收藏进地球了。"
  - 示例："你们的旅行地图又多了一颗星星。"
- 与现有 Phase 5.5 Step 3 成就动画（`PlaceAchievement`）联动，但天书气泡独立于 toast 层

#### Guide Step 6 — 鼠标碰撞物理感
- 用户鼠标碰到天书时，天书像被轻碰的小球一样改变飞行轨迹
- 物理感：滑行、偏移、回弹（轻量，非游戏引擎级）
- `pointer-events` 处理：天书不能阻挡页面按钮的正常点击
- 教程结束后天书常驻左下角，此阶段关闭碰撞推走行为，避免干扰使用

#### Guide Step 7 — 粒子尾气
- 天书飞行时带有轻微粒子拖尾
- 鼠标碰到触发滑行时，粒子尾气更明显
- 风格：梦幻、轻盈、神圣，不要游戏爆炸感
- 粒子数量要轻（CSS/canvas 粒子，不用 Three.js particle system），不影响性能

#### Guide Step 8 — 说话音效 + unlock sound 联动
- 气泡文字出现时，播放轻柔说话音效
- 风格关键词：sacred, ethereal, soft, dreamy, muffled voice, magical whisper, gentle chime
- **与 unlock sound effect（城市解锁音效）一起延后，等 audioService / MusicPanel / 音效资源管理稳定后统一实现**

---

### 角色视觉方向（待定，不先实现）

- 整体：可爱、梦幻、温柔、轻盈
- 感觉方向：天书 / 小精灵 / 书本灵体 / 云朵书灵
- **不提前生成最终形象**；进入 UI Polish 前先收集角色参考、动效参考、粒子参考，统一讨论后设计

---

### 实现前置条件

1. 完成 BACKLOG-01（云雾开场 + 介绍页）的视觉参考讨论，因为天书要与其深度联动
2. 收集角色参考图（精灵 / 书灵 / 云朵灵等风格）
3. 确认角色实现方案：SVG 帧动画 / Lottie / CSS sprite / Canvas
4. 与 BACKLOG-03（卡通地球重设计）一起在同一次 UI Polish 会议中讨论整体视觉统一性

### 实现约束

- 不能修改 Auth、Supabase client、RLS、Storage 配置、database schema
- 不能影响 Phase 1–6 已实现的功能（GlobeScene 不允许因天书触发 re-render）
- 天书层级须在 globe（z-10）之上，但不能覆盖 Sidebar、AlbumModal 等核心操作区
- 属于 UI / Animation / Audio Polish 阶段，不在 Phase 6 及之前实现

---

## [BACKLOG-02] UI 素材准备计划

UI Polish 阶段开始前，需要先准备好以下素材目录和文件。
**现在只建目录结构规划，不写任何代码或样式。**

### 参考图目录
```
docs/ui-references/
  login/          登录页参考图
  register/       注册页参考图
  globe/          地图页（3D 地球 + 整体布局）参考图
  sidebar/        侧边栏参考图
  album/          相册弹窗参考图
  buttons/        按钮样式参考图
  city-markers/   城市 marker / label 参考图
```

### 视觉风格指南
- `docs/UI_STYLE_GUIDE.md`（待创建）
- 内容：整体视觉语言定义，包括：
  - 主色调：粉色系（pink-200 ～ rose-600）
  - 风格关键词：梦幻、迷幻艳美、柔光、玻璃拟态
  - 交互效果：鼠标移动时背景光晕跟随
  - 字体、圆角、阴影、blur 规范
  - 组件复用原则（GlassCard、Button、AuthorCredit 等已有组件的扩展方向）

### 静态资源目录
```
src/assets/
  ui/
    backgrounds/  背景 SVG / PNG / noise 纹理文件
    lottie/       Lottie 动画 JSON 文件
                  例：cloud-fog.json、sparkle.json、scroll-hint.json、upload-success.json
  audio/          背景音乐 + 音效文件（Phase 4 启用音乐时迁移到此）
  models/         后续 3D 模型文件（Three.js / GLTF）
```

### 实现约束
- UI Polish 阶段再创建实际文件，现在只规划目录
- Lottie 动画需评估包体积，避免首屏过重
- audio/ 目录中的文件需确认版权（CC0 或自制）
- models/ 目录中的 GLTF 文件需压缩（Draco），避免影响加载速度
