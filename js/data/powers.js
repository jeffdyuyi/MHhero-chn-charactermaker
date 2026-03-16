/**
 * 能力数据模块
 * 定义所有特殊能力及其分类
 */

export const POWER_CATEGORIES = [
    { rollRange: [2, 3], id: 'mental', name: '精神系', color: '#e74c3c', icon: '🧠' },
    { rollRange: [4, 5], id: 'control', name: '控制系', color: '#3498db', icon: '✋' },
    { rollRange: [6], id: 'defense', name: '防御系', color: '#27ae60', icon: '🛡️' },
    { rollRange: [7], id: 'attack', name: '攻击系', color: '#e67e22', icon: '⚔️' },
    { rollRange: [8], id: 'movement', name: '运动系', color: '#f39c12', icon: '🏃' },
    { rollRange: [9, 10], id: 'alteration', name: '变形系', color: '#9b59b6', icon: '🔄' },
    { rollRange: [11, 12], id: 'sensory', name: '感官系', color: '#1abc9c', icon: '👁️' }
];

export const POWERS = {
    alteration: {
        name: '变形系',
        powers: [
            { d66: [1, 1], name: '能力增幅' },
            { d66: [1, 2], name: '能力提升' },
            { d66: [1, 3], name: '释放自我' },
            { d66: [1, 4], name: '变化形态' },
            { d66: [1, 5], name: '水下生存' },
            { d66: [1, 6], name: '浓缩密度' },
            { d66: [2, 1], name: '基因复制' },
            { d66: [2, 2], name: '三头六臂' },
            { d66: [2, 3], name: '拔地而起' },
            { d66: [2, 4], name: '隐身' },
            { d66: [2, 5], name: '穿越固体' },
            { d66: [2, 6], name: '微缩成寸' },
            { d66: [3, 1], name: '动物模仿' },
            { d66: [3, 2], name: '物质模仿' },
            { d66: [3, 3], name: '植物模仿' },
            { d66: [3, 4], name: '能力模仿' },
            { d66: [3, 5], name: '伸缩自如' },
            { d66: [3, 6], name: '元素转化' }
        ]
    },
    control: {
        name: '控制系',
        powers: [
            { d66: [1, 1], name: '变形射线' },
            { d66: [1, 2], name: '变形射线' },
            { d66: [1, 3], name: '元素控制' },
            { d66: [1, 4], name: '元素控制' },
            { d66: [1, 5], name: '概率控制' },
            { d66: [1, 6], name: '时间控制' },
            { d66: [2, 1], name: '能量控制' },
            { d66: [2, 2], name: '能量控制' },
            { d66: [2, 3], name: '治疗' },
            { d66: [2, 4], name: '心灵感应' },
            { d66: [2, 5], name: '心灵感应' },
            { d66: [2, 6], name: '变形' },
            { d66: [3, 1], name: '宇宙力量' },
            { d66: [3, 2], name: '机关配件' },
            { d66: [3, 3], name: '机关配件' },
            { d66: [3, 4], name: '魔法' },
            { d66: [3, 5], name: '能力清除' },
            { d66: [3, 6], name: '仆役' }
        ]
    },
    defense: {
        name: '防御系',
        powers: [
            { d66: [1, 1], name: '凝神吸收' },
            { d66: [1, 2], name: '凝神吸收' },
            { d66: [1, 3], name: '环境适应' },
            { d66: [1, 4], name: '力场' },
            { d66: [1, 5], name: '力场' },
            { d66: [1, 6], name: '力场' },
            { d66: [2, 1], name: '永生不朽' },
            { d66: [2, 2], name: '维系生命' },
            { d66: [2, 3], name: '维系生命' },
            { d66: [2, 4], name: '维系生命' },
            { d66: [2, 5], name: '反射攻击' },
            { d66: [2, 6], name: '反射攻击' },
            { d66: [3, 1], name: '再生' },
            { d66: [3, 2], name: '再生' },
            { d66: [3, 3], name: '抵抗' },
            { d66: [3, 4], name: '抵抗' },
            { d66: [3, 5], name: '抵抗' },
            { d66: [3, 6], name: '抵抗' }
        ]
    },
    mental: {
        name: '精神系',
        powers: [
            { d66: [1, 1], name: '灵体投射' },
            { d66: [1, 2], name: '梦境控制' },
            { d66: [1, 3], name: '情感控制' },
            { d66: [1, 4], name: '情感控制' },
            { d66: [1, 5], name: '制造幻觉' },
            { d66: [1, 6], name: '生成幻象' },
            { d66: [2, 1], name: '精神冲击波' },
            { d66: [2, 2], name: '精神冲击波' },
            { d66: [2, 3], name: '精神控制' },
            { d66: [2, 4], name: '精神护盾' },
            { d66: [2, 5], name: '心灵感应' },
            { d66: [2, 6], name: '心灵感应' }
        ]
    },
    movement: {
        name: '运动系',
        powers: [
            { d66: [1, 1], name: '挖掘洞穴' },
            { d66: [1, 2], name: '位面旅行' },
            { d66: [1, 3], name: '飞行' },
            { d66: [1, 4], name: '飞行' },
            { d66: [1, 5], name: '跳跃' },
            { d66: [1, 6], name: '跳跃' },
            { d66: [2, 1], name: '高速旋转' },
            { d66: [2, 2], name: '超高速移动' },
            { d66: [2, 3], name: '超高速移动' },
            { d66: [2, 4], name: '摇荡' },
            { d66: [2, 5], name: '瞬间移动' },
            { d66: [2, 6], name: '墙面爬行' }
        ]
    },
    attack: {
        name: '攻击系',
        powers: [
            { d66: [1, 1], name: '灾祸丛生' },
            { d66: [1, 2], name: '桎梏' },
            { d66: [1, 3], name: '冲击波' },
            { d66: [1, 4], name: '冲击波' },
            { d66: [1, 5], name: '击打' },
            { d66: [1, 6], name: '击打' },
            { d66: [2, 1], name: '光环' },
            { d66: [2, 2], name: '眼花缭乱' },
            { d66: [2, 3], name: '眼花缭乱' },
            { d66: [2, 4], name: '能量吸收' },
            { d66: [2, 5], name: '快速攻击' },
            { d66: [2, 6], name: '击晕' }
        ]
    },
    sensory: {
        name: '感官系',
        powers: [
            { d66: [1, 1], name: '察觉' },
            { d66: [1, 2], name: '察觉' },
            { d66: [1, 3], name: '超感知觉' },
            { d66: [1, 4], name: '超感官' },
            { d66: [1, 5], name: '超感官' },
            { d66: [1, 6], name: '超感官' },
            { d66: [2, 1], name: '危险感知' },
            { d66: [2, 2], name: '危险感知' },
            { d66: [2, 3], name: '远程接入' },
            { d66: [2, 4], name: '追溯感知' },
            { d66: [2, 5], name: '预知未来' },
            { d66: [2, 6], name: '预知未来' }
        ]
    }
};

