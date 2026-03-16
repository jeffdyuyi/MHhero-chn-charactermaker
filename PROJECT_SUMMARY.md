# 漫画英雄 TRPG 车卡器 - 项目总结

## 📋 项目概述

这是一个基于 **2d6 核心机制** 的超级英雄TRPG角色创建系统，采用纯前端架构，支持本地存储和PWA离线使用。

## 🏗️ 架构设计

### 模块化结构

```
js/
├── data/           # 数据层
│   ├── index.js    # 数据入口与配置
│   ├── origins.js  # 起源数据
│   ├── attributes.js # 属性数据
│   ├── powers.js   # 能力数据
│   └── specialties.js # 专长数据
├── core/           # 核心逻辑层
│   ├── index.js    # 工具函数与状态管理
│   ├── dice.js     # 骰子系统
│   ├── character.js # 角色生成器
│   └── storage.js  # 存储管理
├── ui/             # UI组件层
│   ├── toast.js    # 通知组件
│   └── modal.js    # 模态框组件
└── main.js         # 应用入口
```

### 技术特点

1. **ES Modules**: 使用原生模块化，代码组织清晰
2. **PWA支持**: Service Worker + Manifest，可离线使用
3. **响应式设计**: 适配桌面和移动设备
4. **无障碍支持**: ARIA标签和键盘导航
5. **纯前端**: 无需后端，数据存储在LocalStorage

## 📦 功能模块

### 1. 角色创建

- **随机模式**: 全程2d6掷骰决定所有属性
- **购点模式**: 45点自由分配，精细控制

### 2. 角色管理

- 创建、编辑、删除角色
- 搜索和排序功能
- 角色详情查看

### 3. 导入导出

- JSON格式导出/导入
- 支持批量操作
- 方便备份和分享

### 4. 帮助系统

- 完整的规则说明
- 属性等级表
- 创建流程指引

## 🎨 视觉设计

### CSS架构

```
css/
├── variables.css   # CSS变量（颜色、间距、字体等）
├── base.css        # 基础样式和重置
├── components.css  # UI组件样式
├── layout.css      # 布局结构
├── views.css       # 视图特定样式
├── responsive.css  # 响应式适配
└── animations.css  # 动画效果
```

### 设计特点

- 漫画风格配色方案
- 渐变和阴影效果
- 流畅的过渡动画
- 卡片式布局

## 🚀 部署配置

### GitHub Actions

- 自动部署到GitHub Pages
- 支持main/master分支触发
- 无需手动配置

### PWA配置

- Web App Manifest
- Service Worker缓存策略
- 多种尺寸图标支持

## 📁 文件清单

### 核心文件

| 文件 | 说明 |
|------|------|
| index.html | 主页面结构 |
| manifest.json | PWA配置 |
| sw.js | Service Worker |
| README.md | 项目文档 |
| LICENSE | MIT许可证 |

### 样式文件

| 文件 | 大小 | 说明 |
|------|------|------|
| variables.css | ~3KB | CSS变量定义 |
| base.css | ~4KB | 基础样式 |
| components.css | ~8KB | 组件样式 |
| layout.css | ~5KB | 布局样式 |
| views.css | ~12KB | 视图样式 |
| responsive.css | ~3KB | 响应式 |
| animations.css | ~2KB | 动画 |

### 脚本文件

| 文件 | 大小 | 说明 |
|------|------|------|
| main.js | ~15KB | 主应用 |
| core/dice.js | ~3KB | 骰子系统 |
| core/character.js | ~8KB | 角色生成 |
| core/storage.js | ~5KB | 存储管理 |
| data/*.js | ~20KB | 数据定义 |
| ui/*.js | ~4KB | UI组件 |

## 🔧 使用说明

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/yourusername/comic-hero-creator.git

# 进入目录
cd comic-hero-creator

# 启动本地服务器
python -m http.server 8000
# 或
npx serve .
```

### GitHub部署

1. 在GitHub创建仓库
2. 推送代码到main分支
3. 启用GitHub Pages
4. 访问部署地址

## 📝 待办事项

### 已完成 ✅

- [x] 模块化代码架构
- [x] 数据层分离
- [x] 核心逻辑优化
- [x] UI组件封装
- [x] PWA支持
- [x] GitHub部署配置
- [x] 响应式设计
- [x] 帮助文档

### 未来计划 📋

- [ ] 添加更多能力数据
- [ ] 实现打印功能
- [ ] 添加角色头像生成
- [ ] 支持多语言
- [ ] 添加数据同步功能
- [ ] 实现角色分享链接

## 🐛 已知问题

1. 旧文件(app.js, data.js, styles.css)删除失败（权限问题）
2. 需要添加PNG格式图标
3. 部分浏览器ES Modules支持需测试

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 漫画英雄TRPG规则设计团队
- 开源社区

---

**版本**: 2.0.0  
**最后更新**: 2026-03-16