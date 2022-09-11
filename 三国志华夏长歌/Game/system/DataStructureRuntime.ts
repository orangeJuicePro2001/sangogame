/**
 * #1 preloadAsset
 */
class DataStructure_preloadAsset {
    assetType: number; // = 0; 资源类型
    asset0: string; // = "1"; 图片
    asset1: string; // = "1"; 音频
    asset2: number; // = 1; 行走图
    asset3: number; // = 1; 立绘
    asset4: number; // = 1; 动画
    asset5: number; // = 1; 界面
    asset6: number; // = 1; 对话框
}
/**
 * #2 packageItem
 */
class DataStructure_packageItem {
    isEquip: boolean; // = false; 是否装备
    equip: Module_Equip; // = 0; 装备
    item: Module_Item; // = 0; 道具
    number: number; // = 1; 数目
}
/**
 * #3 keys
 */
class DataStructure_keys {
    key: number; // = 0; 按键
}
/**
 * #4 compName
 */
class DataStructure_compName {
    未命名变量1: string; // = "";
}
/**
 * #5 dropItem
 */
class DataStructure_dropItem {
    dropProbability: number; // = 100; 掉落几率
    item: number; // = 1; 掉落道具
    num: number; // = 1; 数量
}
/**
 * #6 dropEquip
 */
class DataStructure_dropEquip {
    dropProbability: number; // = 100; 掉落几率
    equip: Module_Equip; // = 1; 掉落装备
}
/**
 * #7 classValidity
 */
class DataStructure_classValidity {
    class: number; // = 0; 职业
    per: number; // = 100; 有效度
}
/**
 * #8 levelUpLearnSkill
 */
class DataStructure_levelUpLearnSkill {
    lv: number; // = 2;
    skill: number; // = 0; 技能
}
/**
 * #9 inPartyActor
 */
class DataStructure_inPartyActor {
    actor: Module_Actor; // = 0; 角色
    lv: number; // = 1; 等级
    dissolutionEnabled: boolean; // = true; 允许解散
}
/**
 * #10 battlerSetting
 */
class DataStructure_battlerSetting {
    isBattler: boolean; // = false; 是否战斗角色
    battleCamp: number; // = 1; 所属阵营
    battleActor: Module_Actor; // = 1; 战斗角色
    usePlayerActors: boolean; // = true; 占用玩家的角色
    mustInBattle: boolean; // = true; 必须出场
    playerCantCtrl: boolean; // = false; 玩家无法操控
    level: number; // = 1; 等级
    isDead: boolean; // = false;
    operationComplete: boolean; // = false; 操作完成，回合行动结束
    moved: boolean; // = false; 已移动过标识
    actioned: boolean; // = false; 已行动标识
    isInited: boolean; // = false; 是否已初始化
    isExecuteAppearEvent: boolean; // = false; 私有实现
    hateList: DataStructure_battlerHate[]; // = [];
    hitBy: boolean; // = false;
}
/**
 * #11 battlerHate
 */
class DataStructure_battlerHate {
    targetIndex: number; // = 0; 目标编号
    hateValue: number; // = 0;
}
/**
 * #12 shopItem
 */
class DataStructure_shopItem {
    isEquip: boolean; // = false; 装备
    item: number; // = 1; 道具
    equip: number; // = 1; 装备
    numberType: number; // = 0;
    number: number; // = 1; 数量
    numberVar: number; // = 0; 数量
    priceType: number; // = 0;
    price: number; // = 0; 价格
    priceVar: number; // = 0; 价格
}
/**
 * #13 equipRand
 */
class DataStructure_equipRand {
    minValue: number; // = 100; 最低浮动值
    maxValue: number; // = 150; 最高浮动值
    probability: number; // = 100; 概率
}
/**
 * #14 gameKeyboard
 */
class DataStructure_gameKeyboard {
    gameKey: number; // = 0; 键位
    keyCode1: number; // = 0; 值1
    keyCode2: number; // = 0; 值2
    keyCode3: number; // = 0; 值3
    keyCode4: number; // = 0; 值4
}
/**
 * #15 inputMessage
 */
class DataStructure_inputMessage {
    type: number; // = 0; 类别
    numberValue: any; // 游戏数值
    booleanValue: any; // 游戏开关
    stringValue: any; // 游戏字符串
}
