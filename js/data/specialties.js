/**
 * 专长数据模块
 * 定义所有专长及其等级系统
 */

export const SPECIALTIES = [
    { id: 'aerial_combat', name: '空中战斗', category: 'combat' },
    { id: 'art', name: '艺术', category: 'social' },
    { id: 'athletics', name: '运动技巧', category: 'action' },
    { id: 'business', name: '商业', category: 'knowledge' },
    { id: 'driving_land', name: '陆地驾驶', category: 'driving' },
    { id: 'investigation', name: '调查', category: 'action' },
    { id: 'law', name: '法律', category: 'knowledge' },
    { id: 'leadership', name: '领导力', category: 'social' },
    { id: 'languages', name: '语言', category: 'social' },
    { id: 'martial_arts', name: '武术', category: 'combat' },
    { id: 'medicine', name: '医学', category: 'knowledge' },
    { id: 'mental_resistance', name: '精神抗性', category: 'combat' },
    { id: 'military', name: '军事', category: 'knowledge' },
    { id: 'occult', name: '神秘学', category: 'knowledge' },
    { id: 'performance', name: '表演', category: 'social' },
    { id: 'driving_air', name: '空中驾驶', category: 'driving' },
    { id: 'power_specialty', name: '特殊能力', category: 'special' },
    { id: 'psychiatry', name: '精神病学', category: 'knowledge' },
    { id: 'science', name: '科学', category: 'knowledge' },
    { id: 'sleight_of_hand', name: '快手', category: 'action' },
    { id: 'stealth', name: '潜行', category: 'action' },
    { id: 'craft', name: '工艺', category: 'action' },
    { id: 'underwater_combat', name: '水下战斗', category: 'combat' },
    { id: 'weapons', name: '武器', category: 'combat' },
    { id: 'brawling', name: '格斗', category: 'combat' }
];

export const SPECIALTY_LEVELS = [
    { level: 1, name: '基础', bonus: '+1', description: '对应检定+1' },
    { level: 2, name: '专家', bonus: '+2', description: '对应检定+2' },
    { level: 3, name: '大师', bonus: '+3', description: '对应检定+3，允许使用特技' }
];

export const SPECIALTY_COUNT_TABLE = [
    { rollRange: [2, 3, 4], count: 1 },
    { rollRange: [5, 6, 7], count: 2 },
    { rollRange: [8, 9, 10], count: 3 },
    { rollRange: [11, 12], count: 4 }
];

export const SPECIALTY_CATEGORIES = {
    combat: { name: '战斗类', icon: '⚔️' },
    driving: { name: '驾驶类', icon: '🚗' },
    knowledge: { name: '学识类', icon: '📚' },
    action: { name: '行动类', icon: '🏃' },
    social: { name: '社交/其他', icon: '👥' },
    special: { name: '特殊', icon: '✨' }
};

/**
 * 根据掷骰结果获取专长数量
 * @param {number} roll - 2d6掷骰结果
 * @returns {number} 专长数量
 */
export function getSpecialtyCountByRoll(roll) {
    const entry = SPECIALTY_COUNT_TABLE.find(t => t.rollRange.includes(roll));
    return entry ? entry.count : 2;
}

/**
 * 根据等级获取专长信息
 * @param {number} level - 等级
 * @returns {Object|null} 等级信息
 */
export function getSpecialtyLevelInfo(level) {
    return SPECIALTY_LEVELS.find(l => l.level === level) || null;
}

/**
 * 获取专长名称
 * @param {string} id - 专长ID
 * @returns {string} 专长名称
 */
export function getSpecialtyName(id) {
    const specialty = SPECIALTIES.find(s => s.id === id);
    return specialty ? specialty.name : id;
}

/**
 * 获取专长分类
 * @param {string} id - 专长ID
 * @returns {string} 分类ID
 */
export function getSpecialtyCategory(id) {
    const specialty = SPECIALTIES.find(s => s.id === id);
    return specialty ? specialty.category : 'special';
}

/**
 * 按分类获取专长列表
 * @returns {Object} 分类后的专长对象
 */
export function getSpecialtiesByCategory() {
    const result = {};
    Object.keys(SPECIALTY_CATEGORIES).forEach(key => {
        result[key] = SPECIALTIES.filter(s => s.category === key);
    });
    return result;
}

/**
 * 创建新专长对象
 * @param {string} specialtyId - 专长ID
 * @param {number} level - 等级
 * @returns {Object} 专长对象
 */
export function createSpecialty(specialtyId, level = 1) {
    const specialty = SPECIALTIES.find(s => s.id === specialtyId);
    return {
        id: Date.now() + Math.random(),
        specialtyId,
        name: specialty ? specialty.name : specialtyId,
        category: specialty ? specialty.category : 'special',
        level
    };
}

/**
 * 获取专长列表（用于选择器）
 * @returns {Array} 专长数组
 */
export function getSpecialtiesList() {
    return SPECIALTIES.map(s => ({
        value: s.id,
        label: s.name,
        category: s.category,
        categoryName: SPECIALTY_CATEGORIES[s.category]?.name || '其他'
    }));
}