/**
 * 核心模块入口
 * 统一导出所有核心模块
 */

export * from './dice.js';
export * from './character.js';
export * from './storage.js';

/**
 * 工具函数
 */

/**
 * 防抖函数
 * @param {Function} func - 目标函数
 * @param {number} wait - 等待时间
 * @returns {Function} 防抖后的函数
 */
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

/**
 * 节流函数
 * @param {Function} func - 目标函数
 * @param {number} limit - 限制时间
 * @returns {Function} 节流后的函数
 */
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

/**
 * 深拷贝
 * @param {any} obj - 目标对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * 格式化数字
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
    return num.toString().padStart(2, '0');
}

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} length - 最大长度
 * @returns {string} 截断后的文本
 */
export function truncateText(text, length = 50) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * 安全地获取嵌套属性
 * @param {Object} obj - 对象
 * @param {string} path - 属性路径
 * @param {any} defaultValue - 默认值
 * @returns {any} 属性值或默认值
 */
export function get(obj, path, defaultValue = null) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result == null || typeof result !== 'object') {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
}

/**
 * 检查对象是否为空
 * @param {Object} obj - 对象
 * @returns {boolean} 是否为空
 */
export function isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj)) return obj.length === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
}

/**
 * 合并对象
 * @param {...Object} objects - 对象列表
 * @returns {Object} 合并后的对象
 */
export function merge(...objects) {
    return Object.assign({}, ...objects);
}

/**
 * 等待指定时间
 * @param {number} ms - 毫秒数
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 随机打乱数组
 * @param {Array} array - 数组
 * @returns {Array} 打乱后的数组
 */
export function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 从数组中随机选择
 * @param {Array} array - 数组
 * @param {number} count - 选择数量
 * @returns {Array} 选中的元素
 */
export function sample(array, count = 1) {
    const shuffled = shuffle(array);
    return shuffled.slice(0, count);
}

/**
 * 计算数组总和
 * @param {Array} array - 数组
 * @param {Function} fn - 取值函数
 * @returns {number} 总和
 */
export function sum(array, fn = x => x) {
    return array.reduce((acc, item) => acc + fn(item), 0);
}

/**
 * 计算数组平均值
 * @param {Array} array - 数组
 * @param {Function} fn - 取值函数
 * @returns {number} 平均值
 */
export function average(array, fn = x => x) {
    if (array.length === 0) return 0;
    return sum(array, fn) / array.length;
}

/**
 * 分组
 * @param {Array} array - 数组
 * @param {Function} fn - 分组函数
 * @returns {Object} 分组后的对象
 */
export function groupBy(array, fn) {
    return array.reduce((acc, item) => {
        const key = fn(item);
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}

/**
 * 去重
 * @param {Array} array - 数组
 * @param {Function} fn - 唯一键函数
 * @returns {Array} 去重后的数组
 */
export function unique(array, fn = x => x) {
    const seen = new Set();
    return array.filter(item => {
        const key = fn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

/**
 * 事件发射器
 */
export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    emit(event, ...args) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => {
            try {
                callback(...args);
            } catch (error) {
                console.error('事件处理错误:', error);
            }
        });
    }

    once(event, callback) {
        const onceCallback = (...args) => {
            this.off(event, onceCallback);
            callback(...args);
        };
        this.on(event, onceCallback);
    }
}

/**
 * 状态管理器
 */
export class StateManager extends EventEmitter {
    constructor(initialState = {}) {
        super();
        this.state = initialState;
        this.prevState = null;
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.prevState = { ...this.state };
        this.state = { ...this.state, ...newState };
        this.emit('change', this.state, this.prevState);
    }

    get(key, defaultValue = null) {
        return this.state[key] !== undefined ? this.state[key] : defaultValue;
    }

    set(key, value) {
        this.setState({ [key]: value });
    }

    reset() {
        this.prevState = { ...this.state };
        this.state = {};
        this.emit('reset');
    }
}