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
import { getSpecialtiesList, SPECIALTIES } from '../data/specialties.js';
import { getAttributeKeys, ATTRIBUTES } from '../data/attributes.js';
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

/** 轻量级防抖工具（仅用于文字输入类操作） */
function debounce(fn, wait = 250) {
    let t;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}

export class CreationFlow {
    constructor(app) {
        this.app = app;
        this.creationMode = 'random';
        this.characterGenerator = null;
        this.isCreating = false;
        this.editingCharacterId = null;
        this.currentStep = 1; // 当前步骤
        this.totalSteps = 4; // 总步骤数
        this.completedSteps = [false, false, false, false]; // 记录各步骤是否完成

        // 文字输入防抖：250ms 内连续输入不重建卡片
        this._debouncedRender = debounce(() => this.renderFullSheet(), 250);

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
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 400; // Limit dimension to save space
                
                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress to JPEG with 0.8 quality
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                
                this.characterGenerator.character.avatar = compressedBase64;
                this.renderFullSheet();
                showSuccess('头像已上传！');
            };
            img.src = e.target.result;
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
            if (char) {
                this.characterGenerator.character = JSON.parse(JSON.stringify(char));
                this.heroType = char.heroType || 'destined_hero';
                this.renderFullSheet();
            }
        } else {
            // 打开模式选择弹窗
            openModal({
                title: '选择英雄命运',
                content: `
                    <div style="text-align: center; margin-bottom: 20px;">
                        <p style="margin-bottom: 15px; color: var(--text-secondary);">决定你的英雄诞生方式：</p>
                        
                        <div class="hero-type-card" style="border: var(--comic-border-width) solid var(--charcoal-ink); padding: 15px; margin-bottom: 15px; border-radius: var(--border-radius); text-align: left; cursor: pointer; transition: background 0.2s;" onclick="app.creationFlow.confirmHeroType('true_hero')">
                            <h4 style="margin: 0 0 5px 0; color: var(--charcoal-ink);">真实英雄 (硬核模式)</h4>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">
                                只能随机投掷1次，接受命运的安排。特点是很有可能随机出并不理想的角色。这是成为真实英雄必须承担的风险。
                            </p>
                        </div>
                        
                        <div class="hero-type-card" style="border: var(--comic-border-width) solid var(--charcoal-ink); padding: 15px; border-radius: var(--border-radius); text-align: left; cursor: pointer; transition: background 0.2s;" onclick="app.creationFlow.confirmHeroType('destined_hero')">
                            <h4 style="margin: 0 0 5px 0; color: var(--charcoal-ink);">天命英雄 (普通模式)</h4>
                            <p style="margin: 0; font-size: 12px; color: var(--text-muted);">
                                在主持人允许的情况下，你可以拥有多次重掷机会，直到打造出心仪的英雄。
                            </p>
                        </div>
                    </div>
                `,
                footer: `<button class="btn btn-outline" onclick="closeModal(); app.showListView()">取消</button>`
            });
        }
    }

    confirmHeroType(type) {
        this.heroType = type;
        closeModal();
        
        // 生成基础结构
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
            heroType: type, // 记录类型
            id: Date.now(),
            createdAt: new Date().toISOString(),
            isPowersRolled: false
        };

        this.renderFullSheet();
    }

    renderFullSheet() {
        const container = document.getElementById('character-sheet');
        if (!container) return;

        try {
            const char = this.characterGenerator.getCharacter();

            // 自动判断区块完成情况，直接更新 completedSteps
            this.completedSteps[0] = char.origin !== null && Object.values(char.attributes).some(val => val > 0);
            this.completedSteps[1] = char.isPowersRolled || char.powers.length > (char.origin?.mechanics?.guaranteedPower ? 1 : 0);
            this.completedSteps[2] = char.specialties.length > 0;
            const traits = char.qualities || [];
            const filledTraits = traits.filter(t => t && t.trim()).length;
            this.completedSteps[3] = char.name && char.name.trim() !== '' && filledTraits >= 3;

            // 编辑模式：角色数据已完整，直接解锁全部区块
            if (this.editingCharacterId) {
                this.completedSteps = [true, true, true, true];
            }

            // 一次性顺序渲染所有区块，根据前置是否完成来施加锁定遮罩
            let html = '';
            
            // 区块 1: 起源与属性（始终解锁）
            html += this.renderOriginSection(char) + this.renderAttributesSection(char) + this.renderCombatSection(char);

            // 区块 2: 能力（如果第一步属性掷骰未完成则锁定）
            let isPowersUnlocked = this.completedSteps[0];
            if (!isPowersUnlocked) {
                html += `
                    <div class="locked-section">
                        <div class="lock-overlay">
                            <div class="lock-message">🔒 请先生成您的起源与属性</div>
                        </div>
                        ${this.renderPowersSection(char)}
                    </div>
                `;
            } else {
                html += this.renderPowersSection(char);
            }

            // 区块 3: 专长与装备（如果第二步未完成则锁定）
            let isSpecsUnlocked = this.completedSteps[1];
            if (!isSpecsUnlocked) {
                html += `
                    <div class="locked-section">
                        <div class="lock-overlay">
                            <div class="lock-message">🔒 请先生成您的超凡能力</div>
                        </div>
                        ${this.renderSpecialtiesSection(char) + this.renderEquipmentSection(char)}
                    </div>
                `;
            } else {
                html += this.renderSpecialtiesSection(char) + this.renderEquipmentSection(char);
            }

            // 区块 4: 英雄身份（如果第三步未完成则锁定）
            let isIdentityUnlocked = this.completedSteps[2];
            if (!isIdentityUnlocked) {
                html += `
                    <div class="locked-section">
                        <div class="lock-overlay">
                            <div class="lock-message">🔒 请先生成您的背景专长</div>
                        </div>
                        ${this.renderIdentitySection(char) + this.renderBioSection(char)}
                    </div>
                `;
            } else {
                html += this.renderIdentitySection(char) + this.renderBioSection(char);
            }

            container.innerHTML = html;

            // 重新绑定可能的动态事件或初始化提示
            this.initPowerTooltips();
        } catch (error) {
            console.error('Rendering failed:', error);
            showError('同步角色档案时遇到技术故障，请重新载入。');
        }
    }

    // 旧的步骤导航与校验方法已被移除

    initPowerTooltips() {
        // 后续可以通过 Tippy.js 或自定义实现更酷的提示，目前使用原生 title 的增强版
    }

    renderIdentitySection(char) {
        // 确保特质数组存在且至少有3项
        if (!char.qualities) char.qualities = ['', '', ''];
        while (char.qualities.length < 3) char.qualities.push('');
        
        const placeholders = [
            "你是谁？（例：身份、头衔、绰号，如“意念大师”）",
            "什么驱使着你？/什么带来麻烦？（例：动机或弱点）",
            "你做些什么？/与众不同之处？（例：作风或特点）"
        ];
        
        return `
            <div class="sheet-section section-identity">
                <div class="step-num">STEP 4</div>
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
                               placeholder="输入英雄代号 (NAME)..." style="font-size: 1.5rem; font-weight: bold; width: 100%;">
                    </div>
                </div>
                <div class="traits-section" style="margin-top: 20px;">
                    <div class="traits-header">
                        <h3 style="margin: 0 0 4px 0;">英雄特质 (QUALITIES)</h3>
                        <p class="group-hint" style="margin: 0 0 12px 0; font-size: 12px; color: var(--text-muted);">
                            选择三项特质，游戏里启用特质可以获得优势或制造麻烦（获得决意点数）。
                        </p>
                    </div>
                    <div class="traits-inputs" style="display: flex; flex-direction: column; gap: 8px;">
                        ${char.qualities.map((trait, index) => `
                            <div class="trait-input-group" style="display: flex; align-items: center; gap: 8px;">
                                <span style="font-weight: bold; color: var(--text-muted); min-width: 20px;">#${index + 1}</span>
                                <input type="text" value="${trait || ''}" 
                                       oninput="app.creationFlow.updateTrait(${index}, this.value)" 
                                       placeholder="${placeholders[index] || '输入特质...'}"
                                       style="flex: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                                ${index >= 3 ? `<button class="btn-icon-del" onclick="app.creationFlow.removeTrait(${index})">✕</button>` : ''}
                            </div>
                        `).join('')}
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
        // 生成起源增益提示
        const originBonusHint = char.origin ? this.renderOriginBonusHint(char.origin) : '';
        
        return `
            <div class="sheet-section section-origin">
                <div class="step-num">STEP 1</div>
                <div class="panel-header">
                    <h3>能力起源 (ORIGIN)</h3>
                    ${!(this.heroType === 'true_hero' && char.origin) ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollOrigin()">🎲 随机生成</button>` : ''}
                </div>
                <div class="origin-display">
                    <div class="origin-type-card">
                        <span class="badge badge-primary">${char.origin?.name || '未知'}</span>
                        <p class="origin-desc">${char.origin?.description || '起源定义了角色的能力背景和潜力。'}</p>
                    </div>
                    ${originBonusHint}
                    ${this.renderOriginMechanicsConfig(char)}
                </div>
            </div>
        `;
    }
    
    renderOriginBonusHint(origin) {
        if (!origin || !origin.mechanics) return '';
        
        const hints = [];
        const mech = origin.mechanics;
        
        if (mech.bonusSpecialties) {
            hints.push(`额外获得 ${mech.bonusSpecialties} 项专长`);
        }
        if (mech.statBoost) {
            let target = '';
            switch (mech.statBoost.target) {
                case 'strength':
                    target = '力量';
                    break;
                case 'mental':
                    target = '一项精神属性';
                    break;
                case 'any_one':
                    target = '一项能力';
                    break;
                case 'any_two':
                    target = '两项能力';
                    break;
            }
            hints.push(`${target} +${mech.statBoost.value} 级`);
        }
        if (mech.bonusPower) {
            hints.push('额外获得1项特殊能力');
        }
        if (mech.deviceLimit) {
            hints.push('所有能力带上"装置"限制');
        }
        if (mech.guaranteedPower) {
            hints.push(`获得「${mech.guaranteedPower}」能力`);
        }
        
        if (hints.length > 0) {
            return `
                <div class="origin-bonus-hint">
                    <h4>起源增益</h4>
                    <ul>
                        ${hints.map(hint => `<li>${hint}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        return '';
    }

    renderAttributesSection(char) {
        const originAttributeHint = this.renderOriginStepHint(char, 'attributes');
        
        return `
            <div class="sheet-section section-attributes" style="border-top: none;">
                <div class="panel-header">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <h3 style="margin: 0;">关键属性 (ATTRIBUTES)</h3>
                        ${this._pendingBoostTokens > 0 ? `<span class="badge" style="background: var(--lavender-glow); color: white;">拥有 ${this._pendingBoostTokens} 个 +2 升级点数</span>` : ''}
                    </div>
                    ${!(this.heroType === 'true_hero' && Object.values(char.attributes).some(v => v > 0)) ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollAttributes()">🎲 随机生成</button>` : ''}
                </div>
                ${originAttributeHint}
                <div class="attributes-stack">
                    ${getAttributeKeys().map(key => this.renderAttributeItem(key, char.attributes[key], char.baseAttributes ? char.baseAttributes[key] : char.attributes[key])).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * 通用起源增益提示渲染
     * @param {Object} char - 角色对象
     * @param {'attributes'|'powers'|'specialties'} section - 所属区块
     */
    renderOriginStepHint(char, section) {
        if (!char.origin || !char.origin.mechanics) return '';
        const mech = char.origin.mechanics;
        const hints = [];

        switch (section) {
            case 'attributes':
                if (mech.statBoost) {
                    const targets = {
                        strength: '力量',
                        mental: '一项精神属性',
                        any_one: '一项能力',
                        any_two: '两项能力'
                    };
                    const target = targets[mech.statBoost.target] || mech.statBoost.target;
                    hints.push(`起源增益：${target} +${mech.statBoost.value} 级`);
                }
                break;
            case 'powers':
                if (mech.bonusPower) hints.push('起源增益：额外获得1项特殊能力');
                if (mech.guaranteedPower) hints.push(`起源增益：获得「${mech.guaranteedPower}」能力`);
                if (mech.deviceLimit) hints.push('起源限制：所有能力带上"装置"限制');
                break;
            case 'specialties':
                if (mech.bonusSpecialties) hints.push(`起源增益：额外获得 ${mech.bonusSpecialties} 项专长`);
                break;
        }

        if (hints.length === 0) return '';
        return `
            <div class="origin-step-hint">
                <span class="hint-icon">💡</span>
                <span class="hint-text">${hints.join(' | ')}</span>
            </div>
        `;
    }

    renderPowersSection(char) {
        const originPowerHint = this.renderOriginStepHint(char, 'powers');
        const originActionBar = this.renderOriginActionBar(char);
        
        return `
            <div class="sheet-section section-powers">
                <div class="step-num">STEP 2</div>
                <div class="panel-header">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <h3 style="margin: 0;">超凡能力 (POWERS)</h3>
                        ${this._pendingBoostTokens > 0 ? `<span class="badge" style="background: var(--lavender-glow); color: white;">拥有 ${this._pendingBoostTokens} 个 +2 升级点数</span>` : ''}
                    </div>
                    <div class="p-actions">
                        ${!(this.heroType === 'true_hero' && char.isPowersRolled) ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollPowers()">🎲 随机生成</button>` : ''}
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddPowerModal()">➕ 手动添加</button>
                    </div>
                </div>
                ${originPowerHint}
                ${originActionBar}
                <div class="powers-stack">
                    ${char.powers.length > 0 ? char.powers.map((p, i) => this.renderPowerItem(p, i, char)).join('') : '<div class="empty-hint">暂未获得超常能力...</div>'}
                </div>
            </div>
        `;
    }
    


    renderSpecialtiesSection(char) {
        const originSpecialtyHint = this.renderOriginStepHint(char, 'specialties');
        
        return `
            <div class="sheet-section section-specialties">
                <div class="step-num">STEP 3</div>
                <div class="panel-header">
                    <h3>生活专长 (SPECIALTIES)</h3>
                    <div class="s-actions">
                        ${!(this.heroType === 'true_hero' && char.specialties.length > 0) ? `<button class="btn btn-xs btn-outline" onclick="app.creationFlow.rerollSpecialties()">🎲 随机生成</button>` : ''}
                        <button class="btn btn-xs btn-outline" onclick="app.creationFlow.openAddSpecialtyModal()">➕ 手动添加</button>
                    </div>
                </div>
                ${originSpecialtyHint}
                <div class="specialties-flex">
                    ${char.specialties.length > 0 ? char.specialties.map((s, i) => this.renderSpecialtyItem(s, i)).join('') : '<div class="empty-hint">暂无特殊生活专长...</div>'}
                </div>
            </div>
        `;
    }
    


    renderBioSection(char) {
        return `
            <div class="sheet-section section-bio">
                 <div class="step-num">STEP 5</div>
                 <div class="bio-container">
                    <label style="display: block; font-weight: bold; margin-bottom: 8px;">英雄档案说明 (BIOGRAPHY & LORE)</label>
                    <p class="group-hint" style="margin-bottom: 12px; font-size: 12px; color: var(--text-muted);">
                        这位英雄是如何获得能力的？他的背景设定之中有哪些元素可以为现在的行动提供动机或是带来挑战？你的英雄看起来如何？
                    </p>
                    <textarea oninput="app.creationFlow.updateBasicInfo('description', this.value)" 
                              style="width: 100%; min-height: 120px; resize: vertical; padding: 10px; border-radius: 4px; border: 1px solid var(--border-color); font-family: inherit;"
                              placeholder="设定他的外貌、着装、体形、发色发型、言行习惯和其他明显的身体特征... 或讲述他的起源故事...">${char.description || ''}</textarea>
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
                                ${item.customFeatures && item.customFeatures.length > 0 ? `
                                    <div class="eq-features-list" style="margin-top: 8px; border-top: 1px dashed var(--comic-border-color); padding-top: 8px;">
                                        ${item.customFeatures.map(f => `
                                            <div style="margin-bottom: 4px; font-size: 12px; line-height: 1.4;">
                                                <strong>${f.name ? f.name + ': ' : ''}</strong><span style="color: var(--text-secondary);">${f.desc || ''}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
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

    renderAttributeItem(key, val, baseVal = val) {
        const isClickable = this._pendingBoostTokens > 0;
        const desc = ATTRIBUTES[key]?.description || '';
        const isBoosted = val > baseVal;
        
        return `
            <div class="attr-row" ${isClickable ? `onclick="app.creationFlow.handleAttributeClick('${key}')" style="cursor:pointer; border-color: var(--lavender-glow);"` : ''}>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="attr-name">${ATTRIBUTE_NAMES[key]}</span>
                    <div class="attr-value-box ${isBoosted ? 'boosted' : ''}">
                        <span class="val">${val}</span>
                        ${isBoosted ? `<span class="boost-label" style="font-size: 10px; margin-left: 4px; font-weight: normal;">▲起源增益</span>` : ''}
                    </div>
                </div>
                ${desc ? `<div class="item-desc">${desc}</div>` : ''}
                ${isClickable ? '<div style="font-size: 10px; color: var(--lavender-glow); text-align: center; margin-top: 4px;">点击升级 +2</div>' : ''}
            </div>
        `;
    }

    renderPowerItem(power, index, char) {
        const desc = getPowerDescription(power.name) || '暂无详细说明';
        const isClickable = this._pendingBoostTokens > 0;
        
        // 检查是否为起源固定能力
        let isGuaranteed = false;
        if (char && char.origin) {
            const mechanicsList = [];
            if (char.stackedOrigins) {
                char.stackedOrigins.forEach(o => o.mechanics && mechanicsList.push(o.mechanics));
            } else if (char.origin.mechanics) {
                mechanicsList.push(char.origin.mechanics);
            }
            isGuaranteed = mechanicsList.some(mech => mech.guaranteedPower === power.name);
        }

        return `
            <div class="power-panel-card" ${isClickable ? `onclick="app.creationFlow.handlePowerClick(${index})" style="cursor:pointer; border-color: var(--lavender-glow);"` : ''}>
                <div class="card-top">
                    <span class="p-name" onclick="event.stopPropagation(); app.showPowerDetail('${power.name}')">${power.name}</span>
                    <span class="p-cat">(${power.category})</span>
                    <div class="p-controls">
                        ${isClickable ? `<span style="font-size: 11px; color: var(--lavender-glow); margin-right: 10px;">点击升级 +2</span>` : ''}
                        <span class="p-level">Lvl ${power.level}</span>
                        ${!isGuaranteed ? `<button class="btn-icon-del" onclick="event.stopPropagation(); app.creationFlow.removePower(${index})">✕</button>` : `<span class="badge" style="margin-left: 8px; font-size: 10px;">固定</span>`}
                    </div>
                </div>
                <div class="item-desc" style="margin-top: 6px;">${desc}</div>
                <div class="p-mods">
                    <div class="mod-list">
                        ${power.extras.map(e => `<span class="tag extra" onclick="event.stopPropagation(); app.creationFlow.removeModifier(${index}, 'extra', '${e.id}')">${e.name}</span>`).join('')}
                        ${power.flaws.map(f => `<span class="tag flaw" onclick="event.stopPropagation(); app.creationFlow.removeModifier(${index}, 'flaw', '${f.id}')">${f.name}</span>`).join('')}
                        <button class="btn-add-tag" onclick="event.stopPropagation(); app.creationFlow.openModifierModal(${index})">+</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderSpecialtyItem(specialty, index) {
        const levels = { 1: '基础', 2: '专家', 3: '大师' };
        const specData = SPECIALTIES.find(s => s.name === specialty.name || s.id === specialty.id);
        const desc = specData ? specData.description : '暂无详细说明';
        return `
            <div class="spec-tag-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span class="s-name">${specialty.name}</span>
                        <span class="s-level" style="margin-left: 8px;">${levels[specialty.level]}</span>
                    </div>
                    <button class="btn-icon-del" onclick="app.creationFlow.removeSpecialty(${index})">✕</button>
                </div>
                <div class="item-desc" style="margin-top: 6px;">${desc}</div>
            </div>
        `;
    }

    renderOriginMechanicsConfig(char) {
        if (!char.origin || !char.origin.mechanics) return '';
        const mech = char.origin.mechanics;
        let html = '<div class="origin-config-row">';

        // 天赋异禀：选择额外能力或属性增幅
        if (mech.choice === 'power_or_boost') {
            html += `
                <div class="origin-exchange-notice">
                    <strong>起源抉择：</strong>
                    <div style="display: flex; gap: 10px; margin-top: 8px;">
                        <button class="btn btn-xs ${char.originChoices.mutantChoice === 'power' ? 'btn-primary' : 'btn-outline'}" 
                                onclick="app.creationFlow.handleMutantChoice('power')">额外获得1项能力</button>
                        <button class="btn btn-xs ${char.originChoices.mutantChoice === 'boost' ? 'btn-primary' : 'btn-outline'}" 
                                onclick="app.creationFlow.handleMutantChoice('boost')">获得1个 +2等级资源点</button>
                    </div>
                </div>
            `;
        }

        // 天外来客：选择双重起源
        if (mech.optionalExchange === 'double_roll_origins') {
            html += `
                <div class="origin-exchange-notice">
                    <strong>起源抉择：</strong> 你可以选择获得两个 +2等级资源点，或进行双重起源融合。
                    <div style="display: flex; gap: 10px; margin-top: 8px;">
                        <button class="btn btn-xs ${char.originChoices.alienChoice === 'boosts' ? 'btn-primary' : 'btn-outline'}" 
                                onclick="app.creationFlow.handleAlienChoice('boosts')">获得2个 +2等级资源点</button>
                        <button class="btn btn-xs ${char.originChoices.alienChoice === 'double' ? 'btn-primary' : 'btn-outline'}" 
                                onclick="app.creationFlow.handleAlienChoice('double')">开启双重起源</button>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        return html;
    }

    renderOriginActionBar(char) {
        if (!char.origin) return '';
        let html = '';
        
        // Handle array of stacked mechanics for Alien
        const mechanicsList = [];
        if (char.stackedOrigins) {
            char.stackedOrigins.forEach(o => o.mechanics && mechanicsList.push(o.mechanics));
        } else if (char.origin.mechanics) {
            mechanicsList.push(char.origin.mechanics);
        }

        mechanicsList.forEach(mech => {
            if (mech.guaranteedPower === '维系生命' && !char.originChoices.sacrificedForLifeSupport) {
                const hasLifeSupport = char.powers.some(p => p.name === '维系生命');
                if (hasLifeSupport) {
                    html += `
                        <div class="origin-exchange-notice" style="border-color: var(--lavender-glow);">
                            <strong>人造生命强化：</strong> 你的「维系生命」尚未满级。
                            <button class="btn btn-xs btn-primary" style="margin-left: 10px;" onclick="app.creationFlow.sacrificePowerForLifeSupport()">献祭另一项能力以升满维系生命</button>
                        </div>
                    `;
                }
            }

            if (mech.optionalExchange === 'power_for_specialties_plus_2' && !char.originChoices.sacrificedForSpecialties) {
                html += `
                    <div class="origin-exchange-notice" style="border-color: var(--lavender-glow);">
                        <strong>受训特权：</strong> 
                        <button class="btn btn-xs btn-primary" style="margin-left: 10px;" onclick="app.creationFlow.sacrificePowerForSpecialties()">用1项能力交换2项额外专长</button>
                    </div>
                `;
            }
        });

        return html;
    }

    // 更新信息
    updateBasicInfo(key, val) {
        this.characterGenerator.character[key] = val;
        // 文字输入用防抖渲染，避免每个按键都重建卡片
        this._debouncedRender();
    }

    updateTrait(index, val) {
        if (!this.characterGenerator.character.qualities) {
            this.characterGenerator.character.qualities = ['', '', ''];
        }
        this.characterGenerator.character.qualities[index] = val;
        // 文字输入用防抖渲染
        this._debouncedRender();
    }

    addTrait() {
        if (!this.characterGenerator.character.qualities) {
            this.characterGenerator.character.qualities = ['', '', ''];
        }
        this.characterGenerator.character.qualities.push('');
        this.renderFullSheet();
    }

    removeTrait(index) {
        if (this.characterGenerator.character.qualities && this.characterGenerator.character.qualities.length > 3) {
            this.characterGenerator.character.qualities.splice(index, 1);
            this.renderFullSheet();
        }
    }

    // 重新掷骰
    rerollOrigin() {
        this.characterGenerator.generateOrigin();
        this.characterGenerator.updateDerivedStats();
        this.renderFullSheet();
    }

    rerollAttributes() {
        this.characterGenerator.generateAttributes();
        this.characterGenerator.updateDerivedStats();
        this.renderFullSheet();
    }

    rerollPowers() {
        this.characterGenerator.generatePowers();
        this.characterGenerator.updateDerivedStats();
        this.renderFullSheet();
        // 标记能力步骤为已完成
        this.completedSteps[1] = true;
    }

    rerollSpecialties() {
        this.characterGenerator.generateSpecialties();
        this.characterGenerator.updateDerivedStats();
        this.renderFullSheet();
        // 标记专长步骤为已完成
        this.completedSteps[2] = true;
    }



    removePower(index) {
        if (this._pendingExchange) {
            if (this._pendingExchange === 'life_support') {
                this.characterGenerator.removePower(index);
                const ls = this.characterGenerator.character.powers.find(p => p.name === '维系生命');
                if (ls) ls.level = 10;
                this.characterGenerator.character.originChoices.sacrificedForLifeSupport = true;
                showSuccess('已舍弃能力，维系生命升至10级！');
            } else if (this._pendingExchange === 'specialties') {
                this.characterGenerator.removePower(index);
                this.characterGenerator.generateSpecialties(2); // 额外加2项
                this.characterGenerator.character.originChoices.sacrificedForSpecialties = true;
                showSuccess('已舍弃能力，获得2项额外专长名额（请在专长页面查看）！');
            } else if (this._pendingExchange === 'extra') {
                if (index === this._pendingExtraConfig.pIndex) {
                    showError('你不能献祭需要添加附带效果的能力本身！请选择另一项能力。');
                    return;
                }
                
                // 确定目标能力在献祭后的新索引
                let targetIndex = this._pendingExtraConfig.pIndex;
                if (index < targetIndex) targetIndex--;
                
                this.characterGenerator.removePower(index);
                this.characterGenerator.addPowerModifier(targetIndex, 'extra', this._pendingExtraConfig.mod);
                showSuccess('已成功献祭一项能力并获得附带效果！');
                this._pendingExtraConfig = null;
            }
            this._pendingExchange = null;
        } else {
            this.characterGenerator.removePower(index);
        }
        this.renderFullSheet();
    }

    rerollAlienOrigins() {
        // Roll two origins, avoiding alien (11,12) and duplicates
        const origins = [];
        const maxAttempts = 10;
        let attempts = 0;
        
        // Ensure we can access origin data safely, using dynamic import logic if app.data.origins is missing
        let getOrigin = window.app?.data?.origins?.getOriginByRoll;
        if (!getOrigin) {
            import('../data/origins.js').then(module => {
                const getO = module.getOriginByRoll;
                const rollFunc = window.app?.dice?.roll2d6 || (() => Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1);
                
                while (origins.length < 2 && attempts < maxAttempts) {
                    const roll = rollFunc();
                    if (roll >= 11) continue; // Skip alien
                    const orig = getO(roll);
                    if (orig && !origins.find(o => o.id === orig.id)) {
                        origins.push(orig);
                    }
                    attempts++;
                }
                this.characterGenerator.character.stackedOrigins = origins;
                this.characterGenerator.character.originChoices.alienChoice = 'double';
                this.renderFullSheet();
            });
            return; // Exit early while async import handles the rest
        }

        while (origins.length < 2 && attempts < maxAttempts) {
            const roll = app.dice.roll2d6();
            if (roll >= 11) continue; // Skip alien
            const orig = getOrigin(roll);
            if (orig && !origins.find(o => o.id === orig.id)) {
                origins.push(orig);
            }
            attempts++;
        }
        this.characterGenerator.character.stackedOrigins = origins;
        this.characterGenerator.character.originChoices.alienChoice = 'double';
        this.characterGenerator.updateDerivedStats();
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
            
            // 附带效果必须以一换一（牺牲另一项特殊能力）
            if (type === 'extra') {
                const powers = this.characterGenerator.character.powers;
                if (powers.length <= 1) {
                    showError('你的特殊能力不足，无法献祭以换取附带效果！');
                    return;
                }
                
                this._pendingExtraConfig = { pIndex, mod };
                this._pendingExchange = 'extra';
                closeModal();
                showInfo('附带效果替换：请点击你要献祭（舍弃）的另一项特殊能力上的 ✕ 按钮！');
                return;
            }
            
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
        const oldChoice = this.characterGenerator.character.originChoices.mutantChoice;
        this.characterGenerator.setOriginChoice('mutantChoice', val);
        if (val === 'boost') {
            this._pendingBoostTokens = 1;
        } else {
            this._pendingBoostTokens = 0;
            // 天赋异禀额外随机操作：在现有能力基础上追加1项，而不是全部重置
            if (oldChoice !== 'power' && this.characterGenerator.character.powers.length > 0) {
                this.characterGenerator.addRandomPower();
                showSuccess('已额外抽取1项特殊能力！');
            } else if (this.creationMode === 'random' && this.characterGenerator.character.powers.length === 0) {
                this.characterGenerator.generatePowers();
            }
        }
        this.renderFullSheet();
    }

    handleAlienChoice(val) {
        this.characterGenerator.setOriginChoice('alienChoice', val);
        if (val === 'boosts') {
            this._pendingBoostTokens = 2;
            this.characterGenerator.character.stackedOrigins = null;
        } else if (val === 'double') {
            this._pendingBoostTokens = 0;
            this.rerollAlienOrigins();
            return; // rerollAlienOrigins will render
        }
        this.renderFullSheet();
    }

    handleAttributeClick(key) {
        if (this._pendingBoostTokens > 0) {
            const char = this.characterGenerator.character;
            char.attributes[key] = Math.min(10, (char.attributes[key] || 0) + 2);
            this._pendingBoostTokens--;
            this.characterGenerator.updateDerivedStats();
            this.renderFullSheet();
        }
    }

    handlePowerClick(index) {
        if (this._pendingBoostTokens > 0) {
            const char = this.characterGenerator.character;
            const power = char.powers[index];
            if (power) {
                power.level = Math.min(10, power.level + 2);
                this._pendingBoostTokens--;
                this.characterGenerator.updateDerivedStats();
                this.renderFullSheet();
            }
        }
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

        // 初始化 customFeatures 数组
        const features = item.customFeatures || [];
        
        let featuresHtml = features.map((f, i) => `
            <div class="eq-feature-row" style="display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start;">
                <input type="text" class="eq-feature-name full-width" placeholder="条目名称 (如: 特效)" value="${f.name || ''}" style="flex: 1;">
                <textarea class="eq-feature-desc full-width" placeholder="描述效果..." style="flex: 2; height: 36px; resize: vertical;">${f.desc || ''}</textarea>
                <button class="btn-icon-del" onclick="this.parentElement.remove()" style="margin-top: 4px;">✕</button>
            </div>
        `).join('');

        openModal({
            title: '自定义装备信息',
            content: `
                <div class="edit-eq-modal" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                    <div class="form-group">
                        <label>装备名称</label>
                        <input type="text" id="edit-eq-name" value="${item.name}" class="full-width">
                    </div>
                    <div class="form-group">
                        <label>核心描述与备注</label>
                        <textarea id="edit-eq-desc" class="full-width" style="height: 60px; resize: vertical;">${item.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group" style="margin-top: 16px; border-top: 1px dashed var(--comic-border-color); padding-top: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <label style="margin: 0;">分栏式条目 (特效/能力/规则)</label>
                            <button class="btn btn-xs btn-outline" onclick="app.creationFlow.addEqFeatureRow()">➕ 添加条目</button>
                        </div>
                        <div id="eq-features-container">
                            ${featuresHtml}
                        </div>
                    </div>

                    <div class="form-group" style="margin-top: 16px; border-top: 1px dashed var(--comic-border-color); padding-top: 16px;">
                        <label>基础数值调整 (可选)</label>
                        <div class="form-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">
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
                </div>
            `,
            footer: `<button class="btn btn-primary" onclick="app.creationFlow.confirmEditEquipment('${instanceId}')">保存修改</button>`
        });
    }

    addEqFeatureRow() {
        const container = document.getElementById('eq-features-container');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'eq-feature-row';
        row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-start;';
        row.innerHTML = `
            <input type="text" class="eq-feature-name full-width" placeholder="条目名称 (如: 特效)" style="flex: 1;">
            <textarea class="eq-feature-desc full-width" placeholder="描述效果..." style="flex: 2; height: 36px; resize: vertical;"></textarea>
            <button class="btn-icon-del" onclick="this.parentElement.remove()" style="margin-top: 4px;">✕</button>
        `;
        container.appendChild(row);
    }

    confirmEditEquipment(instanceId) {
        const features = [];
        const rows = document.querySelectorAll('.eq-feature-row');
        rows.forEach(row => {
            const name = row.querySelector('.eq-feature-name').value.trim();
            const desc = row.querySelector('.eq-feature-desc').value.trim();
            if (name || desc) {
                features.push({ name, desc });
            }
        });

        const newData = {
            name: document.getElementById('edit-eq-name').value,
            description: document.getElementById('edit-eq-desc').value,
            customFeatures: features,
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
        showInfo('进入献祭模式：请点击要舍弃的能力卡片右上角的 ✕ 按钮。');
        this._pendingExchange = 'life_support';
    }

    sacrificePowerForSpecialties() {
        showInfo('进入交换模式：请点击要舍弃的能力卡片右上角的 ✕ 按钮，换取2项专长。');
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
