/**
 * 角色核心模块
 * 处理角色的创建、修改和计算
 */

import {
    createEmptyCharacter,
    calculateDerivedStats,
    validateCharacter,
    POINT_BUY_CONFIG
} from '../data/index.js';

import {
    getOriginByRoll,
    getOriginById,
    formatOriginMechanics
} from '../data/origins.js';

import {
    getAttributeLevel,
    getAttributeKeys,
    calculateAttributeSum,
    checkAttributeMinimum
} from '../data/attributes.js';

import {
    getPowerCategoryByRoll,
    getPowerByD66,
    getPowerCountByRoll,
    createPower
} from '../data/powers.js';

import {
    getSpecialtyCountByRoll,
    createSpecialty,
    SPECIALTIES
} from '../data/specialties.js';

import { roll2d6, rollD66 } from './dice.js';

/**
 * 角色生成器类
 */
export class CharacterGenerator {
    constructor(mode = 'random') {
        this.mode = mode;
        this.character = createEmptyCharacter();
        this.character.mode = mode;
        this.character.id = Date.now();
        this.character.createdAt = new Date().toISOString();
    }

    /**
     * 生成随机角色
     * @returns {Object} 生成的角色
     */
    generateRandom() {
        this.generateOrigin();
        this.generateAttributes();
        this.generatePowers();
        this.generateSpecialties();
        this.updateDerivedStats();
        return this.character;
    }

    /**
     * 生成购点角色（初始状态）
     * @returns {Object} 初始角色
     */
    generatePointBuy() {
        // 平均分配点数
        const pointsPerAttr = Math.floor(POINT_BUY_CONFIG.totalPoints / 6);
        getAttributeKeys().forEach(key => {
            this.character.attributes[key] = pointsPerAttr;
        });
        this.updateDerivedStats();
        return this.character;
    }

    /**
     * 生成起源
     */
    generateOrigin() {
        const roll = roll2d6();
        this.character.originRoll = roll;
        this.character.origin = getOriginByRoll(roll);
    }

    /**
     * 设置起源
     * @param {string} originId - 起源ID
     */
    setOrigin(originId) {
        this.character.origin = getOriginById(originId);
        this.character.originRoll = null;
    }

    /**
     * 生成属性
     */
    generateAttributes() {
        let attempts = 0;
        const maxAttempts = 50;

        do {
            getAttributeKeys().forEach(key => {
                const roll = roll2d6();
                this.character.attributes[key] = getAttributeLevel(roll);
            });

            // 保存基础属性
            this.character.baseAttributes = { ...this.character.attributes };

            // 应用起源加成 (仅限非选择项)
            this.applyOriginStatBoost();

            attempts++;
        } while (!checkAttributeMinimum(this.character.attributes) && attempts < maxAttempts);

        if (attempts >= maxAttempts) {
            console.warn('Attribute generation reached max attempts, proceeding with current values.');
        }
    }

    /**
     * 应用起源属性加成
     */
    applyOriginStatBoost() {
        if (!this.character.origin || !this.character.origin.mechanics.statBoost) {
            return;
        }

        const boost = this.character.origin.mechanics.statBoost;
        const keys = getAttributeKeys();
        const choices = this.character.originChoices;

        // 如果是 Mutants，需要先看玩家选的是不是 boost
        if (this.character.origin.mechanics.choice === 'power_or_boost' && choices.mutantChoice !== 'boost') {
            return;
        }

        // 如果是固定项，直接应用。如果是‘any’类，等候玩家选择
        switch (boost.target) {
            case 'strength':
                this.character.attributes.strength = Math.min(10, this.character.attributes.strength + boost.value);
                break;
            case 'mental':
                // 默认随机选一个，但玩家可以后续手动更改
                if (!choices.statBoost) {
                    const mentalKeys = ['intellect', 'awareness', 'willpower'];
                    const targetKey = mentalKeys[Math.floor(Math.random() * mentalKeys.length)];
                    choices.statBoost = targetKey;
                }
                break;
            case 'any_one':
                if (!choices.statBoost) {
                    const randomKey = keys[Math.floor(Math.random() * keys.length)];
                    choices.statBoost = randomKey;
                }
                break;
            case 'any_two':
                if (!choices.statBoosts) {
                    const shuffled = [...keys].sort(() => 0.5 - Math.random());
                    choices.statBoosts = shuffled.slice(0, 2);
                }
                break;
        }

        // 处理固定获得的超凡能力
        if (mech.guaranteedPower) {
            this.addPowerDirectly(mech.guaranteedPower);
        }

        this.applyOriginChoices();
    }

