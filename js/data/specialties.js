/**
 * 专长数据模块
 * 定义所有专长及其等级系统
 */

export const SPECIALTIES = [
    { id: 'aerial_combat', name: '空中战斗', category: 'combat', description: '你擅长空中作战,在滑翔或飞行状态下进行防御战斗检定时可以获得专长加值。' },
    { id: 'art', name: '艺术', category: 'social', description: '这是一个专长群组,包含各种各样的艺术专长和创造性专长。在创作艺术作品时,你的对应属性(尤其是协调和感知)可以获得专长加值艺术专长包括速写、绘画、诗歌、雕塑、写作及其他类型的纯粹艺术形式,选择该项专长时需要从中选择一项。' },
    { id: 'athletics', name: '运动技巧', category: 'action', description: '你在进行运动相关的检定时可以获得专长加值,如杂技、攀爬、跳跃、跑步、游泳以及类似的运动行为,包括战斗中的闪避(但不包括格挡),通常还包括乘骑,除非游戏主持人在游戏中加入独立的骑术专长。' },
    { id: 'business', name: '商业', category: 'knowledge', description: '你在进行商业洞察或业界知识相关的检定时可以获得专长加值并且可以同时拥有其他行业(包括专业技能和专业知识)的同类专长。' },
    { id: 'driving_land', name: '陆地驾驶', category: 'driving', description: '你在进行陆地车辆(包括所有类型)的驾驶检定时可以获得专长加值,水上车辆也包含在内,除非游戏主持人在游戏中加入独立的航海专长。' },
    { id: 'investigation', name: '调查', category: 'action', description: '你擅长收集分析犯罪现场的证据、挖掘信息、跟踪尾随和寻人找物--一言以蔽之,你擅长侦探工作,在进行与此相关的检定时可以获得专长加值。' },
    { id: 'law', name: '法律', category: 'knowledge', description: '你懂得大量的法律背景知识,甚至可以作为一名从业律师,在进行法律知识和法律实践相关的检定时可以获得专长加值。' },
    { id: 'leadership', name: '领导力', category: 'social', description: '作为能力卓绝、公众认可的领导者,你能够鼓舞麾下士气、坚定理属决心并赋子队员预外的公意点数。领导力专长也可以作为机动动作、用#蔡悉、制造或用特局(消发交的特质部分)每个国队每次能逃出查得到认可的领导者。' },
    { id: 'languages', name: '语言', category: 'social', description: '你特别擅长学习和使用外语,可以掌握的语言数量取决于智等级和专长加值的总和。详细内容请参阅采取行动章节互动部分的语言。' },
    { id: 'martial_arts', name: '武术', category: 'combat', description: '你知晓各种各样的徒手战斗方式,在徒手战斗状态下进行攻,检定和防御检定时可以获得专长加值,但格斗不包括在内(请参阅后文。格斗专长部分)。' },
    { id: 'medicine', name: '医学', category: 'knowledge', description: '你接受过医疗卫生培训,可以帮助患者加快恢复速度,使目标的对应能力等级获得专长加值(请参阅采取行动章节的恢复部分)。' },
    { id: 'mental_resistance', name: '精神抗性', category: 'combat', description: '你擅长抵御外界影响,包括某些精神能力,此时你的意志等级可以获得专长加值。精神抗性专长和精神抗性特殊能力非常相似,但不尽相同,角色可以两者兼得(详细内容请参阅特殊能力章节的精神抗性部分)' },
    { id: 'military', name: '军事', category: 'knowledge', description: '你服役(或曾经服役)于军事部队/准军事部队,先攻点数(请参采取行动章节的先攻部分)可以获得专长加值,进行军事协议、军事信息和军事策略相关的检定时也可以获得专长加值。' },
    { id: 'occult', name: '神秘学', category: 'knowledge', description: '你熟知神秘学和超自然知识,进行神秘知识、神秘调查和神秘行动相关的检定时可以获得专长加值。神秘学大师可以施展巫术仪式在内的大量特技。为了突显神秘氛围,游戏主持人不妨将神秘学作为一个专长群组,内含对应各个神秘学流派的不同专长。' },
    { id: 'performance', name: '表演', category: 'social', description: '这是一个专长群组,包含戏剧、喜剧、舞蹈、音乐、歌唱等表演艺术。你需要选择一种艺术形式,在进行相关检定时可以获得专长加值。详细内容请参阅采取行动章节的表演部分。' },
    { id: 'driving_air', name: '空中驾驶', category: 'driving', description: '你在进行空中运载工具和太空交通工具相关的驾驶检定时可以获得专长加值。' },
    { id: 'power_specialty', name: '特殊能力', category: 'special', description: '这是一个专长群组,包含需要不同检定的各种特殊能力(请参见特殊能力章节),尤其是基于勇猛和协调的攻击系特殊能力、每个特殊能力都是一项独立的专长(如冲击波、火焰控制等)、进行能力相关的检定时能获得专长加值,这项专长不增加特殊能力的等级和效果，但可以用于能力相关的特技检定(请参阅前文的特技部分)。' },
    { id: 'psychiatry', name: '精神病学', category: 'knowledge', description: '你接受过心理卫生培训，在进行评估他人情绪或性格，留心外界精神影响和诊疗精神疾病相关的检定时可以获得专长加值。' },
    { id: 'science', name: '科学', category: 'knowledge', description: '你精通科学领域,在进行科学知识、调查研究和发明创新相关的定时可以获得专长加值。科学大师可以施展科学公式和发明创新在大的大量特技。游戏主持人不妨将科学作为一个专长群组,内含对应名个学科的不同专长。' },
    { id: 'sleight_of_hand', name: '快手', category: 'action', description: '你具备灵活的手上技巧,在进行相关检定(如魔术戏法、扒窃/开锁等)时可以获得专长加值。' },
    { id: 'stealth', name: '潜行', category: 'action', description: '你在进行避人耳目或藏踪匿迹的行动检定时可以获得专长加值。' },
    { id: 'craft', name: '工艺', category: 'action', description: '你在进行制作、修复和使用各类工艺/机器相关的检定时可以获得专长加值。技术大师可以施展发明创新和使用装置在内的大量特技。戏主持人不妨将技术作为一个专长群组,内含对应各个领域(计算机、电子学、机械学等)的不同专长。' },
    { id: 'underwater_combat', name: '水下战斗', category: 'combat', description: '你擅长在水中作战,在水下进行战斗防御检定时可以获得专长加值,主要适用于拥有水下生存能力的角色(请参阅特殊能力章节)。' },
    { id: 'weapons', name: '武器', category: 'combat', description: '这是一个专长群组,包含各种类型武器(近战和远程)的使用。你在进行对应武器的攻击检定时可以获得专长加值。武器专长包括刀剑(所有近战劈砍武器)、棍棒(所有近战钝打武器)、弓箭(含弩)、枪械(所有全自动射杀武器)和投掷。游戏主持人还可以在游戏内加入对应外星武器的特殊武器专长。' },
    { id: 'brawling', name: '格斗', category: 'combat', description: '你擅长格斗,在进行所有格斗和逃脱相关的检定时可以获得专长加值(请参阅采取行动章节)。' }
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