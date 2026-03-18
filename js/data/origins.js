/**
 * 起源数据模块
 * 定义所有能力起源及其效果
 */

export const ORIGINS = [
    {
        id: 'trained',
        name: '受训',
        rollRange: [2, 3, 4],
        description: '英雄是技艺娴熟的个体，拥有的“能力”实际上都来自精湛的训练或专门的设备。额外获得两项专长，同时可以选择一项特殊能力作为交换，另外获得两项专长。',
        mechanics: {
            bonusSpecialties: 2,
            optionalExchange: 'power_for_specialties_plus_2'
        }
    },
    {
        id: 'altered',
        name: '改造',
        rollRange: [5, 6],
        description: '英雄原本是正常人类，经由某些外部手段（通常是事故或试验）成为超人。选择一项能力（属性或特殊能力）增加2个等级，最高不超过10级。',
        mechanics: {
            statBoost: { target: 'any_one', value: 2 }
        }
    },
    {
        id: 'mutant',
        name: '天赋异禀',
        rollRange: [7],
        description: '英雄与生俱来（或命中注定）拥有超越常人的特殊能力。额外选择一项——与生俱来，而非依靠装置的——特殊能力，或者选择一项能力增加2个等级，最高不超过10级。',
        mechanics: {
            choice: 'power_or_boost',
            bonusPower: 1,
            powerType: 'natural',
            statBoost: { target: 'any_one', value: 2 }
        }
    },
    {
        id: 'gimmick',
        name: '花招诡计',
        rollRange: [8, 9],
        description: '角色的特殊能力完全依靠某种装置。选择一项精神属性增加2个等级，最高不超过10级。',
        mechanics: {
            deviceLimit: true,
            statBoost: { target: 'mental', value: 2 }
        }
    },
    {
        id: 'artificial',
        name: '人造生命',
        rollRange: [10],
        description: '角色是机器人或其他类型的构装体（如魔像）。角色增加2个力量等级，除了掷骰获得的特殊能力，还会额外获得维系生命能力，正常掷骰决定维系生命的等级，或者舍弃一项掷骰获得特殊能力，将维系生命升至10级。',
        mechanics: {
            statBoost: { target: 'strength', value: 2 },
            guaranteedPower: '维系生命',
            optionalExchange: 'power_for_max_life_support'
        }
    },
    {
        id: 'alien',
        name: '天外来客',
        rollRange: [11, 12],
        description: '角色是外星人、元素精灵、天使、魔鬼乃至神祇。选择两项能力（属性或特殊能力）增加2个等级，或者根据起源列表进行两次掷骰（去掉重复和11-12的结果）。',
        mechanics: {
            statBoost: { target: 'any_two', value: 2 },
            optionalExchange: 'double_roll_origins'
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