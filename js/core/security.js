export function sanitizeInput(input) {
    // 防止XSS攻击
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

export function encryptData(data) {
    // 简单的加密处理
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
}

export function decryptData(encryptedData) {
    // 解密处理
    const jsonString = atob(encryptedData);
    return JSON.parse(jsonString);
}

export function validateInput(input, type) {
    // 根据类型验证输入
    switch (type) {
        case 'name':
            return input.trim().length > 0 && input.trim().length <= 50;
        case 'number':
            return !isNaN(input) && input >= 1 && input <= 10;
        case 'text':
            return input.length <= 500;
        case 'specialty':
            return input.trim().length > 0 && input.trim().length <= 30;
        default:
            return true;
    }
}

export function generateId() {
    // 生成唯一ID
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function validateCharacterId(id) {
    // 验证角色ID格式
    return /^[a-z0-9]+$/.test(id);
}

export function sanitizeCharacterData(data) {
    // 清理角色数据，防止注入攻击
    const sanitized = { ...data };
    
    // 清理字符串字段
    if (sanitized.name) {
        sanitized.name = sanitizeInput(sanitized.name);
    }
    if (sanitized.identity) {
        sanitized.identity = sanitizeInput(sanitized.identity);
    }
    if (sanitized.motivation) {
        sanitized.motivation = sanitizeInput(sanitized.motivation);
    }
    if (sanitized.description) {
        sanitized.description = sanitizeInput(sanitized.description);
    }
    
    // 清理能力和专长
    if (sanitized.powers) {
        sanitized.powers = sanitized.powers.map(power => ({
            ...power,
            name: sanitizeInput(power.name)
        }));
    }
    if (sanitized.specialties) {
        sanitized.specialties = sanitized.specialties.map(specialty => ({
            ...specialty,
            name: sanitizeInput(specialty.name)
        }));
    }
    
    return sanitized;
}

export function checkStorageSecurity() {
    // 检查本地存储安全性
    try {
        const testKey = '__security_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        return true;
    } catch (error) {
        console.error('Storage security check failed:', error);
        return false;
    }
}