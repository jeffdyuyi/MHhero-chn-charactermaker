/**
 * Toast通知模块
 */

const CONTAINER_ID = 'toast-container';

/**
 * 获取或创建容器
 * @returns {HTMLElement} 容器元素
 */
function getContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = CONTAINER_ID;
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'true');
        document.body.appendChild(container);
    }
    return container;
}

/**
 * 创建Toast元素
 * @param {string} message - 消息内容
 * @param {string} type - 类型
 * @param {number} duration - 持续时间
 * @returns {HTMLElement} Toast元素
 */
function createToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" aria-label="关闭">&times;</button>
    `;
    
    // 关闭按钮
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }
    
    return toast;
}

/**
 * 移除Toast
 * @param {HTMLElement} toast - Toast元素
 */
function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    
    toast.style.animation = 'slideOutRight 0.3s ease';
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * 显示Toast
 * @param {string} message - 消息内容
 * @param {string} type - 类型 (success, error, warning, info)
 * @param {number} duration - 持续时间
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = getContainer();
    const toast = createToast(message, type, duration);
    container.appendChild(toast);
}

/**
 * 显示成功Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间
 */
export function showSuccess(message, duration = 3000) {
    showToast(message, 'success', duration);
}

/**
 * 显示错误Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间
 */
export function showError(message, duration = 5000) {
    showToast(message, 'error', duration);
}

/**
 * 显示警告Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间
 */
export function showWarning(message, duration = 4000) {
    showToast(message, 'warning', duration);
}

/**
 * 显示信息Toast
 * @param {string} message - 消息内容
 * @param {number} duration - 持续时间
 */
export function showInfo(message, duration = 3000) {
    showToast(message, 'info', duration);
}

/**
 * 清除所有Toast
 */
export function clearAllToasts() {
    const container = getContainer();
    const toasts = container.querySelectorAll('.toast');
    toasts.forEach(toast => removeToast(toast));
}