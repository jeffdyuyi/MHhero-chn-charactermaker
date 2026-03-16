/**
 * 属性数据模块
 * 定义所有基础属性和等级系统
 */

export const ATTRIBUTES = {
    brawn: {
        id: 'brawn',
        name: '勇猛',
        category: 'physical',
        description: '徒手或使用武器进行近战攻击的能力',
        icon: '👊'
    },
    coordination: {
        id: 'coordination',
        name: '协调',
        category: 'physical',
        description: '敏捷、精准度、手眼协调、速度和魅力',
        icon: '🎯'
    },
    strength: {
        id: 'strength',
        name: '力量',
        category: 'physical',
        description: '肌肉力量、耐力和体质',
        icon: '💪'
    },
    intellect: {
        id: 'intellect',
        name: '智力',
        category: 'mental',
        description: '聪慧、理性思考能力和一般知识',
        icon: '🧠'
    },
    awareness: {
        id: 'awareness',
        name: '感知',
        category: 'mental',
        description: '洞察力，细节关注和理解力',
        icon: '👁️'
    },
    willpower: {
        id: 'willpower',
        name: '意志',
        category: 'mental',
        description: '人格力量、自信、自律和勇气',
        icon: '🔥'
    }
};

export const ATTRIBUTE_LEVELS = [
    { roll: 2, level: 1, title: '资质驽钝', description: '能力不佳，人类的最低值' },
    { roll: 3, level: 2, title: '相形见绌', description: '低于人类平均水平' },
    { roll: 4, level: 3, title: '平庸之辈', description: '人类的平均水平' },
    { roll: [5, 6], level: 4, title: '天赋尚可', description: '高于人类平均水平' },
    { roll: [7, 8], level: 5, title: '高人一等', description: '超凡的人类' },
    { roll: [9, 10], level: 6, title: '超乎常人', description: '卓越的人类' },
    { roll: 11, level: 7, title: '出类拔萃', description: '水平较低的超人类' },
    { roll: 12, level: 8, title: '卓尔不凡', description: '超人类' },
    { roll: null, level: 9, title: '望尘莫及', description: '水平较高的超人类（需加成）' },
    { roll: null, level: 10, title: '登峰造极', description: '宛若神明（需加成）' }
];

/**
 * 根据掷骰结果获取属性等级
 * @param {number} roll - 2d6掷骰结果
 * @returns {number} 等级值
 */
export function getAttributeLevel(roll) {
    const level = ATTRIBUTE_LEVELS.find(l => {
        if (Array.isArray(l.roll)) {
            return l.roll.includes(roll);
        }
        return l.roll === roll;
    });
    return level ? level.level : 1;
}

/**
 * 根据等级获取属性标题
 * @param {number} level - 等级值
 * @returns {Object|null} 等级对象
 */
export function getAttributeLevelInfo(level) {
    return ATTRIBUTE_LEVELS.find(l => l.level === level) || null;
}

/**
 * 获取属性标题
 * @param {number} level - 等级值
 * @returns {string} 标题
 */
export function getAttributeTitle(level) {
    const info = getAttributeLevelInfo(level);
    return info ? info.title : '';
}

/**
 * 获取属性描述
 * @param {number} level - 等级值
 * @returns {string} 描述
 */
export function getAttributeDescription(level) {
    const info = getAttributeLevelInfo(level);
    return info ? info.description : '';
}

/**
 * 获取所有属性键
 * @returns {string[]} 属性键数组
 */
export function getAttributeKeys() {
    return Object.keys(ATTRIBUTES);
}

/**
 * 获取属性列表
 * @returns {Array} 属性数组
 */
export function getAttributesList() {
    return Object.entries(ATTRIBUTES).map(([key, attr]) => ({
        key,
        ...attr
    }));
}

/**
 * 计算属性总和
 * @param {Object} attributes - 属性对象
 * @returns {number} 总和
 */
export function calculateAttributeSum(attributes) {
    return Object.values(attributes).reduce((sum, val) => sum + val, 0);
}

/**
 * 检查属性是否达到最低要求
 * @param {Object} attributes - 属性对象
 * @param {number} minSum - 最低总和要求
 * @returns {boolean} 是否满足
 */
export function checkAttributeMinimum(attributes, minSum = 20) {
    return calculateAttributeSum(attributes) >= minSum;
}