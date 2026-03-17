/**
 * 角色创建流程模块
 * 处理多步骤角色生成UI
 */

import {
    getPowerDescription,
    getAllPowers,
    getPowerCategoryById,
    POWERS
} from '../data/powers.js';

import { formatOriginMechanics } from '../data/origins.js';
import { getSpecialtiesList } from '../data/specialties.js';
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
        this.currentStep = 1;
        this.creationMode = null;
        this.characterGenerator = null;
        this.isCreating = false;
        this.editingCharacterId = null;

        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.handleNextStep());
        }
    }

    start(mode, editingId = null) {
        this.creationMode = mode;
        this.currentStep = 1;
        this.isCreating = true;
        this.editingCharacterId = editingId;

        // 创建角色生成器
        this.characterGenerator = new CharacterGenerator(mode);

        if (mode === 'random') {
            this.characterGenerator.generateRandom();
        } else {
            this.characterGenerator.generatePointBuy();
        }

        // 更新UI
        this.updateModeBadge();
        this.updatePointsDisplay();
        this.renderStep();
        this.app.viewManager.showSection('creation-section');
    }

    updateModeBadge() {
        const badge = document.getElementById('current-mode-badge');
        if (badge) {
            badge.textContent = this.creationMode === 'random' ? '🎲 随机模式' : '🎯 购点模式';
            badge.className = `mode-badge ${this.creationMode}`;
        }
    }

    updatePointsDisplay() {
        const display = document.getElementById('points-display');
        if (!display) return;

        if (this.creationMode === 'point-buy') {
            display.classList.remove('hidden');
            const remaining = this.characterGenerator.getRemainingPoints();
            display.querySelector('.points-value').textContent = remaining;

            if (remaining < 0) {
                display.classList.add('warning');
            } else {
                display.classList.remove('warning');
            }
        } else {
            display.classList.add('hidden');
        }
    }

    renderStep() {
        const container = document.getElementById('step-content');
        if (!container) return;

        this.updateStepIndicator();
        this.updateNavigationButtons();

        switch (this.currentStep) {
            case 1: this.renderOriginStep(container); break;
            case 2: this.renderAttributesStep(container); break;
            case 3: this.renderPowersStep(container); break;
            case 4: this.renderSpecialtiesStep(container); break;
            case 5: this.renderDescriptionStep(container); break;
            case 6: this.renderCompleteStep(container); break;
        }
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            const stepNum = index + 1;
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            if (this.currentStep === 6) {
                nextBtn.textContent = '保存角色';
            } else {
                nextBtn.textContent = '下一步';
            }
        }
    }

    handleNextStep() {
        if (this.currentStep === 6) {
            this.save();
        } else {
            this.nextStep();
        }
    }

    nextStep() {
        if (this.currentStep < 6) {
            this.saveStepData();
            this.currentStep++;
            this.renderStep();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.saveStepData();
            this.currentStep--;
            this.renderStep();
        }
    }

    saveStepData() {
        if (this.currentStep === 5) {
            const name = document.getElementById('hero-name')?.value || '';
            const description = document.getElementById('hero-description')?.value || '';
            const qualities = Array.from(document.querySelectorAll('.quality-input-field')).map(input => input.value);
            this.characterGenerator.setInfo({ name, description, qualities });
        }
    }

    renderOriginStep(container) {
        const character = this.characterGenerator.getCharacter();
        if (this.creationMode === 'random') {
            container.innerHTML = `
                <div class="step-origin">
                    <h3>能力起源</h3>
                    <div class="origin-result">
                        <div class="origin-card selected">
                            <div class="origin-header">
                                <h4>${character.origin.name}</h4>
                                <span class="origin-roll">掷骰: ${character.originRoll}</span>
                            </div>
                            <p class="origin-desc">${character.origin.description}</p>
                            <div class="origin-effects">
                                <p>${formatOriginMechanics(character.origin.mechanics)}</p>
                            </div>
                        </div>
                    </div>
                    <div class="step-actions">
                        <button class="btn btn-secondary" onclick="app.creationFlow.rerollOrigin()">
                            <span>🎲</span> 重新掷骰
                        </button>
                    </div>
                </div>
            `;
        } else {
            const origins = [
                { id: 'trained', name: '受训', range: '2-4', description: '英雄是技艺娴熟的个体，拥有的"能力"实际上都来自精湛的训练或专门的设备。', effects: '额外获得 2 项专长，可选：放弃1项能力换取2项专长' },
                { id: 'altered', name: '改造', range: '5-6', description: '英雄原本是正常人类，经由某些外部手段成为超人。', effects: '一项能力 +2 级' },
                { id: 'mutant', name: '天赋异禀', range: '7', description: '英雄与生俱来拥有超越常人的特殊能力。', effects: '可选择：额外获得1项特殊能力 或 1项能力+2级' },
                { id: 'gimmick', name: '花招诡计', range: '8-9', description: '英雄本身是凡人，角色的特殊能力完全依靠高科技装备、魔法道具或外穿装置。', effects: '所有能力带上"装置"限制，一项精神属性 +2 级' },
                { id: 'artificial', name: '人造生命', range: '10', description: '角色是机器人、生化人或其他类型的构装体（如魔法魔像）。', effects: '力量 +2 级，额外获得 "维系生命" 能力' },
                { id: 'alien', name: '天外来客', range: '11-12', description: '角色是外星人、元素精灵、天使、魔鬼乃至神祇——来自另外一个世界或位面的生物。', effects: '两项能力 +2 级' }
            ];

            container.innerHTML = `
                <div class="step-origin">
                    <h3>选择能力起源</h3>
                    <p class="step-hint">购点模式下，起源仅作为背景描述，不提供额外机制加成</p>
                    <div class="origin-grid">
                        ${origins.map(o => `
                            <div class="origin-card ${character.origin?.id === o.id ? 'selected' : ''}" 
                                 onclick="app.creationFlow.selectOrigin('${o.id}')">
                                <div class="origin-header">
                                    <h4>${o.name}</h4>
                                    <span class="origin-roll">${o.range}</span>
                                </div>
                                <p class="origin-desc">${o.description}</p>
                                <div class="origin-effects">
                                    <p>${o.effects}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    renderAttributesStep(container) {
        const character = this.characterGenerator.getCharacter();
        const isPointBuy = this.creationMode === 'point-buy';

        let html = `
            <div class="step-attributes">
                <h3>属性测定</h3>
                <p class="step-hint">所有属性等级范围：1-10</p>
        `;

        // 起源选择逻辑 (随机模式下也有选择)
        if (character.origin && character.origin.mechanics) {
            const mech = character.origin.mechanics;
            if (mech.statBoost || mech.choice === 'power_or_boost') {
                html += `<div class="origin-choice-box">
                    <h5>来源奖励选择 (${character.origin.name})</h5>`;

                if (mech.choice === 'power_or_boost') {
                    html += `
                        <div class="choice-row">
                            <label>选择奖励类型：</label>
                            <select onchange="app.creationFlow.handleMutantChoice(this.value)">
                                <option value="power" ${character.originChoices.mutantChoice === 'power' ? 'selected' : ''}>额外获得1项能力</option>
                                <option value="boost" ${character.originChoices.mutantChoice === 'boost' ? 'selected' : ''}>一项属性 +2 级</option>
                            </select>
                        </div>
                    `;
                }

                if (mech.statBoost?.target === 'any' || (mech.choice === 'power_or_boost' && character.originChoices.mutantChoice === 'boost')) {
                    html += `
                        <div class="choice-row">
                            <label>选择要提升的属性 (+2)：</label>
                            <select onchange="app.creationFlow.setOriginChoice('statBoost', this.value)">
                                ${getAttributeKeys().map(key => `
                                    <option value="${key}" ${character.originChoices.statBoost === key ? 'selected' : ''}>${ATTRIBUTE_NAMES[key]}</option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                } else if (mech.statBoost?.target === 'mental') {
                    html += `
                        <div class="choice-row">
                            <label>选择要提升的精神属性 (+2)：</label>
                            <select onchange="app.creationFlow.setOriginChoice('statBoost', this.value)">
                                <option value="intellect" ${character.originChoices.statBoost === 'intellect' ? 'selected' : ''}>智力</option>
                                <option value="awareness" ${character.originChoices.statBoost === 'awareness' ? 'selected' : ''}>感知</option>
                                <option value="willpower" ${character.originChoices.statBoost === 'willpower' ? 'selected' : ''}>意志</option>
                            </select>
                        </div>
                    `;
                } else if (mech.statBoost?.target === 'any_two') {
                    const selected = character.originChoices.statBoosts || [];
                    html += `
                        <div class="choice-row">
                            <label>选择两项要提升的能力 (+2)：</label>
                            <div class="checkbox-group">
                                ${getAttributeKeys().map(key => `
                                    <label class="checkbox-item">
                                        <input type="checkbox" value="${key}" 
                                               ${selected.includes(key) ? 'checked' : ''} 
                                               onchange="app.creationFlow.handleAnyTwoChoice('${key}', this.checked)">
                                        ${ATTRIBUTE_NAMES[key]}
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }

                html += `</div>`;
            }
        }

        if (isPointBuy) {
            const remaining = this.characterGenerator.getRemainingPoints();
            html += `<div class="points-display-inline ${remaining < 0 ? 'warning' : ''}">
                剩余点数: ${remaining} / ${POINT_BUY_CONFIG.totalPoints}
            </div>`;
        }

        html += `<div class="attributes-grid">`;

        Object.entries(character.attributes).forEach(([key, value]) => {
            const isBoosted = (character.originChoices.statBoost === key) ||
                (character.originChoices.statBoosts?.includes(key)) ||
                (character.origin?.mechanics.statBoost?.target === key);

            html += `
                <div class="attribute-card ${isBoosted ? 'boosted' : ''}">
                    <div class="attribute-header">
                        <h4>${ATTRIBUTE_NAMES[key]}</h4>
                        ${isBoosted ? '<span class="boost-badge">+2</span>' : ''}
                    </div>
                    <div class="attribute-value">${value}</div>
                    ${isPointBuy ? `
                        <div class="attribute-controls">
                            <button onclick="app.creationFlow.adjustAttribute('${key}', -1)" ${value <= 1 ? 'disabled' : ''}>-</button>
                            <button onclick="app.creationFlow.adjustAttribute('${key}', 1)" ${value >= 10 ? 'disabled' : ''}>+</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div>`;

        if (!isPointBuy) {
            const total = Object.values(character.attributes).reduce((a, b) => a + b, 0);
            html += `
                <div class="attribute-total">
                    属性总和: <span class="attribute-total-value ${total < 20 ? 'warning' : ''}">${total}</span>
                    ${total < 20 ? '<p class="warning-text">总和低于20，建议重新掷骰</p>' : ''}
                </div>
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.creationFlow.rerollAttributes()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    renderPowersStep(container) {
        const character = this.characterGenerator.getCharacter();
        const isPointBuy = this.creationMode === 'point-buy';

        let html = `
            <div class="step-powers">
                <h3>特殊能力</h3>
                <p class="step-hint">当前拥有 ${character.powers.length} 项特殊能力</p>
                <div class="powers-list">
        `;

        character.powers.forEach((power, index) => {
            const description = getPowerDescription(power.name);
            html += `
                <div class="power-card">
                    <div class="power-header">
                        <h4 class="power-name">${power.name}</h4>
                        <span class="power-category">${power.category}</span>
                    </div>
                    <div class="power-level">
                        <span class="power-level-label">等级:</span>
                        <span class="power-level-value">${power.level}</span>
                    </div>
                    
                    <div class="power-modifiers">
                        <div class="mods-section extras">
                            <span class="mods-label">增益:</span>
                            ${power.extras.length > 0 ? power.extras.map(e => `
                                <span class="mod-tag extra" onclick="app.creationFlow.removeModifier(${index}, 'extra', '${e.id}')">${e.name} ✕</span>
                            `).join('') : '<span class="empty-mods">无</span>'}
                            <button class="btn-add-mod" onclick="app.creationFlow.openModifierModal(${index}, 'extra')">+</button>
                        </div>
                        <div class="mods-section flaws">
                            <span class="mods-label">限制:</span>
                            ${power.flaws.length > 0 ? power.flaws.map(f => `
                                <span class="mod-tag flaw" onclick="app.creationFlow.removeModifier(${index}, 'flaw', '${f.id}')">${f.name} ✕</span>
                            `).join('') : '<span class="empty-mods">无</span>'}
                            <button class="btn-add-mod" onclick="app.creationFlow.openModifierModal(${index}, 'flaw')">+</button>
                        </div>
                    </div>

                    <div class="power-description">
                        ${description}
                    </div>
                    <div class="power-actions">
                        ${isPointBuy ? `
                            <button onclick="app.creationFlow.adjustPowerLevel(${index}, -1)" ${power.level <= 1 ? 'disabled' : ''}>-</button>
                            <button onclick="app.creationFlow.adjustPowerLevel(${index}, 1)" ${power.level >= 10 ? 'disabled' : ''}>+</button>
                        ` : ''}
                        <button class="btn-danger" onclick="app.creationFlow.removePower(${index})">删除</button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        if (isPointBuy) {
            html += `
                <div class="add-power-form">
                    <h5>添加新能力</h5>
                    <div class="form-row">
                        <select id="new-power-category" onchange="app.creationFlow.updatePowerSelect()">
                            <option value="">选择类别</option>
                            <option value="alteration">变形系</option>
                            <option value="control">控制系</option>
                            <option value="defense">防御系</option>
                            <option value="mental">精神系</option>
                            <option value="movement">运动系</option>
                            <option value="attack">攻击系</option>
                            <option value="sensory">感官系</option>
                        </select>
                        <select id="new-power-name">
                            <option value="">选择能力</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="app.creationFlow.addPower()">添加能力</button>
                </div>
            `;
        } else {
            html += `
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.creationFlow.rerollPowers()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

        // 如果是购点模式，更新下拉框
        if (isPointBuy) {
            this.updatePowerSelect();
        }
    }

    renderSpecialtiesStep(container) {
        const character = this.characterGenerator.getCharacter();
        const isPointBuy = this.creationMode === 'point-buy';

        let html = `
            <div class="step-specialties">
                <h3>专长</h3>
                <p class="step-hint">当前拥有 ${character.specialties.length} 项专长</p>
                <div class="specialties-list">
        `;

        character.specialties.forEach((specialty, index) => {
            const levelInfo = {
                1: { name: '基础', bonus: '+1', description: '对应检定+1' },
                2: { name: '专家', bonus: '+2', description: '对应检定+2' },
                3: { name: '大师', bonus: '+3', description: '对应检定+3，允许使用特技' }
            };
            const level = levelInfo[specialty.level] || levelInfo[1];
            html += `
                <div class="specialty-card">
                    <div class="specialty-info">
                        <span class="specialty-name">${specialty.name}</span>
                        <div class="specialty-description">
                            ${level.description}
                        </div>
                    </div>
                    <div class="specialty-level">
                        <span class="specialty-level-badge">${level.name} ${level.bonus}</span>
                        ${isPointBuy ? `
                            <div class="attribute-controls">
                                <button onclick="app.creationFlow.adjustSpecialtyLevel(${index}, -1)">-</button>
                                <button onclick="app.creationFlow.adjustSpecialtyLevel(${index}, 1)">+</button>
                                <button class="btn-danger" onclick="app.creationFlow.removeSpecialty(${index})">删除</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        if (isPointBuy) {
            const specialtiesList = getSpecialtiesList();
            const options = specialtiesList.map(s =>
                `<option value="${s.value}">${s.label}</option>`
            ).join('');

            html += `
                <div class="add-specialty-form">
                    <h5>添加新专长</h5>
                    <select id="new-specialty">
                        <option value="">选择专长</option>
                        ${options}
                    </select>
                    <button class="btn btn-primary" onclick="app.creationFlow.addSpecialty()">添加专长</button>
                </div>
            `;
        } else {
            html += `
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.creationFlow.rerollSpecialties()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    renderDescriptionStep(container) {
        const character = this.characterGenerator.getCharacter();

        container.innerHTML = `
            <div class="step-description">
                <h3>角色描述</h3>
                
                <div class="derived-stats-preview">
                    <div class="derived-stat-card">
                        <div class="derived-stat-name">耐力</div>
                        <div class="derived-stat-value">${character.stamina}</div>
                        <div class="derived-stat-formula">力量 + 意志</div>
                    </div>
                    <div class="derived-stat-card resolve">
                        <div class="derived-stat-name">决意</div>
                        <div class="derived-stat-value">${character.resolve}</div>
                        <div class="derived-stat-formula">6 - 能力数量</div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="hero-name">英雄名称 *</label>
                    <input type="text" id="hero-name" value="${character.name || ''}" placeholder="输入英雄名称">
                </div>
                
                <div class="qualities-section">
                    <h4>特质</h4>
                    <div class="quality-inputs">
                        <div class="quality-input">
                            <label>特质1 (身份/头衔)</label>
                            <input type="text" class="quality-input-field" value="${character.qualities[0] || ''}" placeholder="例如：亿万富翁">
                        </div>
                        <div class="quality-input">
                            <label>特质2 (动机/信念)</label>
                            <input type="text" class="quality-input-field" value="${character.qualities[1] || ''}" placeholder="例如：正义必胜">
                        </div>
                        <div class="quality-input">
                            <label>特质3 (弱点/羁绊)</label>
                            <input type="text" class="quality-input-field" value="${character.qualities[2] || ''}" placeholder="例如：氪星石过敏">
                        </div>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="hero-description">角色描述</label>
                    <textarea id="hero-description" rows="4" placeholder="描述角色的背景、外观、性格等...">${character.description || ''}</textarea>
                </div>
            </div>
        `;
    }

    renderCompleteStep(container) {
        const character = this.characterGenerator.getCharacter();

        container.innerHTML = `
            <div class="step-complete">
                <h3>角色创建完成！</h3>
                <div class="character-sheet">
                    <div class="sheet-header">
                        <h2>${character.name || '未命名英雄'}</h2>
                        <p>${character.origin?.name || ''} | ${this.creationMode === 'random' ? '随机模式' : '购点模式'}</p>
                    </div>
                    
                    <div class="sheet-section">
                        <h4>衍生属性</h4>
                        <div class="sheet-grid">
                            <div class="sheet-item">
                                <div class="sheet-item-label">耐力</div>
                                <div class="sheet-item-value">${character.stamina}</div>
                            </div>
                            <div class="sheet-item">
                                <div class="sheet-item-label">决意</div>
                                <div class="sheet-item-value">${character.resolve}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sheet-section">
                        <h4>基础属性</h4>
                        <div class="sheet-grid">
                            ${Object.entries(character.attributes).map(([key, value]) => `
                                <div class="sheet-item">
                                    <div class="sheet-item-label">${ATTRIBUTE_NAMES[key]}</div>
                                    <div class="sheet-item-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sheet-section">
                        <h4>特殊能力 (${character.powers.length}项)</h4>
                        ${character.powers.length > 0 ? character.powers.map(p => `
                            <div class="sheet-power">
                                <div class="power-main">
                                    <span class="power-clickable" onclick="app.showPowerDetail('${p.name}')">${p.name}</span> (${p.category}) - 等级 ${p.level}
                                </div>
                                ${p.extras.length > 0 || p.flaws.length > 0 ? `
                                    <div class="power-mods-list">
                                        ${p.extras.map(e => `<span class="mod-badge extra">${e.name}</span>`).join('')}
                                        ${p.flaws.map(f => `<span class="mod-badge flaw">${f.name}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('') : '<p>无特殊能力</p>'}
                    </div>
                    
                    <div class="sheet-section">
                        <h4>专长 (${character.specialties.length}项)</h4>
                        ${character.specialties.length > 0 ? character.specialties.map(s => `
                            <div class="sheet-specialty">
                                <strong>${s.name}</strong> - 等级 ${s.level}
                            </div>
                        `).join('') : '<p>无专长</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    // 操作方法
    selectOrigin(originId) {
        this.characterGenerator.setOrigin(originId);
        this.renderStep();
    }

    rerollOrigin() {
        this.characterGenerator.generateOrigin();
        this.renderStep();
    }

    adjustAttribute(key, delta) {
        const current = this.characterGenerator.getCharacter().attributes[key];
        this.characterGenerator.updateAttribute(key, current + delta);
        this.updatePointsDisplay();
        this.renderStep();
    }

    rerollAttributes() {
        this.characterGenerator.generateAttributes();
        this.renderStep();
    }

    adjustPowerLevel(index, delta) {
        const power = this.characterGenerator.getCharacter().powers[index];
        this.characterGenerator.updatePowerLevel(index, power.level + delta);
        this.updatePointsDisplay();
        this.renderStep();
    }

    removePower(index) {
        this.characterGenerator.removePower(index);
        this.updatePointsDisplay();
        this.renderStep();
    }

    addPower() {
        const categoryId = document.getElementById('new-power-category')?.value;
        const name = document.getElementById('new-power-name')?.value;
        if (categoryId && name) {
            this.characterGenerator.addPower(categoryId, name);
            this.updatePointsDisplay();
            this.renderStep();
        } else {
            showError('请选择能力类别和名称');
        }
    }

    rerollPowers() {
        this.characterGenerator.generatePowers();
        this.renderStep();
    }

    updatePowerSelect() {
        const categorySelect = document.getElementById('new-power-category');
        const powerSelect = document.getElementById('new-power-name');
        if (!categorySelect || !powerSelect) return;

        const categoryId = categorySelect.value;
        const currentValue = powerSelect.value;
        powerSelect.innerHTML = '<option value="">选择能力</option>';

        if (categoryId) {
            const categoryData = POWERS[categoryId];
            if (categoryData) {
                categoryData.powers.forEach(power => {
                    const option = document.createElement('option');
                    option.value = power.name;
                    option.textContent = power.name;
                    if (power.name === currentValue) option.selected = true;
                    powerSelect.appendChild(option);
                });
            }
        }
    }

    adjustSpecialtyLevel(index, delta) {
        const specialty = this.characterGenerator.getCharacter().specialties[index];
        this.characterGenerator.updateSpecialtyLevel(index, specialty.level + delta);
        this.updatePointsDisplay();
        this.renderStep();
    }

    removeSpecialty(index) {
        this.characterGenerator.removeSpecialty(index);
        this.updatePointsDisplay();
        this.renderStep();
    }

    addSpecialty() {
        const name = document.getElementById('new-specialty')?.value;
        if (name) {
            this.characterGenerator.addSpecialty(name);
            this.updatePointsDisplay();
            this.renderStep();
        } else {
            showError('请选择专长');
        }
    }

    rerollSpecialties() {
        this.characterGenerator.generateSpecialties();
        this.renderStep();
    }

    handleMutantChoice(value) {
        this.characterGenerator.setOriginChoice('mutantChoice', value);
        if (value === 'power') {
            this.characterGenerator.generatePowers();
        }
        this.renderStep();
    }

    handleAnyTwoChoice(key, checked) {
        let selected = this.characterGenerator.getCharacter().originChoices.statBoosts || [];
        if (checked) {
            if (selected.length < 2) {
                selected.push(key);
            } else {
                showInfo('只能选择两项能力');
                this.renderStep();
                return;
            }
        } else {
            selected = selected.filter(s => s !== key);
        }
        this.characterGenerator.setOriginChoice('statBoosts', selected);
        this.renderStep();
    }

    setOriginChoice(type, value) {
        this.characterGenerator.setOriginChoice(type, value);
        this.renderStep();
    }

    openModifierModal(powerIndex, type) {
        const modifiers = type === 'extra' ? POWER_EXTRAS : POWER_FLAWS;
        const title = type === 'extra' ? '添加增益 (Extra)' : '添加限制 (Flaw)';
        const power = this.characterGenerator.getCharacter().powers[powerIndex];

        let content = `
            <div class="modifier-picker">
                <p class="picker-hint">点击选择要为 <strong>${power.name}</strong> 添加的${type === 'extra' ? '增益' : '限制'}：</p>
                <div class="modifier-grid">
                    ${modifiers.map(m => `
                        <div class="modifier-item" onclick="app.creationFlow.addModifier(${powerIndex}, '${type}', '${m.id}')">
                            <h6>${m.name}</h6>
                            <p>${m.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        openModal({
            title,
            content,
            size: 'medium'
        });
    }

    addModifier(powerIndex, type, modifierId) {
        const modifiers = type === 'extra' ? POWER_EXTRAS : POWER_FLAWS;
        const modifier = modifiers.find(m => m.id === modifierId);
        if (modifier) {
            this.characterGenerator.addPowerModifier(powerIndex, type, modifier);
            closeModal();
            this.renderStep();
        }
    }

    removeModifier(powerIndex, type, modifierId) {
        this.characterGenerator.removePowerModifier(powerIndex, type, modifierId);
        this.renderStep();
    }

    save() {
        // ... 原有逻辑 ...
        this.saveStepData();
        const character = this.characterGenerator.getCharacter();

        if (!character.name) {
            showError('请输入英雄名称');
            return;
        }

        if (this.editingCharacterId) {
            character.id = this.editingCharacterId;
        }

        const usedPoints = this.characterGenerator.calculateUsedPoints();
        if (this.creationMode === 'point-buy' && usedPoints > POINT_BUY_CONFIG.totalPoints) {
            showError(`点数超出限制 (${usedPoints}/${POINT_BUY_CONFIG.totalPoints})`);
            return;
        }

        if (saveCharacter(character)) {
            showSuccess('角色保存成功！');
            this.isCreating = false;
            this.app.viewManager.switchView('saved');
            this.app.viewManager.showSection('welcome-section');
        } else {
            showError('保存失败，请重试');
        }
    }
}
