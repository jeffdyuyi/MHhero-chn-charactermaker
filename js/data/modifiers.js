/**
 * 限制与增益数据模块
 * 为特殊能力提供标准的可选修饰项
 */

export const POWER_EXTRAS = [
    { id: 'affects_others', name: '影响他人', cost: '+1', description: '该项特殊能力不仅对使用者本身生效,还可以对他人造成影响。如果特殊能力只对他人有效,请参阅仅限他人的限制条件(下文)。' },
    { id: 'type_effect', name: '类型影响', cost: '+1', description: '该项特殊能力可以对通常情况下不受影响的某类目标产生效果,比如让冲击波对无实体目标造成物理伤害,或是让精神控制影响不死生物或机器等无思维目标(通常是通过环境对特定目标造成影响)。' },
    { id: 'area_effect', name: '散布效果', cost: '+1', description: '使通常情况下适用于视程范围的特殊能力具有更广阔的作用范围,能对目睹/聆听到使用者(面对面/通过电视/通过无线电台)的目标造成影响。' },
    { id: 'burst_effect', name: '爆溢效果', cost: '+1', description: '该项特殊能力可以同时对近身范围内的所有目标造成影响,每项特殊能力进行一次检定,分别对抗不同目标带来的不同难度(结果也不尽相同)。' },
    { id: 'contagious', name: '感染效果', cost: '+1', description: '该项特殊能力具有“感染性”在能力效果尚未失效之前只要接触到作用目标就可能会受到影响。如“蔓延”的灾祸丛生、粘黏”的桎梏、“扩散”的酸性冲击波或火焰冲击波。新的受害者正常进行对抗检定,一旦能力生效,他们同样也具有感染性。' },
    { id: 'defensive', name: '防御效果', cost: '+1', description: '该项特殊能力可以用于格挡攻击(请参阅采取行动章节的格挡部分),占用一个反应动作,使用能力等级进行掷骰,以此确定对方攻击的难度。' },
    { id: 'mimic', name: '复制效果', cost: '+1', description: '该项特殊能力可以复制其他特殊能力的效果,能力等级与目标能力一致,且通常记录成目标能力的名称,复制飞行能力就记录成“飞行”,复制冲击波能力就记录成“冲击波”。如果连同目标能力的附带效果一起复制,就需要将两者一起记录在案,并额外花费一个附带效果。从本质上而言,这是将被复制能力的附带效果变成原本能力的新附带效果。' },
    { id: 'extended_duration', name: '延长时间', cost: '+1', description: '该项特殊能力延长一个等级的持续时间(请参阅持续时间)。' },
    { id: 'carry_passengers', name: '携带同伴', cost: '+1', description: '该项运动系特殊能力可以携带与能力等级数目相等的同伴。' },
    { id: 'increased_range', name: '扩大范围', cost: '+1', description: '使通常情况下适用于近身范围的特殊能力能够在远程范围内生效。' },
    { id: 'infinite_range', name: '无视范围', cost: '+1', description: '该项特殊能力可以无视距离,只要知晓目标所在地点即可生效。' },
    { id: 'reversible', name: '撤销效果', cost: '+1', description: '该项特殊能力可被终止,其效果可被随时撤销,撤销效果的适用范围与能力本身的适用范围相同。' },
    { id: 'stacking', name: '叠加效果', cost: '+1', description: '该项特殊能力具有额外的叠加效果,相当于同时使用别外一项特殊能力,比如使用击打能力时“携带”灾祸丛生能力,通过击打散布毒素。玩家只能将辅助效果与主要能力进行组合使用,叠加效果相同的特殊能力时,视为能力等级+1,类似于齐心协力(请参阅基本概念章节的齐心协力部分)的效果。' },
    { id: 'slow_recovery', name: '减缓恢复', cost: '+1', description: '该项特殊能力可以减缓目标的恢复速度,花费平时十倍的时间才能恢复如常。' }
];

