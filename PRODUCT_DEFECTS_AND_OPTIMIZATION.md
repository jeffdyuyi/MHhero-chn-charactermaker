# 漫画英雄 TRPG 车卡器 - 产品缺点分析与优化方案

> 审视视角：苛刻程序员 × 产品经理 × TRPG玩家
> 文档版本：v1.0
> 生成日期：2026-04-02

---

## 一、技术架构层面（程序员视角）

### 1.1 状态管理混乱

**问题描述**：
- 角色数据分散在 `CharacterGenerator` 类和 `creation-flow.js` 中，没有统一的状态管理
- 数据变更通过直接修改对象属性实现，缺乏不可变性保障
- 多处存在 `JSON.parse(JSON.stringify(char))` 这种低效的深拷贝

**技术影响**：
- 数据不一致风险高
- 难以实现撤销/重做功能
- 调试困难，无法追踪数据变更来源

**优化方案**：
```javascript
// 实现基于 Proxy 的响应式状态管理
class CharacterStore {
  constructor() {
    this.state = createEmptyCharacter();
    this.listeners = new Set();
    this.history = [];
    this.historyIndex = -1;
    
    // 使用 Proxy 实现响应式
    this.reactiveState = new Proxy(this.state, {
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = value;
        if (oldValue !== value) {
          this.notify(prop, value, oldValue);
        }
        return true;
      }
    });
  }
  
  // 支持撤销/重做
  commit() {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(JSON.stringify(this.state));
    this.historyIndex++;
    // 限制历史记录数量
    if (this.history.length > 50) {
      this.history.shift();
      this.historyIndex--;
    }
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(this.history[this.historyIndex]);
      this.notify('state', this.state);
    }
  }
}
```

---

### 1.2 DOM 操作效率低下

**问题描述**：
- `renderFullSheet()` 每次重新渲染整个角色卡，使用 `innerHTML` 完全替换
- 事件监听器通过内联 `onclick` 属性绑定，违反 CSP 最佳实践
- 没有虚拟 DOM 或增量更新机制

**技术影响**：
- 频繁操作导致页面闪烁
- 输入框焦点丢失问题
- 性能随角色复杂度下降

**优化方案**：
```javascript
// 实现简单的 Diff 算法进行增量更新
class DOMRenderer {
  constructor(container) {
    this.container = container;
    this.virtualTree = null;
  }
  
  render(newVNode) {
    if (!this.virtualTree) {
      // 首次渲染
      this.container.innerHTML = this.createHTML(newVNode);
    } else {
      // 增量更新
      this.patch(this.container, this.virtualTree, newVNode);
    }
    this.virtualTree = newVNode;
  }
  
  patch(parent, oldVNode, newVNode, index = 0) {
    if (!oldVNode) {
      parent.appendChild(this.createElement(newVNode));
    } else if (!newVNode) {
      parent.removeChild(parent.childNodes[index]);
    } else if (this.changed(oldVNode, newVNode)) {
      parent.replaceChild(
        this.createElement(newVNode),
        parent.childNodes[index]
      );
    } else if (newVNode.children) {
      const length = Math.max(
        oldVNode.children?.length || 0,
        newVNode.children.length
      );
      for (let i = 0; i < length; i++) {
        this.patch(
          parent.childNodes[index],
          oldVNode.children?.[i],
          newVNode.children[i],
          i
        );
      }
    }
  }
  
  // 事件委托替代内联 onclick
  bindEvents() {
    this.container.addEventListener('click', (e) => {
      const handler = e.target.dataset.action;
      if (handler && this.actionHandlers[handler]) {
        this.actionHandlers[handler](e);
      }
    });
  }
}
```

---

### 1.3 缺乏类型安全

**问题描述**：
- 纯 JavaScript 项目，没有 TypeScript 或 JSDoc 类型注解
- 角色对象结构变化时无编译期检查
- API 接口参数类型不明确

**技术影响**：
- 运行时错误风险高
- 重构困难
- 新成员上手成本高

**优化方案**：
```javascript
// 添加 JSDoc 类型定义
/**
 * @typedef {Object} Character
 * @property {string} id - 唯一标识
 * @property {string} name - 英雄名称
 * @property {Origin} origin - 能力起源
 * @property {Attributes} attributes - 基础属性
 * @property {Power[]} powers - 特殊能力列表
 * @property {Specialty[]} specialties - 专长列表
 * @property {number} stamina - 耐力
 * @property {number} resolve - 决意
 * @property {'random'|'point-buy'} mode - 创建模式
 */

/**
 * @typedef {Object} Power
 * @property {string} id - 能力ID
 * @property {string} name - 能力名称
 * @property {number} level - 能力等级 1-10
 * @property {string[]} extras - 附加效果
 * @property {string[]} flaws - 限制条件
 */

// 使用 TypeScript 进行渐进式迁移
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["js/**/*"]
}
```

---

### 1.4 存储层缺乏抽象

**问题描述**：
- LocalStorage 直接暴露在业务逻辑中
- 没有数据迁移机制
- 存储键名硬编码，容易冲突

**技术影响**：
- 难以切换存储方案（如 IndexedDB）
- 数据结构升级时无法平滑迁移
- 存储空间管理困难

