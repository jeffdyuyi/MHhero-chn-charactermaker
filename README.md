# 🦸 漫画英雄 TRPG 车卡器

基于 **2d6 核心机制** 的超级英雄角色创建系统，专为《ICONS》（中文名漫画英雄）TRPG规则设计。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)

## 📢 版权声明

本工具基于《ICONS》（中文名漫画英雄）TRPG规则设计，仅作为爱好者工具使用。

- **版权所有**：《ICONS Superpowered Roleplaying》规则由 Steve Kenson 设计，Green Ronin Publishing 出版
- **使用目的**：本工具仅用于非商业目的的个人使用和爱好者交流
- **免责声明**：本工具不代表《ICONS》官方产品，仅为粉丝自制工具
- **官方信息**：更多关于《ICONS》的信息，请访问 [Green Ronin Publishing 官方网站](https://greenronin.com/)

## ✨ 特性

- 🎲 **随机模式** - 掷骰决定角色属性，体验命运的安排
- 🎯 **购点模式** - 精确控制角色构建，打造完美英雄
- 💾 **本地存储** - 角色卡自动保存，随时编辑和查看
- 📤 **导入导出** - JSON格式导出，方便分享和备份
- 📱 **PWA支持** - 可安装为桌面应用，离线也能使用
- 🎨 **精美界面** - 超级英雄电影LOGO风格设计，沉浸式体验

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

## 📖 基本使用

1. **创建角色**：选择随机模式或购点模式
2. **按照步骤**：能力起源 → 基础属性 → 特殊能力 → 专长 → 角色描述
3. **管理角色**：查看、编辑、删除已保存的角色
4. **导入导出**：分享或备份角色数据

## 🎮 核心规则

- **掷骰**：2d6（两枚六面骰）
- **属性**：勇猛、协调、力量、智力、感知、意志
- **衍生属性**：耐力 = 力量 + 意志，决意 = 6 - 能力数量（最少1）
- **购点**：总点数45点，属性范围1-10

## 🛠️ 技术栈

- **前端**：原生 HTML5 + CSS3 + ES6+
- **样式**：CSS 变量 + Flexbox + Grid
- **存储**：LocalStorage
- **PWA**：Service Worker + Web App Manifest
- **模块化**：ES Modules

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## ⚠️ 使用条款

1. 本工具仅供个人非商业使用
2. 不得用于任何商业目的或盈利活动
3. 尊重《ICONS》规则的知识产权
4. 保留所有权利和声明

---

Made with ❤️ for comic book heroes everywhere!