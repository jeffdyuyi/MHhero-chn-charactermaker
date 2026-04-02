/**
 * 角色创建流程模块 - 一页式竖版极简版
 * 将所有编辑功能集成在单张角色卡内，实时响应
 */

import {
    getPowerDescription,
    getAllPowers,
    getPowerCategoryById,
    POWERS
} from '../data/powers.js';

import { formatOriginMechanics, ORIGINS } from '../data/origins.js';
import { getSpecialtiesList } from '../data/specialties.js';
import { getAttributeKeys } from '../data/attributes.js';
import { POINT_BUY_CONFIG } from '../data/index.js';
import { CharacterGenerator } from '../core/character.js';
import { showSuccess, showError, showInfo } from './toast.js';
import { saveCharacter, exportCharacterAsImage } from '../core/storage.js';
import { openModal, closeModal } from './modal.js';
import { POWER_EXTRAS, POWER_FLAWS } from '../data/modifiers.js';

const ATTRIBUTE_NAMES = {
    brawn: '勇猛',
    coordination: '协调',
    strength: '力量',
    intellect: '智力',
    awareness: '感知',
    willpower: '意志'
};

export class CreationFlow {
    constructor(app) {
        this.app = app;
        this.creationMode = 'random';
        this.characterGenerator = null;
        this.isCreating = false;
        this.editingCharacterId = null;
        this.currentStep = 1; // 当前步骤
        this.totalSteps = 5; // 总步骤数
        this.completedSteps = [false, false, false, false, false]; // 记录各步骤是否完成

        this.init();
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 限制 1MB
            showError('头像文件过大，请选择 1MB 以内的图片。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            this.characterGenerator.character.avatar = base64;
            this.renderFullSheet();
            showSuccess('头像已上传！');
        };
        reader.readAsDataURL(file);
    }

    init() {
        // 全局初始化
    }

    start(editingId = null) {
        this.creationMode = 'random';
        this.isCreating = true;
        this.editingCharacterId = editingId;

        // 初始化生成器
        this.characterGenerator = new CharacterGenerator('random');

        if (editingId) {
            const char = this.app.getCharacterById(editingId);
            if (char) this.characterGenerator.character = JSON.parse(JSON.stringify(char));
        } else {
            // 只生成基础结构，不生成具体内容
            this.characterGenerator.character = {
                name: '',
                description: '',
                qualities: ['', '', ''],
                origin: null,
                attributes: {
                    brawn: 0,
                    coordination: 0,
                    strength: 0,
                    intellect: 0,
                    awareness: 0,
                    willpower: 0
                },
                powers: [],
                specialties: [],
                equipment: [],
                stamina: 0,
                resolve: 0,
                originChoices: {},
                mode: 'random',
                id: Date.now(),
                createdAt: new Date().toISOString()
            };
        }

        this.renderFullSheet();
    }

    renderFullSheet() {
        const container = document.getElementById('character-sheet');
        if (!container) return;

        try {
            const char = this.characterGenerator.getCharacter();

            // 清空并渲染当前步骤的内容
            container.innerHTML = '';

            // 渲染步骤导航
            container.innerHTML += this.renderStepNavigation();

            // 根据当前步骤渲染对应内容
            let sectionContent = '';
            switch (this.currentStep) {
                case 1:
                    sectionContent = this.renderOriginSection(char) + this.renderCombatSection(char);
                    break;
                case 2:
                    sectionContent = this.renderAttributesSection(char);
                    break;
                case 3:
                    sectionContent = this.renderPowersSection(char);
                    break;
                case 4:
                    sectionContent = this.renderSpecialtiesSection(char) + this.renderEquipmentSection(char);
                    break;
                case 5:
                    sectionContent = this.renderIdentitySection(char) + this.renderBioSection(char);
                    break;
            }

            container.innerHTML += sectionContent;

            // 重新绑定可能的动态事件或初始化提示
            this.initPowerTooltips();
        } catch (error) {
            console.error('Rendering failed:', error);
            showError('同步角色档案时遇到技术故障，请重新载入。');
        }
    }

