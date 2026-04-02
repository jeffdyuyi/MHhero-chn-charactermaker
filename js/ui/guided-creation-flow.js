import { getAllPowers } from '../data/powers.js';
import { getSpecialtiesList } from '../data/specialties.js';
import { openModal, closeModal } from './modal.js';
import { errorHandler } from '../core/error-handler.js';
import { validateCharacterData, validatePower, validateSpecialty } from '../core/validation.js';
import { sanitizeInput, sanitizeCharacterData, generateId } from '../core/security.js';
import { debounce, throttle } from '../core/performance.js';

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
        this.editingCharacterId = null;
        this.init();
    }

    init() {
        this.renderStepNavigation();
        this.goToStep(0);
    }

    renderStepNavigation() {
        const navContainer = document.getElementById('step-navigation');
        if (!navContainer) return;

        navContainer.innerHTML = `
            <div class="step-nav-header">
                <h2>角色创建流程</h2>
            </div>
            <div class="step-list">
                ${this.steps.map((step, index) => `
                    <div class="step-item ${index === this.currentStepIndex ? 'active' : ''}" onclick="app.guidedCreationFlow.goToStep(${index})">
                        <div class="step-number">${index + 1}</div>
                        <div class="step-name">${step.name}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    goToStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        this.currentStepIndex = index;
        this.renderCurrentStep();
        this.updateNavigation();
    }

    renderCurrentStep() {
        const contentContainer = document.getElementById('step-content');
        if (!contentContainer) return;

        // 添加过渡动画类
        contentContainer.classList.add('step-transition');

        // 短暂延迟后渲染内容，触发过渡效果
        setTimeout(() => {
            const currentStep = this.steps[this.currentStepIndex];
            const StepComponent = currentStep.component;
            const stepInstance = new StepComponent(this, this.characterData);

            contentContainer.innerHTML = `
                <div class="step-header">
                    <h3>${currentStep.name}</h3>
                    <p>步骤 ${this.currentStepIndex + 1}/${this.steps.length}</p>
                </div>
                <div class="step-body">
                    ${stepInstance.render()}
                </div>
                <div class="step-actions">
                    <button class="btn btn-secondary" ${this.currentStepIndex === 0 ? 'disabled' : ''} onclick="app.guidedCreationFlow.prevStep()">上一步</button>
                    <button class="btn btn-primary" onclick="app.guidedCreationFlow.nextStep()">
                        ${this.currentStepIndex === this.steps.length - 1 ? '完成' : '下一步'}
                    </button>
                </div>
            `;

            // 移除过渡动画类
            setTimeout(() => {
                contentContainer.classList.remove('step-transition');
            }, 300);
        }, 150);
    }

    updateNavigation() {
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentStepIndex);
        });
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveCurrentStepData();
            if (this.currentStepIndex < this.steps.length - 1) {
                this.goToStep(this.currentStepIndex + 1);
            } else {
                this.completeCreation();
            }
        }
    }

    prevStep() {
        if (this.currentStepIndex > 0) {
            this.goToStep(this.currentStepIndex - 1);
        }
    }

    validateCurrentStep() {
        const currentStep = this.steps[this.currentStepIndex];
        const StepComponent = currentStep.component;
        const stepInstance = new StepComponent(this, this.characterData);
        
        // 首先调用步骤自身的验证
        if (!stepInstance.validate()) {
            errorHandler.showError('请完成当前步骤的所有必填项');
            return false;
        }
        
        // 然后根据步骤类型进行额外验证
        switch (currentStep.id) {
            case 'attributes':
                // 验证属性总和
                if (this.characterData.attributes) {
                    const attrSum = Object.values(this.characterData.attributes).reduce((sum, val) => sum + val, 0);
                    if (attrSum < 20) {
                        errorHandler.showError(`属性总和不能低于 20 (当前: ${attrSum})`);
                        return false;
                    }
                }
                break;
            case 'powers':
                // 验证能力
                if (this.characterData.powers) {
                    for (const power of this.characterData.powers) {
                        const validation = validatePower(power);
                        if (!validation.valid) {
                            errorHandler.showError(validation.errors[0]);
                            return false;
                        }
                    }
                }
                break;
            case 'specialties':
                // 验证专长
                if (this.characterData.specialties) {
                    for (const specialty of this.characterData.specialties) {
                        const validation = validateSpecialty(specialty);
                        if (!validation.valid) {
                            errorHandler.showError(validation.errors[0]);
                            return false;
                        }
                    }
                }
                break;
            case 'info':
                // 验证角色信息
                if (!this.characterData.name || this.characterData.name.trim() === '') {
                    errorHandler.showError('角色名称不能为空');
                    return false;
                }
                if (this.characterData.name.length > 50) {
                    errorHandler.showError('角色名称不能超过 50 个字符');
                    return false;
                }
                break;
        }
        
        return true;
    }

    saveCurrentStepData() {
        const currentStep = this.steps[this.currentStepIndex];
        const StepComponent = currentStep.component;
        const stepInstance = new StepComponent(this, this.characterData);
        const stepData = stepInstance.saveData();
        this.characterData = { ...this.characterData, ...stepData };
    }

    completeCreation() {
        console.log('Character creation completed:', this.characterData);
        // 这里可以添加保存角色的逻辑
    }

    loadCharacter(characterId) {
        // 从本地存储中加载角色数据
        const { getCharacterById } = this.app.core.storage;
        const character = getCharacterById(characterId);
        
        if (character) {
            this.characterData = JSON.parse(JSON.stringify(character));
            this.editingCharacterId = characterId;
            this.currentStepIndex = 0;
            this.renderStepNavigation();
            this.goToStep(0);
            errorHandler.showSuccess(`已加载角色 "${character.name}"`);
        } else {
            errorHandler.showError('无法加载角色数据');
        }
    }

    deleteCharacter() {
        if (this.editingCharacterId) {
            if (confirm('确定要删除这个角色吗？此操作不可恢复。')) {
                // 显示加载状态
                const previewActions = document.querySelector('.preview-actions');
                if (previewActions) {
                    previewActions.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="loading"></div>
                            <span>删除中...</span>
                        </div>
                    `;
                }
                
                // 模拟删除延迟
                setTimeout(() => {
                    const { deleteCharacter } = this.app.core.storage;
                    if (deleteCharacter(this.editingCharacterId)) {
                        errorHandler.showSuccess('角色删除成功！');
                        // 跳转到已保存角色页面
                        this.app.viewManager.switchView('saved');
                        // 重新加载角色列表
                        this.app.savedCharactersView.loadCharacters();
                        // 重置引导流程
                        this.characterData = {};
                        this.editingCharacterId = null;
                        this.currentStepIndex = 0;
                    } else {
                        errorHandler.showError('删除失败，请重试');
                        // 恢复按钮
                        if (previewActions) {
                            this.renderCurrentStep();
                        }
                    }
                }, 500);
            }
        }
    }

    saveCharacter() {
        // 首先验证完整的角色数据
        const validation = validateCharacterData(this.characterData);
        if (!validation.valid) {
            errorHandler.showError(validation.errors[0]);
            return;
        }
        
        // 显示加载状态
        const previewActions = document.querySelector('.preview-actions');
        if (previewActions) {
            previewActions.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="loading"></div>
                    <span>保存中...</span>
                </div>
            `;
        }
        
        // 清理角色数据，确保安全性
        const sanitizedData = sanitizeCharacterData(this.characterData);
        
        // 为角色生成唯一ID
        if (!sanitizedData.id) {
            sanitizedData.id = generateId();
        }
        
        // 添加创建时间
        if (!sanitizedData.createdAt) {
            sanitizedData.createdAt = new Date().toISOString();
        }
        
        // 模拟保存延迟，实际项目中可以移除
        setTimeout(() => {
            // 保存角色到本地存储
            const { saveCharacter } = this.app.core.storage;
            if (saveCharacter(sanitizedData)) {
                errorHandler.showSuccess(`英雄 "${sanitizedData.name}" 已保存至名录！`);
                // 跳转到已保存角色页面
                this.app.viewManager.switchView('saved');
                // 重新加载角色列表
                this.app.savedCharactersView.loadCharacters();
            } else {
                errorHandler.showError('保存失败，请检查浏览器存储空间。');
                // 恢复按钮
                if (previewActions) {
                    this.renderCurrentStep();
                }
            }
        }, 500);
    }

    exportCharacter() {
        // 首先验证完整的角色数据
        const validation = validateCharacterData(this.characterData);
        if (!validation.valid) {
            errorHandler.showError(validation.errors[0]);
            return;
        }
        
        // 显示加载状态
        const previewActions = document.querySelector('.preview-actions');
        if (previewActions) {
            previewActions.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="loading"></div>
                    <span>导出中...</span>
                </div>
            `;
        }
        
        // 模拟导出延迟，实际项目中可以移除
        setTimeout(() => {
            // 导出角色为JSON
            const dataStr = JSON.stringify(this.characterData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.characterData.name || 'hero'}.json`;
            link.click();
            URL.revokeObjectURL(url);
            
            errorHandler.showSuccess('角色导出成功！');
            
            // 恢复按钮
            if (previewActions) {
                this.renderCurrentStep();
            }
        }, 500);
    }
}

