/**
 * 骰子模块
 * 处理所有掷骰逻辑
 */

/**
 * 掷1d6
 * @returns {number} 1-6的随机数
 */
export function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

/**
 * 掷2d6
 * @returns {number} 2-12的随机数
 */
export function roll2d6() {
    return rollD6() + rollD6();
}

/**
 * 掷d66（两枚d6，第一枚决定十位，第二枚决定个位）
 * @returns {Object} {first, second, value}
 */
export function rollD66() {
    const first = rollD6();
    const second = rollD6();
    return {
        first,
        second,
        value: first * 10 + second
    };
}

/**
 * 掷指定数量的d6
 * @param {number} count - 骰子数量
 * @returns {number[]} 结果数组
 */
export function rollDice(count) {
    return Array.from({ length: count }, () => rollD6());
}

/**
 * 掷骰并获取结果详情
 * @param {string} type - 骰子类型 ('d6', '2d6', 'd66')
 * @returns {Object} 结果详情
 */
export function roll(type = '2d6') {
    switch (type) {
        case 'd6':
            return {
                type,
                result: rollD6(),
                dice: [rollD6()]
            };
        case '2d6':
            const d6_1 = rollD6();
            const d6_2 = rollD6();
            return {
                type,
                result: d6_1 + d6_2,
                dice: [d6_1, d6_2]
            };
        case 'd66':
            const d66 = rollD66();
            return {
                type,
                result: d66.value,
                dice: [d66.first, d66.second]
            };
        default:
            throw new Error(`未知的骰子类型: ${type}`);
    }
}

/**
 * 批量掷骰
 * @param {string} type - 骰子类型
 * @param {number} count - 次数
 * @returns {Object[]} 结果数组
 */
export function rollMultiple(type, count) {
    return Array.from({ length: count }, () => roll(type));
}

/**
 * 带动画效果的掷骰
 * @param {string} type - 骰子类型
 * @param {number} duration - 动画持续时间（毫秒）
 * @returns {Promise<Object>} 结果Promise
 */
export function rollWithAnimation(type = '2d6', duration = 500) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const interval = 50;
        let currentResult = roll(type);
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < duration) {
                currentResult = roll(type);
                setTimeout(animate, interval);
            } else {
                resolve(currentResult);
            }
        };
        
        animate();
    });
}

/**
 * 计算掷骰概率
 * @param {number} target - 目标值
 * @param {string} type - 骰子类型
 * @returns {number} 概率（0-1）
 */
export function calculateProbability(target, type = '2d6') {
    switch (type) {
        case '2d6':
            // 2d6的概率分布
            const probabilities = {
                2: 1/36, 3: 2/36, 4: 3/36, 5: 4/36,
                6: 5/36, 7: 6/36, 8: 5/36, 9: 4/36,
                10: 3/36, 11: 2/36, 12: 1/36
            };
            return probabilities[target] || 0;
        case 'd6':
            return target >= 1 && target <= 6 ? 1/6 : 0;
        default:
            return 0;
    }
}

/**
 * 获取掷骰结果描述
 * @param {number} result - 掷骰结果
 * @param {string} type - 骰子类型
 * @returns {string} 描述
 */
export function getRollDescription(result, type = '2d6') {
    if (type === '2d6') {
        if (result === 2) return '大失败！';
        if (result === 12) return '大成功！';
        if (result <= 4) return '失败';
        if (result >= 10) return '成功';
        return '普通';
    }
    return '';
}