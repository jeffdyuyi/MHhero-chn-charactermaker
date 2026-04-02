/**
 * 专长数据模块
 * 定义所有专长及其等级系统
 */

export const SPECIALTIES = [
    { id: 'aerial_combat', name: '空中战斗', category: 'combat', description: '在飞行或空中环境中进行战斗的技能', details: '掌握空中战斗技巧的角色在飞行状态下进行攻击和防御时获得检定加值，能够更有效地在三维空间中与敌人交战。' },
    { id: 'art', name: '艺术', category: 'social', description: '各种艺术形式的创作和欣赏能力', details: '拥有艺术专长的角色在创作艺术作品、鉴赏艺术品和通过艺术表达情感时获得检定加值。' },
    { id: 'athletics', name: '运动技巧', category: 'action', description: '各种体育运动和体能活动的技能', details: '运动技巧专长使角色在跑步、跳跃、攀爬、游泳等体能活动中获得检定加值，提高身体表现能力。' },
    { id: 'business', name: '商业', category: 'knowledge', description: '商业运作、财务管理和谈判的能力', details: '商业专长使角色在商业谈判、财务管理、市场分析和企业运营方面获得检定加值。' },
    { id: 'driving_land', name: '陆地驾驶', category: 'driving', description: '驾驶各种陆地车辆的技能', details: '陆地驾驶专长使角色在驾驶汽车、摩托车、卡车等陆地交通工具时获得检定加值，提高驾驶安全性和操控能力。' },
    { id: 'investigation', name: '调查', category: 'action', description: '收集线索、分析证据和解决谜题的能力', details: '调查专长使角色在寻找线索、分析证据、破解谜题和追踪目标时获得检定加值。' },
    { id: 'law', name: '法律', category: 'knowledge', description: '法律知识和法律程序的理解', details: '法律专长使角色在理解法律条文、处理法律事务和进行法律辩护时获得检定加值。' },
    { id: 'leadership', name: '领导力', category: 'social', description: '领导和激励他人的能力', details: '领导力专长使角色在领导团队、激励他人和组织行动时获得检定加值，提高团队的整体表现。' },
    { id: 'languages', name: '语言', category: 'social', description: '掌握多种语言的能力', details: '语言专长使角色在学习和使用多种语言时获得检定加值，能够更有效地与不同语言的人交流。' },
    { id: 'martial_arts', name: '武术', category: 'combat', description: '各种武术技巧和格斗术的掌握', details: '武术专长使角色在使用武术技巧进行近战攻击和防御时获得检定加值，提高格斗效率。' },
    { id: 'medicine', name: '医学', category: 'knowledge', description: '医疗知识和治疗技能', details: '医学专长使角色在诊断疾病、治疗伤口和提供医疗护理时获得检定加值，提高治疗效果。' },
    { id: 'mental_resistance', name: '精神抗性', category: 'combat', description: '抵抗精神攻击和心灵影响的能力', details: '精神抗性专长使角色在抵抗精神控制、心灵感应和其他精神影响时获得检定加值，提高精神防御力。' },
    { id: 'military', name: '军事', category: 'knowledge', description: '军事战略、战术和组织的理解', details: '军事专长使角色在理解军事战略、执行战术行动和组织军事力量时获得检定加值。' },
    { id: 'occult', name: '神秘学', category: 'knowledge', description: '神秘知识、魔法理论和超自然现象的理解', details: '神秘学专长使角色在理解魔法原理、识别超自然现象和使用神秘知识时获得检定加值。' },
    { id: 'performance', name: '表演', category: 'social', description: '各种表演艺术的技能', details: '表演专长使角色在进行戏剧、音乐、舞蹈等表演时获得检定加值，提高表演效果和感染力。' },
    { id: 'driving_air', name: '空中驾驶', category: 'driving', description: '驾驶各种飞行器的技能', details: '空中驾驶专长使角色在驾驶飞机、直升机等飞行器时获得检定加值，提高飞行安全性和操控能力。' },
    { id: 'power_specialty', name: '特殊能力', category: 'special', description: '特定特殊能力的专精', details: '特殊能力专长使角色在使用特定类型的特殊能力时获得检定加值，提高能力效果。' },
    { id: 'psychiatry', name: '精神病学', category: 'knowledge', description: '心理疾病的诊断和治疗', details: '精神病学专长使角色在诊断心理疾病、进行心理治疗和理解人类行为时获得检定加值。' },
    { id: 'science', name: '科学', category: 'knowledge', description: '科学知识和科学研究的能力', details: '科学专长使角色在进行科学研究、理解科学原理和应用科学知识时获得检定加值。' },
    { id: 'sleight_of_hand', name: '快手', category: 'action', description: '手部灵巧和魔术技巧', details: '快手专长使角色在进行扒窃、开锁、魔术表演等需要手部灵巧的活动时获得检定加值。' },
    { id: 'stealth', name: '潜行', category: 'action', description: '隐藏和悄悄移动的能力', details: '潜行专长使角色在隐藏身形、悄悄移动和避免被发现时获得检定加值，提高隐蔽能力。' },
    { id: 'craft', name: '工艺', category: 'action', description: '制造和修理物品的技能', details: '工艺专长使角色在制造、修理和改进物品时获得检定加值，提高工艺水平和作品质量。' },
    { id: 'underwater_combat', name: '水下战斗', category: 'combat', description: '在水下环境中进行战斗的技能', details: '水下战斗专长使角色在水下进行攻击和防御时获得检定加值，能够更有效地在水下环境中与敌人交战。' },
    { id: 'weapons', name: '武器', category: 'combat', description: '各种武器的使用技巧', details: '武器专长使角色在使用各种武器进行攻击时获得检定加值，提高武器使用效率和准确性。' },
    { id: 'brawling', name: '格斗', category: 'combat', description: '徒手格斗的技巧', details: '格斗专长使角色在进行徒手攻击和防御时获得检定加值，提高肉搏战能力。' }
];

export const SPECIALTY_LEVELS = [
    { level: 1, name: '基础', bonus: '+1', description: '对应检定+1', details: '角色对该专长有基本的了解和掌握，能够完成基础任务。' },
    { level: 2, name: '专家', bonus: '+2', description: '对应检定+2', details: '角色对该专长有深入的理解和熟练的掌握，能够完成复杂任务。' },
    { level: 3, name: '大师', bonus: '+3', description: '对应检定+3，允许使用特技', details: '角色对该专长达到了精通的程度，能够创造和使用高级技巧，展现出非凡的能力。' }
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