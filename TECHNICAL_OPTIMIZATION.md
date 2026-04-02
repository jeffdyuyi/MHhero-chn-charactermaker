# 漫画英雄TRPG车卡器技术优化方案

## 一、核心优化目标

以分布引导式角色创建为核心，构建一个流程清晰、用户友好、技术可靠的TRPG角色创建工具。

## 二、优先级排序

1. **用户体验优先**：确保引导流程流畅，规则解释清晰
2. **技术稳定性**：保证系统运行稳定，数据安全
3. **功能完整性**：实现所有必要的创建步骤
4. **性能优化**：确保操作响应迅速，界面流畅

## 三、具体技术实现方案

### 高优先级优化

#### 1. 引导式流程架构重构

**实现文件**：`js/ui/guided-creation-flow.js`

**核心代码结构**：
```javascript
class GuidedCreationFlow {
    constructor(app) {
        this.app = app;
        this.steps = [
            { id: 'mode', name: '创建模式', component: ModeSelectionStep },
            { id: 'origin', name: '能力起源', component: OriginSelectionStep },
            { id: 'attributes', name: '基础属性', component: AttributesStep },
            { id: 'powers', name: '超凡能力', component: PowersStep },
            { id: 'specialties', name: '生活专长', component: SpecialtiesStep },
            { id: 'info', name: '角色信息', component: CharacterInfoStep },
            { id: 'preview', name: '预览保存', component: PreviewStep }
        ];
        this.currentStepIndex = 0;
        this.characterData = {};
        this.init();
    }

    init() {
        this.renderStepNavigation();
        this.goToStep(0);
    }

    goToStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        this.currentStepIndex = index;
        this.renderCurrentStep();
        this.updateNavigation();
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            if (this.currentStepIndex < this.steps.length - 1) {
                this.goToStep(this.currentStepIndex + 1);
            }
        }
    }

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.goToStep(this.currentStepIndex - 1);
        }
    }

    // 其他方法...
}
```

#### 2. 步骤组件化

**实现文件**：`js/ui/steps/` 目录下的各个步骤组件

**基础步骤类**：
```javascript
class Step {
    constructor(flow, data) {
        this.flow = flow;
        this.data = data || {};
    }

    render() {
        // 子类实现
    }

    validate() {
        // 子类实现
        return true;
    }

    saveData() {
        // 子类实现
        return {};
    }
}
```

**具体步骤实现示例**：
```javascript
class ModeSelectionStep extends Step {
    render() {
        return `
            <div class="step-content">
                <h2>选择创建模式</h2>
                <div class="mode-options">
                    <div class="mode-option" data-mode="random">
                        <h3>随机模式</h3>
                        <p>掷骰决定角色属性，体验命运的安排</p>
                    </div>
                    <div class="mode-option" data-mode="point-buy">
                        <h3>购点模式</h3>
                        <p>45点自由分配，精细控制角色构建</p>
                    </div>
                </div>
                <div class="rule-hint">
                    <h4>规则说明</h4>
                    <p>随机模式：全程使用2d6掷骰决定所有属性和能力</p>
                    <p>购点模式：总点数45点，属性范围1-10，能力和专长也需要消耗点数</p>
                </div>
            </div>
        `;
    }

    validate() {
        return this.data.mode !== undefined;
    }

    saveData() {
        return { mode: this.data.mode };
    }
}
```

#### 3. 规则提示系统

**实现文件**：`js/ui/rule-hint.js`

**核心代码**：
```javascript
class RuleHint {
    constructor() {
        this.hints = {
            mode: {
                random: '随机模式下，所有属性和能力都通过掷骰决定',
                'point-buy': '购点模式下，你有45点可以自由分配到属性、能力和专长上'
            },
            origin: {
                trained: '受训起源：额外获得两项专长，可以选择用一项特殊能力交换两项专长',
                altered: '改造起源：选择一项能力增加2个等级，最高不超过10级',
                // 其他起源提示...
            },
            // 其他步骤提示...
        };
    }

    getHint(step, key) {
        return this.hints[step]?.[key] || '';
    }

    renderHint(step, key) {
        const hint = this.getHint(step, key);
        if (!hint) return '';
        return `
            <div class="rule-hint">
                <p>${hint}</p>
            </div>
        `;
    }
}
```

#### 4. 数据验证增强

**实现文件**：`js/core/validation.js`

