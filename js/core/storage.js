/**
 * 存储模块
 * 处理本地存储和导入导出
 */

import { APP_CONFIG } from '../data/index.js';

const STORAGE_KEY = APP_CONFIG.storageKey;

/**
 * 获取所有保存的角色
 * @returns {Array} 角色数组
 */
export function getSavedCharacters() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('读取角色数据失败:', error);
        return [];
    }
}

/**
 * 保存角色
 * @param {Object} character - 角色对象
 * @returns {boolean} 是否成功
 */
export function saveCharacter(character) {
    try {
        const characters = getSavedCharacters();

        // 检查是否已存在
        const existingIndex = characters.findIndex(c => c.id === character.id);

        character.updatedAt = new Date().toISOString();

        if (existingIndex >= 0) {
            // 更新现有角色
            characters[existingIndex] = character;
        } else {
            // 添加新角色
            if (characters.length >= APP_CONFIG.maxCharacters) {
                throw new Error(`最多只能保存 ${APP_CONFIG.maxCharacters} 个角色`);
            }
            characters.push(character);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
        return true;
    } catch (error) {
        console.error('保存角色失败:', error);
        return false;
    }
}

/**
 * 删除角色
 * @param {number} id - 角色ID
 * @returns {boolean} 是否成功
 */
export function deleteCharacter(id) {
    try {
        const characters = getSavedCharacters();
        const filtered = characters.filter(c => c.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('删除角色失败:', error);
        return false;
    }
}

/**
 * 根据ID获取角色
 * @param {number} id - 角色ID
 * @returns {Object|null} 角色对象
 */
export function getCharacterById(id) {
    const characters = getSavedCharacters();
    return characters.find(c => c.id === id) || null;
}

/**
 * 搜索角色
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的角色数组
 */
export function searchCharacters(query) {
    const characters = getSavedCharacters();
    if (!query || query.trim() === '') return characters;

    const lowerQuery = query.toLowerCase();
    return characters.filter(c =>
        c.name?.toLowerCase().includes(lowerQuery) ||
        c.origin?.name?.toLowerCase().includes(lowerQuery) ||
        c.description?.toLowerCase().includes(lowerQuery)
    );
}

/**
 * 排序角色
 * @param {Array} characters - 角色数组
 * @param {string} sortBy - 排序方式
 * @returns {Array} 排序后的数组
 */
export function sortCharacters(characters, sortBy = 'newest') {
    const sorted = [...characters];

    switch (sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'name':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'power':
            sorted.sort((a, b) => b.powers.length - a.powers.length);
            break;
        case 'stamina':
            sorted.sort((a, b) => b.stamina - a.stamina);
            break;
        default:
            break;
    }

    return sorted;
}

/**
 * 导出所有角色
 * @returns {string} JSON字符串
 */
export function exportAllCharacters() {
    const characters = getSavedCharacters();
    return JSON.stringify(characters, null, 2);
}

/**
 * 导入角色
 * @param {string} json - JSON字符串
 * @returns {Object} 导入结果
 */
export function importCharacters(json) {
    try {
        const data = JSON.parse(json);

        // 支持单角色或角色数组
        const characters = Array.isArray(data) ? data : [data];

        let imported = 0;
        let failed = 0;

        characters.forEach(character => {
            // 验证角色数据
            if (character.attributes && character.powers && character.specialties) {
                // 生成新ID避免冲突
                character.id = Date.now() + Math.random();
                character.createdAt = new Date().toISOString();

                if (saveCharacter(character)) {
                    imported++;
                } else {
                    failed++;
                }
            } else {
                failed++;
            }
        });

        return { success: true, imported, failed };
    } catch (error) {
        console.error('导入角色失败:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 清空所有角色
 * @returns {boolean} 是否成功
 */
export function clearAllCharacters() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('清空角色失败:', error);
        return false;
    }
}

/**
 * 获取存储统计
 * @returns {Object} 统计信息
 */
export function getStorageStats() {
    const characters = getSavedCharacters();
    const totalSize = new Blob([JSON.stringify(characters)]).size;

    return {
        count: characters.length,
        totalSize: totalSize,
        maxSize: 5 * 1024 * 1024, // 5MB (localStorage typical limit)
        usage: (totalSize / (5 * 1024 * 1024) * 100).toFixed(2) + '%'
    };
}

/**
 * 备份数据
 * @returns {string} 备份数据JSON
 */
export function backupData() {
    const data = {
        version: APP_CONFIG.version,
        timestamp: new Date().toISOString(),
        characters: getSavedCharacters()
    };
    return JSON.stringify(data, null, 2);
}

/**
 * 恢复数据
 * @param {string} json - 备份JSON
 * @returns {boolean} 是否成功
 */
export function restoreData(json) {
    try {
        const data = JSON.parse(json);

        if (data.characters && Array.isArray(data.characters)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.characters));
            return true;
        }
        return false;
    } catch (error) {
        console.error('恢复数据失败:', error);
        return false;
    }
}

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - MIME类型
 */
export function downloadFile(content, filename, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * 读取文件
 * @param {File} file - 文件对象
 * @returns {Promise<string>} 文件内容
 */
export function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * 将角色导出为包含JSON数据的图片
 * @param {HTMLElement} element - 要截图的DOM元素
 * @param {Object} character - 角色对象
 */
export async function exportCharacterAsImage(element, character) {
    if (typeof html2canvas === 'undefined') {
        throw new Error('未加载 html2canvas 库');
    }

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#ffffff',
            scale: 2, // 提升清晰度
            useCORS: true,
            logging: false
        });

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        const jsonString = JSON.stringify(character);
        const marker = 'CHAR_DATA:';

        // 创建包含图片和JSON数据的混合Blob
        const finalBlob = new Blob([blob, marker, jsonString], { type: 'image/png' });

        const filename = `hero-${character.name || 'unnamed'}-${new Date().getTime()}.png`;
        const url = URL.createObjectURL(finalBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        URL.revokeObjectURL(url);
        return true;
    } catch (error) {
        console.error('导出图片失败:', error);
        throw error;
    }
}

/**
 * 从含有嵌入数据的图片中恢复角色
 * @param {File} file - 图片文件
 * @returns {Promise<Object>} 角色对象
 */
export function importCharacterFromImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                const decoder = new TextDecoder();
                const text = decoder.decode(uint8Array);

                const marker = 'CHAR_DATA:';
                const markerIndex = text.lastIndexOf(marker);

                if (markerIndex === -1) {
                    throw new Error('该图片不包含有效的英雄档案数据');
                }

                const jsonPart = text.substring(markerIndex + marker.length);
                const character = JSON.parse(jsonPart);
                resolve(character);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}