export const POWER_MODS = {
    extras: [
        { id: 'affect_others', name: '影响他人', description: '能力可对他人造成影响' },
        { id: 'type_affect', name: '类型影响', description: '可对通常不受影响的目标生效' },
        { id: 'scatter', name: '散布效果', description: '具有更广阔的作用范围' },
        { id: 'overflow', name: '爆溢效果', description: '可同时影响近身范围内所有目标' },
        { id: 'infect', name: '感染效果', description: '能力具有感染性' },
        { id: 'defense', name: '防御效果', description: '可用于格挡攻击' },
        { id: 'copy', name: '复制效果', description: '可复制其他能力效果' },
        { id: 'extend_time', name: '延长时间', description: '延长一个等级的持续时间' },
        { id: 'carry_companions', name: '携带同伴', description: '可携带同伴一起移动' },
        { id: 'expand_range', name: '扩大范围', description: '近身能力可在远程生效' },
        { id: 'ignore_range', name: '无视范围', description: '只要知晓目标位置即可生效' },
        { id: 'cancel', name: '撤销效果', description: '可随时终止能力效果' },
        { id: 'stack', name: '叠加效果', description: '具有额外的叠加效果' },
        { id: 'slow_recovery', name: '减缓恢复', description: '减缓目标的恢复速度' }
    ],
    flaws: [
        { id: 'animals_only', name: '仅限动物', description: '只能对动物造成影响' },
        { id: 'type_fail', name: '类型失效', description: '无法对某些类型目标生效' },
        { id: 'exhausted', name: '消耗殆尽', description: '使用后有概率暂时失效' },
        { id: 'narrow_range', name: '缩小范围', description: '需要近身接触才能生效' },
        { id: 'maintain_focus', name: '保持专注', description: '需要保持专注才能持续' },
        { id: 'continuous', name: '持续生效', description: '能力持续生效无法关闭' },
        { id: 'diminishing', name: '逐级递减', description: '效果随时间递减' },
        { id: 'exclusive', name: '排他性', description: '无法与其他能力同时使用' },
        { id: 'extras_only', name: '仅限附带效果', description: '只能使用附带效果' },
        { id: 'visual_only', name: '仅限可视范围', description: '只能影响视野内目标' },
        { id: 'max_level_only', name: '仅限最高等级', description: '只能在最高等级使用' },
        { id: 'no_tricks', name: '特技禁用', description: '无法使用特技' },
        { id: 'special_limit', name: '特殊限定', description: '受特定条件限制' },
        { id: 'others_only', name: '仅限他人', description: '只能对他人使用' },
        { id: 'action_required', name: '施放动作', description: '需要特定动作施放' },
        { id: 'preparation', name: '预先准备', description: '需要预先准备' },
        { id: 'limited_source', name: '限制来源', description: '能力来源受限' },
        { id: 'short_time', name: '缩短时间', description: '持续时间缩短' },
        { id: 'stamina_cost', name: '耐力消耗', description: '消耗耐力使用' },
        { id: 'uncontrolled', name: '不受控制', description: '能力不受控制' },
        { id: 'uncertain', name: '成败未知', description: '效果不确定' },
        { id: 'unpredictable', name: '变化莫测', description: '效果随机变化' }
    ]
};