export const POWER_FLAWS = [
    { id: 'animals_only', name: '仅限动物', cost: '-1', description: '该项特殊能力只能对动物造成影响。' },
    { id: 'type_ineffective', name: '类型失效', cost: '-1', description: '该项特殊能力无法对某些常见类型的物体或物质造成影响,如木制品、铝制品或蓝色物品等。' },
    { id: 'burnout', name: '消耗殆尽', cost: '-1', description: '使用能力之后需要进行掷骰,若结果为1点或2点,则该项特殊能力在当前章节的剩余部分都无法使用。' },
    { id: 'reduced_range', name: '缩小范围', cost: '-1', description: '通常情况下适用于远程范围的特殊能力,现在需要使用者近身接触目标才能生效。' },
    { id: 'concentration', name: '保持专注', cost: '-1', description: '该项特殊能力需要保持专注才能持续使用(请参阅持续时间部分的专注),只适用于持续时间为永久、延续或等级等原本无须专注的特殊能力。' },
    { id: 'permanent', name: '持续生效', cost: '-1', description: '该项特殊能力一直保持生效状态,也就是说具有破坏性的特殊能力可能会对周围的人员和物品造成伤害。其他类型的特殊能力不会带来这种困扰,此时这项限制条件可能会显得使用者特立独行,或是为他们的生活平添磨难。' },
    { id: 'fades', name: '逐级递减', cost: '-1', description: '使用时间每经过一画页,该项特殊能力就会降低一个等级,降低的等级会在章节之间恢复正常(请参加采取行动章节的恢复部分)。' },
    { id: 'exclusive', name: '排他性', cost: '-1', description: '如果使用排他性特殊能力,就无法使用或维持其他特殊能力(请参阅前文的排他性特殊能力)。' },
    { id: 'extra_only', name: '仅限附带效果', cost: '-1', description: '该项特殊能力只能表现出附带效果,而非原有效果,本质上是将两种效果互相交换,设定这项限制条件时必须选择一项附带效果。' },
    { id: 'visual_range_only', name: '仅限可视范围', cost: '-1', description: '该项特殊能力只能对可视范围内的目标(或者使用者在目标的可视范围内时)造成影响。' },
    { id: 'max_level_only', name: '仅限最高等级', cost: '-1', description: '该项特殊能力只能以最大效果对目标造成影响,无法改变能力等级,也无法进行有效控制。' },
    { id: 'no_stunts', name: '特技禁用', cost: '-1', description: '该项特殊能力无法作为特技使用(请参阅特技部分),只能发挥最基本的效果。' },
    { id: 'special_limitation', name: '特殊限定', cost: '-1', description: '该项特殊能力只能在特定情况下或对抗特定目标时才能生效,如仅限夜晚使用,仅限愤怒时使用,只能对男性(或女性)目标使用等等。' },
    { id: 'others_only', name: '仅限他人', cost: '-1', description: '该项特殊能力只能对他人造成影响,无法作用于自身这会抵消影响他人的附带效果。' },
    { id: 'activation', name: '施放动作', cost: '-1', description: '使用者需要做出某些施放动作才能使用特殊能力,如几句歌曲、一小段舞蹈、神秘的手势或吟诵咒语,无法做出施放动作则不能使用能力。除非该项特殊能力需要预先准备(下文所述),否则将施放动作视为使用能力这个动作的一部分。' },
    { id: 'preparation', name: '预先准备', cost: '-1', description: '使用者需要至少进行一画页的准备才能触发特殊能力(参阅前文的预先准备)。' },
    { id: 'source_limited', name: '限制来源', cost: '-1', description: '使用者无法生成特殊能力所需的能量或物质,必须依赖外部来源,游戏主持人可以将特殊能力的等级限制为可用来源的有效等级。' },
    { id: 'reduced_duration', name: '缩短时间', cost: '-1', description: '原本持续时间为延续或永久的特殊能力效果,现在只能持续与等级相同的画页数。' },
    { id: 'tiring', name: '耐力消耗', cost: '-1', description: '使用该项特殊能力会损耗2点耐力值。' },
    { id: 'uncontrolled', name: '不受控制', cost: '-1', description: '该项特殊能力的触发有时不遵循使用者的意愿,而是受到游戏主持人控制。与其他限制条件一样,这不能视为麻烦。' },
    { id: 'unreliable', name: '成败未知', cost: '-1', description: '使用该项特殊能力时需要进行掷骰,若结果为1点或2点,则能力不会生效。' },
    { id: 'unpredictable', name: '变化莫测', cost: '-1', description: '在战斗或其他紧急状态使用该项特殊能力时,需要进行掷骰,若结果为1点或2点,则能力会随机产生效果,而不会遵照使用者的意图生效。' }
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