**优化方案**：
```javascript
// 实现存储抽象层
class StorageAdapter {
  async get(key) { throw new Error('Not implemented'); }
  async set(key, value) { throw new Error('Not implemented'); }
  async remove(key) { throw new Error('Not implemented'); }
  async clear() { throw new Error('Not implemented'); }
}

class LocalStorageAdapter extends StorageAdapter {
  constructor(prefix = 'comicHero_') {
    super();
    this.prefix = prefix;
  }
  
  async get(key) {
    const data = localStorage.getItem(this.prefix + key);
    return data ? JSON.parse(data) : null;
  }
  
  async set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }
  
  // 添加存储配额检查
  async checkQuota() {
    const usage = new Blob(Object.values(localStorage)).size;
    const quota = 5 * 1024 * 1024; // 5MB
    return { usage, quota, remaining: quota - usage };
  }
}

class IndexedDBAdapter extends StorageAdapter {
  constructor(dbName = 'ComicHeroDB', version = 1) {
    super();
    this.dbName = dbName;
    this.version = version;
  }
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('characters')) {
          const store = db.createObjectStore('characters', { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }
  
  async get(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['characters'], 'readonly');
      const store = transaction.objectStore('characters');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

// 数据迁移管理器
class MigrationManager {
  constructor(storage) {
    this.storage = storage;
    this.migrations = [];
  }
  
  register(version, migrationFn) {
    this.migrations.push({ version, migrate: migrationFn });
  }
  
  async migrate() {
    const currentVersion = await this.storage.get('__version') || 0;
    for (const { version, migrate } of this.migrations) {
      if (version > currentVersion) {
        await migrate(this.storage);
        await this.storage.set('__version', version);
      }
    }
  }
}
```

---

### 1.5 错误处理不完善

**问题描述**：
- 多处使用 `try-catch` 但仅做 console.error 输出
- 用户无法感知操作失败
- 没有错误上报机制

**技术影响**：
- 用户体验差，操作无反馈
- 无法收集生产环境问题
- 难以排查用户遇到的问题

**优化方案**：
```javascript
// 统一错误处理系统
class ErrorHandler {
  constructor() {
    this.errorCallbacks = [];
    this.setupGlobalHandler();
  }
  
  setupGlobalHandler() {
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'runtime',
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'promise',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  handleError(error) {
    // 分级处理
    const level = this.classifyError(error);
    
    switch (level) {
      case 'critical':
        this.showErrorModal(error);
        this.reportToServer(error);
        break;
      case 'warning':
        this.showToast(error.message, 'warning');
        console.warn(error);
        break;
      case 'info':
        console.info(error);
        break;
    }
    
    // 执行注册的回调
    this.errorCallbacks.forEach(cb => cb(error));
  }
  
  classifyError(error) {
    if (error.message?.includes('storage') || error.message?.includes('quota')) {
      return 'critical';
    }
    if (error.type === 'validation') {
      return 'info';
    }
    return 'warning';
  }
  
  // 错误边界组件
  wrapComponent(componentFn) {
    return async (...args) => {
      try {
        return await componentFn(...args);
      } catch (error) {
        this.handleError({
          type: 'component',
          message: error.message,
          stack: error.stack,
          component: componentFn.name
        });
        return null;
      }
    };
  }
}

// 使用示例
const errorHandler = new ErrorHandler();

export const saveCharacter = errorHandler.wrapComponent(async (character) => {
  // 原有的保存逻辑
});
```

---

### 1.6 测试覆盖率为零

**问题描述**：
- 项目没有任何测试文件
- 核心计算逻辑（如决意计算）缺乏单元测试
- 数据验证逻辑无测试保障

**技术影响**：
- 重构风险极高
- 规则实现错误难以发现
- 回归缺陷频繁

**优化方案**：
```javascript
// 使用 Vitest 建立测试体系
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    }
  }
});

// __tests__/character.test.js
import { describe, it, expect } from 'vitest';
import { calculateDerivedStats } from '../js/data/index.js';

describe('决意计算', () => {
  it('基础决意应为 6 - 有效能力数量', () => {
    const character = {
      attributes: { strength: 5, willpower: 5 },
      powers: [
        { name: '飞行', level: 5 },
        { name: '能量控制', level: 6 }
      ]
    };
    const stats = calculateDerivedStats(character);
    expect(stats.resolve).toBe(4); // 6 - 2 = 4
  });
  
  it('能力提升不计入决意计算', () => {
    const character = {
      attributes: { strength: 5, willpower: 5 },
      powers: [
        { name: '能力提升', level: 6 },
        { name: '飞行', level: 5 }
      ]
    };
    const stats = calculateDerivedStats(character);
    expect(stats.resolve).toBe(5); // 6 - 1 = 5
  });
  
  it('概率控制应增加决意', () => {
    const character = {
      attributes: { strength: 5, willpower: 5 },
      powers: [
        { name: '概率控制', level: 4 }
      ]
    };
    const stats = calculateDerivedStats(character);
    expect(stats.resolve).toBe(9); // (6 - 1) + 4 = 9
  });
  
  it('决意最低为 1', () => {
    const character = {
      attributes: { strength: 5, willpower: 5 },
      powers: Array(10).fill({ name: '测试能力', level: 5 })
    };
    const stats = calculateDerivedStats(character);
    expect(stats.resolve).toBe(1);
  });
});

// E2E 测试
// __tests__/e2e/creation-flow.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('角色创建流程', () => {
  let dom;
  
  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true
    });
    global.window = dom.window;
    global.document = dom.window.document;
  });
  
  it('应能完成完整的随机角色创建', async () => {
    // 测试完整流程
  });
});
```