export const POWER_COUNT_TABLE = [
    { rollRange: [2, 3, 4], count: 2 },
    { rollRange: [5, 6, 7], count: 3 },
    { rollRange: [8, 9, 10], count: 4 },
    { rollRange: [11, 12], count: 5 }
];

/**
 * 根据掷骰结果获取能力类别
 * @param {number} roll - 2d6掷骰结果
 * @returns {Object|null} 类别对象
 */
export function getPowerCategoryByRoll(roll) {
    return POWER_CATEGORIES.find(c => c.rollRange.includes(roll)) || null;
}

/**
 * 根据ID获取能力类别
 * @param {string} id - 类别ID
 * @returns {Object|null} 类别对象
 */
export function getPowerCategoryById(id) {
    return POWER_CATEGORIES.find(c => c.id === id) || null;
}

/**
 * 根据d66结果获取具体能力
 * @param {string} categoryId - 类别ID
 * @param {Object} d66 - d66结果对象 {first, second}
 * @returns {Object|null} 能力对象
 */
export function getPowerByD66(categoryId, d66) {
    const category = POWERS[categoryId];
    if (!category) return null;
    return category.powers.find(p => p.d66[0] === d66.first && p.d66[1] === d66.second) || null;
}

/**
 * 根据掷骰结果获取能力数量
 * @param {number} roll - 2d6掷骰结果
 * @returns {number} 能力数量
 */
export function getPowerCountByRoll(roll) {
    const entry = POWER_COUNT_TABLE.find(t => t.rollRange.includes(roll));
    return entry ? entry.count : 3;
}

/**
 * 获取所有能力列表
 * @returns {Array} 能力数组
 */
export function getAllPowers() {
    const allPowers = [];
    Object.entries(POWERS).forEach(([categoryId, category]) => {
        category.powers.forEach(power => {
            allPowers.push({
                ...power,
                categoryId,
                categoryName: category.name
            });
        });
    });
    return allPowers;
}

/**
 * 创建新能力对象
 * @param {string} categoryId - 类别ID
 * @param {string} powerName - 能力名称
 * @param {number} level - 等级
 * @returns {Object} 能力对象
 */
export function createPower(categoryId, powerName, level = 1) {
    const category = getPowerCategoryById(categoryId);
    return {
        id: Date.now() + Math.random(),
        category: category ? category.name : '未知',
        categoryId,
        name: powerName,
        level,
        extras: [],
        flaws: []
    };
}