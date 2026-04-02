/**
 * 属性数据模块
 * 定义所有基础属性和等级系统
 */

export const ATTRIBUTES = {
    brawn: {
        id: 'brawn',
        name: '勇猛',
        category: 'physical',
        description: '徒手或使用武器进行近战攻击的能力，决定了角色在近身战斗中的攻击和防御能力，是肉搏战的核心属性。',
        icon: '👊',
        details: '勇猛属性影响角色的近战攻击检定、格斗能力和对物理攻击的抵抗能力。高勇猛值的角色在肉搏战中更具优势，能够更有效地使用近战武器和进行徒手攻击。'
    },
    coordination: {
        id: 'coordination',
        name: '协调',
        category: 'physical',
        description: '敏捷、精准度、手眼协调、速度和灵活性，影响远程攻击、躲避和各种需要精细动作的任务。',
        icon: '🎯',
        details: '协调属性决定了角色的反应速度、瞄准精度和身体协调性。高协调值的角色在使用远程武器、进行杂技动作、驾驶车辆和躲避攻击时表现更佳。'
    },
    strength: {
        id: 'strength',
        name: '力量',
        category: 'physical',
        description: '肌肉力量、耐力和体质，决定了角色的负重能力、物理伤害和对伤害的抵抗力。',
        icon: '💪',
        details: '力量属性影响角色的负重限额、近战攻击的伤害输出、对物理伤害的抵抗能力，以及需要体力的各种任务。高力量值的角色能够举起更重的物体，造成更多的物理伤害。'
    },
    intellect: {
        id: 'intellect',
        name: '智力',
        category: 'mental',
        description: '聪慧、理性思考能力和一般知识，影响解谜、科技使用和知识检定。',
        icon: '🧠',
        details: '智力属性决定了角色的学习能力、问题解决能力和对知识的掌握程度。高智力值的角色在解谜、使用科技设备、进行科学研究和记忆信息方面表现更佳。'
    },
    awareness: {
        id: 'awareness',
        name: '感知',
        category: 'mental',
        description: '洞察力，细节关注和理解力，影响察觉、侦查和对环境的感知能力。',
        icon: '👁️',
        details: '感知属性决定了角色的观察力、洞察力和对周围环境的感知能力。高感知值的角色能够更容易地发现隐藏的物体、察觉敌人的存在和注意到环境中的细节。'
    },
    willpower: {
        id: 'willpower',
        name: '意志',
        category: 'mental',
        description: '人格力量、自信、自律和勇气，影响精神抵抗、决意点和面对压力的能力。',
        icon: '🔥',
        details: '意志属性决定了角色的精神韧性、抵抗精神攻击的能力和面对困难时的坚持程度。高意志值的角色能够更好地抵抗精神控制、恐惧和其他精神影响，同时也是计算决意点的重要因素。'
    }
};

export const ATTRIBUTE_LEVELS = [
    { roll: 2, level: 1, title: '资质驽钝', description: '能力不佳，人类的最低值', details: '角色在该属性方面表现极差，几乎无法完成需要该属性的基本任务。' },
    { roll: 3, level: 2, title: '相形见绌', description: '低于人类平均水平', details: '角色在该属性方面表现较弱，完成相关任务时经常遇到困难。' },
    { roll: 4, level: 3, title: '平庸之辈', description: '人类的平均水平', details: '角色在该属性方面表现普通，能够完成基本任务，但没有特别突出的表现。' },
    { roll: [5, 6], level: 4, title: '天赋尚可', description: '高于人类平均水平', details: '角色在该属性方面表现良好，能够较为轻松地完成相关任务。' },
    { roll: [7, 8], level: 5, title: '高人一等', description: '超凡的人类', details: '角色在该属性方面表现出色，超出大多数人类的水平。' },
    { roll: [9, 10], level: 6, title: '超乎常人', description: '卓越的人类', details: '角色在该属性方面表现卓越，达到人类的极限水平。' },
    { roll: 11, level: 7, title: '出类拔萃', description: '水平较低的超人类', details: '角色在该属性方面已经超越了人类的极限，展现出超人类的能力。' },
    { roll: 12, level: 8, title: '卓尔不凡', description: '超人类', details: '角色在该属性方面表现出明显的超人类能力，远超普通人类。' },
    { roll: null, level: 9, title: '望尘莫及', description: '水平较高的超人类（需加成）', details: '角色在该属性方面达到了高级超人类的水平，能力令人惊叹。' },
    { roll: null, level: 10, title: '登峰造极', description: '宛若神明（需加成）', details: '角色在该属性方面达到了神级水平，能力几乎不可限量。' }
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