// 基础步骤类
class Step {
    constructor(flow, data) {
        this.flow = flow;
        this.data = data || {};
    }

    render() {
        // 子类实现
        return '';
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

// 模式选择步骤
class ModeSelectionStep extends Step {
    render() {
        return `
            <div class="step-content">
                <h2>选择创建模式</h2>
                <div class="mode-options">
                    <div class="mode-option ${this.data.mode === 'random' ? 'selected' : ''}" data-mode="random" onclick="app.guidedCreationFlow.selectMode('random')">
                        <h3>随机模式</h3>
                        <p>掷骰决定角色属性，体验命运的安排</p>
                    </div>
                    <div class="mode-option ${this.data.mode === 'point-buy' ? 'selected' : ''}" data-mode="point-buy" onclick="app.guidedCreationFlow.selectMode('point-buy')">
                        <h3>购点模式</h3>
                        <p>45点自由分配，精细控制角色构建</p>
                    </div>
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

// 能力起源步骤
class OriginSelectionStep extends Step {
    render() {
        const origins = [
            { id: 'trained', name: '受训', description: '通过严格训练获得能力' },
            { id: 'altered', name: '改造', description: '通过实验或事故获得能力' },
            { id: 'mutant', name: '变种', description: '天生具有特殊能力' },
            { id: 'alien', name: '外星', description: '来自其他星球的能力' },
            { id: 'magic', name: '魔法', description: '通过魔法获得能力' },
            { id: 'tech', name: '科技', description: '通过高科技装备获得能力' }
        ];

        return `
            <div class="step-content">
                <h2>选择能力起源</h2>
                <div class="origin-options">
                    ${origins.map(origin => `
                        <div class="origin-option ${this.data.origin === origin.id ? 'selected' : ''}" data-origin="${origin.id}" onclick="app.guidedCreationFlow.selectOrigin('${origin.id}')">
                            <h3>${origin.name}</h3>
                            <p>${origin.description}</p>
                        </div>
                    `).join('')}
                </div>

            </div>
        `;
    }

    validate() {
        return this.data.origin !== undefined;
    }

    saveData() {
        return { origin: this.data.origin };
    }
}

// 基础属性步骤
class AttributesStep extends Step {
    render() {
        const attributes = {
            brawn: '勇猛',
            coordination: '协调',
            strength: '力量',
            intellect: '智力',
            awareness: '感知',
            willpower: '意志'
        };

        return `
            <div class="step-content">
                <h2>分配基础属性</h2>
                <div class="attributes-grid">
                    ${Object.entries(attributes).map(([key, name]) => `
                        <div class="attribute-item">
                            <label>${name}</label>
                            <div class="attribute-controls">
                                <button class="btn-step" onclick="app.guidedCreationFlow.adjustAttribute('${key}', -1)">-</button>
                                <span class="attribute-value">${this.data.attributes?.[key] || 0}</span>
                                <button class="btn-step" onclick="app.guidedCreationFlow.adjustAttribute('${key}', 1)">+</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

            </div>
        `;
    }

    validate() {
        if (!this.data.attributes) return false;
        const attrSum = Object.values(this.data.attributes).reduce((sum, val) => sum + val, 0);
        return attrSum >= 20;
    }

    saveData() {
        return { attributes: this.data.attributes };
    }
}

// 超凡能力步骤
class PowersStep extends Step {
    render() {
        return `
            <div class="step-content">
                <h2>选择超凡能力</h2>
                <div class="powers-container">
                    <div class="powers-list">
                        ${(this.data.powers || []).map((power, index) => `
                            <div class="power-item">
                                <span>${power.name} (Lv${power.level})</span>
                                <button class="btn-icon-del" onclick="app.guidedCreationFlow.removePower(${index})")">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary" onclick="app.guidedCreationFlow.openAddPowerModal()">添加能力</button>
                </div>

            </div>
        `;
    }

    validate() {
        return true;
    }

    saveData() {
        return { powers: this.data.powers || [] };
    }
}

// 生活专长步骤
class SpecialtiesStep extends Step {
    render() {
        return `
            <div class="step-content">
                <h2>选择生活专长</h2>
                <div class="specialties-container">
                    <div class="specialties-list">
                        ${(this.data.specialties || []).map((specialty, index) => `
                            <div class="specialty-item">
                                <span>${specialty.name} (${specialty.level}级)</span>
                                <button class="btn-icon-del" onclick="app.guidedCreationFlow.removeSpecialty(${index})")">✕</button>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-secondary" onclick="app.guidedCreationFlow.openAddSpecialtyModal()">添加专长</button>
                </div>

            </div>
        `;
    }

    validate() {
        return true;
    }

    saveData() {
        return { specialties: this.data.specialties || [] };
    }
}

// 角色信息步骤
class CharacterInfoStep extends Step {
    render() {
        return `
            <div class="step-content">
                <h2>填写角色信息</h2>
                <div class="info-form">
                    <div class="form-group">
                        <label>角色名称</label>
                        <input type="text" value="${this.data.name || ''}" oninput="app.guidedCreationFlow.updateInfo('name', this.value)" placeholder="输入角色名称">
                    </div>
                    <div class="form-group">
                        <label>身份</label>
                        <input type="text" value="${this.data.identity || ''}" oninput="app.guidedCreationFlow.updateInfo('identity', this.value)" placeholder="输入角色身份">
                    </div>
                    <div class="form-group">
                        <label>动机</label>
                        <input type="text" value="${this.data.motivation || ''}" oninput="app.guidedCreationFlow.updateInfo('motivation', this.value)" placeholder="输入角色动机">
                    </div>
                    <div class="form-group">
                        <label>描述</label>
                        <textarea oninput="app.guidedCreationFlow.updateInfo('description', this.value)" placeholder="输入角色描述">${this.data.description || ''}</textarea>
                    </div>
                </div>
            </div>
        `;
    }

    validate() {
        return this.data.name && this.data.name.trim() !== '';
    }

    saveData() {
        return {
            name: this.data.name,
            identity: this.data.identity,
            motivation: this.data.motivation,
            description: this.data.description
        };
    }
}

// 预览保存步骤
class PreviewStep extends Step {
    render() {
        const character = this.flow.characterData;
        const attributeNames = {
            brawn: '勇猛',
            coordination: '协调',
            strength: '力量',
            intellect: '智力',
            awareness: '感知',
            willpower: '意志'
        };
        
        return `
            <div class="step-content">
                <h2>角色预览</h2>
                <div class="character-preview">
                    <div class="preview-section">
                        <h3>基本信息</h3>
                        <p>名称: ${character.name || '未设置'}</p>
                        <p>身份: ${character.identity || '未设置'}</p>
                        <p>动机: ${character.motivation || '未设置'}</p>
                        <p>起源: ${character.origin || '未设置'}</p>
                        <p>模式: ${character.mode === 'random' ? '随机模式' : '购点模式'}</p>
                    </div>
                    <div class="preview-section">
                        <h3>属性</h3>
                        ${Object.entries(character.attributes || {}).map(([key, value]) => 
                            `<p>${attributeNames[key] || key}: ${value}</p>`
                        ).join('')}
                    </div>
                    <div class="preview-section">
                        <h3>能力</h3>
                        ${(character.powers || []).length > 0 ? 
                            (character.powers || []).map(power => 
                                `<p>${power.name} (Lv${power.level})</p>`
                            ).join('') : 
                            '<p>暂无能力</p>'
                        }
                    </div>
                    <div class="preview-section">
                        <h3>专长</h3>
                        ${(character.specialties || []).length > 0 ? 
                            (character.specialties || []).map(specialty => 
                                `<p>${specialty.name} (${specialty.level}级)</p>`
                            ).join('') : 
                            '<p>暂无专长</p>'
                        }
                    </div>
                    <div class="preview-section">
                        <h3>描述</h3>
                        <p>${character.description || '未设置'}</p>
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="btn btn-primary" onclick="app.guidedCreationFlow.saveCharacter()">保存角色</button>
                    <button class="btn btn-secondary" onclick="app.guidedCreationFlow.exportCharacter()">导出角色</button>
                    ${this.flow.editingCharacterId ? `
                        <button class="btn btn-danger" onclick="app.guidedCreationFlow.deleteCharacter()">删除角色</button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    validate() {
        return true;
    }

    saveData() {
        return {};
    }
}

// 添加辅助方法
GuidedCreationFlow.prototype.selectMode = function(mode) {
    this.characterData.mode = mode;
    this.renderCurrentStep();
};

GuidedCreationFlow.prototype.selectOrigin = function(origin) {
    this.characterData.origin = origin;
    this.renderCurrentStep();
};

GuidedCreationFlow.prototype.adjustAttribute = throttle(function(key, delta) {
    if (!this.characterData.attributes) {
        this.characterData.attributes = {
            brawn: 1,
            coordination: 1,
            strength: 1,
            intellect: 1,
            awareness: 1,
            willpower: 1
        };
    }
    const currentValue = this.characterData.attributes[key];
    const newValue = Math.max(1, Math.min(10, currentValue + delta));
    this.characterData.attributes[key] = newValue;
    this.renderCurrentStep();
}, 100);

GuidedCreationFlow.prototype.openAddPowerModal = function() {
    const allPowers = getAllPowers();
    openModal({
        title: '添加特殊能力',
        content: `
            <div class="add-power-modal">
                <select id="modal-power-select">
                    ${allPowers.map(p => `<option value="${p.categoryId}|${p.name}">${p.categoryName}: ${p.name}</option>`).join('')}
                </select>
                <div class="form-group">
                    <label>能力等级</label>
                    <input type="number" id="modal-power-level" value="1" min="1" max="10">
                </div>
            </div>
        `,
        footer: `<button class="btn btn-primary" onclick="app.guidedCreationFlow.confirmAddPower()">确认添加</button>`
    });
};

GuidedCreationFlow.prototype.confirmAddPower = function() {
    const val = document.getElementById('modal-power-select').value;
    const level = parseInt(document.getElementById('modal-power-level').value);
    
    // 严格验证输入
    if (!val) {
        errorHandler.showError('请选择一个能力');
        return;
    }
    
    if (isNaN(level) || level < 1 || level > 10) {
        errorHandler.showError('能力等级必须在 1-10 之间');
        return;
    }
    
    const [cat, name] = val.split('|');
    
    // 验证能力名称长度
    if (name.length > 50) {
        errorHandler.showError('能力名称过长');
        return;
    }
    
    if (!this.characterData.powers) {
        this.characterData.powers = [];
    }
    
    // 防止重复添加相同能力
    const existingPower = this.characterData.powers.find(power => power.name === name);
    if (existingPower) {
        errorHandler.showError('该能力已经添加过了');
        return;
    }
    
    // 清理数据
    const sanitizedName = sanitizeInput(name);
    const sanitizedCat = sanitizeInput(cat);
    
    this.characterData.powers.push({ name: sanitizedName, category: sanitizedCat, level });
    this.renderCurrentStep();
    closeModal();
    errorHandler.showSuccess('能力添加成功！');
};

GuidedCreationFlow.prototype.openAddSpecialtyModal = function() {
    const list = getSpecialtiesList();
    openModal({
        title: '添加专长',
        content: `
            <div class="add-spec-modal">
                <select id="modal-spec-select">
                    ${list.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
                </select>
                <div class="form-group">
                    <label>专长等级</label>
                    <select id="modal-spec-level">
                        <option value="1">1级 (基础)</option>
                        <option value="2">2级 (专家)</option>
                        <option value="3">3级 (大师)</option>
                    </select>
                </div>
            </div>
        `,
        footer: `<button class="btn btn-primary" onclick="app.guidedCreationFlow.confirmAddSpecialty()">确认添加</button>`
    });
};

GuidedCreationFlow.prototype.confirmAddSpecialty = function() {
    const val = document.getElementById('modal-spec-select').value;
    const level = parseInt(document.getElementById('modal-spec-level').value);
    
    // 严格验证输入
    if (!val) {
        errorHandler.showError('请选择一个专长');
        return;
    }
    
    if (isNaN(level) || level < 1 || level > 3) {
        errorHandler.showError('专长等级必须在 1-3 之间');
        return;
    }
    
    // 验证专长名称长度
    if (val.length > 30) {
        errorHandler.showError('专长名称过长');
        return;
    }
    
    if (!this.characterData.specialties) {
        this.characterData.specialties = [];
    }
    
    // 防止重复添加相同专长
    const existingSpecialty = this.characterData.specialties.find(specialty => specialty.name === val);
    if (existingSpecialty) {
        errorHandler.showError('该专长已经添加过了');
        return;
    }
    
    // 清理数据
    const sanitizedName = sanitizeInput(val);
    
    this.characterData.specialties.push({ name: sanitizedName, level });
    this.renderCurrentStep();
    closeModal();
    errorHandler.showSuccess('专长添加成功！');
};

GuidedCreationFlow.prototype.removePower = function(index) {
    if (this.characterData.powers) {
        this.characterData.powers.splice(index, 1);
        this.renderCurrentStep();
    }
};

GuidedCreationFlow.prototype.removeSpecialty = function(index) {
    if (this.characterData.specialties) {
        this.characterData.specialties.splice(index, 1);
        this.renderCurrentStep();
    }
};

GuidedCreationFlow.prototype.updateInfo = debounce(function(key, value) {
    // 对输入进行安全处理
    this.characterData[key] = sanitizeInput(value);
    // 可以在这里添加实时预览或其他操作
}, 300);

export { GuidedCreationFlow };