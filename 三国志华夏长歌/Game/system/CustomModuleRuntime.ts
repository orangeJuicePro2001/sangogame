/**
 * #1 角色
 */
class Module_Actor {
    id: number;
    name: string;
    face: string; // = ""; 大头像
    class: number; // = 1; 职业
    growUpEnabled: boolean; // = false; 可成长角色
    dropEnabled: boolean; // = false; 死亡后掉落设定
    avatar: number; // = 0; 行走图
    smallFace: string; // = ""; 小头像
    moveSpeed: number; // = 250; 移动速度
    MaxHP: number; // = 100; 生命值
    MaxSP: number; // = 100; 魔法值
    POW: number; // = 10; 力量
    END: number; // = 5; 耐力
    MAG: number; // = 0; 魔力
    AGI: number; // = 0; 敏捷
    MaxHPGrow: string; // = ""; 生命值
    MaxSPGrow: string; // = ""; 魔法值
    POWGrow: string; // = ""; 力量
    ENDGrow: string; // = ""; 耐力
    MAGGrow: string; // = ""; 魔力
    AGIGrow: string; // = ""; 敏捷
    MaxLv: number; // = 100; 最大等级
    needEXPGrow: string; // = ""; 经验值设定
    MoveGrid: number; // = 5; 移动力
    MagDef: number; // = 0; 魔法防御力
    HIT: number; // = 100; 命中率
    atkMode: number; // = 0; 普通攻击使用技能代替
    atkSkill: Module_Skill; // = 1; 攻击技能
    hitFrame: number; // = 1; 击中帧
    hitAnimation: number; // = 1; 击中动画
    skills: Module_Skill[]; // = [];
    equips: Module_Equip[]; // = [];
    items: Module_Item[]; // = [];
    aiType: number; // = 0; 行动类别
    aiVigilance: boolean; // = false; 警戒
    aiVigilanceRange: number; // = 10; 警戒范围
    aiGetTargetMode: number; // = 0; 获取目标的方式
    moveType: number; // = 0; 移动方式
    dropGold: number; // = 0; 掉落金币
    dropExp: number; // = 0; 掉落经验值
    dropEquips: DataStructure_dropEquip[]; // = [];
    dropItems: DataStructure_dropItem[]; // = [];
    currentEXP: number; // = 0; 当前经验值
    increaseMaxHP: number; // = 0; 增加的最大生命值
    increaseMaxSP: number; // = 0; 增加的最大魔法值
    increasePow: number; // = 0; 增加的力量
    increaseEnd: number; // = 0; 增加的耐力
    increaseMag: number; // = 0; 增加的魔力
    increaseAgi: number; // = 0; 增加的敏捷
    status: Module_Status[]; // = [];
    ATK: number; // = 0; 攻击力
    DEF: number; // = 0; 防御力
    DOD: number; // = 0; 躲避率
    CRIT: number; // = 0; 暴击率
    MagCrit: number; // = 0; 暴击率
    AI: boolean; // = false;
    AIRecord: number; // = 0;
    hp: number; // = 1;
    sp: number; // = 1;
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
}
/**
 * #2 职业
 */
class Module_Class {
    id: number;
    name: string;
    lvUpAutoGetSkills: DataStructure_levelUpLearnSkill[]; // = [];
    canWearEquips: number[]; // = [];
    icon: string; // = ""; 职业图标
}
/**
 * #3 技能
 */
class Module_Skill {
    id: number;
    name: string;
    icon: string; // = ""; 技能图标
    intro: string; // = "";  
    skillType: number; // = 0; 技能类别
    targetType: number; // = 2; 目标类别
    effectRange1: number; // = 4; 作用范围
    effectRange2A: number; // = 1; 最小范围
    effectRange2B: number; // = 4; 最大范围
    effectRange3: { size: number, gridData: number[][] }; // 作用范围
    releaseRange: { size: number, gridData: number[][] }; // 释放范围
    totalCD: number; // = 1; 冷却回合数
    hit: number; // = 100; 命中率
    costSP: number; // = 0; 消耗魔法值
    useDamage: boolean; // = false; 计算伤害
    releaseFrame: number; // = 1; 释放帧
    releaseActionID: number; // = 1; 释放动作
    effectRangeType: number; // = 0; 范围类别
    mustOpenSpace: boolean; // = false; 必须指定空地
    costActionPower: boolean; // = true; 消耗行动力
    useHate: boolean; // = false; 造成仇恨
    releaseTimes: number; // = 1; 连击次数
    isThroughObstacle: boolean; // = false; 穿透障碍
    bulletSpeed: number; // = 500; 弹幕速度
    bulletAnimation: number; // = 0; 弹幕对象
    damageType: number; // = 0; 伤害类型
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 100; + 按伤害数值比例增加仇恨
    releaseAnimation: number; // = 0; 释放动画
    hitAnimation: number; // = 0; 击中目标的动画
    targetGridAnimation: number; // = 0; 目标地的动画
    targetGridAniLayer: number; // = 0; 目标地动画层次
    releaseEvent: string; // = ""; 使用技能时事件
    hitEvent: string; // = ""; 击中目标时事件
    hitOpenSpaceEvent: string; // = ""; 击中地面的事件
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit1: number; // = 0; 命中率变更
    moveGrid: number; // = 0; 移动力
    agi: number; // = 0; 敏捷
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
    currentCD: number; // = 0;
}
/**
 * #4 装备
 */
