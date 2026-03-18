/**
 * 限制与增益数据模块
 * 为特殊能力提供标准的可选修饰项
 */

export const POWER_EXTRAS = [
    { id: 'affects_others', name: '影响他人', description: '该项特殊能力也可以作用于其他人，既可以通过接触生效，也可以在预先设定的范围内（取决于能力等级）生效。' },
    { id: 'area', name: '区域影响', description: '该项特殊能力的作用范围覆盖一个完整的面板（或类似的空间区域）。' },
    { id: 'damage_swap', name: '损害转移', description: '你可以将受到的损害转移至另一个目标或特定介质。' },
    { id: 'duration_continuous', name: '持续生效', description: '即便不进行维持，该项特殊能力也会在一段时间内持续发挥作用。' },
    { id: 'range_increased', name: '增加距离', description: '该项特殊能力的视程范围等级增加一个台阶。' },
    { id: 'secondary_effect', name: '次要效果', description: '除了主要功能，该项特殊能力还附带一项类似其他能力的额外效果。' },
    { id: 'triggered', name: '触发机制', description: '你可以为能力的触发设定一个特定的前提条件。' },
    { id: 'versatile', name: '多才多艺', description: '该项特殊能力可以以多种不同的方式（相当于多种低级能力的组合）应用场景。' }
];

export const POWER_FLAWS = [
    { id: 'activation', name: '激活要求', description: '在使用该项特殊能力之前，需要进行一次特定的动作、手势、咒语或检定。' },
    { id: 'burnout', name: '效能损耗', description: '每次使用该项能力都有一定几率使其在当前章节或特定时间内无法再次使用。' },
    { id: 'concentration', name: '专注维持', description: '必须时刻保持专注才能维持该项特殊能力的效果。' },
    { id: 'device', name: '装置依赖', description: '该项特殊能力完全依赖于一项可被移除、破坏或遗失的物理装置。' },
    { id: 'limited', name: '情境限制', description: '该项特殊能力只能在特定条件下（如满月、水中或面对特定目标）生效。' },
    { id: 'tiring', name: '容易疲劳', description: '使用该项特殊能力会消耗使用者的体力或精神，通常需要痛下决心或休息才能再次施展。' },
    { id: 'uncontrolled', name: '无法控制', description: '能力的使用或效果由游戏主持人决定，或者由于某种原因无法被角色平稳掌控。' },
    { id: 'weakness', name: '伴生弱点', description: '开启该项能力时，会使角色在其他方面（如防御或特定检定）受到减值。' }
];

/**
 * 根据ID获取增益信息
 */
export function getExtraById(id) {
    return POWER_EXTRAS.find(e => e.id === id) || null;
}

/**
 * 根据ID获取限制信息
 */
export function getFlawById(id) {
    return POWER_FLAWS.find(f => f.id === id) || null;
}
