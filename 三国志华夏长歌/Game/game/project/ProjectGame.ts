/**
 * 项目层游戏管理器实现类
 * -- 为了让系统API属性的类别直接指向项目层的实现类
 *    游戏内会经常用到Game.player以及Game.currentScene，实现此类可指向项目层自定义的「玩家类」和「场景类」
 *    
 * 
 * Created by 黑暗之神KDS on 2020-09-08 17:00:46.
 */
class ProjectGame extends GameBase {
    //------------------------------------------------------------------------------------------------------
    // 事件：角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：卸下了角色的道具 onRemoveActorItem(actor: Module_Actor, itemIndex: number, item: Module_Item);
     */
    EVENT_REMOVE_ACTOR_ITEM: string = "GameEVENT_REMOVE_ACTOR_ITEM";
    /**
     * 事件：安装了角色的道具 onCarryActorItem(actor: Module_Actor, itemIndex: number, removeItem: Module_Item, newItem: Module_Item);
     */
    EVENT_CARRY_ACTOR_ITEM: string = "GameEVENT_CARRY_ACTOR_ITEM";
    /**
     * 事件：学习了技能 onLearnSkill(actor: Module_Actor, newSkill: Module_Skill);
     */
    EVENT_LEARN_SKILL: string = "GameEVENT_LEARN_SKILL";
    /**
     * 事件：忘记了技能 onForgetSkill(actor: Module_Actor, forgetSkill: Module_Skill);
     */
    EVENT_FORGET_SKILL: string = "GameEVENT_FORGET_SKILL";
    /**
     * 事件：穿戴了装备 onWearActorEquip(actor: Module_Actor, partID: number, takeOffEquip: Module_Equip, newEquip: Module_Equip);
     */
    EVENT_WEAR_ACTOR_EQUIP: string = "GameEVENT_WEAR_ACTOR_EQUIP";
    /**
     * 事件：卸下了装备 onTakeOffActorEquip(actor: Module_Actor, partID: number, takeOffEquip: Module_Equip);
     */
    EVENT_TAKE_OFF_ACTOR_EQUIP: string = "GameEVENT_TAKE_OFF_ACTOR_EQUIP";
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 游戏开始时间（新游戏时记录，读档后记录档案的时间会计算差值以便获得游戏总游玩时间）
     */
    static gameStartTime: Date;
    /**
    * 当前的场景对象：重写，以便类别能够对应项目层自定义的子类
    */
    declare currentScene: ProjectClientScene;
    /**
     * 玩家对象：重写，便类别能够对应项目层自定义的子类
     */
    declare player: ProjectPlayer;
    /**
     * 构造函数
     */
    constructor() {
        super();
        EventUtils.addEventListenerFunction(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, this.onInSceneStateChange, this);
    }
    /**
     * 初始化
     */
    init() {
        // 创建的玩家是这个项目层自定义类的实例
        this.player = new ProjectPlayer();
    }
    //------------------------------------------------------------------------------------------------------
    // 角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 根据场景对象（战斗者）的编号获取其对应的角色数据
     * @param soIndex 场景对象编号
     * @return [Module_Actor] 
     */
    getActorBySceneObjectIndex(soIndex: number): Module_Actor {
        var soc = Game.currentScene.sceneObjects[soIndex];
        if (GameBattleHelper.isBattler(soc)) {
            return soc.battlerSetting.battleActor;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的技能：根据技能编号
     * @param actor 角色
     * @param skillID 技能编号
     * @return [Module_Skill] 
     */
    getActorSkillBySkillID(actor: Module_Actor, skillID: number): Module_Skill {
        return ArrayUtils.matchAttributes(actor.skills, { id: skillID }, true)[0];
    }
    /**
     * 角色学习技能
     * @param actor 角色
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 
     */
    actorLearnSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (skill || !GameData.getModuleData(3, skillID)) return;
        var newSkill = GameData.newModuleData(3, skillID);
        actor.skills.push(newSkill);
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_LEARN_SKILL, [actor, newSkill]);
        return newSkill;
    }
    /**
     * 角色忘记技能
     * @param actor 角色
     * @param skillID 技能编号
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 忘却的技能
     */
    actorForgetSkill(actor: Module_Actor, skillID: number, happenEvent: boolean = true): Module_Skill {
        var skill = this.getActorSkillBySkillID(actor, skillID);
        if (!skill || !GameData.getModuleData(3, skillID)) return;
        actor.skills.splice(actor.skills.indexOf(skill), 1);
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, skill]);
        return skill;
    }
    /**
     * 角色忘记全部技能
     * @param actor 角色
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Skill] 忘却的技能集合
     */
    actorForgetAllSkills(actor: Module_Actor, happenEvent: boolean = true): Module_Skill[] {
        var forgetSkills = actor.skills.concat();
        actor.skills.length = 0;
        for (var i = 0; i < forgetSkills.length; i++) {
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_FORGET_SKILL, [actor, forgetSkills[i]]);
        }
        return forgetSkills;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的装备
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的装备：根据装备部位
     * @param actor 角色
     * @param partID 装备部位
     * @return [Module_Equip] 
     */
    getActorEquipByPartID(actor: Module_Actor, partID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true)[0];
    }
    /**
     * 获取角色的装备：根据装备的编号
     * @param actor 角色
     * @param equipID 装备编号
     * @return [Module_Equip] 
     */
    getActorEquipByEquipID(actor: Module_Actor, equipID: number): Module_Equip {
        return ArrayUtils.matchAttributes(actor.equips, { id: equipID }, true)[0];
    }
    /**
     * 穿戴角色装备
     * @param actor 角色数据
     * @param newEquip 新的装备
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return success=是否更换成功 removeEquip=更换下来的装备
     */
    wearActorEquip(actor: Module_Actor, newEquip: Module_Equip, happenEvent: boolean = true): { success: boolean, takeOffEquip: Module_Equip } {
        if (newEquip) {
            var takeOffEquip = this.takeOffActorEquipByPartID(actor, newEquip.partID);
            actor.equips.push(newEquip);
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_WEAR_ACTOR_EQUIP, [actor, newEquip.partID, takeOffEquip, newEquip]);
            return { success: true, takeOffEquip: takeOffEquip };
        }
    }
    /**
     * 卸下装备
     * @param actor 角色
     * @param partID 部位
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Equip] 
     */
    takeOffActorEquipByPartID(actor: Module_Actor, partID: number, happenEvent: boolean = true): Module_Equip {
        var idx = ArrayUtils.matchAttributes(actor.equips, { partID: partID }, true, "==", true)[0];
        if (idx == null) return null;
        var takeOffEquip = actor.equips.splice(idx, 1)[0];
        if (takeOffEquip && happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, partID, takeOffEquip]);
        return takeOffEquip;
    }
    /**
     * 卸下全部装备
     * @param actor 角色
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Equip] 
     */
    takeOffActorAllEquips(actor: Module_Actor, happenEvent: boolean = true): Module_Equip[] {
        var takeOffEquipArr = actor.equips.concat();
        actor.equips.length = 0;
        for (var i = 0; i < takeOffEquipArr.length; i++) {
            var takeOffEquip = takeOffEquipArr[i];
            if (happenEvent) EventUtils.happen(Game, Game.EVENT_TAKE_OFF_ACTOR_EQUIP, [actor, takeOffEquip.partID, takeOffEquip]);
        }
        return takeOffEquipArr;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的道具
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取角色的道具：根据道具所在的位置，如果不存在则为null
     * @param actor 角色
     * @param partID 道具位置
     */
    getActorItemByItemIndex(actor: Module_Actor, itemIndex: number): Module_Item {
        return actor.items[itemIndex];
    }
    /**
     * 获取角色的道具：根据道具编号，如果不存在则为null
     * @param actor 角色
     * @param itemID 道具编号
     * @return [Module_Item] 
     */
    getActorItemByItemID(actor: Module_Actor, itemID: number): Module_Item {
        return ArrayUtils.matchAttributes(actor.items, { id: itemID }, true)[0];
    }
    /**
     * 卸下角色的道具
     * @param inPartyIndex 该角色所在队伍的索引
     * @param itemIndex 道具位置
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return [Module_Item] 卸下的道具
     */
    unActorItemByItemIndex(actor: Module_Actor, itemIndex: number, happenEvent: boolean = true): Module_Item {
        var item = actor.items[itemIndex];
        if (item == null) return null;
        actor.items[itemIndex] = null;
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_REMOVE_ACTOR_ITEM, [actor, itemIndex, item]);
        return item;
    }
    /**
     * 角色携带道具
     * @param inPartyIndex 该角色所在队伍的索引
     * @param newItem 新的道具
     * @param happenEvent [可选] 默认值=true 是否派发事件
     * @return 更换下来的装备
     */
    carryActorItem(actor: Module_Actor, newItem: Module_Item, itemIndex: number, happenEvent: boolean = true): Module_Item {
        var removeItem = this.unActorItemByItemIndex(actor, itemIndex, happenEvent);
        actor.items[itemIndex] = newItem;
        if (happenEvent) EventUtils.happen(Game, Game.EVENT_CARRY_ACTOR_ITEM, [actor, itemIndex, removeItem, newItem]);
        return removeItem;
    }
    //------------------------------------------------------------------------------------------------------
    // 角色的属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取下一等级所需经验值
     * @param actor 角色数据
     * @param lv 当前等级
     * @return [number] 
     */
    getLevelUpNeedExp(actor: Module_Actor, lv: number): number {
        return Math.floor(this.getGrowValueByLv(actor, "needEXPGrow", lv));
    }
    /**
     * 刷新角色属性
     * -- 基础属性
     * -- 加点属性
     * -- 装备加成
     * -- 状态加成
     */
    refreshActorAttribute(actor: Module_Actor, lv: number): void {
        // 获取数据库预设的数据
        var res = this.clacActorAttribute(actor, lv);
        // 写入属性至该角色数据里
        if (res) {
            actor.ATK = Math.floor(res.ATK);
            actor.DEF = Math.floor(res.DEF);
            actor.AGI = Math.floor(res.AGI);
            actor.DOD = Math.floor(res.DOD);
            actor.MaxHP = Math.floor(res.MaxHP);
            actor.MaxSP = Math.floor(res.MaxSP);
            actor.POW = Math.floor(res.POW);
            actor.END = Math.floor(res.END);
            actor.MAG = Math.floor(res.MAG);
            actor.MagDef = Math.floor(res.MagDef);
            actor.HIT = Math.floor(res.HIT);
            actor.CRIT = Math.floor(res.CRIT);
            actor.MagCrit = Math.floor(res.MagCrit);
            actor.MoveGrid = Math.floor(res.MoveGrid);
        }
    }
    /**
     * 计算角色属性
     * @param actor 角色
     * @param lv 等级
     * @param previewChangeEquipMode [可选] 默认值=false 是否预览替换的装备模式
     * @param previewChangeEquipIndex [可选] 默认值=0 预览替换的装备部位
     * @param previewChangeEquip [可选] 默认值=null 预览替换的装备属性
     */
    clacActorAttribute(actor: Module_Actor, lv: number, previewChangeEquipMode: boolean = false, previewChangeEquipIndex: number = 0, previewChangeEquip: Module_Equip = null) {
        // 获取数据库预设的数据
        let systemActor = GameData.getModuleData(1, actor.id) as Module_Actor;
        if (!systemActor) return;
        // 获取原始属性
        let maxhp: number;
        let maxsp: number;
        let mag: number;
        let agi: number;
        let pow: number;
        let end: number;
        let magDef: number;
        let hit: number;
        let crit: number;
        let magCrit: number;
        let moveGrid: number;
        // -- 成长型的角色
        if (actor.growUpEnabled) {
            maxhp = this.getGrowValueByLv(actor, "MaxHPGrow", lv) + actor.increaseMaxHP;
            maxsp = this.getGrowValueByLv(actor, "MaxSPGrow", lv) + actor.increaseMaxSP;
            mag = this.getGrowValueByLv(actor, "MAGGrow", lv) + actor.increaseMag;
            agi = this.getGrowValueByLv(actor, "AGIGrow", lv) + actor.increaseAgi;
            pow = this.getGrowValueByLv(actor, "POWGrow", lv) + actor.increasePow;
            end = this.getGrowValueByLv(actor, "ENDGrow", lv) + actor.increaseEnd;
        }
        // -- 非成长型角色（固定值）
        else {
            maxhp = systemActor.MaxHP + actor.increaseMaxHP;
            maxsp = systemActor.MaxSP + actor.increaseMaxSP;
            mag = systemActor.MAG + actor.increaseMag;
            agi = systemActor.AGI + actor.increaseAgi;
            pow = systemActor.POW + actor.increasePow;
            end = systemActor.END + actor.increaseEnd;
        }
        // 其他战斗属性（通用固定值）
        magDef = systemActor.MagDef;
        hit = systemActor.HIT;
        crit = 0;
        magCrit = 0;
        moveGrid = systemActor.MoveGrid;
        // 刷新装备和技能以及状态，剔除相同的元素
        ArrayUtils.removeSameObjectD2(actor.equips, "id", false);
        ArrayUtils.removeSameObjectD2(actor.skills, "id", false);
        ArrayUtils.removeSameObjectD2(actor.status, "id", false);
        // 追加来自装备的属性和状态：加法
        let atkIncrease = 0;
        let defIncrease = 0;
        actor.selfStatus.length = 0;
        actor.selfImmuneStatus.length = 0;
        actor.hitTargetStatus.length = 0;
        actor.hitTargetSelfAddStatus.length = 0;
        for (let i = 0; i < 5; i++) {
            let equip: Module_Equip;
            // 预览模式下该部件使用指定的装备（可能无装备）
            if (previewChangeEquipMode && previewChangeEquipIndex == i) {
                equip = previewChangeEquip;
            }
            // 否则使用当前该部位上已佩戴的装备
            else {
                equip = Game.getActorEquipByPartID(actor, i);
            }
            // 存在装备的话，属性加成
            if (equip) {
                maxhp += equip.maxHP;
                maxsp += equip.maxSP;
                atkIncrease += equip.atk;
                defIncrease += equip.def;
                mag += equip.mag;
                magDef += equip.magDef;
                moveGrid += equip.moveGrid;
                hit += equip.hit;
                agi += equip.agi;
                crit += equip.crit;
                magCrit += equip.magCrit;
                // 状态刷新
                actor.selfStatus = actor.selfStatus.concat(equip.selfStatus);
                actor.selfImmuneStatus = actor.selfImmuneStatus.concat(equip.selfImmuneStatus);
                actor.hitTargetStatus = actor.hitTargetStatus.concat(equip.hitTargetStatus);
                actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(equip.hitTargetSelfAddStatus);
            }
        }
        // 追加来自技能的属性和状态
        for (let i = 0; i < actor.skills.length; i++) {
            let actorSkill = actor.skills[i];
            maxhp += actorSkill.maxHP;
            maxsp += actorSkill.maxSP;
            atkIncrease += actorSkill.atk;
            defIncrease += actorSkill.def;
            mag += actorSkill.mag;
            magDef += actorSkill.magDef;
            moveGrid += actorSkill.moveGrid;
            hit += actorSkill.hit;
            agi += actorSkill.agi;
            crit += actorSkill.crit;
            magCrit += actorSkill.magCrit;
            // 状态刷新
            actor.selfStatus = actor.selfStatus.concat(actorSkill.selfStatus);
            actor.selfImmuneStatus = actor.selfImmuneStatus.concat(actorSkill.selfImmuneStatus);
            actor.hitTargetStatus = actor.hitTargetStatus.concat(actorSkill.hitTargetStatus);
            actor.hitTargetSelfAddStatus = actor.hitTargetSelfAddStatus.concat(actorSkill.hitTargetSelfAddStatus);
        }
        // 转换计算
        let atk = pow * 1.5 + atkIncrease;
        let def = end * 2 + defIncrease;
        let dod = agi * 0.1;
        // 追加来自状态的属性 %
        let stHPPer = 100;
        let stSPPer = 100;
        let stATK = 100;
        let stDEF = 100;
        let stMAG = 100;
        let stMagDef = 100;
        let stMoveGrid = 100;
        for (let i = 0; i < actor.status.length; i++) {
            let status = actor.status[i];
            stHPPer *= Math.pow(status.maxHP / 100, status.currentLayer);
            stSPPer *= Math.pow(status.maxSP / 100, status.currentLayer);
            stATK *= Math.pow(status.atk / 100, status.currentLayer);
            stDEF *= Math.pow(status.def / 100, status.currentLayer);
            stMAG *= Math.pow(status.mag / 100, status.currentLayer);
            stMagDef *= Math.pow(status.magDef / 100, status.currentLayer);
            stMoveGrid *= Math.pow(status.moveGrid / 100, status.currentLayer);
            hit += status.hit * status.currentLayer;
            crit += status.crit * status.currentLayer;
            magCrit += status.magCrit * status.currentLayer;
        }
        maxhp *= stHPPer / 100;
        maxsp *= stSPPer / 100;
        atk *= stATK / 100;
        def *= stDEF / 100;
        mag *= stMAG / 100;
        magDef *= stMagDef / 100;
        moveGrid *= stMoveGrid / 100;
        // 限制
        atk = Math.max(atk, 0);
        def = Math.max(def, 0);
        agi = Math.max(agi, 0);
        dod = Math.max(dod, 0);
        maxhp = Math.max(maxhp, 0);
        maxsp = Math.max(maxsp, 0);
        pow = Math.max(pow, 0);
        end = Math.max(end, 0);
        mag = Math.max(mag, 0);
        magDef = Math.max(magDef, 0);
        hit = Math.max(hit, 0);
        crit = Math.max(Math.min(crit, 100), 0);
        magCrit = Math.max(Math.min(magCrit, 100), 0);
        moveGrid = Math.max(moveGrid, 0);
        // 返回结果
        return {
            ATK: Math.floor(atk),
            DEF: Math.floor(def),
            AGI: Math.floor(agi),
            DOD: Math.floor(dod),
            MaxHP: Math.floor(maxhp),
            MaxSP: Math.floor(maxsp),
            POW: Math.floor(pow),
            END: Math.floor(end),
            MAG: Math.floor(mag),
            MagDef: Math.floor(magDef),
            HIT: Math.floor(hit),
            CRIT: Math.floor(crit),
            MagCrit: Math.floor(magCrit),
            MoveGrid: Math.floor(moveGrid),
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 私有实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 监听事件：进入场景的状态改变时派发事件
     * @param inNewSceneState 0-切换游戏场景 1-新游戏 2-读取存档
     */
    private onInSceneStateChange(inNewSceneState: number) {
        // 状态：离开场景时（标题时视为离开空场景）
        if (GameGate.gateState == GameGate.STATE_0_START_EXECUTE_LEAVE_SCENE_EVENT) {
            // 新游戏的话：记录当前时间为启动时间
            if (inNewSceneState == 1) {
                ProjectGame.gameStartTime = new Date();
                ProjectPlayer.init();
            }
            // 读取存档的情况：以当前的时间减去已游戏时间来记录
            else if (inNewSceneState == 2) {
                ProjectGame.gameStartTime = new Date((Date.now() - GUI_SaveFileManager.currentSveFileIndexInfo.indexInfo.gameTime));
            }
        }
        // 状态：加载场景完毕
        else if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
            // -- 新游戏：创建队友的场景对象以及战斗者和角色的数据
            if (inNewSceneState == 1 || inNewSceneState == 2) {
                // 将角色转为副本模式，以便支持存档
                for (var i = 0; i < Game.player.data.party.length; i++) {
                    var actorDS = Game.player.data.party[i];
                    if (actorDS == null) continue;
                    GameData.changeModuleDataToCopyMode(actorDS.actor, 1);
                }
            }
        }
    }
    /**
     * 获取成长数据根据等级
     * @param actor 角色数据 
     * @param growAttrName 属性名称 
     * @param lv 等级
     * @return [number] 
     */
    private getGrowValueByLv(actor: Module_Actor, growAttrName: string, lv: number): number {
        // -- 获取属性
        var cacheGrowName = growAttrName + "_cache";
        var growData = actor[cacheGrowName];
        if (!actor[cacheGrowName]) growData = actor[cacheGrowName] = GameUtils.getCurveData(actor[growAttrName]);
        var per = lv == 0 ? 0 : (lv - 1) / (actor.MaxLv - 1); // 转为0-1的空间
        return GameUtils.getBezierPoint2ByGroupValue(growData, per);
    }
}