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
import { saveCharacter } from '../core/storage.js';
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

        this.init();
    }

    init() {
        // 全局初始化
    }

    start(mode, editingId = null) {
        this.creationMode = mode;
        this.isCreating = true;
        this.editingCharacterId = editingId;

        // 初始化生成器
        this.characterGenerator = new CharacterGenerator(mode);

        if (editingId) {
            const char = this.app.getCharacterById(editingId);
            if (char) this.characterGenerator.character = JSON.parse(JSON.stringify(char));
        } else {
            if (mode === 'random') {
                this.characterGenerator.generateRandom();
            } else {
                this.characterGenerator.generatePointBuy();
            }
        }

        this.renderFullSheet();
        this.updateModeUI();
    }

    setMode(mode) {
        if (this.creationMode === mode) return;
        this.creationMode = mode;
        this.start(mode); // 切换模式即重置
    }

    updateModeUI() {
        const randomBtn = document.getElementById('mode-random-btn');
        const pointBuyBtn = document.getElementById('mode-pointbuy-btn');
        if (randomBtn && pointBuyBtn) {
            randomBtn.classList.toggle('btn-active', this.creationMode === 'random');
            pointBuyBtn.classList.toggle('btn-active', this.creationMode === 'point-buy');
        }
    }

    renderFullSheet() {
        const container = document.getElementById('character-sheet');
        if (!container) return;

        const char = this.characterGenerator.getCharacter();
        const isPB = this.creationMode === 'point-buy';

        container.innerHTML = `
            <!-- STEP 1: 英雄代号 & 核心特质 -->
            <div class="sheet-section section-identity">
                <div class="step-num">STEP 1</div>
                <div class="identity-header">
                    <input type="text" id="sheet-name" value="${char.name || ''}" 
                           oninput="app.creationFlow.updateBasicInfo('name', this.value)" 
                           placeholder="输入英雄代号 (NAME)...">
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

            <!-- STEP 2: 能力起源 -->
            <div class="sheet-section section-origin">
                <div class="step-num">STEP 2</div>
                <div class="panel-header">
                    <h3>能力起源 (ORIGIN)</h3>
                    ${!isPB ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollOrigin()">🎲 随机重骰</button>` : ''}
                </div>
                <div class="origin-display">
                    <div class="origin-type-card">
                        <span class="badge badge-primary">${char.origin?.name || '未知'}</span>
                        <p class="origin-desc">${char.origin?.description || '起源定义了角色的能力背景和潜力。'}</p>
                    </div>
                    ${this.renderOriginMechanicsConfig(char)}
                </div>
            </div>

            <!-- STEP 3: 关键属性 -->
            <div class="sheet-section section-attributes">
                <div class="step-num">STEP 3</div>
                <div class="panel-header">
                    <h3>关键属性 (ATTRIBUTES)</h3>
                    ${!isPB ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollAttributes()">🎲 随机重骰</button>` : ''}
                </div>
                <div class="attributes-stack">
                    ${getAttributeKeys().map(key => this.renderAttributeItem(key, char.attributes[key], isPB)).join('')}
                </div>
            </div>

            <!-- STEP 4: 超凡能力 -->
            <div class="sheet-section section-powers">
                <div class="step-num">STEP 4</div>
                <div class="panel-header">
                    <h3>超凡能力 (POWERS)</h3>
                    <div class="p-actions">
                        ${!isPB ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollPowers()">🎲 随机重骰</button>` :
                `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddPowerModal()">➕ 手动添加</button>`}
                    </div>
                </div>
                <div class="powers-stack">
                    ${char.powers.length > 0 ? char.powers.map((p, i) => this.renderPowerItem(p, i, isPB)).join('') : '<div class="empty-hint">暂未获得超常能力...</div>'}
                </div>
            </div>

            <!-- STEP 5: 生活专长 -->
            <div class="sheet-section section-specialties">
                <div class="step-num">STEP 5</div>
                <div class="panel-header">
                    <h3>生活专长 (SPECIALTIES)</h3>
                    <div class="s-actions">
                        ${!isPB ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollSpecialties()">🎲 随机重骰</button>` :
                `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddSpecialtyModal()">➕ 手动添加</button>`}
                    </div>
                </div>
                <div class="specialties-flex">
                    ${char.specialties.length > 0 ? char.specialties.map((s, i) => this.renderSpecialtyItem(s, i, isPB)).join('') : '<div class="empty-hint">暂无特殊生活专长...</div>'}
                </div>
            </div>

            <!-- STEP 6: 实战总结 -->
            <div class="sheet-section section-combat">
                <div class="step-num">RESULT</div>
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
                    ${isPB ? `
                        <div class="combat-points-box">
                            <span class="label">购点余额 (REMAINING)</span>
                            <span class="val point-val ${this.characterGenerator.getRemainingPoints() < 0 ? 'negative' : ''}">${this.characterGenerator.getRemainingPoints()} / ${POINT_BUY_CONFIG.totalPoints}</span>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- FINAL: 传记详情 -->
            <div class="sheet-section section-bio">
                 <div class="bio-container">
                    <label>英雄档案说明 (BIOGRAPHY)</label>
                    <textarea oninput="app.creationFlow.updateBasicInfo('description', this.value)" 
                              placeholder="在正义被召唤时，这里将记述你的故事...">${char.description || ''}</textarea>
                 </div>
            </div>
        `;
    }

    renderAttributeItem(key, val, isPB) {
        return `
            <div class="attr-row">
                <span class="attr-name">${ATTRIBUTE_NAMES[key]}</span>
                <div class="attr-value-box">
                    ${isPB ? `<button class="btn-step" onclick="app.creationFlow.adjustAttribute('${key}', -1)">-</button>` : ''}
                    <span class="val">${val}</span>
                    ${isPB ? `<button class="btn-step" onclick="app.creationFlow.adjustAttribute('${key}', 1)">+</button>` : ''}
                </div>
            </div>
        `;
    }

    renderPowerItem(power, index, isPB) {
        return `
            <div class="power-panel-card">
                <div class="card-top">
                    <span class="p-name" onclick="app.showPowerDetail('${power.name}')">${power.name}</span>
                    <span class="p-cat">(${power.category})</span>
                    <div class="p-controls">
                        ${isPB ? `
                            <button class="btn-step" onclick="app.creationFlow.adjustPowerLevel(${index}, -1)">-</button>
                            <span class="p-level">Lvl ${power.level}</span>
                            <button class="btn-step" onclick="app.creationFlow.adjustPowerLevel(${index}, 1)">+</button>
                            <button class="btn-icon-del" onclick="app.creationFlow.removePower(${index})">✕</button>
                        ` : `<span class="p-level">Lvl ${power.level}</span>`}
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

    renderSpecialtyItem(specialty, index, isPB) {
        const levels = { 1: '基础', 2: '专家', 3: '大师' };
        return `
            <div class="spec-tag-card">
                <span class="s-name">${specialty.name}</span>
                <span class="s-level">${levels[specialty.level]}</span>
                ${isPB ? `
                    <button class="btn-step" onclick="app.creationFlow.adjustSpecialtyLevel(${index}, 1)">+</button>
                    <button class="btn-icon-del" onclick="app.creationFlow.removeSpecialty(${index})">✕</button>
                ` : ''}
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

        html += '</div>';
        return html;
    }

    // 更新信息
    updateBasicInfo(key, val) {
        this.characterGenerator.character[key] = val;
    }

    updateQuality(index, val) {
        this.characterGenerator.character.qualities[index] = val;
    }

    // 重新掷骰
    rerollOrigin() {
        this.characterGenerator.generateOrigin();
        this.renderFullSheet();
    }

    rerollAttributes() {
        this.characterGenerator.generateAttributes();
        this.renderFullSheet();
    }

    rerollPowers() {
        this.characterGenerator.generatePowers();
        this.renderFullSheet();
    }

    rerollSpecialties() {
        this.characterGenerator.generateSpecialties();
        this.renderFullSheet();
    }

    quickGenerate() {
        this.characterGenerator.generateRandom();
        this.renderFullSheet();
        showSuccess('英雄档案已随机重塑！');
    }

    // 调整数值
    adjustAttribute(key, delta) {
        const char = this.characterGenerator.getCharacter();
        this.characterGenerator.updateAttribute(key, char.attributes[key] + delta);
        this.renderFullSheet();
    }

    adjustPowerLevel(index, delta) {
        const char = this.characterGenerator.getCharacter();
        this.characterGenerator.updatePowerLevel(index, char.powers[index].level + delta);
        this.renderFullSheet();
    }

    adjustSpecialtyLevel(index, delta) {
        const char = this.characterGenerator.getCharacter();
        const next = (char.specialties[index].level % 3) + 1;
        this.characterGenerator.updateSpecialtyLevel(index, next);
        this.renderFullSheet();
    }

    removePower(index) {
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
            title: `为 "${power.name}" 添加修饰`,
            content: `
                <div class="mod-modal-grid">
                    <div class="mod-group">
                        <h5>增益 (Extras)</h5>
                        <div class="mod-list">
                            ${POWER_EXTRAS.map(e => `<button class="btn-mod-pick extra" onclick="app.creationFlow.applyMod(${powerIndex}, 'extra', '${e.id}')">${e.name}</button>`).join('')}
                        </div>
                    </div>
                    <div class="mod-group">
                        <h5>限制 (Flaws)</h5>
                        <div class="mod-list">
                            ${POWER_FLAWS.map(f => `<button class="btn-mod-pick flaw" onclick="app.creationFlow.applyMod(${powerIndex}, 'flaw', '${f.id}')">${f.name}</button>`).join('')}
                        </div>
                    </div>
                </div>
            `
        });
    }

    applyMod(pIndex, type, modId) {
        const mod = (type === 'extra' ? POWER_EXTRAS : POWER_FLAWS).find(m => m.id === modId);
        this.characterGenerator.addPowerModifier(pIndex, type, mod);
        this.renderFullSheet();
        closeModal();
    }

    removeModifier(pIndex, type, modId) {
        this.characterGenerator.removePowerModifier(pIndex, type, modId);
        this.renderFullSheet();
    }

    handleMutantChoice(val) {
        this.characterGenerator.setOriginChoice('mutantChoice', val);
        if (val === 'power') this.characterGenerator.generatePowers();
        this.renderFullSheet();
    }

    setOriginChoice(type, val) {
        this.characterGenerator.setOriginChoice(type, val);
        this.renderFullSheet();
    }

    saveCurrentCharacter() {
        const char = this.characterGenerator.getCharacter();
        if (!char.name) {
            showError('请输入英雄名称后再保存！');
            return;
        }
        if (saveCharacter(char)) {
            showSuccess(`英雄 "${char.name}" 已保存至名录！`);
        } else {
            showError('保存失败，请检查浏览器存储空间。');
        }
    }
}
