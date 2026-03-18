/**
 * 限制与增益数据模块
 * 为特殊能力提供标准的可选修饰项
 */

export const POWER_EXTRAS = [
    { id: 'affects_others', name: '影响他人', cost: '+1', description: '该项特殊能力也可以作用于其他人。既可以通过接触生效，也可以在预先设定的范围内（取决于能力等级，参照基准表）生效。' },
    { id: 'area', name: '区域影响', cost: '+1', description: '该项特殊能力的作用范围覆盖一个完整的面板（或类似的空间区域）。这在对抗成群的杂兵时非常有效。' },
    { id: 'damage_swap', name: '损害转移', cost: '+1', description: '你可以将受到的损害转移至另一个目标、影子或特定介质。转移成功率通常取决于能力等级。' },
    { id: 'duration_continuous', name: '持续生效', cost: '+1', description: '即便不进行维持（专注），该项特殊能力也会在一段时间内持续发挥作用（通常为能力等级对应的画页数）。' },
    { id: 'range_increased', name: '增加距离', cost: '+1', description: '该项特殊能力的视程范围等级增加一个台阶。例如从“近身”延长至“远程”。' },
    { id: 'secondary_effect', name: '次要效果', cost: '+1', description: '除了主要功能，该项特殊能力还附带一项类似其他能力的额外效果。主次效果等级相同。' },
    { id: 'triggered', name: '触发机制', cost: '+1', description: '你可以为能力的触发设定一个特定的前提条件。例如只有在受到攻击或进入黑暗环境时才会激活。' },
    { id: 'versatile', name: '多才多艺', cost: '+1', description: '该项特殊能力可以以多种不同的方式（相当于多种低级能力的组合）应用，使其更具通用性。' }
];

export const POWER_FLAWS = [
    { id: 'activation', name: '激活要求', cost: '-1', description: '在使用该项特殊能力之前，需要进行一次特定的动作、手势、咒语或检定。这通常会消耗一个画格。' },
    { id: 'burnout', name: '效能损耗', cost: '-1', description: '每次使用该项能力都有一定几率（掷d6结果为1）使其在当前章节或特定时间内无法再次使用。' },
    { id: 'concentration', name: '专注维持', cost: '-1', description: '必须时刻保持专注才能维持该项能力。如果你受到攻击或分心，需要进行意志检定以维持效果。' },
    { id: 'device', name: '装置依赖', cost: '-1', description: '该能力完全依赖于一项可被移除、破坏或遗失的物理装置。如果失去装置，则无法使用该能力，直到重新找回。' },
    { id: 'limited', name: '情境限制', cost: '-1', description: '该能力只能在特定条件下生效。例如：仅在满月下、仅在水中、或仅针对异型生物时生效。' },
    { id: 'tiring', name: '容易疲劳', cost: '-1', description: '使用该能力会消耗大量精力。每次使用后，你可能需要花费一个决意点或休息一整个画页来恢复。' },
    { id: 'uncontrolled', name: '无法控制', cost: '-1', description: '能力的使用时机或具体效果由主持人决定，或者由于某种原因无法被角色平稳掌控。' },
    { id: 'weakness', name: '伴生弱点', cost: '-1', description: '开启该项能力时，会使角色在其他方面（例如防御或特定的物理检定）受到减值。' }
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
