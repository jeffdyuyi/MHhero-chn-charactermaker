/**
 * 模态框模块
 */

import { getPowerDescription } from '../data/powers.js';

const MODAL_ID = 'modal';

/**
 * 获取模态框元素
 * @returns {HTMLElement} 模态框元素
 */
function getModal() {
    return document.getElementById(MODAL_ID);
}

/**
 * 打开模态框
 * @param {Object} options - 配置选项
 */
export function openModal(options = {}) {
    const modal = getModal();
    if (!modal) return;

    const {
        title = '',
        content = '',
        footer = '',
        size = 'medium', // small, medium, large, full
        closable = true,
        onClose = null
    } = options;

    // 设置标题
    const titleEl = modal.querySelector('#modal-title');
    if (titleEl) titleEl.textContent = title;

    // 设置内容
    const bodyEl = modal.querySelector('#modal-body');
    if (bodyEl) {
        if (typeof content === 'string') {
            bodyEl.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyEl.innerHTML = '';
            bodyEl.appendChild(content);
        }
    }

    // 设置底部
    const footerEl = modal.querySelector('#modal-footer');
    if (footerEl) {
        if (footer) {
            footerEl.innerHTML = footer;
            footerEl.style.display = 'flex';
        } else {
            footerEl.innerHTML = '';
            footerEl.style.display = 'none';
        }
    }

    // 设置大小
    modal.querySelector('.modal-content').className = `modal-content modal-${size}`;

    // 显示模态框
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // 关闭按钮
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => {
            closeModal();
            if (onClose) onClose();
        };
    }

    // 点击背景关闭
    if (closable) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
                if (onClose) onClose();
            }
        };
    }

    // ESC键关闭
    const handleKeydown = (e) => {
        if (e.key === 'Escape' && closable) {
            closeModal();
            if (onClose) onClose();
        }
    };
    document.addEventListener('keydown', handleKeydown);

    // 保存引用以便清理
    modal._keydownHandler = handleKeydown;
}

/**
 * 关闭模态框
 */
export function closeModal() {
    const modal = getModal();
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';

    // 清理事件监听
    if (modal._keydownHandler) {
        document.removeEventListener('keydown', modal._keydownHandler);
        delete modal._keydownHandler;
    }
}

/**
 * 显示确认对话框
 * @param {string} message - 确认消息
 * @param {Function} onConfirm - 确认回调
 * @param {Function} onCancel - 取消回调
 */
export function showConfirm(message, onConfirm, onCancel = null) {
    openModal({
        title: '确认',
        content: `<p class="confirm-message">${message}</p>`,
        footer: `
            <button class="btn btn-secondary" onclick="window.modalCancel()">取消</button>
            <button class="btn btn-primary" onclick="window.modalConfirm()">确认</button>
        `,
        closable: false,
        onClose: onCancel
    });

    window.modalConfirm = () => {
        closeModal();
        if (onConfirm) onConfirm();
        cleanup();
    };

    window.modalCancel = () => {
        closeModal();
        if (onCancel) onCancel();
        cleanup();
    };

    function cleanup() {
        delete window.modalConfirm;
        delete window.modalCancel;
    }
}

/**
 * 显示角色详情
 * @param {Object} character - 角色对象
 */
export function showCharacterDetail(character) {
    const content = createCharacterDetailHTML(character);

    openModal({
        title: character.name || '未命名英雄',
        content,
        size: 'large',
        footer: `
            <button class="btn btn-secondary" onclick="app.closeModal()">关闭</button>
            <button class="btn btn-primary" onclick="app.editCharacter('${character.id}')">编辑</button>
            <button class="btn btn-success" onclick="app.exportSingleCharacter('${character.id}')">导出</button>
        `
    });
}

/**
 * 创建角色详情HTML
 * @param {Object} character - 角色对象
 * @returns {string} HTML字符串
 */
function createCharacterDetailHTML(character) {
    return `
        <div class="character-detail-sheet">
            <div class="sheet-header">
                <p class="sheet-meta">
                    ${character.origin?.name || ''} | 
                    ${character.mode === 'random' ? '随机模式' : '购点模式'} |
                    创建于 ${new Date(character.createdAt).toLocaleString('zh-CN')}
                </p>
            </div>
            
            <div class="sheet-section">
                <h4>衍生属性</h4>
                <div class="sheet-stats">
                    <div class="stat-box">
                        <span class="stat-label">耐力</span>
                        <span class="stat-value">${character.stamina}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">决意</span>
                        <span class="stat-value">${character.resolve}</span>
                    </div>
                </div>
            </div>
            
            <div class="sheet-section">
                <h4>基础属性</h4>
                <div class="sheet-attributes">
                    ${Object.entries(character.attributes).map(([key, value]) => `
                        <div class="attribute-item">
                            <span class="attr-name">${getAttributeName(key)}</span>
                            <span class="attr-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="sheet-section">
                <h4>特殊能力 (${character.powers.length}项)</h4>
                <div class="sheet-powers">
                    ${character.powers.map(power => `
                        <div class="power-item">
                            <div class="power-info">
                                <span class="power-name power-clickable" onclick="window.showPowerDetailInModal('${power.name}')">${power.name}</span>
                                <span class="power-category">${power.category}</span>
                            </div>
                            <span class="power-level">等级 ${power.level}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="sheet-section">
                <h4>专长 (${character.specialties.length}项)</h4>
                <div class="sheet-specialties">
                    ${character.specialties.map(spec => `
                        <div class="specialty-item">
                            <span class="spec-name">${spec.name}</span>
                            <span class="spec-level">${getSpecialtyLevelName(spec.level)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${character.qualities?.some(q => q) ? `
                <div class="sheet-section">
                    <h4>特质</h4>
                    <div class="sheet-qualities">
                        ${character.qualities.filter(q => q).map(q => `
                            <span class="quality-tag">${q}</span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${character.description ? `
                <div class="sheet-section">
                    <h4>角色描述</h4>
                    <p class="sheet-description">${character.description}</p>
                </div>
            ` : ''}
        </div>
    `;
}

function getAttributeName(key) {
    const names = {
        brawn: '勇猛',
        coordination: '协调',
        strength: '力量',
        intellect: '智力',
        awareness: '感知',
        willpower: '意志'
    };
    return names[key] || key;
}

function getSpecialtyLevelName(level) {
    const names = { 1: '基础', 2: '专家', 3: '大师' };
    return names[level] || level;
}

window.showPowerDetailInModal = function (powerName) {
    const description = getPowerDescription(powerName);
    openModal({
        title: powerName,
        content: `
            <div class="power-detail-content">
                <div class="power-description">
                    ${description}
                </div>
            </div>
        `,
        size: 'medium'
    });
};