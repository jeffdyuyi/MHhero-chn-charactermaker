/**
 * 起源数据模块
 * 定义所有能力起源及其效果
 */

export const ORIGINS = [
    {
        id: 'trained',
        name: '受训',
        rollRange: [2, 3, 4],
        description: '英雄是技艺娴熟的个体，拥有的"能力"实际上都来自精湛的训练或专门的设备。',
        mechanics: {
            bonusSpecialties: 2,
            optionalExchange: {
                costPower: 1,
                gainSpecialties: 2
            }
        }
    },
    {
        id: 'altered',
        name: '改造',
        rollRange: [5, 6],
        description: '英雄原本是正常人类，经由某些外部手段（通常是科学事故、实验室改造或特殊试验）成为超人。',
        mechanics: {
            statBoost: {
                target: 'any',
                value: 2
            }
        }
    },
    {
        id: 'mutant',
        name: '天赋异禀',
        rollRange: [7],
        description: '英雄与生俱来（或命中注定）拥有超越常人的特殊能力。',
        mechanics: {
            choice: 'power_or_boost',
            bonusPower: 1,
            statBoost: {
                target: 'any',
                value: 2
            }
        }
    },
    {
        id: 'gimmick',
        name: '花招诡计',
        rollRange: [8, 9],
        description: '英雄本身是凡人，角色的特殊能力完全依靠某种高科技装备、魔法道具或外挂装置。',
        mechanics: {
            deviceLimit: true,
            statBoost: {
                target: 'mental',
                value: 2
            }
        }
    },
    {
        id: 'artificial',
        name: '人造生命',
        rollRange: [10],
        description: '角色是机器人、生化人或其他类型的构装体（如魔法魔像）。',
        mechanics: {
            statBoost: {
                target: 'strength',
                value: 2
            },
            bonusPower: '维系生命',
            optionalExchange: {
                costPower: 1,
                maxBonusPowerLevel: 10
            }
        }
    },
    {
        id: 'alien',
        name: '天外来客',
        rollRange: [11, 12],
        description: '角色是外星人、元素精灵、天使、魔鬼乃至神祇——来自另外一个世界或位面的生物。',
        mechanics: {
            statBoost: {
                target: 'any_two',
                value: 2
            }
        }
    }
];

/**
 * 根据掷骰结果获取起源
 * @param {number} roll - 2d6掷骰结果
 * @returns {Object|null} 起源对象
 */
export function getOriginByRoll(roll) {
    return ORIGINS.find(o => o.rollRange.includes(roll)) || null;
}

/**
 * 根据ID获取起源
 * @param {string} id - 起源ID
 * @returns {Object|null} 起源对象
 */
export function getOriginById(id) {
    return ORIGINS.find(o => o.id === id) || null;
}

/**
 * 格式化起源效果描述
 * @param {Object} mechanics - 起源机制
 * @returns {string} 格式化后的描述
 */
export function formatOriginMechanics(mechanics) {
    const parts = [];
    
    if (mechanics.bonusSpecialties) {
        parts.push(`额外获得 ${mechanics.bonusSpecialties} 项专长`);
    }
    if (mechanics.statBoost) {
        const target = mechanics.statBoost.target === 'strength' ? '力量' :
                      mechanics.statBoost.target === 'mental' ? '一项精神属性' :
                      mechanics.statBoost.target === 'any_two' ? '两项能力' : '一项能力';
        parts.push(`${target} +${mechanics.statBoost.value} 级`);
    }
    if (mechanics.bonusPower) {
        parts.push(`额外获得 "${mechanics.bonusPower}" 能力`);
    }
    if (mechanics.deviceLimit) {
        parts.push('所有能力带上"装置"限制');
    }
    if (mechanics.choice) {
        parts.push('可选择：额外获得1项特殊能力 或 1项能力+2级');
    }
    if (mechanics.optionalExchange) {
        parts.push(`可选：放弃1项能力换取额外效果`);
    }
    
    return parts.join('，') || '无特殊效果';
}