    /**
     * 直接添加特定能力（不通过随机池，如人工生命的维系生命）
     */
    addPowerDirectly(powerName) {
        if (!this.character.powers.some(p => p.name === powerName)) {
            const power = createPower(powerName);
            if (power) {
                // 如果随机模式，随机决定等级
                if (this.mode === 'random') {
                    power.level = roll2d6();
                }
                this.character.powers.push(power);
            }
        }
    }

    setOriginChoice(type, value) {
        this.character.originChoices[type] = value;
        this.applyOriginChoices();
        this.updateDerivedStats();
    }

    applyOriginChoices() {
        if (!this.character.origin) return;

        // 重置为基础值
        if (this.character.baseAttributes) {
            this.character.attributes = { ...this.character.baseAttributes };
        }

        // 应用固定属性
        const mechanics = this.character.origin.mechanics;
        if (mechanics.statBoost) {
            if (mechanics.statBoost.target === 'strength') {
                this.character.attributes.strength = Math.min(10, this.character.attributes.strength + mechanics.statBoost.value);
            }
        }

        // 应用选择属性
        const choices = this.character.originChoices;
        if (choices.statBoost && this.character.attributes[choices.statBoost] !== undefined) {
            this.character.attributes[choices.statBoost] = Math.min(10, this.character.attributes[choices.statBoost] + 2);
        }
        if (choices.statBoosts && Array.isArray(choices.statBoosts)) {
            choices.statBoosts.forEach(key => {
                if (this.character.attributes[key] !== undefined) {
                    this.character.attributes[key] = Math.min(10, this.character.attributes[key] + 2);
                }
            });
        }
        if (choices.powerBoost && choices.powerBoostIndex !== undefined) {
            const power = this.character.powers[choices.powerBoostIndex];
            if (power) {
                // 注意：这里需要考虑是否超过10级
                power.level = Math.min(10, power.level + 2);
            }
        }
    }

    /**
     * 生成能力
     */
    generatePowers() {
        this.character.powers = [];

        const roll = roll2d6();
        let count = getPowerCountByRoll(roll);
        const mech = this.character.origin?.mechanics;

        if (mech) {
            if (mech.bonusPower && !mech.choice) {
                // 普通加成
                count++;
            } else if (mech.choice === 'power_or_boost' && this.character.originChoices.mutantChoice === 'power') {
                // 天赋异禀选择能力
                count++;
            }
        }

        for (let i = 0; i < count; i++) {
            this.addRandomPower();
        }

        // 处理由于起源获得固定能力（如维系生命），不占用掷骰次数
        if (mech?.guaranteedPower) {
            this.addPowerDirectly(mech.guaranteedPower);
        }

        // 应用装置限制
        if (this.character.origin?.mechanics.deviceLimit) {
            const deviceFlaw = { id: 'device', name: '装置', description: '该能力依赖于外部装置' };
            this.character.powers.forEach(power => {
                if (!power.flaws.some(f => f.id === 'device')) {
                    power.flaws.push(deviceFlaw);
                }
            });
        }
    }

    /**
     * 装备管理
     */
    addEquipment(id) {
        const item = getEquipmentById(id);
        if (item) {
            this.character.equipment.push({
                ...item,
                instanceId: Date.now() + Math.random().toString(36).substr(2, 5)
            });
        }
    }

