/**
 * 装备与装置资料库
 */

export const EQUIPMENT_CATEGORIES = {
    ARMOR: {
        name: '护甲 (Armor)',
        description: '提供伤害抵抗的防护装置。',
        items: [
            { id: 'leather_armor', name: '厚重皮甲', level: 1, type: 'armor', description: '基础身体防护。' },
            { id: 'reinforced_armor', name: '强化护甲', level: 2, type: 'armor', description: '更坚固的个人防具。' },
            { id: 'heavy_metal_armor', name: '重金属甲', level: 3, type: 'armor', description: '全覆盖式金属防护，适合前线作战。' },
            { id: 'modern_ballistic', name: '现代防弹护甲', level: 4, type: 'armor', description: '高端科技材料，对抗远程攻击有特效。' }
        ]
    },
    SHIELD: {
        name: '盾牌 (Shield)',
        description: '用于格挡攻击的装置，通常需要花费动作。',
        items: [
            { id: 'basic_shield', name: '标准盾牌', level: 3, type: 'shield', description: '提供 3 级伤害抵抗，可用于格挡攻击。' },
            { id: 'riot_shield', name: '防暴盾牌', level: 4, type: 'shield', description: '警用或特种部队装备，覆盖面更广。' },
            { id: 'energy_shield', name: '能量力场盾', level: 5, type: 'shield', description: '高科技原型机，可抵御极端损害。' }
        ]
    },
    VEHICLE: {
        name: '交通工具 (Vehicle)',
        description: '提供移动与战术支持。',
        items: [
            { id: 'car', name: '汽车', speed: 3, body: 4, handling: 6, armor: 0, description: '普通家用车。' },
            { id: 'bus', name: '公共汽车', speed: 3, body: 4, handling: 2, armor: 1, description: '大型客运载具。' },
            { id: 'motorcycle', name: '摩托车', speed: 4, body: 3, handling: 7, armor: 0, description: '灵活轻便。' },
            { id: 'tank', name: '坦克', speed: 2, body: 7, handling: 3, armor: 5, description: '威力巨大的陆战之王。内置 7 级攻击。' },
            { id: 'jet_fighter', name: '喷气战机', speed: 10, body: 4, handling: 7, armor: 2, description: '极限速度，制霸天空。内置 5 级攻击与导弹。' },
            { id: 'starship', name: '宇宙飞船', speed: 10, body: 5, handling: 8, armor: 5, description: '地外科技载具。内置 8 级激光炮。' }
        ]
    },
    WEAPONS: {
        name: '武器 (Weapons)',
        description: '各种攻击性装置。',
        items: [
            { id: 'blunt_weapon', name: '钝打武器', level: 4, type: 'weapon', description: '棍棒、锤子等。通常造成力量+1级伤害（材质上限5）。' },
            { id: 'slashing_weapon', name: '劈砍武器', level: 4, type: 'weapon', description: '刀剑、矛战。造成 4 点劈砍伤害。' },
            { id: 'blast_pistol', name: '激光手枪', level: 4, type: 'weapon', description: '高科技冲击类武器。' },
            { id: 'heavy_rifle', name: '重型步枪', level: 5, type: 'weapon', description: '火力强劲的射杀武器。' },
            { id: 'heavy_mg', name: '重机枪', level: 6, type: 'weapon', description: '军事级重武器。' }
        ]
    },
    UTILITY: {
        name: '万能/杂项 (Utility)',
        description: '各种多功能或特定用途的装置。',
        items: [
            { id: 'utility_belt', name: '万能腰带', type: 'utility', description: '内含各种微型装置，可应对多种突发状况。' },
            { id: 'flash_grenade', name: '闪光手榴弹', type: 'utility', description: '造成强光爆溢效果。' },
            { id: 'comm_link', name: '通讯链路', type: 'utility', description: '保持团队实时联络。' },
            { id: 'team_hq', name: '团队总部', type: 'utility', description: '如“正义之塔”，提供共享资源。' }
        ]
    }
};

/**
 * 获取所有装备列表
 */
export function getAllEquipment() {
    const list = [];
    Object.keys(EQUIPMENT_CATEGORIES).forEach(cat => {
        const category = EQUIPMENT_CATEGORIES[cat];
        category.items.forEach(item => {
            list.push({
                ...item,
                categoryName: category.name
            });
        });
    });
    return list;
}

/**
 * 根据ID获取装备
 */
export function getEquipmentById(id) {
    for (const cat in EQUIPMENT_CATEGORIES) {
        const item = EQUIPMENT_CATEGORIES[cat].items.find(i => i.id === id);
        if (item) return { ...item, categoryName: EQUIPMENT_CATEGORIES[cat].name };
    }
    return null;
}