---

## 二、产品体验层面（产品经理视角）

### 2.1 新手引导缺失

**问题描述**：
- 首次进入应用无任何引导
- 没有规则解释，TRPG 新手无法上手
- 用户不清楚各步骤的具体操作方法

**用户影响**：
- 新用户流失率高
- 需要外部查阅规则书
- 操作流程不清晰

**优化方案**：
```javascript
// 实现引导系统
class OnboardingSystem {
  constructor() {
    this.steps = [
      {
        target: '.section-identity',
        title: '英雄基本信息',
        content: '填写英雄名称和特质，这些将构成角色的核心身份',
        position: 'bottom'
      },
      {
        target: '.section-origin',
        title: '能力起源',
        content: '起源决定了你的英雄如何获得能力，不同起源有不同的属性加成和特殊规则',
        position: 'right'
      },
      {
        target: '.section-attributes',
        title: '基础属性',
        content: '勇猛、协调、力量、智力、感知、意志<br>范围1-10，通过掷骰决定',
        position: 'right'
      },
      {
        target: '.section-powers',
        title: '超凡能力',
        content: '选择适合你英雄的特殊能力，这些将决定角色的核心战斗力',
        position: 'right'
      }
    ];
    this.currentStep = 0;
  }
  
  start() {
    if (localStorage.getItem('onboardingCompleted')) return;
    this.showStep(0);
  }
  
  showStep(index) {
    const step = this.steps[index];
    const target = document.querySelector(step.target);
    
    // 高亮目标元素
    target.classList.add('onboarding-highlight');
    
    // 创建提示框
    const tooltip = document.createElement('div');
    tooltip.className = 'onboarding-tooltip';
    tooltip.innerHTML = `
      <h4>${step.title}</h4>
      <p>${step.content}</p>
      <div class="onboarding-actions">
        <button onclick="onboarding.skip()">跳过</button>
        <button onclick="onboarding.next()">${index === this.steps.length - 1 ? '完成' : '下一步'}</button>
      </div>
      <div class="onboarding-progress">${index + 1}/${this.steps.length}</div>
    `;
    
    document.body.appendChild(tooltip);
    this.positionTooltip(tooltip, target, step.position);
  }
  
  // 添加上下文帮助
  addContextualHelp() {
    document.querySelectorAll('[data-help]').forEach(el => {
      el.addEventListener('click', (e) => {
        const helpKey = e.target.dataset.help;
        this.showHelpModal(helpKey);
      });
    });
  }
}
```

**UI 改进**：
```css
/* 引导高亮效果 */
.onboarding-highlight {
  position: relative;
  z-index: 1000;
  box-shadow: 0 0 0 4px var(--accent-color), 0 0 0 9999px rgba(0,0,0,0.5);
  animation: pulse-highlight 2s infinite;
}

@keyframes pulse-highlight {
  0%, 100% { box-shadow: 0 0 0 4px var(--accent-color), 0 0 0 9999px rgba(0,0,0,0.5); }
  50% { box-shadow: 0 0 0 8px var(--accent-color), 0 0 0 9999px rgba(0,0,0,0.5); }
}

/* 帮助按钮 */
.help-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
  background: var(--accent-color);
  color: white;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
  margin-left: 8px;
}
```

---

### 2.2 掷骰结果可视化不足

**问题描述**：
- 掷骰结果显示简单，缺乏视觉反馈
- 没有掷骰历史记录
- 无法看到具体的骰子点数

**用户影响**：
- 掷骰过程缺乏仪式感
- 无法验证掷骰结果的公平性
- 游戏体验不够沉浸

