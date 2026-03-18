/**
 * 数据模块入口
 * 统一导出所有数据模块
 */

export * from './origins.js';
export * from './attributes.js';
export * from './powers.js';
export * from './specialties.js';

/**
 * 购点配置
 */
export const POINT_BUY_CONFIG = {
    totalPoints: 45,
    minAttributeValue: 1,
    maxAttributeValue: 10,
    maxHighLevelItems: 1,
    minAttributeSum: 20
};

/**
 * 应用配置
 */
export const APP_CONFIG = {
    name: '漫画英雄 TRPG 车卡器',
    version: '2.0.0',
    description: '基于2d6核心机制的超级英雄角色创建系统',
    storageKey: 'comicHeroCharacters',
    maxCharacters: 100
};

/**
 * 创建空角色模板
 * @returns {Object} 空角色对象
 */
export function createEmptyCharacter() {
    return {
        id: null,
        name: '',
        origin: null,
        originRoll: null,
        attributes: {
            brawn: 1,
            coordination: 1,
            strength: 1,
            intellect: 1,
            awareness: 1,
            willpower: 1
        },
        powers: [],
        specialties: [],
        equipment: [], // 新增：装备资料库
        avatar: null, // 新增：英雄头像 (Base64)
        originChoices: {}, // 存储起源带来的选择结果
        qualities: ['', '', ''],
        description: '',
        mode: 'random',
        createdAt: null,
        updatedAt: null
    };
}

/**
 * 计算衍生属性
 * @param {Object} character - 角色对象
 * @returns {Object} 衍生属性
 */
export function calculateDerivedStats(character) {
    const stamina = (character.attributes?.strength || 1) + (character.attributes?.willpower || 1);

    // 基础决意: 6 - 有效能力数量 (最低为1)
    // 根据规则，“能力提升”不计入决意等级判定
    const effectivePowers = (character.powers || []).filter(p => p.name !== '能力提升');
    let resolve = Math.max(1, 6 - effectivePowers.length);

    // 检查是否有“概率控制”能力
    const probControl = character.powers?.find(p => p.name === '概率控制');
    if (probControl) {
        resolve += probControl.level;
    }

    return { stamina, resolve };
}

/**
 * 验证角色数据完整性
 * @param {Object} character - 角色对象
 * @returns {Object} 验证结果
 */
export function validateCharacter(character) {
    const errors = [];

    if (!character.name || character.name.trim() === '') {
        errors.push('角色名称不能为空');
    }

    if (!character.origin) {
        errors.push('必须选择能力起源');
    }

    const attrSum = Object.values(character.attributes || {}).reduce((a, b) => a + b, 0);
    if (attrSum < POINT_BUY_CONFIG.minAttributeSum) {
        errors.push(`属性总和不能低于 ${POINT_BUY_CONFIG.minAttributeSum}`);
    }

    if (character.mode === 'point-buy') {
        let usedPoints = 0;
        Object.values(character.attributes || {}).forEach(value => usedPoints += value);
        (character.powers || []).forEach(power => {
            usedPoints += power.level;
            usedPoints += (power.extras?.length || 0);
            usedPoints -= (power.flaws?.length || 0);
        });
        (character.specialties || []).forEach(specialty => usedPoints += specialty.level);

        if (usedPoints > POINT_BUY_CONFIG.totalPoints) {
            errors.push(`购点模式下总点数超过了 ${POINT_BUY_CONFIG.totalPoints} (当前: ${usedPoints})`);
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}