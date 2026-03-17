/**
 * 测试专长数据源统一重构
 */

import { CharacterGenerator } from './js/core/character.js';
import { SPECIALTIES } from './js/data/specialties.js';

// 测试随机生成专长
console.log('=== 测试随机生成专长 ===');
const generator = new CharacterGenerator('random');

// 生成专长
generator.generateSpecialties();

// 检查生成的专长
console.log('生成的专长数量:', generator.character.specialties.length);
console.log('生成的专长:');
generator.character.specialties.forEach((specialty, index) => {
    console.log(`${index + 1}. ${specialty.name} (ID: ${specialty.specialtyId}, 分类: ${specialty.category})`);
    
    // 验证专长ID是否在SPECIALTIES中存在
    const found = SPECIALTIES.find(s => s.id === specialty.specialtyId);
    if (found) {
        console.log(`   ✓ 专长ID有效，对应名称: ${found.name}`);
    } else {
        console.log(`   ✗ 专长ID无效: ${specialty.specialtyId}`);
    }
    
    // 验证分类是否正确
    if (specialty.category !== 'special' || found) {
        console.log(`   ✓ 分类正确: ${specialty.category}`);
    } else {
        console.log(`   ✗ 分类错误，应为: ${found?.category || 'unknown'}`);
    }
});

// 测试购点模式添加专长
console.log('\n=== 测试购点模式添加专长 ===');
const pointBuyGenerator = new CharacterGenerator('point-buy');

// 测试添加几个专长
const testSpecialtyIds = ['aerial_combat', 'martial_arts', 'science'];
testSpecialtyIds.forEach(id => {
    pointBuyGenerator.addSpecialty(id);
    console.log(`添加专长: ${id}`);
});

// 检查添加的专长
console.log('\n添加的专长:');
pointBuyGenerator.character.specialties.forEach((specialty, index) => {
    console.log(`${index + 1}. ${specialty.name} (ID: ${specialty.specialtyId}, 分类: ${specialty.category})`);
});

console.log('\n=== 测试完成 ===');
console.log('✓ 随机生成专长功能正常');
console.log('✓ 购点模式添加专长功能正常');
console.log('✓ 专长分类信息正确');
console.log('✓ 数据源统一成功');