    removeEquipment(instanceId) {
        this.character.equipment = this.character.equipment.filter(e => e.instanceId !== instanceId);
    }

    updateEquipment(instanceId, newData) {
        const item = this.character.equipment.find(e => e.instanceId === instanceId);
        if (item) {
            Object.assign(item, newData);
        }
    }

    /**
     * 添加随机能力
     */
    addRandomPower() {
        const categoryRoll = roll2d6();
        const category = getPowerCategoryByRoll(categoryRoll);
        let powerData = null;

        // 循环生成d66，直到找到有效的能力 (增加上限防止死循环)
        let attempts = 0;
        while (!powerData && attempts < 100) {
            const d66 = rollD66();
            powerData = getPowerByD66(category.id, d66);
            attempts++;
        }

        // 如果实在没抽到，退而求其次选择该分类下的第一个
        if (!powerData) {
            const allInCat = POWERS[category.id]?.powers || [];
            powerData = allInCat[0] || { name: '未知能力' };
        }

        const levelRoll = roll2d6();
        const level = getAttributeLevel(levelRoll);

        const power = createPower(category.id, powerData.name, level);
        this.character.powers.push(power);
    }

    /**
     * 添加指定能力
     * @param {string} categoryId - 类别ID
     * @param {string} powerName - 能力名称
     * @param {number} level - 等级
     */
    addPower(categoryId, powerName, level = 1) {
        const power = createPower(categoryId, powerName, level);
        this.character.powers.push(power);
        this.updateDerivedStats();
    }

    /**
     * 移除能力
     * @param {number} index - 索引
     */
    removePower(index) {
        this.character.powers.splice(index, 1);
        this.updateDerivedStats();
    }

    /**
     * 更新能力等级
     * @param {number} index - 索引
     * @param {number} level - 新等级
     */
    updatePowerLevel(index, level) {
        if (index >= 0 && index < this.character.powers.length) {
            this.character.powers[index].level = Math.max(1, Math.min(10, level));
            this.updateDerivedStats();
        }
    }

    addPowerModifier(powerIndex, modifierType, modifier) {
        const power = this.character.powers[powerIndex];
        if (!power) return;

        if (modifierType === 'extra') {
            if (!power.extras.some(e => e.id === modifier.id)) {
                power.extras.push(modifier);
            }
        } else {
            if (!power.flaws.some(f => f.id === modifier.id)) {
                power.flaws.push(modifier);
            }
        }
        this.updateDerivedStats();
    }

    removePowerModifier(powerIndex, modifierType, modifierId) {
        const power = this.character.powers[powerIndex];
        if (!power) return;

        if (modifierType === 'extra') {
            power.extras = power.extras.filter(e => e.id !== modifierId);
        } else {
            power.flaws = power.flaws.filter(f => f.id !== modifierId);
        }
        this.updateDerivedStats();
    }

