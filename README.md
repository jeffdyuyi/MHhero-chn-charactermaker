# 漫画英雄：英雄快速登场工具

基于 **2d6 核心机制** 的超级英雄角色创建系统，专为《ICONS》（中文名漫画英雄）TRPG规则设计。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)](https://web.dev/progressive-web-apps/)

## 📢 版权与免责声明

本工具基于《ICONS》（中文译名：漫画英雄）TRPG规则设计，属于**非盈利性质的粉丝自制工具**。

- **原作者 (Original Author)**：Steve Kenson
  - 英文原版官方网站：[ICONS Superpowered Roleplaying](https://stevekenson.com/icons/)
- **中文代理 (Chinese Localizer)**：乐博睿
  - 中文代理官方网站：[乐博睿 - 独立佳作](https://labyrinth-rpg.com/%E7%8B%AC%E7%AB%8B%E4%BD%B3%E4%BD%9C)
- **免责声明**：
  - 本工具仅作为方便玩家跑团的辅助工具，涉及的**所有游戏规则、专有名词、机制设定**的著作权均归原作者及中文代理方所有。
  - 本工具**严格禁止用于任何形式的商业用途**或盈利活动。
  - 若您喜欢本规则，请购买并支持官方正版出版物。

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