**核心代码**：
```javascript
export function validateCharacterData(data) {
    const errors = [];

    // 验证模式
    if (!data.mode) {
        errors.push('请选择创建模式');
    }

    // 验证起源
    if (!data.origin) {
        errors.push('请选择能力起源');
    }

    // 验证属性
    if (data.attributes) {
        const attrSum = Object.values(data.attributes).reduce((sum, val) => sum + val, 0);
        if (attrSum < 20) {
            errors.push(`属性总和不能低于 20 (当前: ${attrSum})`);
        }
    }

    // 验证购点模式
    if (data.mode === 'point-buy') {
        let usedPoints = 0;
        // 计算已用点数...
        if (usedPoints > 45) {
            errors.push(`购点模式下总点数超过了 45 (当前: ${usedPoints})`);
        }
    }

    // 验证角色信息
    if (!data.name || data.name.trim() === '') {
        errors.push('角色名称不能为空');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}
```

#### 5. 性能优化

**实现文件**：`js/core/performance.js`

**核心代码**：
```javascript
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

export function optimizeRendering() {
    // 实现虚拟DOM或增量渲染
}
```

### 中优先级优化

#### 6. 代码架构重构

**实现文件**：`js/main.js` (重构)

**核心代码**：
```javascript
import { GuidedCreationFlow } from './ui/guided-creation-flow.js';
import { ViewManager } from './ui/view-manager.js';
import { APP_CONFIG } from './data/index.js';

class ComicHeroApp {
    constructor() {
        this.viewManager = new ViewManager(this);
        this.guidedCreationFlow = new GuidedCreationFlow(this);
        this.init();
    }

    init() {
        console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} (引导式) 已加载`);
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // 绑定全局事件
    }

    // 其他方法...
}

const app = new ComicHeroApp();
export default app;
```

#### 7. 错误处理完善

**实现文件**：`js/core/error-handler.js`

**核心代码**：
```javascript
class ErrorHandler {
    constructor() {
        this.init();
    }

