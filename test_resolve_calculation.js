// 测试决意点计算
const { calculateDerivedStats } = require('./js/data/index.js');

// 测试用例1: 协调为8的英雄，拥有2项特殊能力
const testCharacter1 = {
    attributes: {
        brawn: 4,
        coordination: 8, // 大于6，视为1项特殊能力
        strength: 5,
        intellect: 6,
        awareness: 5,
        willpower: 5
    },
    powers: [
        { name: '飞行' },
        { name: '超级力量' }
    ]
};

// 测试用例2: 没有高等级属性，只有1项特殊能力
const testCharacter2 = {
    attributes: {
        brawn: 4,
        coordination: 5,
        strength: 5,
        intellect: 6,
        awareness: 5,
        willpower: 5
    },
    powers: [
        { name: '飞行' }
    ]
};

// 测试用例3: 有多个高等级属性和多个特殊能力
const testCharacter3 = {
    attributes: {
        brawn: 7, // 大于6
        coordination: 8, // 大于6
        strength: 7, // 大于6
        intellect: 5,
        awareness: 5,
        willpower: 5
    },
    powers: [
        { name: '飞行' },
        { name: '超级力量' },
        { name: '心灵感应' }
    ]
};

// 运行测试
console.log('测试用例1: 协调8，2项特殊能力');
console.log('期望决意等级: 3 (6 - 2 - 1)');
console.log('实际计算结果:', calculateDerivedStats(testCharacter1).resolve);
console.log('');

console.log('测试用例2: 无高等级属性，1项特殊能力');
console.log('期望决意等级: 5 (6 - 1)');
console.log('实际计算结果:', calculateDerivedStats(testCharacter2).resolve);
console.log('');

console.log('测试用例3: 3个高等级属性，3项特殊能力');
console.log('期望决意等级: 1 (最低值)');
console.log('实际计算结果:', calculateDerivedStats(testCharacter3).resolve);
console.log('');

console.log('测试完成!');
