export function validateCharacterData(data) {
    const errors = [];

    // 验证模式
    if (!data.mode) {
        errors.push('请选择创建模式');
    }

    // 验证起源
    if (!data.origin) {
        errors.push('请选择能力起源');
    }

    // 验证属性
    if (data.attributes) {
        const attrSum = Object.values(data.attributes).reduce((sum, val) => sum + val, 0);
        if (attrSum < 20) {
            errors.push(`属性总和不能低于 20 (当前: ${attrSum})`);
        }
        
        // 验证每个属性的范围
        Object.entries(data.attributes).forEach(([key, value]) => {
            if (value < 1 || value > 10) {
                errors.push(`${key} 属性值必须在 1-10 之间 (当前: ${value})`);
            }
        });
    } else {
        errors.push('请设置基础属性');
    }

    // 验证购点模式
    if (data.mode === 'point-buy') {
        let usedPoints = 0;
        
        // 计算属性点数
        if (data.attributes) {
            usedPoints += Object.values(data.attributes).reduce((sum, val) => sum + (val - 1), 0);
        }
        
        // 计算能力点数
        if (data.powers) {
            usedPoints += data.powers.reduce((sum, power) => sum + power.level, 0);
        }
        
        // 计算专长点数
        if (data.specialties) {
            usedPoints += data.specialties.reduce((sum, specialty) => sum + specialty.level, 0);
        }
        
        if (usedPoints > 45) {
            errors.push(`购点模式下总点数超过了 45 (当前: ${usedPoints})`);
        }
    }

    // 验证角色信息
    if (!data.name || data.name.trim() === '') {
        errors.push('角色名称不能为空');
    }

    if (data.name && data.name.length > 50) {
        errors.push('角色名称不能超过 50 个字符');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

export function validatePower(power) {
    const errors = [];
    
    if (!power.name) {
        errors.push('能力名称不能为空');
    }
    
    if (!power.level || power.level < 1 || power.level > 10) {
        errors.push('能力等级必须在 1-10 之间');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateSpecialty(specialty) {
    const errors = [];
    
    if (!specialty.name) {
        errors.push('专长名称不能为空');
    }
    
    if (!specialty.level || specialty.level < 1 || specialty.level > 3) {
        errors.push('专长等级必须在 1-3 之间');
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

export function validateAttributeValue(value) {
    return value >= 1 && value <= 10;
}

export function validatePointBuyPoints(usedPoints) {
    return usedPoints <= 45;
}