    renderStepNavigation() {
        return `
            <div class="step-navigation">
                <div class="step-indicators">
                    ${Array.from({ length: this.totalSteps }, (_, i) => {
                        const step = i + 1;
                        const isClickable = step === this.currentStep || this.completedSteps[step - 1];
                        return `
                            <div class="step-indicator ${step === this.currentStep ? 'active' : step < this.currentStep ? 'completed' : ''} ${!isClickable ? 'disabled' : ''}" ${isClickable ? `onclick="app.creationFlow.goToStep(${step})"` : ''}>
                                ${step < this.currentStep ? '✓' : step}
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="step-buttons">
                    <button class="btn btn-secondary ${this.currentStep === 1 ? 'disabled' : ''}" onclick="app.creationFlow.prevStep()" ${this.currentStep === 1 ? 'disabled' : ''}>
                        ← 上一步
                    </button>
                    <button class="btn btn-primary ${this.currentStep === this.totalSteps ? 'disabled' : ''}" onclick="app.creationFlow.nextStep()" ${this.currentStep === this.totalSteps ? 'disabled' : ''}>
                        下一步 →
                    </button>
                </div>
            </div>
        `;
    }

    goToStep(step) {
        // 只允许访问当前步骤或已完成的步骤
        if (step >= 1 && step <= this.totalSteps && (step === this.currentStep || this.completedSteps[step - 1])) {
            this.currentStep = step;
            this.renderFullSheet();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.renderFullSheet();
        }
    }

    nextStep() {
        // 检查当前步骤是否完成
        if (!this.isStepCompleted()) {
            showInfo('请先完成当前步骤的内容');
            return;
        }
        
        if (this.currentStep < this.totalSteps) {
            // 标记当前步骤为已完成
            this.completedSteps[this.currentStep - 1] = true;
            this.currentStep++;
            this.renderFullSheet();
        }
    }

    isStepCompleted() {
        const char = this.characterGenerator.getCharacter();
        switch (this.currentStep) {
            case 1: // 起源
                return char.origin !== null;
            case 2: // 属性
                return Object.values(char.attributes).every(val => val > 0);
            case 3: // 能力
                return char.powers.length > 0;
            case 4: // 专长
                return char.specialties.length > 0;
            case 5: // 英雄信息
                return char.name && char.qualities.some(q => q);
            default:
                return true;
        }
    }

    initPowerTooltips() {
        // 后续可以通过 Tippy.js 或自定义实现更酷的提示，目前使用原生 title 的增强版
    }

    renderIdentitySection(char) {
        return `
            <div class="sheet-section section-identity">
                <div class="step-num">STEP 1</div>
                <div class="identity-layout">
                    <div class="avatar-upload-container">
                        <div class="avatar-preview" id="avatar-preview-box" onclick="document.getElementById('avatar-input').click()">
                            ${char.avatar ? `<img src="${char.avatar}" alt="Avatar">` : '<span class="avatar-placeholder">上传头像</span>'}
                        </div>
                        <input type="file" id="avatar-input" hidden accept="image/*" onchange="app.creationFlow.handleAvatarUpload(event)">
                    </div>
                    <div class="identity-header">
                        <input type="text" id="sheet-name" value="${char.name || ''}" 
                               oninput="app.creationFlow.updateBasicInfo('name', this.value)" 
                               placeholder="输入英雄代号 (NAME)...">
                    </div>
                </div>
                <div class="qualities-grid">
                    <div class="q-box">
                        <label>身份 (IDENTITY)</label>
                        <input type="text" value="${char.qualities[0] || ''}" 
                               oninput="app.creationFlow.updateQuality(0, this.value)" placeholder="如：退役特工">
                    </div>
                    <div class="q-box">
                        <label>动机 (MOTIVATION)</label>
                        <input type="text" value="${char.qualities[1] || ''}" 
                               oninput="app.creationFlow.updateQuality(1, this.value)" placeholder="如：寻找真相">
                    </div>
                    <div class="q-box">
                        <label>羁绊 (BOND)</label>
                        <input type="text" value="${char.qualities[2] || ''}" 
                               oninput="app.creationFlow.updateQuality(2, this.value)" placeholder="如：唯一的伙伴">
                    </div>
                </div>
            </div>
        `;
    }

    renderCombatSection(char) {
        return `
            <div class="sheet-section section-combat">
                <div class="step-num">CORE</div>
                <div class="combat-grid">
                    <div class="combat-main-box">
                        <div class="c-stat">
                            <span class="label">耐力 (STAMINA)</span>
                            <span class="val large">${char.stamina}</span>
                        </div>
                        <div class="c-stat">
                            <span class="label">决意 (RESOLVE)</span>
                            <span class="val large">${char.resolve}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderOriginSection(char) {
        return `
            <div class="sheet-section section-origin">
                <div class="step-num">STEP 2</div>
                <div class="panel-header">
                    <h3>能力起源 (ORIGIN)</h3>
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollOrigin()">🎲 随机生成</button>
                </div>
                <div class="origin-display">
                    <div class="origin-type-card">
                        <span class="badge badge-primary">${char.origin?.name || '未知'}</span>
                        <p class="origin-desc">${char.origin?.description || '起源定义了角色的能力背景和潜力。'}</p>
                    </div>
                    ${this.renderOriginMechanicsConfig(char)}
                </div>
            </div>
        `;
    }

    renderAttributesSection(char) {
        return `
            <div class="sheet-section section-attributes">
                <div class="step-num">STEP 3</div>
                <div class="panel-header">
                    <h3>关键属性 (ATTRIBUTES)</h3>
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollAttributes()">🎲 随机生成</button>
                </div>
                <div class="attributes-stack">
                    ${getAttributeKeys().map(key => this.renderAttributeItem(key, char.attributes[key])).join('')}
                </div>
            </div>
        `;
    }

    renderPowersSection(char) {
        return `
            <div class="sheet-section section-powers">
                <div class="step-num">STEP 4</div>
                <div class="panel-header">
                    <h3>超凡能力 (POWERS)</h3>
                    <div class="p-actions">
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollPowers()">🎲 随机生成</button>
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddPowerModal()">➕ 手动添加</button>
                    </div>
                </div>
                <div class="powers-stack">
                    ${char.powers.length > 0 ? char.powers.map((p, i) => this.renderPowerItem(p, i)).join('') : '<div class="empty-hint">暂未获得超常能力...</div>'}
                </div>
            </div>
        `;
    }

    renderSpecialtiesSection(char) {
        return `
            <div class="sheet-section section-specialties">
                <div class="step-num">STEP 5</div>
                <div class="panel-header">
                    <h3>生活专长 (SPECIALTIES)</h3>
                    <div class="s-actions">
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollSpecialties()">🎲 随机生成</button>
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddSpecialtyModal()">➕ 手动添加</button>
                    </div>
                </div>
                <div class="specialties-flex">
                    ${char.specialties.length > 0 ? char.specialties.map((s, i) => this.renderSpecialtyItem(s, i)).join('') : '<div class="empty-hint">暂无特殊生活专长...</div>'}
                </div>
            </div>
        `;
    }

    renderBioSection(char) {
        return `
            <div class="sheet-section section-bio">
                 <div class="bio-container">
                    <label>英雄档案说明 (BIOGRAPHY)</label>
                    <textarea oninput="app.creationFlow.updateBasicInfo('description', this.value)" 
                              placeholder="在正义被召唤时，这里将记述你的故事...">${char.description || ''}</textarea>
                 </div>
            </div>
        `;
    }

    renderEquipmentSection(char) {
        const eqList = char.equipment || [];
        return `
            <div class="sheet-section section-equipment">
                <div class="step-num">GEAR</div>
                <div class="panel-header">
                    <h3>装备与装置 (EQUIPMENT)</h3>
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddEquipmentModal()">➕ 添加装备</button>
                </div>
                <div class="equipment-list">
                    ${eqList.length > 0 ? eqList.map(item => `
                        <div class="eq-item-card">
                            <div class="eq-info" onclick="app.creationFlow.openEditEquipmentModal('${item.instanceId}')">
                                <span class="eq-name">${item.name}</span>
                                <span class="eq-cat">(${item.categoryName})</span>
                                <p class="eq-desc">${item.description || ''}</p>
                                <div class="eq-stats-row">
                                    ${item.level ? `<span class="eq-stat">LV ${item.level}</span>` : ''}
                                    ${item.speed ? `<span class="eq-stat">SPD ${item.speed}</span>` : ''}
                                    ${item.body ? `<span class="eq-stat">BODY ${item.body}</span>` : ''}
                                    ${item.handling ? `<span class="eq-stat">OP ${item.handling}</span>` : ''}
                                    ${item.armor ? `<span class="eq-stat">ARMOR ${item.armor}</span>` : ''}
                                </div>
                            </div>
                            <div class="eq-controls">
                                <button class="btn-icon-del" onclick="app.creationFlow.openEditEquipmentModal('${item.instanceId}')">✎</button>
                                <button class="btn-icon-del" onclick="app.creationFlow.removeEquipment('${item.instanceId}')">✕</button>
                            </div>
                        </div>
                    `).join('') : '<div class="empty-hint">尚未携带任何装备...</div>'}
                </div>
            </div>
        `;
    }

    renderAttributeItem(key, val) {
        return `
            <div class="attr-row">
                <span class="attr-name">${ATTRIBUTE_NAMES[key]}</span>
                <div class="attr-value-box">
                    <span class="val">${val}</span>
                </div>
            </div>
        `;
    }

    renderPowerItem(power, index) {
        const desc = getPowerDescription(power.name) || '暂无详细说明';
        return `
            <div class="power-panel-card" title="${desc.replace(/"/g, '&quot;')}">
                <div class="card-top">
                    <span class="p-name" onclick="app.showPowerDetail('${power.name}')">${power.name}</span>
                    <span class="p-cat">(${power.category})</span>
                    <div class="p-controls">
                        <span class="p-level">Lvl ${power.level}</span>
                        <button class="btn-icon-del" onclick="app.creationFlow.removePower(${index})">✕</button>
                    </div>
                </div>
                <div class="p-mods">
                    <div class="mod-list">
                        ${power.extras.map(e => `<span class="tag extra" onclick="app.creationFlow.removeModifier(${index}, 'extra', '${e.id}')">${e.name}</span>`).join('')}
                        ${power.flaws.map(f => `<span class="tag flaw" onclick="app.creationFlow.removeModifier(${index}, 'flaw', '${f.id}')">${f.name}</span>`).join('')}
                        <button class="btn-add-tag" onclick="app.creationFlow.openModifierModal(${index})">+</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSpecialtyItem(specialty, index) {
        const levels = { 1: '基础', 2: '专家', 3: '大师' };
        return `
            <div class="spec-tag-card">
                <span class="s-name">${specialty.name}</span>
                <span class="s-level">${levels[specialty.level]}</span>
                <button class="btn-icon-del" onclick="app.creationFlow.removeSpecialty(${index})">✕</button>
            </div>
        `;
    }

    renderOriginMechanicsConfig(char) {
        if (!char.origin || !char.origin.mechanics) return '';
        const mech = char.origin.mechanics;
        let html = '<div class="origin-config-row">';

        if (mech.choice === 'power_or_boost') {
            html += `
                <select onchange="app.creationFlow.handleMutantChoice(this.value)">
                    <option value="power" ${char.originChoices.mutantChoice === 'power' ? 'selected' : ''}>起源奖励：额外能力</option>
                    <option value="boost" ${char.originChoices.mutantChoice === 'boost' ? 'selected' : ''}>起源奖励：属性增幅 (+2)</option>
                </select>
            `;
        }

        if (mech.statBoost?.target === 'any' || (mech.choice === 'power_or_boost' && char.originChoices.mutantChoice === 'boost')) {
            html += `
                <select onchange="app.creationFlow.setOriginChoice('statBoost', this.value)">
                    <option value="">选择增幅属性</option>
                    ${getAttributeKeys().map(k => `<option value="${k}" ${char.originChoices.statBoost === k ? 'selected' : ''}>${ATTRIBUTE_NAMES[k]}</option>`).join('')}
                </select>
            `;
        }

        if (mech.guaranteedPower === '维系生命') {
            html += `
                <div class="origin-exchange-notice">
                    获得「维系生命」能力。
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.sacrificePowerForLifeSupport()">舍弃一项能力提升至10级</button>
                </div>
            `;
        }

        if (mech.optionalExchange === 'power_for_specialties_plus_2') {
            html += `
                <div class="origin-exchange-notice">
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.sacrificePowerForSpecialties()">用1项能力交换2项额外专长</button>
                </div>
            `;
        }

        if (mech.optionalExchange === 'double_roll_origins') {
            html += `
                <div class="origin-exchange-notice">
                    <button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollAlienOrigins()">选择随机双起源 (替代+2加成)</button>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    // 更新信息
    updateBasicInfo(key, val) {
        this.characterGenerator.character[key] = val;
        // 检查英雄信息步骤是否完成
        if (this.currentStep === 5) {
            this.completedSteps[4] = this.isStepCompleted();
        }
    }

    updateQuality(index, val) {
        this.characterGenerator.character.qualities[index] = val;
        // 检查英雄信息步骤是否完成
        if (this.currentStep === 5) {
            this.completedSteps[4] = this.isStepCompleted();
        }
    }

    // 重新掷骰
    rerollOrigin() {
        this.characterGenerator.generateOrigin();
        this.renderFullSheet();
        // 标记起源步骤为已完成
        this.completedSteps[0] = true;
    }

    rerollAttributes() {
        this.characterGenerator.generateAttributes();
        this.renderFullSheet();
        // 标记属性步骤为已完成
        this.completedSteps[1] = true;
    }

    rerollPowers() {
        this.characterGenerator.generatePowers();
        this.renderFullSheet();
        // 标记能力步骤为已完成
        this.completedSteps[2] = true;
    }

    rerollSpecialties() {
        this.characterGenerator.generateSpecialties();
        this.renderFullSheet();
        // 标记专长步骤为已完成
        this.completedSteps[3] = true;
    }



    removePower(index) {
        if (this._pendingExchange) {
            if (this._pendingExchange === 'life_support') {
                const ls = this.characterGenerator.character.powers.find(p => p.name === '维系生命');
                if (ls) ls.level = 10;
                showSuccess('已舍弃能力，维系生命升至10级！');
            } else if (this._pendingExchange === 'specialties') {
                this.characterGenerator.generateSpecialties(2); // 额外加2项
                showSuccess('已舍弃能力，获得2项额外专长！');
            }
            this._pendingExchange = null;
        }
        this.characterGenerator.removePower(index);
        this.renderFullSheet();
    }

    removeSpecialty(index) {
        this.characterGenerator.removeSpecialty(index);
        this.renderFullSheet();
    }

    openAddPowerModal() {
        const allPowers = getAllPowers();
        openModal({
            title: '添加特殊能力',
            content: `
                <div class="add-power-modal">
                    <select id="modal-power-select">
                        ${allPowers.map(p => `<option value="${p.categoryId}|${p.name}">${p.categoryName}: ${p.name}</option>`).join('')}
                    </select>
                </div>
            `,
            footer: `<button class="btn btn-primary" onclick="app.creationFlow.confirmAddPower()">确认添加</button>`
        });
    }

    confirmAddPower() {
        const val = document.getElementById('modal-power-select').value;
        if (val) {
            const [cat, name] = val.split('|');
            this.characterGenerator.addPower(cat, name);
            this.renderFullSheet();
            closeModal();
        }
    }

    openAddSpecialtyModal() {
        const list = getSpecialtiesList();
        openModal({
            title: '添加专长',
            content: `
                <div class="add-spec-modal">
                    <select id="modal-spec-select">
                        ${list.map(s => `<option value="${s.value}">${s.label}</option>`).join('')}
                    </select>
                </div>
            `,
            footer: `<button class="btn btn-primary" onclick="app.creationFlow.confirmAddSpecialty()">确认添加</button>`
        });
    }

    confirmAddSpecialty() {
        const val = document.getElementById('modal-spec-select').value;
        if (val) {
            this.characterGenerator.addSpecialty(val);
            this.renderFullSheet();
            closeModal();
        }
    }

    openModifierModal(powerIndex) {
        const power = this.characterGenerator.character.powers[powerIndex];
        openModal({
            title: `为能力「${power.name}」配置修饰`,
            content: `
                <div class="mod-modal-grid">
                    <div class="mod-group">
                        <h5>✅ 额外增益 (Extras)</h5>
                        <p class="group-hint">增强能力的效果，但会增加点数成本。</p>
                        <div class="mod-list">
                            ${POWER_EXTRAS.map(e => `
                                <button class="btn-mod-pick extra" onclick="app.creationFlow.applyMod(${powerIndex}, 'extra', '${e.id}')">
                                    <span class="m-name">${e.name}</span>
                                    <span class="m-cost">${e.cost}</span>
                                    <small class="m-desc">${e.description}</small>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="mod-group">
                        <h5>⚠️ 能力限制 (Flaws)</h5>
                        <p class="group-hint">限制能力的发挥，可以返还点数用于其他方面。</p>
                        <div class="mod-list">
                            ${POWER_FLAWS.map(f => `
                                <button class="btn-mod-pick flaw" onclick="app.creationFlow.applyMod(${powerIndex}, 'flaw', '${f.id}')">
                                    <span class="m-name">${f.name}</span>
                                    <span class="m-cost">${f.cost}</span>
                                    <small class="m-desc">${f.description}</small>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `
        });
    }

    applyMod(pIndex, type, modId) {
        try {
            const mod = (type === 'extra' ? POWER_EXTRAS : POWER_FLAWS).find(m => m.id === modId);
            this.characterGenerator.addPowerModifier(pIndex, type, mod);
            this.renderFullSheet();
        } catch (error) {
            console.error('Modifier application failed:', error);
            showError('添加修饰项时出错，请重试。');
        } finally {
            closeModal();
        }
    }

    removeModifier(pIndex, type, modId) {
        this.characterGenerator.removePowerModifier(pIndex, type, modId);
        this.renderFullSheet();
    }

    handleMutantChoice(val) {
        this.characterGenerator.setOriginChoice('mutantChoice', val);
        // 随机模式下重新生成一次能力列表，确保数量正确
        if (val === 'power' && this.creationMode === 'random') {
            this.characterGenerator.generatePowers();
        }
        this.renderFullSheet();
    }

    setOriginChoice(type, val) {
        this.characterGenerator.setOriginChoice(type, val);
        this.renderFullSheet();
    }

    openAddEquipmentModal() {
        const allEq = window.getAllEquipment();
        openModal({
            title: '从资料库添加装备/载具',
            content: `
                <div class="add-eq-modal">
                    <p class="group-hint">选择预设模板，添加后可进行自定义修改</p>
                    <select id="modal-eq-select" class="full-width">
                        ${allEq.map(e => `<option value="${e.id}">${e.categoryName}: ${e.name}</option>`).join('')}
                    </select>
                </div>
            `,
            footer: `<button class="btn btn-primary" onclick="app.creationFlow.confirmAddEquipment()">确认添加</button>`
        });
    }

    openEditEquipmentModal(instanceId) {
        const char = this.characterGenerator.character;
        const item = char.equipment.find(e => e.instanceId === instanceId);
        if (!item) return;

        openModal({
            title: '自定义装备信息',
            content: `
                <div class="edit-eq-modal">
                    <div class="form-group">
                        <label>装备名称</label>
                        <input type="text" id="edit-eq-name" value="${item.name}" class="full-width">
                    </div>
                    <div class="form-group">
                        <label>描述与备注</label>
                        <textarea id="edit-eq-desc" class="full-width" style="height: 80px;">${item.description || ''}</textarea>
                    </div>
                    <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group">
                            <label>等级 (Level)</label>
                            <input type="number" id="edit-eq-level" value="${item.level || 0}" class="full-width">
                        </div>
                        <div class="form-group">
                            <label>速度 (Speed)</label>
                            <input type="number" id="edit-eq-speed" value="${item.speed || 0}" class="full-width">
                        </div>
                        <div class="form-group">
                            <label>构造 (Body)</label>
                            <input type="number" id="edit-eq-body" value="${item.body || 0}" class="full-width">
                        </div>
                        <div class="form-group">
                            <label>操控 (Handling)</label>
                            <input type="number" id="edit-eq-handling" value="${item.handling || 0}" class="full-width">
                        </div>
                        <div class="form-group">
                            <label>护甲 (Armor)</label>
                            <input type="number" id="edit-eq-armor" value="${item.armor || 0}" class="full-width">
                        </div>
                    </div>
                </div>
            `,
            footer: `<button class="btn btn-primary" onclick="app.creationFlow.confirmEditEquipment('${instanceId}')">保存修改</button>`
        });
    }

    confirmEditEquipment(instanceId) {
        const newData = {
            name: document.getElementById('edit-eq-name').value,
            description: document.getElementById('edit-eq-desc').value,
            level: parseInt(document.getElementById('edit-eq-level').value) || 0,
            speed: parseInt(document.getElementById('edit-eq-speed').value) || 0,
            body: parseInt(document.getElementById('edit-eq-body').value) || 0,
            handling: parseInt(document.getElementById('edit-eq-handling').value) || 0,
            armor: parseInt(document.getElementById('edit-eq-armor').value) || 0
        };

        this.characterGenerator.updateEquipment(instanceId, newData);
        this.renderFullSheet();
        closeModal();
    }

    confirmAddEquipment() {
        const id = document.getElementById('modal-eq-select').value;
        if (id) {
            this.characterGenerator.addEquipment(id);
            this.renderFullSheet();
            closeModal();
        }
    }

    removeEquipment(instanceId) {
        this.characterGenerator.removeEquipment(instanceId);
        this.renderFullSheet();
    }

    sacrificePowerForLifeSupport() {
        showInfo('请在能力列表中点击 ✕ 舍弃一项能力，系统将自动升级维系生命。');
        this._pendingExchange = 'life_support';
    }

    sacrificePowerForSpecialties() {
        showInfo('请在能力列表中点击 ✕ 舍弃一项能力，系统将为您增加2项随机专长。');
        this._pendingExchange = 'specialties';
    }

    saveCurrentCharacter() {
        const char = this.characterGenerator.getCharacter();
        if (!char.name) {
            showError('请输入英雄名称后再保存！');
            return;
        }
        if (saveCharacter(char)) {
            showSuccess(`英雄 "${char.name}" 已保存至名录！`);
            this.app.savedCharactersView.loadCharacters();
            this.app.viewManager.switchView('saved');
        } else {
            showError('保存失败，请检查浏览器存储空间。');
        }
    }

    async exportAsImage() {
        const sheet = document.getElementById('character-sheet');
        if (!sheet) return;

        const char = this.characterGenerator.getCharacter();
        showInfo('正在生成英雄卡图片，请稍候...');

        try {
            await exportCharacterAsImage(sheet, char);
            showSuccess('英雄卡图片生成成功！数据已嵌入图片中。');
        } catch (error) {
            showError('生成图片失败，请重试。');
            console.error(error);
        }
    }
}
