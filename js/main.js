/**
 * 漫画英雄 TRPG 车卡器
 * 主应用入口
 */

import {
    CharacterGenerator,
    createRandomCharacter,
    createPointBuyCharacter,
    importCharacterFromJSON,
    exportCharacterToJSON
} from './core/character.js';

import {
    getSavedCharacters,
    saveCharacter,
    deleteCharacter,
    getCharacterById,
    searchCharacters,
    sortCharacters,
    exportAllCharacters,
    importCharacters,
    downloadFile,
    readFile
} from './core/storage.js';

import { showSuccess, showError, showInfo } from './ui/toast.js';
import { openModal, closeModal, showConfirm, showCharacterDetail } from './ui/modal.js';
import { POINT_BUY_CONFIG, APP_CONFIG } from './data/index.js';

/**
 * 应用主类
 */
class ComicHeroApp {
    constructor() {
        this.currentView = 'home';
        this.currentStep = 1;
        this.creationMode = null;
        this.characterGenerator = null;
        this.editingCharacterId = null;
        this.searchQuery = '';
        this.sortBy = 'newest';
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.loadSavedCharacters();
        console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} 已加载`);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 导航按钮
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });
    }

    /**
     * 切换视图
     * @param {string} viewName - 视图名称
     */
    switchView(viewName) {
        // 更新导航状态
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // 切换视图
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // 视图特定逻辑
        if (viewName === 'saved') {
            this.loadSavedCharacters();
        }
    }

    /**
     * 返回首页
     */
    goHome() {
        this.resetCreation();
        this.switchView('home');
    }

    /**
     * 开始创建角色
     * @param {string} mode - 创建模式 ('random' | 'point-buy')
     */
    startCreation(mode) {
        this.creationMode = mode;
        this.currentStep = 1;
        this.editingCharacterId = null;

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
        this.switchView('create');
    }

    /**
     * 更新模式徽章
     */
    updateModeBadge() {
        const badge = document.getElementById('current-mode-badge');
        if (badge) {
            badge.textContent = this.creationMode === 'random' ? '🎲 随机模式' : '🎯 购点模式';
            badge.className = `mode-badge ${this.creationMode}`;
        }
    }

    /**
     * 更新点数显示
     */
    updatePointsDisplay() {
        const display = document.getElementById('points-display');
        if (!display) return;

        if (this.creationMode === 'point-buy') {
            display.classList.remove('hidden');
            const remaining = this.characterGenerator.getRemainingPoints();
            display.querySelector('.points-value').textContent = remaining;
        } else {
            display.classList.add('hidden');
        }
    }

    /**
     * 渲染当前步骤
     */
    renderStep() {
        const container = document.getElementById('step-content');
        if (!container) return;

        // 更新步骤指示器
        this.updateStepIndicator();

        // 更新导航按钮
        this.updateNavigationButtons();

        // 渲染步骤内容
        switch (this.currentStep) {
            case 1:
                this.renderOriginStep(container);
                break;
            case 2:
                this.renderAttributesStep(container);
                break;
            case 3:
                this.renderPowersStep(container);
                break;
            case 4:
                this.renderSpecialtiesStep(container);
                break;
            case 5:
                this.renderDescriptionStep(container);
                break;
            case 6:
                this.renderCompleteStep(container);
                break;
        }
    }

    /**
     * 更新步骤指示器
     */
    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            const stepNum = index + 1;
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
                step.setAttribute('aria-selected', 'true');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
                step.setAttribute('aria-selected', 'false');
            } else {
                step.setAttribute('aria-selected', 'false');
            }
        });
    }

    /**
     * 更新导航按钮
     */
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prev-step-btn');
        const nextBtn = document.getElementById('next-step-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }

        if (nextBtn) {
            if (this.currentStep === 6) {
                nextBtn.textContent = '保存角色';
                nextBtn.onclick = () => this.saveCharacter();
            } else {
                nextBtn.textContent = '下一步';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }

    /**
     * 渲染起源步骤
     */
    renderOriginStep(container) {
        const character = this.characterGenerator.getCharacter();
        
        if (this.creationMode === 'random') {
            container.innerHTML = this.createRandomOriginHTML(character);
        } else {
            container.innerHTML = this.createSelectOriginHTML(character);
        }
    }

    createRandomOriginHTML(character) {
        const origin = character.origin;
        return `
            <div class="step-origin">
                <h3>能力起源</h3>
                <div class="origin-result">
                    <div class="origin-card selected">
                        <div class="origin-header">
                            <h4>${origin.name}</h4>
                            <span class="origin-roll">掷骰: ${character.originRoll}</span>
                        </div>
                        <p class="origin-desc">${origin.description}</p>
                        <div class="origin-effects">
                            ${this.formatOriginEffects(origin.mechanics)}
                        </div>
                    </div>
                </div>
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.rerollOrigin()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            </div>
        `;
    }

    createSelectOriginHTML(character) {
        const origins = [
            { id: 'trained', name: '受训', range: '2-4' },
            { id: 'altered', name: '改造', range: '5-6' },
            { id: 'mutant', name: '天赋异禀', range: '7' },
            { id: 'gimmick', name: '花招诡计', range: '8-9' },
            { id: 'artificial', name: '人造生命', range: '10' },
            { id: 'alien', name: '天外来客', range: '11-12' }
        ];

        return `
            <div class="step-origin">
                <h3>选择能力起源</h3>
                <p class="step-hint">购点模式下，起源仅作为背景描述，不提供数值加成</p>
                <div class="origin-grid">
                    ${origins.map(o => `
                        <div class="origin-card ${character.origin?.id === o.id ? 'selected' : ''}" 
                             onclick="app.selectOrigin('${o.id}')">
                            <div class="origin-header">
                                <h4>${o.name}</h4>
                                <span class="origin-roll">${o.range}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    formatOriginEffects(mechanics) {
        // 简化版本，实际应该使用 formatOriginMechanics
        return '<p>查看详细效果</p>';
    }

    /**
     * 渲染属性步骤
     */
    renderAttributesStep(container) {
        const character = this.characterGenerator.getCharacter();
        const isPointBuy = this.creationMode === 'point-buy';
        
        let html = `
            <div class="step-attributes">
                <h3>属性测定</h3>
                <p class="step-hint">所有属性等级范围：1-10</p>
        `;

        if (isPointBuy) {
            const remaining = this.characterGenerator.getRemainingPoints();
            html += `<div class="points-display ${remaining < 0 ? 'warning' : ''}">
                剩余点数: ${remaining} / ${POINT_BUY_CONFIG.totalPoints}
            </div>`;
        }

        html += `<div class="attributes-grid">`;

        const attributeNames = {
            brawn: '勇猛', coordination: '协调', strength: '力量',
            intellect: '智力', awareness: '感知', willpower: '意志'
        };

        Object.entries(character.attributes).forEach(([key, value]) => {
            html += `
                <div class="attribute-card">
                    <div class="attribute-header">
                        <h4>${attributeNames[key]}</h4>
                    </div>
                    <div class="attribute-value">${value}</div>
                    ${isPointBuy ? `
                        <div class="attribute-controls">
                            <button onclick="app.adjustAttribute('${key}', -1)" ${value <= 1 ? 'disabled' : ''}>-</button>
                            <button onclick="app.adjustAttribute('${key}', 1)" ${value >= 10 ? 'disabled' : ''}>+</button>
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
                    <button class="btn btn-secondary" onclick="app.rerollAttributes()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * 渲染能力步骤
     */
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
            html += `
                <div class="power-card">
                    <div class="power-header">
                        <h4>${power.name}</h4>
                        <span class="power-category">${power.category}</span>
                    </div>
                    <div class="power-level">等级: ${power.level}</div>
                    ${isPointBuy ? `
                        <div class="power-actions">
                            <button onclick="app.adjustPowerLevel(${index}, -1)">-</button>
                            <button onclick="app.adjustPowerLevel(${index}, 1)">+</button>
                            <button class="btn-danger" onclick="app.removePower(${index})">删除</button>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += `</div>`;

        if (isPointBuy) {
            html += `
                <div class="add-power-form">
                    <h5>添加新能力</h5>
                    <div class="form-row">
                        <select id="new-power-category" onchange="app.updatePowerSelect()">
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
                    <button class="btn btn-primary" onclick="app.addPower()">添加能力</button>
                </div>
            `;
        } else {
            html += `
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.rerollPowers()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * 渲染专长步骤
     */
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
            const levelNames = { 1: '基础', 2: '专家', 3: '大师' };
            html += `
                <div class="specialty-card">
                    <div class="specialty-info">
                        <span class="specialty-name">${specialty.name}</span>
                    </div>
                    <div class="specialty-level">
                        <span class="specialty-level-badge">${levelNames[specialty.level]} (+${specialty.level})</span>
                        ${isPointBuy ? `
                            <div class="attribute-controls">
                                <button onclick="app.adjustSpecialtyLevel(${index}, -1)">-</button>
                                <button onclick="app.adjustSpecialtyLevel(${index}, 1)">+</button>
                                <button class="btn-danger" onclick="app.removeSpecialty(${index})">删除</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += `</div>`;

        if (isPointBuy) {
            html += `
                <div class="add-specialty-form">
                    <h5>添加新专长</h5>
                    <select id="new-specialty">
                        <option value="">选择专长</option>
                        <option value="空中战斗">空中战斗</option>
                        <option value="武术">武术</option>
                        <option value="科学">科学</option>
                        <option value="调查">调查</option>
                        <option value="潜行">潜行</option>
                        <option value="武器">武器</option>
                    </select>
                    <button class="btn btn-primary" onclick="app.addSpecialty()">添加专长</button>
                </div>
            `;
        } else {
            html += `
                <div class="step-actions">
                    <button class="btn btn-secondary" onclick="app.rerollSpecialties()">
                        <span>🎲</span> 重新掷骰
                    </button>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * 渲染描述步骤
     */
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
                    <input type="text" id="hero-name" value="${character.name}" placeholder="输入英雄名称">
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
                    <textarea id="hero-description" rows="4" placeholder="描述角色的背景、外观、性格等...">${character.description}</textarea>
                </div>
            </div>
        `;
    }

    /**
     * 渲染完成步骤
     */
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
                                    <div class="sheet-item-label">${key}</div>
                                    <div class="sheet-item-value">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sheet-section">
                        <h4>特殊能力 (${character.powers.length}项)</h4>
                        ${character.powers.map(p => `
                            <div class="sheet-power">
                                <strong>${p.name}</strong> (${p.category}) - 等级 ${p.level}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // 各种操作方法...
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
        // 保存当前步骤的数据
        if (this.currentStep === 5) {
            const name = document.getElementById('hero-name')?.value || '';
            const description = document.getElementById('hero-description')?.value || '';
            const qualities = Array.from(document.querySelectorAll('.quality-input-field')).map(input => input.value);
            
            this.characterGenerator.setInfo({ name, description, qualities });
        }
    }

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
        const category = document.getElementById('new-power-category')?.value;
        const name = document.getElementById('new-power-name')?.value;
        if (category && name) {
            this.characterGenerator.addPower(category, name);
            this.updatePointsDisplay();
            this.renderStep();
        }
    }

    rerollPowers() {
        this.characterGenerator.generatePowers();
        this.renderStep();
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
        }
    }

    rerollSpecialties() {
        this.characterGenerator.generateSpecialties();
        this.renderStep();
    }

    saveCharacter() {
        this.saveStepData();
        
        const character = this.characterGenerator.getCharacter();
        
        if (!character.name) {
            showError('请输入英雄名称');
            return;
        }

        if (this.editingCharacterId) {
            character.id = this.editingCharacterId;
        }

        if (saveCharacter(character)) {
            showSuccess('角色保存成功！');
            this.resetCreation();
            this.switchView('saved');
        } else {
            showError('保存失败，请重试');
        }
    }

    resetCreation() {
        this.currentStep = 1;
        this.creationMode = null;
        this.characterGenerator = null;
        this.editingCharacterId = null;
    }

    // 已存角色相关方法
    loadSavedCharacters() {
        const container = document.getElementById('saved-characters-list');
        if (!container) return;

        let characters = getSavedCharacters();
        
        // 搜索过滤
        if (this.searchQuery) {
            characters = searchCharacters(this.searchQuery);
        }
        
        // 排序
        characters = sortCharacters(characters, this.sortBy);

        if (characters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-title">还没有保存的角色</div>
                    <div class="empty-state-desc">点击"创建角色"开始您的英雄之旅</div>
                </div>
            `;
            return;
        }

        container.innerHTML = characters.map(char => `
            <div class="character-card">
                <div class="character-avatar">🦸</div>
                <div class="character-info">
                    <div class="character-name">${char.name || '未命名英雄'}</div>
                    <div class="character-meta">
                        <span>${char.origin?.name || ''}</span>
                        <span>耐力: ${char.stamina}</span>
                        <span>决意: ${char.resolve}</span>
                        <span>${char.powers.length}项能力</span>
                    </div>
                </div>
                <div class="character-actions">
                    <button class="btn btn-secondary btn-small" onclick="app.viewCharacter(${char.id})">查看</button>
                    <button class="btn btn-primary btn-small" onclick="app.editCharacter(${char.id})">编辑</button>
                    <button class="btn btn-danger btn-small" onclick="app.deleteCharacter(${char.id})">删除</button>
                </div>
            </div>
        `).join('');
    }

    viewCharacter(id) {
        const character = getCharacterById(id);
        if (character) {
            showCharacterDetail(character);
        }
    }

    editCharacter(id) {
        const character = getCharacterById(id);
        if (!character) return;

        this.editingCharacterId = id;
        this.creationMode = character.mode;
        this.currentStep = 1;

        // 创建生成器并加载角色数据
        this.characterGenerator = new CharacterGenerator(character.mode);
        this.characterGenerator.character = { ...character };

        this.updateModeBadge();
        this.updatePointsDisplay();
        this.renderStep();
        this.switchView('create');
    }

    deleteCharacter(id) {
        showConfirm('确定要删除这个角色吗？', () => {
            if (deleteCharacter(id)) {
                showSuccess('角色已删除');
                this.loadSavedCharacters();
            } else {
                showError('删除失败');
            }
        });
    }

    filterCharacters() {
        const input = document.getElementById('character-search');
        this.searchQuery = input?.value || '';
        this.loadSavedCharacters();
    }

    sortCharacters() {
        const select = document.getElementById('sort-select');
        this.sortBy = select?.value || 'newest';
        this.loadSavedCharacters();
    }

    // 导入导出
    async importCharacter() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const content = await readFile(file);
                const result = importCharacters(content);
                
                if (result.success) {
                    showSuccess(`成功导入 ${result.imported} 个角色`);
                    this.loadSavedCharacters();
                } else {
                    showError(result.error || '导入失败');
                }
            } catch (error) {
                showError('文件读取失败');
            }
        };
        
        input.click();
    }

    exportAllCharacters() {
        const data = exportAllCharacters();
        const filename = `漫画英雄角色卡_${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(data, filename);
        showSuccess('角色卡已导出');
    }

    exportSingleCharacter(id) {
        const character = getCharacterById(id);
        if (!character) return;

        const data = exportCharacterToJSON(character);
        const filename = `${character.name || '角色'}_${Date.now()}.json`;
        downloadFile(data, filename);
        showSuccess('角色卡已导出');
    }

    // 其他方法
    loadRandomExample() {
        const character = createRandomCharacter();
        character.name = '示例英雄';
        
        this.characterGenerator = new CharacterGenerator('random');
        this.characterGenerator.character = character;
        this.creationMode = 'random';
        this.currentStep = 6;
        
        this.updateModeBadge();
        this.renderStep();
        this.switchView('create');
    }

    showHelp() {
        this.switchView('help');
    }

    toggleHelp() {
        if (this.currentView === 'help') {
            this.switchView('home');
        } else {
            this.switchView('help');
        }
    }

    closeModal() {
        closeModal();
    }

    updatePowerSelect() {
        // 根据类别更新能力选择
        // 简化实现
    }
}

// 创建全局应用实例
const app = new ComicHeroApp();
window.app = app; // 暴露到全局以便HTML中调用

export default app;