    /**
     * 生成专长
     * @param {number} extraCount - 额外增加的数量
     */
    generateSpecialties(extraCount = 0) {
        if (extraCount === 0) {
            this.character.specialties = [];
        }

        const roll = roll2d6();
        let count = (extraCount === 0) ? getSpecialtyCountByRoll(roll) : extraCount;

        // 起源额外专长 (仅在非额外生成时计算)
        if (extraCount === 0 && this.character.origin?.mechanics.bonusSpecialties) {
            count += this.character.origin.mechanics.bonusSpecialties;
        }

        for (let i = 0; i < count; i++) {
            const randomSpecialty = SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)];
            const specialty = createSpecialty(randomSpecialty.id, 1);
            this.character.specialties.push(specialty);
        }
    }

    /**
     * 添加专长
     * @param {string} specialtyId - 专长ID
     * @param {number} level - 等级
     */
    addSpecialty(specialtyId, level = 1) {
        const specialty = createSpecialty(specialtyId, level);
        this.character.specialties.push(specialty);
    }

    /**
     * 移除专长
     * @param {number} index - 索引
     */
    removeSpecialty(index) {
        this.character.specialties.splice(index, 1);
    }

    /**
     * 更新专长等级
     * @param {number} index - 索引
     * @param {number} level - 新等级
     */
    updateSpecialtyLevel(index, level) {
        if (index >= 0 && index < this.character.specialties.length) {
            this.character.specialties[index].level = Math.max(1, Math.min(3, level));
        }
    }

    /**
     * 更新属性
     * @param {string} key - 属性键
     * @param {number} value - 新值
     */
    updateAttribute(key, value) {
        if (this.character.attributes.hasOwnProperty(key)) {
            this.character.attributes[key] = Math.max(1, Math.min(10, value));
            this.updateDerivedStats();
        }
    }

    /**
     * 更新衍生属性
     */
    updateDerivedStats() {
        const derived = calculateDerivedStats(this.character);
        this.character.stamina = derived.stamina;
        this.character.resolve = derived.resolve;
    }

    /**
     * 设置角色信息
     * @param {Object} info - 信息对象
     */
    setInfo(info) {
        if (info.name !== undefined) this.character.name = info.name;
        if (info.description !== undefined) this.character.description = info.description;
        if (info.qualities !== undefined) this.character.qualities = info.qualities;
    }

    /**
     * 获取角色
     * @returns {Object} 角色对象
     */
    getCharacter() {
        return this.character;
    }

    /**
     * 验证角色
     * @returns {Object} 验证结果
     */
    validate() {
        return validateCharacter(this.character);
    }

    /**
     * 计算购点模式已用点数
     * @returns {number} 已用点数
     */
    calculateUsedPoints() {
        if (this.mode !== 'point-buy') return 0;

        let used = 0;
        // 属性消耗
        Object.values(this.character.attributes).forEach(value => used += value);

        // 能力消耗
        this.character.powers.forEach(power => {
            used += power.level;
            used += power.extras.length; // 每个增益 +1
            used -= power.flaws.length;  // 每个限制 -1
        });

        // 专长消耗
        this.character.specialties.forEach(specialty => used += specialty.level);

        return used;
    }

    /**
     * 获取剩余点数
     * @returns {number} 剩余点数
     */
    getRemainingPoints() {
        return POINT_BUY_CONFIG.totalPoints - this.calculateUsedPoints();
    }

    /**
     * 检查是否可添加高等级项目
     * @returns {boolean} 是否可添加
     */
    canAddHighLevel() {
        let highLevelCount = 0;
        Object.values(this.character.attributes).forEach(value => {
            if (value >= 9) highLevelCount++;
        });
        this.character.powers.forEach(power => {
            if (power.level >= 9) highLevelCount++;
        });
        return highLevelCount < POINT_BUY_CONFIG.maxHighLevelItems;
    }
}

/**
 * 创建随机角色
 * @returns {Object} 随机角色
 */
export function createRandomCharacter() {
    const generator = new CharacterGenerator('random');
    return generator.generateRandom();
}

/**
 * 创建购点角色
 * @returns {Object} 购点角色初始状态
 */
export function createPointBuyCharacter() {
    const generator = new CharacterGenerator('point-buy');
    return generator.generatePointBuy();
}

/**
 * 从JSON导入角色
 * @param {string} json - JSON字符串
 * @returns {Object|null} 角色对象或null
 */
export function importCharacterFromJSON(json) {
    try {
        const character = JSON.parse(json);
        // 验证必要字段
        if (!character.attributes || !character.powers || !character.specialties) {
            throw new Error('无效的角色数据');
        }
        return character;
    } catch (error) {
        console.error('导入角色失败:', error);
        return null;
    }
}

/**
 * 导出角色为JSON
 * @param {Object} character - 角色对象
 * @returns {string} JSON字符串
 */
export function exportCharacterToJSON(character) {
    return JSON.stringify(character, null, 2);
}