**优化方案**：
```javascript
// 掷骰动画系统
class DiceAnimation {
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'dice-animation-container';
    document.body.appendChild(this.container);
  }
  
  async roll(type = '2d6', duration = 1000) {
    this.showAnimation(type, duration);
    await new Promise(resolve => setTimeout(resolve, duration));
    
    const result = this.calculateResult(type);
    this.showResult(result);
    return result;
  }
  
  showAnimation(type, duration) {
    const diceCount = type === '2d6' ? 2 : 1;
    this.container.innerHTML = `
      <div class="dice-rolling">
        ${Array.from({ length: diceCount }).map((_, i) => `
          <div class="die rolling" data-index="${i}">
            <div class="face">1</div>
            <div class="face">2</div>
            <div class="face">3</div>
            <div class="face">4</div>
            <div class="face">5</div>
            <div class="face">6</div>
          </div>
        `).join('')}
      </div>
    `;
    
    this.container.classList.add('active');
  }
  
  calculateResult(type) {
    if (type === '2d6') {
      const die1 = Math.floor(Math.random() * 6) + 1;
      const die2 = Math.floor(Math.random() * 6) + 1;
      return { total: die1 + die2, dice: [die1, die2] };
    } else {
      const die = Math.floor(Math.random() * 6) + 1;
      return { total: die, dice: [die] };
    }
  }
  
  showResult(result) {
    this.container.innerHTML = `
      <div class="dice-result">
        ${result.dice.map((die, index) => `
          <div class="die">
            <div class="face active">${die}</div>
          </div>
        `).join('')}
        <div class="result-total">${result.total}</div>
      </div>
    `;
    
    setTimeout(() => {
      this.container.classList.remove('active');
    }, 1000);
  }
}

// 掷骰历史记录
class RollHistory {
  constructor() {
    this.history = [];
  }
  
  addRoll(type, result, context) {
    this.history.push({
      id: Date.now(),
      type,
      result,
      context,
      timestamp: new Date().toISOString()
    });
    
    // 限制历史记录长度
    if (this.history.length > 20) {
      this.history.shift();
    }
  }
  
  renderHistory() {
    return `
      <div class="roll-history">
        <h4>掷骰历史</h4>
        <div class="history-list">
          ${this.history.map(roll => `
            <div class="roll-item">
              <span class="roll-type">${roll.type}</span>
              <span class="roll-result">${roll.result.total}</span>
              <span class="roll-context">${roll.context}</span>
              <span class="roll-time">${new Date(roll.timestamp).toLocaleTimeString()}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
```

**UI 设计**：
```css
.dice-animation-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  z-index: 1000;
  transition: transform 0.3s ease;
}

.dice-animation-container.active {
  transform: translate(-50%, -50%) scale(1);
}

.dice-rolling {
  display: flex;
  gap: 20px;
}

.die {
  width: 60px;
  height: 60px;
  perspective: 1000px;
  position: relative;
}

.die .face {
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  border: 3px solid black;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.die.rolling {
  animation: roll 1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes roll {
  0% { transform: rotateX(0deg) rotateY(0deg); }
  100% { transform: rotateX(720deg) rotateY(720deg); }
}

.dice-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.result-total {
  font-size: 32px;
  font-weight: bold;
  color: var(--accent-color);
}

.roll-history {
  background: var(--white);
  border: 3px solid var(--black);
  padding: 16px;
  margin-top: 20px;
  box-shadow: 4px 4px 0 var(--black);
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 10px;
}

.roll-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid var(--gray-200);
}

.roll-result {
  font-weight: bold;
  color: var(--accent-color);
}
```

---

### 2.3 角色对比功能缺失

**问题描述**：
- 无法同时查看多个角色的属性对比
- 没有角色强度评估工具
- 难以判断角色是否平衡

**用户影响**：
- GM 难以平衡队伍
- 玩家无法评估角色强弱
- 角色优化缺乏数据支持

**优化方案**：
```javascript
// 角色分析器
class CharacterAnalyzer {
  analyze(character) {
    return {
      combatPower: this.calculateCombatPower(character),
      utilityScore: this.calculateUtilityScore(character),
      durability: this.calculateDurability(character),
      versatility: this.calculateVersatility(character),
      weaknesses: this.identifyWeaknesses(character),
      recommendations: this.generateRecommendations(character)
    };
  }
  
  calculateCombatPower(char) {
    const offense = (char.attributes.brawn + char.attributes.coordination) / 2;
    const defense = char.attributes.coordination;
    const powers = char.powers.filter(p => 
      ['攻击系', '控制系'].includes(p.category)
    ).reduce((sum, p) => sum + p.level, 0);
    
    return Math.round((offense + defense + powers) / 3);
  }
  
  calculateUtilityScore(char) {
    const mental = (char.attributes.intellect + char.attributes.awareness) / 2;
    const utilityPowers = char.powers.filter(p =>
      ['精神系', '感官系', '运动系'].includes(p.category)
    ).length;
    const specialties = char.specialties.length;
    
    return Math.round(mental + utilityPowers * 2 + specialties);
  }
  
  identifyWeaknesses(char) {
    const weaknesses = [];
    
    // 检查低属性
    const lowAttrs = Object.entries(char.attributes)
      .filter(([_, val]) => val <= 3)
      .map(([key, _]) => key);
    if (lowAttrs.length > 0) {
      weaknesses.push({
        type: 'attribute',
        description: `${lowAttrs.join('、')}较低，可能成为突破口`,
        severity: lowAttrs.length > 2 ? 'high' : 'medium'
      });
    }
    
    // 检查防御能力
    const hasDefense = char.powers.some(p => 
      p.category === '防御系' || p.name.includes('抵抗')
    );
    if (!hasDefense && char.attributes.coordination < 5) {
      weaknesses.push({
        type: 'defense',
        description: '缺乏防御能力，容易被击中',
        severity: 'high'
      });
    }
    
    // 检查决意
    if (char.resolve <= 2) {
      weaknesses.push({
        type: 'resolve',
        description: '决意过低，难以使用决意点',
        severity: 'medium'
      });
    }
    
    return weaknesses;
  }
  
  // 生成雷达图数据
  generateRadarData(char) {
    return {
      labels: ['攻击', '防御', '机动', '精神', '感知', '社交'],
      datasets: [{
        label: char.name,
        data: [
          char.attributes.brawn,
          char.attributes.coordination,
          this.getMobilityScore(char),
          char.attributes.intellect,
          char.attributes.awareness,
          char.attributes.willpower
        ]
      }]
    };
  }
}
```

---

### 2.4 移动端体验差

**问题描述**：
- 角色卡在小屏幕上显示拥挤
- 输入框在移动端难以操作
- 导出图片在手机上尺寸不合适

**用户影响**：
- 手机用户无法正常使用
- 团中随时查看角色卡困难
- 分享角色卡效果差

**优化方案**：
```css
/* 移动端专用角色卡布局 */
@media (max-width: 480px) {
  .sheet-container {
    padding: 12px;
    box-shadow: 4px 4px 0 var(--black);
  }
  
  /* 属性网格改为单列 */
  .attributes-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .attribute-item {
    padding: 8px;
    font-size: 14px;
  }
  
  .attribute-item .value {
    font-size: 24px;
  }
  
  /* 能力列表简化 */
  .power-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .power-level {
    align-self: flex-end;
  }
  
  /* 底部固定操作栏 */
  .mobile-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--white);
    border-top: 3px solid var(--black);
    padding: 12px;
    display: flex;
    gap: 8px;
    z-index: 100;
  }
  
  .mobile-actions .btn {
    flex: 1;
    padding: 12px;
    font-size: 16px; /* 防止 iOS 缩放 */
  }
  
  /* 增加触摸目标 */
  .btn, .nav-btn, input, select {
    min-height: 44px;
    min-width: 44px;
  }
}

/* 移动端导出图片优化 */
.mobile-export .sheet-container {
  width: 375px; /* iPhone 宽度 */
  margin: 0 auto;
}
```

```javascript
// 移动端检测和适配
class MobileAdapter {
  constructor() {
    this.isMobile = this.detectMobile();
    this.init();
  }
  
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;
  }
  
  init() {
    if (this.isMobile) {
      document.body.classList.add('mobile-mode');
      this.optimizeForTouch();
      this.addMobileActions();
    }
  }
  
  optimizeForTouch() {
    // 禁用 hover 效果
    document.querySelectorAll('[data-hover]').forEach(el => {
      el.addEventListener('touchstart', () => {}, { passive: true });
    });
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }
  
  addMobileActions() {
    const actions = document.createElement('div');
    actions.className = 'mobile-actions';
    actions.innerHTML = `
      <button class="btn btn-secondary" onclick="app.creationFlow.prevStep()">←</button>
      <button class="btn btn-primary" onclick="app.creationFlow.saveCurrentCharacter()">保存</button>
      <button class="btn btn-secondary" onclick="app.creationFlow.nextStep()">→</button>
    `;
    document.body.appendChild(actions);
  }
}
```

---

### 2.5 数据导出格式单一

**问题描述**：
- 仅支持 JSON 和图片导出
- 无法导出为 PDF 或打印友好的格式
- 不支持导入其他车卡器的数据

**用户影响**：
- 需要手动转录到纸质卡
- 与其他工具兼容性差
- 角色卡无法离线使用

**优化方案**：
```javascript
// 多格式导出器
class CharacterExporter {
  constructor(character) {
    this.character = character;
  }
  
  // PDF 导出
  async toPDF() {
    // 使用 jsPDF 或 pdfmake
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    // 添加漫画风格背景
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');
    
    // 添加角色信息
    doc.setFontSize(24);
    doc.text(this.character.name || '未命名英雄', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`起源: ${this.character.origin?.name || '未知'}`, 20, 45);
    
    // 添加属性表格
    const attributes = Object.entries(this.character.attributes)
      .map(([key, val]) => [this.translateAttr(key), val.toString()]);
    
    doc.autoTable({
      startY: 55,
      head: [['属性', '等级']],
      body: attributes,
      theme: 'grid',
      styles: { fontSize: 10 }
    });
    
    // 添加能力列表
    const powers = this.character.powers.map(p => [p.name, p.level.toString()]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['能力', '等级']],
      body: powers,
      theme: 'grid'
    });
    
    doc.save(`${this.character.name || 'hero'}.pdf`);
  }
  
  // Foundry VTT 格式导出
  toFoundryVTT() {
    return {
      name: this.character.name,
      type: 'character',
      system: {
        attributes: this.character.attributes,
        powers: this.character.powers,
        specialties: this.character.specialties,
        stamina: this.character.stamina,
        resolve: this.character.resolve
      }
    };
  }
  
  // Roll20 格式导出
  toRoll20() {
    return {
      name: this.character.name,
      attributes: {
        brawn: this.character.attributes.brawn,
        coordination: this.character.attributes.coordination,
        // ...
      },
      abilities: this.character.powers.map(p => ({
        name: p.name,
        description: p.description
      }))
    };
  }
  
  // Markdown 格式（适合论坛分享）
  toMarkdown() {
    return `
# ${this.character.name || '未命名英雄'}

**起源**: ${this.character.origin?.name || '未知'}
**耐力**: ${this.character.stamina} | **决意**: ${this.character.resolve}

## 属性
| 属性 | 等级 |
|------|------|
${Object.entries(this.character.attributes)
  .map(([k, v]) => `| ${this.translateAttr(k)} | ${v} |`)
  .join('\n')}

## 能力
${this.character.powers.map(p => `- **${p.name}** (等级 ${p.level})`).join('\n')}

## 专长
${this.character.specialties.map(s => `- ${s.name} (等级 ${s.level})`).join('\n')}
    `.trim();
  }
  
  translateAttr(key) {
    const map = {
      brawn: '勇猛', coordination: '协调', strength: '力量',
      intellect: '智力', awareness: '感知', willpower: '意志'
    };
    return map[key] || key;
  }
}
```

---

## 三、TRPG 游戏层面（玩家视角）

### 3.1 规则实现不完整

**问题描述**：
- 缺乏"痛下决心"机制追踪
- 没有战斗轮次管理
- 检定辅助工具缺失

**游戏影响**：
- 需要额外记录决意点使用
- 战斗时需要手动计算
- 掷骰结果需要查表

**优化方案**：
```javascript
// 游戏会话管理器
class GameSession {
  constructor() {
    this.characters = new Map();
    this.currentRound = 0;
    this.initiativeOrder = [];
    this.resolveTracker = new Map(); // 追踪决意点使用
  }
  
  addCharacter(character) {
    this.characters.set(character.id, {
      ...character,
      currentStamina: character.stamina,
      currentResolve: character.resolve,
      determinationUsed: 0 // 痛下决心次数
    });
  }
  
  // 掷骰检定
  rollCheck(characterId, attribute, difficulty = 0, modifiers = []) {
    const char = this.characters.get(characterId);
    const attrValue = char.attributes[attribute];
    
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const total = roll1 + roll2 + attrValue + modifiers.reduce((a, b) => a + b, 0);
    
    const result = {
      roll1,
      roll2,
      attribute: attrValue,
      modifiers,
      total,
      difficulty,
      margin: total - difficulty,
      success: total >= difficulty,
      degree: this.calculateDegree(total, difficulty)
    };
    
    return result;
  }
  
  calculateDegree(total, difficulty) {
    const margin = total - difficulty;
    if (margin >= 10) return { level: 3, name: '非凡成功', color: '#4CAF50' };
    if (margin >= 5) return { level: 2, name: '重大成功', color: '#8BC34A' };
    if (margin >= 0) return { level: 1, name: '普通成功', color: '#CDDC39' };
    if (margin >= -4) return { level: -1, name: '普通失败', color: '#FF9800' };
    return { level: -2, name: '重大失败', color: '#F44336' };
  }
  
  // 痛下决心
  useDetermination(characterId, type) {
    const char = this.characters.get(characterId);
    if (char.currentResolve <= 0) {
      return { success: false, reason: '决意点不足' };
    }
    
    char.currentResolve--;
    char.determinationUsed++;
    
    const effects = {
      '加强尝试': '本次检定获得 +2 加值',
      '即兴能力': '临时获得一项等级为决意等级的特殊能力',
      '灵感闪现': '获得一个与当前场景相关的线索或提示',
      '编辑场景': '在合理范围内改变场景中的一个细节',
      '逆转': '将一次失败变为成功，或反之',
      '逃脱': '从困境中自动脱身'
    };
    
    return {
      success: true,
      remaining: char.currentResolve,
      effect: effects[type]
    };
  }
  
  // 恢复决意
  recoverResolve(characterId, amount = 1) {
    const char = this.characters.get(characterId);
    char.currentResolve = Math.min(char.resolve, char.currentResolve + amount);
  }
}

// 检定结果可视化组件
class RollResultDisplay {
  render(result) {
    return `
      <div class="roll-result ${result.success ? 'success' : 'failure'}">
        <div class="dice-display">
          <div class="die">${result.roll1}</div>
          <div class="die">${result.roll2}</div>
        </div>
        <div class="calculation">
          <span>${result.roll1} + ${result.roll2}</span>
          <span>+ ${result.attribute} (属性)</span>
          ${result.modifiers.map(m => `<span>+ ${m}</span>`).join('')}
          <span class="total">= ${result.total}</span>
        </div>
        <div class="outcome" style="color: ${result.degree.color}">
          ${result.degree.name}
          ${result.margin !== 0 ? `(差值: ${result.margin > 0 ? '+' : ''}${result.margin})` : ''}
        </div>
      </div>
    `;
  }
}
```

---

### 3.2 能力描述检索困难

**问题描述**：
- 能力描述过长，难以快速查阅
- 没有能力搜索功能
- 能力之间的关联关系不清晰

**游戏影响**：
- 游戏时需要反复翻阅规则
- 能力组合效果难以判断
- 新手学习成本高

**优化方案**：
```javascript
// 能力知识库
class PowerKnowledgeBase {
  constructor() {
    this.powers = POWERS;
    this.buildIndex();
  }
  
  buildIndex() {
    // 构建倒排索引
    this.index = new Map();
    this.powers.forEach(power => {
      const words = this.tokenize(power.name + ' ' + power.description);
      words.forEach(word => {
        if (!this.index.has(word)) {
          this.index.set(word, new Set());
        }
        this.index.get(word).add(power.id);
      });
    });
    
    // 构建能力关系图
    this.relationships = this.buildRelationshipGraph();
  }
  
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }
  
  search(query) {
    const words = this.tokenize(query);
    const scores = new Map();
    
    words.forEach(word => {
      const matches = this.index.get(word);
      if (matches) {
        matches.forEach(id => {
          scores.set(id, (scores.get(id) || 0) + 1);
        });
      }
    });
    
    return Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => this.powers.find(p => p.id === id))
      .slice(0, 10);
  }
  
  // 查找相关能力
  findRelated(powerId) {
    return this.relationships.get(powerId) || [];
  }
  
  buildRelationshipGraph() {
    const graph = new Map();
    
    // 基于描述相似度建立关系
    this.powers.forEach(power1 => {
      const related = [];
      this.powers.forEach(power2 => {
        if (power1.id !== power2.id) {
          const similarity = this.calculateSimilarity(power1, power2);
          if (similarity > 0.3) {
            related.push({ power: power2, similarity });
          }
        }
      });
      graph.set(power1.id, related.sort((a, b) => b.similarity - a.similarity).slice(0, 5));
    });
    
    return graph;
  }
  
  calculateSimilarity(p1, p2) {
    const words1 = new Set(this.tokenize(p1.description));
    const words2 = new Set(this.tokenize(p2.description));
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    return intersection.size / Math.sqrt(words1.size * words2.size);
  }
  
  // 快速参考卡片
  generateQuickRef(powerId) {
    const power = this.powers.find(p => p.id === powerId);
    return {
      name: power.name,
      category: power.category,
      keyPoints: this.extractKeyPoints(power.description),
      combos: this.findRelated(powerId).map(r => r.power.name)
    };
  }
  
  extractKeyPoints(description) {
    // 提取关键规则点
    const points = [];
    const patterns = [
      /(\d+)级/,
      /(\d+)个/,
      /(\d+)点/,
      /需要(.+?)(?:，|。)/,
      /获得(.+?)(?:，|。)/
    ];
    
    patterns.forEach(pattern => {
      const match = description.match(pattern);
      if (match) {
        points.push(match[0]);
      }
    });
    
    return points.slice(0, 5);
  }
}

// 能力搜索 UI
class PowerSearchUI {
  render() {
    return `
      <div class="power-search">
        <div class="search-box">
          <input type="text" 
                 id="power-search-input" 
                 placeholder="搜索能力..."
                 autocomplete="off">
          <div class="search-icon">🔍</div>
        </div>
        <div class="search-filters">
          <button class="filter-btn active" data-category="all">全部</button>
          <button class="filter-btn" data-category="attack">攻击</button>
          <button class="filter-btn" data-category="defense">防御</button>
          <button class="filter-btn" data-category="mental">精神</button>
        </div>
        <div class="search-results" id="power-search-results"></div>
      </div>
    `;
  }
  
  bindEvents() {
    const input = document.getElementById('power-search-input');
    let debounceTimer;
    
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300);
    });
  }
}
```

---

### 3.3 角色成长追踪缺失

**问题描述**：
- 无法记录角色升级历史
- 没有经验值管理系统
- 无法追踪角色故事进展

**游戏影响**：
- 长团角色发展难以记录
- 升级时需要手动计算
- 角色背景故事容易遗忘

**优化方案**：
```javascript
// 角色成长系统
class CharacterProgression {
  constructor(character) {
    this.character = character;
    this.history = character.history || [];
    this.xp = character.xp || 0;
    this.storyMilestones = character.storyMilestones || [];
  }
  
  // 经验值系统
  addXP(amount, reason) {
    this.xp += amount;
    this.history.push({
      date: new Date().toISOString(),
      type: 'xp',
      amount,
      reason,
      total: this.xp
    });
    
    // 检查升级
    const newLevel = this.calculateLevel();
    if (newLevel > (this.character.level || 1)) {
      this.levelUp(newLevel);
    }
  }
  
  calculateLevel() {
    // ICONS 规则：每 5 XP 升一级
    return Math.floor(this.xp / 5) + 1;
  }
  
  levelUp(newLevel) {
    this.character.level = newLevel;
    this.history.push({
      date: new Date().toISOString(),
      type: 'levelup',
      level: newLevel
    });
    
    // 升级奖励
    return {
      newLevel,
      benefits: this.getLevelBenefits(newLevel)
    };
  }
  
  getLevelBenefits(level) {
    const benefits = [];
    
    // 每级获得 1 点提升
    benefits.push({
      type: 'improvement',
      description: '提升一项属性或能力 1 级'
    });
    
    // 特定等级额外奖励
    if (level % 3 === 0) {
      benefits.push({
        type: 'specialty',
        description: '获得一项新专长或提升现有专长'
      });
    }
    
    return benefits;
  }
  
  // 故事里程碑
  addMilestone(title, description, sessionDate) {
    this.storyMilestones.push({
      date: new Date().toISOString(),
      sessionDate,
      title,
      description
    });
  }
  
  // 生成角色时间线
  generateTimeline() {
    const events = [
      ...this.history.map(h => ({ ...h, category: 'progression' })),
      ...this.storyMilestones.map(m => ({ ...m, category: 'story' }))
    ];
    
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  
  // 导出角色日志
  exportJournal() {
    const timeline = this.generateTimeline();
    
    return `
# ${this.character.name} 的英雄日志

## 基本信息
- 当前等级: ${this.character.level || 1}
- 总经验值: ${this.xp} XP
- 创建日期: ${this.character.createdAt}

## 成长历程
${timeline.map(event => {
  if (event.category === 'progression') {
    if (event.type === 'levelup') {
      return `### ${new Date(event.date).toLocaleDateString()} - 升至 ${event.level} 级`;
    }
    if (event.type === 'xp') {
      return `- ${event.reason}: +${event.amount} XP`;
    }
  } else {
    return `### ${event.sessionDate} - ${event.title}\n${event.description}`;
  }
}).join('\n\n')}
    `.trim();
  }
}
```

---

### 3.4 团务管理功能缺失

**问题描述**：
- 无法管理多个团的角色
- 没有 GM 工具
- 缺乏场景/敌人模板

**游戏影响**：
- GM 需要额外工具管理团务
- 敌人数据需要手动创建
- 场景设定难以复用

**优化方案**：
```javascript
// 团务管理系统
class CampaignManager {
  constructor() {
    this.campaigns = this.loadCampaigns();
  }
  
  createCampaign(name, description) {
    const campaign = {
      id: Date.now().toString(),
      name,
      description,
      createdAt: new Date().toISOString(),
      characters: [],
      npcs: [],
      scenes: [],
      sessions: []
    };
    this.campaigns.push(campaign);
    this.saveCampaigns();
    return campaign;
  }
  
  // NPC 生成器
  generateNPC(type, level = 3) {
    const templates = {
      thug: {
        name: '暴徒',
        attributes: { brawn: 4, coordination: 3, strength: 3, intellect: 2, awareness: 2, willpower: 2 },
        powers: [],
        specialties: [{ name: '格斗', level: 1 }]
      },
      mastermind: {
        name: '幕后黑手',
        attributes: { brawn: 2, coordination: 3, strength: 2, intellect: 6, awareness: 5, willpower: 5 },
        powers: [{ name: '心灵感应', level: 5 }],
        specialties: [{ name: '领导力', level: 2 }, { name: '神秘学', level: 2 }]
      },
      // 更多模板...
    };
    
    const template = templates[type];
    if (!template) return null;
    
    // 根据等级调整
    const adjusted = this.adjustToLevel(template, level);
    return {
      ...adjusted,
      id: Date.now().toString(),
      type: 'npc',
      npcType: type
    };
  }
  
  // 场景模板
  getSceneTemplates() {
    return [
      {
        name: '银行抢劫',
        description: '一群暴徒正在抢劫银行，人质被挟持',
        threats: ['暴徒 x4', '暴徒头目 x1'],
        objectives: ['解救人质', '制服暴徒', '防止逃跑'],
        hazards: ['人质', '警报系统', '逃跑车辆']
      },
      {
        name: '实验室爆炸',
        description: '化学实验室发生爆炸，有危险物质泄漏',
        threats: ['火焰', '有毒气体', '变异实验体'],
        objectives: ['疏散人员', '控制火势', '收容实验体'],
        hazards: ['爆炸物', '化学品', '坍塌']
      }
    ];
  }
  
  // 遭遇平衡计算器
  calculateEncounterDifficulty(playerCharacters, enemies) {
    const playerPower = playerCharacters.reduce((sum, pc) => {
      return sum + this.calculatePowerLevel(pc);
    }, 0);
    
    const enemyPower = enemies.reduce((sum, npc) => {
      return sum + this.calculatePowerLevel(npc);
    }, 0);
    
    const ratio = enemyPower / playerPower;
    
    if (ratio < 0.5) return { level: 'trivial', description: '轻松', color: '#4CAF50' };
    if (ratio < 0.8) return { level: 'easy', description: '简单', color: '#8BC34A' };
    if (ratio < 1.2) return { level: 'moderate', description: '适中', color: '#FFC107' };
    if (ratio < 1.5) return { level: 'hard', description: '困难', color: '#FF9800' };
    return { level: 'deadly', description: '致命', color: '#F44336' };
  }
  
  calculatePowerLevel(character) {
    const attrSum = Object.values(character.attributes).reduce((a, b) => a + b, 0);
    const powerSum = character.powers.reduce((sum, p) => sum + p.level, 0);
    const specialtyBonus = character.specialties.length * 2;
    return attrSum + powerSum + specialtyBonus;
  }
}
```

---

## 四、优化优先级矩阵

| 优化项 | 技术难度 | 用户价值 | 优先级 |
|--------|----------|----------|--------|
| 状态管理重构 | 高 | 高 | P0 |
| 移动端适配 | 中 | 高 | P0 |
| 错误处理系统 | 中 | 高 | P1 |
| 新手引导 | 中 | 高 | P1 |
| 掷骰结果可视化 | 低 | 中 | P1 |
| 测试覆盖 | 高 | 中 | P1 |
| 类型安全 | 中 | 中 | P2 |
| 存储抽象层 | 中 | 中 | P2 |
| 角色分析器 | 中 | 中 | P2 |
| 多格式导出 | 低 | 中 | P2 |
| 游戏会话管理 | 高 | 低 | P3 |
| 能力知识库 | 高 | 低 | P3 |
| 角色成长系统 | 高 | 低 | P3 |
| 团务管理 | 高 | 低 | P3 |

---

## 五、实施路线图

### Phase 1: 稳定性（1-2周）
1. 实现统一错误处理系统
2. 添加基础单元测试
3. 修复已知 DOM 操作问题

### Phase 2: 核心体验（2-3周）
1. 重构状态管理
2. 实现掷骰结果可视化
3. 完成移动端适配

### Phase 3: 功能增强（3-4周）
1. 添加新手引导系统
2. 实现角色分析器
3. 扩展导出格式

### Phase 4: 高级功能（4-6周）
1. 游戏会话管理
2. 角色成长追踪
3. 团务管理系统

---

*文档结束*