    init() {
        // 全局错误捕获
        window.addEventListener('error', (event) => {
            this.handleError(event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    handleError(error) {
        console.error('Error:', error);
        // 显示友好的错误提示
        this.showError(`发生错误: ${error.message || '未知错误'}`);
    }

    showError(message) {
        // 显示错误提示
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }
}

export const errorHandler = new ErrorHandler();
```

#### 8. 功能完善

**实现文件**：`js/ui/preview-step.js`

**核心代码**：
```javascript
class PreviewStep extends Step {
    render() {
        const character = this.flow.characterData;
        return `
            <div class="step-content">
                <h2>角色预览</h2>
                <div class="character-preview">
                    <div class="preview-section">
                        <h3>基本信息</h3>
                        <p>名称: ${character.name || '未设置'}</p>
                        <p>起源: ${character.origin?.name || '未设置'}</p>
                        <p>模式: ${character.mode === 'random' ? '随机模式' : '购点模式'}</p>
                    </div>
                    <div class="preview-section">
                        <h3>属性</h3>
                        ${Object.entries(character.attributes || {}).map(([key, value]) => 
                            `<p>${key}: ${value}</p>`
                        ).join('')}
                    </div>
                    <div class="preview-section">
                        <h3>能力</h3>
                        ${(character.powers || []).map(power => 
                            `<p>${power.name} (Lv${power.level})</p>`
                        ).join('')}
                    </div>
                    <div class="preview-section">
                        <h3>专长</h3>
                        ${(character.specialties || []).map(specialty => 
                            `<p>${specialty.name} (${specialty.level}级)</p>`
                        ).join('')}
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="app.guidedCreationFlow.saveCharacter()">保存角色</button>
                    <button class="btn btn-secondary" onclick="app.guidedCreationFlow.exportCharacter()">导出角色</button>
                </div>
            </div>
        `;
    }

    // 其他方法...
}
```

#### 9. 安全性加强

**实现文件**：`js/core/security.js`

**核心代码**：
```javascript
export function sanitizeInput(input) {
    // 防止XSS攻击
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

export function encryptData(data) {
    // 简单的加密处理
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
}

export function decryptData(encryptedData) {
    // 解密处理
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
}

export function validateInput(input, type) {
    // 根据类型验证输入
    switch (type) {
        case 'name':
            return input.trim().length > 0 && input.trim().length <= 50;
        case 'number':
            return !isNaN(input) && input >= 1 && input <= 10;
        // 其他验证类型...
        default:
            return true;
    }
}
```

### 低优先级优化

#### 10. 多语言支持

**实现文件**：`js/i18n/` 目录

**核心代码**：
```javascript
// js/i18n/locales/zh-CN.js
export const zhCN = {
    mode: '创建模式',
    origin: '能力起源',
    attributes: '基础属性',
    // 其他翻译...
};

// js/i18n/locales/en-US.js
export const enUS = {
    mode: 'Creation Mode',
    origin: 'Origin',
    attributes: 'Attributes',
    // 其他翻译...
};

// js/i18n/i18n.js
import { zhCN } from './locales/zh-CN.js';
import { enUS } from './locales/en-US.js';

class I18n {
    constructor() {
        this.currentLocale = 'zh-CN';
        this.locales = {
            'zh-CN': zhCN,
            'en-US': enUS
        };
    }

    setLocale(locale) {
        if (this.locales[locale]) {
            this.currentLocale = locale;
        }
    }

    t(key) {
        return this.locales[this.currentLocale][key] || key;
    }
}

export const i18n = new I18n();
```

#### 11. 数据同步功能

**实现文件**：`js/core/sync.js`

**核心代码**：
```javascript
class SyncService {
    constructor() {
        this.apiUrl = 'https://api.example.com/sync'; // 示例API地址
    }

    async syncData(data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('Sync error:', error);
            return null;
        }
    }

    async loadData() {
        try {
            const response = await fetch(this.apiUrl);
            return await response.json();
        } catch (error) {
            console.error('Load error:', error);
            return null;
        }
    }
}

export const syncService = new SyncService();
```

#### 12. 角色分享功能

**实现文件**：`js/ui/share.js`

**核心代码**：
```javascript
class ShareService {
    generateShareLink(character) {
        const characterData = JSON.stringify(character);
        const encodedData = btoa(characterData);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?share=${encodedData}`;
    }

    async exportAsImage(character) {
        // 实现角色卡图片导出
        try {
            // 使用html2canvas等库生成图片
            const canvas = await html2canvas(document.getElementById('character-preview'));
            const image = canvas.toDataURL('image/png');
            
            // 下载图片
            const link = document.createElement('a');
            link.href = image;
            link.download = `${character.name || 'hero'}.png`;
            link.click();
        } catch (error) {
            console.error('Export error:', error);
        }
    }

    shareToSocialMedia(character, platform) {
        const shareLink = this.generateShareLink(character);
        switch (platform) {
            case 'weixin':
                // 微信分享
                break;
            case 'weibo':
                // 微博分享
                break;
            // 其他平台...
        }
    }
}

export const shareService = new ShareService();
```

## 四、实施计划

### 第一阶段：核心架构搭建 (1-2周)
1. 重构代码架构，移除全局变量
2. 实现引导式流程控制器
3. 创建基础步骤组件
4. 实现步骤导航系统

### 第二阶段：功能实现 (2-3周)
1. 实现各个步骤的具体功能
2. 完善数据验证和错误处理
3. 添加规则提示系统
4. 实现角色预览和保存功能

### 第三阶段：优化和完善 (1-2周)
1. 性能优化和用户体验改进
2. 功能完善和测试
3. 安全性加强
4. 文档编写

## 五、技术栈

- **前端**：原生 JavaScript + ES Modules
- **样式**：CSS3 + CSS变量
- **存储**：LocalStorage
- **可选库**：html2canvas (用于图片导出)

## 六、预期效果

通过以上优化方案，预计实现以下效果：

1. **用户体验**：引导式流程使角色创建更加简单直观，尤其是对于新手用户
2. **技术质量**：代码结构清晰，性能优化，系统稳定
3. **功能完整性**：实现所有必要的角色创建功能
4. **可维护性**：模块化设计，易于扩展和维护
5. **安全性**：保护用户数据和系统安全

## 七、总结

本技术优化方案以分布引导式角色创建为核心，通过重构代码架构、实现步骤组件化、添加规则提示系统等措施，显著提高漫画英雄TRPG车卡器的用户体验和技术质量。建议按照优先级逐步实施优化方案，首先解决高优先级的核心问题，然后再处理中低优先级的功能和优化。这样可以在保证系统稳定性的同时，逐步提升整体质量。