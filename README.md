# 🦸 漫画英雄 TRPG 车卡器

基于 **2d6 核心机制** 的超级英雄角色创建系统。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)

## ✨ 特性

- 🎲 **随机模式** - 掷骰决定角色属性，体验命运的安排
- 🎯 **购点模式** - 精确控制角色构建，打造完美英雄
- 💾 **本地存储** - 角色卡自动保存，随时编辑和查看
- 📤 **导入导出** - JSON格式导出，方便分享和备份
- 📱 **PWA支持** - 可安装为桌面应用，离线也能使用
- 🎨 **精美界面** - 漫画风格设计，沉浸式体验

## 🚀 快速开始

### 在线使用

访问 [GitHub Pages](https://yourusername.github.io/comic-hero-creator/) 即可使用。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/comic-hero-creator.git

# 进入目录
cd comic-hero-creator

# 启动本地服务器（任选其一）
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# 然后访问 http://localhost:8000
```

## 📖 使用指南

### 创建角色

1. 点击首页的"创建角色"按钮
2. 选择创建模式：
   - **随机模式**：掷骰决定所有属性
   - **购点模式**：使用45点自由分配
3. 按照步骤完成角色创建：
   - 能力起源
   - 基础属性
   - 特殊能力
   - 专长
   - 角色描述
4. 保存角色

### 角色管理

- **查看**：点击已存角色列表中的"查看"按钮
- **编辑**：修改现有角色的属性和能力
- **删除**：移除不需要的角色
- **搜索**：按名称搜索角色
- **排序**：按创建时间、名称、能力数量等排序

### 导入导出

- **导出全部**：将所有角色导出为JSON文件
- **导入**：从JSON文件导入角色
- **单角色导出**：查看角色详情时导出单个角色

## 🎮 游戏规则

### 核心机制

- **掷骰**：2d6（两枚六面骰）
- **大失败**：掷出 2
- **失败**：掷出 3-4
- **普通**：掷出 5-9
- **成功**：掷出 10-11
- **大成功**：掷出 12

### 能力起源

| 起源 | 范围 | 描述 |
|------|------|------|
| 受训 | 2-4 | 精湛的训练或专门设备 |
| 改造 | 5-6 | 实验室事故或实验产物 |
| 天赋异禀 | 7 | 基因突变，天生超能力 |
| 花招诡计 | 8-9 | 神秘道具或古老遗物 |
| 人造生命 | 10 | 机器人、克隆体等 |
| 天外来客 | 11-12 | 外星人或异界生物 |

### 属性系统

**基础属性**（1-10级）：
- 勇猛（Brawn）- 近战攻击
- 协调（Coordination）- 敏捷和远程
- 力量（Strength）- 物理力量
- 智力（Intellect）- 知识和推理
- 感知（Awareness）- 观察和直觉
- 意志（Willpower）- 精神和决心

**衍生属性**：
- 耐力 = 力量 + 意志
- 决意 = 6 - 能力数量（最少1）

### 购点规则

- 总点数：45点
- 属性范围：1-10
- 能力等级：1-10
- 专长等级：1-3
- 限制：最多1项9级以上属性或能力

## 🛠️ 技术栈

- **前端**：原生 HTML5 + CSS3 + ES6+
- **样式**：CSS 变量 + Flexbox + Grid
- **存储**：LocalStorage
- **PWA**：Service Worker + Web App Manifest
- **模块化**：ES Modules

## 📁 项目结构

```
.
├── index.html              # 主页面
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker
├── README.md               # 项目说明
├── LICENSE                 # 许可证
├── css/                    # 样式文件
│   ├── variables.css       # CSS 变量
│   ├── base.css            # 基础样式
│   ├── components.css      # 组件样式
│   ├── layout.css          # 布局样式
│   ├── views.css           # 视图样式
│   ├── responsive.css      # 响应式
│   └── animations.css      # 动画
├── js/                     # JavaScript
│   ├── data/               # 数据模块
│   │   ├── index.js        # 数据入口
│   │   ├── origins.js      # 起源数据
│   │   ├── attributes.js   # 属性数据
│   │   ├── powers.js       # 能力数据
│   │   └── specialties.js  # 专长数据
│   ├── core/               # 核心模块
│   │   ├── index.js        # 工具函数
│   │   ├── dice.js         # 骰子模块
│   │   ├── character.js    # 角色模块
│   │   └── storage.js      # 存储模块
│   ├── ui/                 # UI模块
│   │   ├── toast.js        # 通知组件
│   │   └── modal.js        # 模态框组件
│   └── main.js             # 主应用入口
└── icons/                  # 图标资源
    └── ...
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- 漫画英雄 TRPG 规则设计团队
- 所有贡献者和测试者

---

Made with ❤️ for comic book heroes everywhere!