class Module_Equip {
    id: number;
    name: string;
    icon: string; // = ""; 装备图标
    intro: string; // = "";  
    sell: number; // = 0; 商店售价
    partID: number; // = 0; 部位
    sellEnabled: boolean; // = true; 允许出售
    maxHP: number; // = 0;
    maxSP: number; // = 0;
    atk: number; // = 0; 攻击力
    def: number; // = 0; 防御力
    mag: number; // = 0; 魔力
    magDef: number; // = 0; 魔法防御力
    hit: number; // = 0; 命中率变更
    moveGrid: number; // = 0; 移动力
    agi: number; // = 0; 敏捷
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    selfStatus: number[]; // = [];
    selfImmuneStatus: number[]; // = [];
    hitTargetStatus: number[]; // = [];
    hitTargetSelfAddStatus: number[]; // = [];
}
/**
 * #5 道具
 */
class Module_Item {
    id: number;
    name: string;
    icon: string; // = ""; 道具图标
    intro: string; // = "";
    sell: number; // = 0; 商店售价
    isUse: boolean; // = false; 可使用
    sellEnabled: boolean; // = true; 允许出售
    isConsumables: boolean; // = false; 消耗品
    callEvent: string; // = ""; 使用后执行的事件
    se: string; // = ""; 非战斗使用时音效
    useType: number; // = 0; 使用的场合
    isSingleTarget: boolean; // = true; 指定单个目标
    harmful: boolean; // = false; 有害的
    releaseAnimation: number; // = 1; 释放动画
    recoveryHP: number; // = 0; 恢复生命值
    recoverySP: number; // = 0; 恢复魔法值
    costActionPower: boolean; // = true; 消耗行动力
    addStatus: number[]; // = [];
    removeStatus: number[]; // = [];
}
/**
 * #6 状态
 */
class Module_Status {
    id: number;
    name: string;
    icon: string; // = ""; 图标
    intro: string; // = "";
    totalDuration: number; // = 1; 持续回合
    overtime: boolean; // = false; DOT/HOT
    statusHit: number; // = 100; 命中率%
    cantMove: boolean; // = false; 无法移动
    cantAtk: boolean; // = false; 无法攻击
    cantUseSkill: boolean; // = false; 无法使用技能
    cantUseItem: boolean; // = false; 无法使用道具
    removeWhenInjured: boolean; // = false; 受伤时解除
    maxlayer: number; // = 1; 最大叠加层
    removePer: number; // = 100; 解除概率%
    animation: number; // = 1; 状态自动动画
    turnInterval: number; // = 1; 回合间隔
    damageType: number; // = 0; 伤害类别
    damageValue: number; // = 0; 数值
    additionMultiple: number; // = 100; 属性加成值
    useAddition: boolean; // = false; 属性加成
    additionMultipleType: number; // = 0; 加成类别
    whenOvertimeEvent: string; // = ""; 执行的事件
    fixedHeteValue: number; // = 0; 固定仇恨值
    damageHatePer: number; // = 0; + 按伤害数值比例增加仇恨
    whenAddEvent: string; // = ""; 拥有该状态时处理
    whenRemoveEvent: string; // = ""; 解除该状态时处理
    maxHP: number; // = 100; maxHP%
    maxSP: number; // = 100; maxSP%
    atk: number; // = 100; 攻击力%
    def: number; // = 100; 防御力%
    mag: number; // = 100; 魔力%
    magDef: number; // = 100; 魔法防御力%
    hit: number; // = 0; 命中率变更
    moveGrid: number; // = 100; 移动力%
    crit: number; // = 0; 暴击率变更
    magCrit: number; // = 0; 魔法暴击率变更
    currentLayer: number; // = 1; 当前层
    fromBattlerID: number; // = 0; 来源的场景对象编号
    currentDuration: number; // = 0;
}