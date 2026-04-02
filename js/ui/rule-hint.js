class RuleHint {
    constructor() {
        this.hints = {
            mode: {
                random: '随机模式下，所有属性和能力都通过掷骰决定',
                'point-buy': '购点模式下，你有45点可以自由分配到属性、能力和专长上'
            },
            origin: {
                trained: '受训起源：额外获得两项专长，可以选择用一项特殊能力交换两项专长',
                altered: '改造起源：选择一项能力增加2个等级，最高不超过10级',
                mutant: '变种起源：天生具有特殊能力，获得一项额外能力',
                alien: '外星起源：来自其他星球，获得特殊能力和属性加成',
                magic: '魔法起源：通过魔法获得能力，可选择特殊魔法技能',
                tech: '科技起源：通过高科技装备获得能力，可选择特殊科技装备'
            },
            attributes: {
                brawn: '勇猛：影响物理攻击和近战能力',
                coordination: '协调：影响敏捷和精准度',
                strength: '力量：影响负重和物理伤害',
                intellect: '智力：影响技能和知识',
                awareness: '感知：影响察觉和反应速度',
                willpower: '意志：影响精神抵抗和意志力'
            },
            powers: {
                general: '能力等级越高，效果越强，但消耗的点数也越多',
                combat: '战斗类能力主要影响战斗效果',
                utility: '工具类能力主要提供各种实用功能',
                mental: '精神类能力主要影响思维和精神层面'
            },
            specialties: {
                general: '专长代表角色在生活中的特殊技能',
                level1: '1级专长：基础掌握',
                level2: '2级专长：专家水平',
                level3: '3级专长：大师水平'
            }
        };
    }

    getHint(step, key) {
        return this.hints[step]?.[key] || '';
    }

    renderHint(step, key) {
        const hint = this.getHint(step, key);
        if (!hint) return '';
        return `
            <div class="rule-hint">
                <p>${hint}</p>
            </div>
        `;
    }

    renderStepHints(step) {
        const stepHints = this.hints[step];
        if (!stepHints) return '';

        return `
            <div class="rule-hints">
                <h4>规则提示</h4>
                ${Object.entries(stepHints).map(([key, value]) => `
                    <p><strong>${key}:</strong> ${value}</p>
                `).join('')}
            </div>
        `;
    }
}

export const ruleHint = new RuleHint();