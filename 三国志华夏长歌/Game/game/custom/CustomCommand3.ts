/**
 * 自定义事件命令-战斗指令
 * 
 * -- 调用「进入战斗」的指令
 *    -- 记录战斗前的状态
 *    -- 暂停当前事件执行，直到战斗结束后恢复
 *    -- 触发世界设定中的「战斗开始时事件」
 *    -- 玩家的场景对象变为光标
 * 
 * -- 调用「进入结束」的指令：默认模板的常规战斗结束后奖励框中点击后调用，或是自行在任意时中断战斗
 *    -- 恢复战前的状态
 *    -- 触发世界设定中的「战斗结束时事件」
 *    -- 恢复调用进入战斗的事件，使之后续能够正常执行
 * 
 * 
 * 
 * 
 * Created by 黑暗之神KDS on 2021-01-12 07:06:34.
 */
module CommandExecute {
    //------------------------------------------------------------------------------------------------------
    // 战斗相关指令
    //------------------------------------------------------------------------------------------------------
    // 记录玩家战斗前的状态
    var recordBeforeBattleState: {
        avatarID: number,
        moveAutoChangeAction: boolean,
        moveSpeed: number,
        through: boolean,
        selectEnabled: boolean,
        layerLevel: number,
        shadowVisible: boolean,
        moveToGridCenter: boolean,
        lastBgmURL: string,
        lastBGMPitch: number,
        lastBGMVolume: number,
        lastBgsURL: string,
        lastBGSPitch: number,
        lastBGSVolume: number,
        battleTriggerID: number,
        battleSceneID: number

    } = {} as any;

    if (!Config.BEHAVIOR_EDIT_MODE) {
        // 追加存档时额外储存战斗前玩家的状态
        SinglePlayerGame.regSaveCustomData("recordBeforeBattleState", Callback.New(() => {
            return recordBeforeBattleState;
        }, null));
        // 监听读档恢复数据，恢复储存的自定义数据-战斗前玩家的状态
        EventUtils.addEventListener(SinglePlayerGame, SinglePlayerGame.EVENT_ON_BEFORE_RECOVERY_DATA, Callback.New(() => {
            var saveRecordBeforeBattleState = SinglePlayerGame.getSaveCustomData("recordBeforeBattleState");
            if (saveRecordBeforeBattleState) recordBeforeBattleState = saveRecordBeforeBattleState;
        }, null));
    }
    /**
     * 开始进入战斗
     */
    export function customCommand_5001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5001): void {
        // 已在战斗的话则忽略该指令
        if (GameBattle.state != 0) {
            return;
        }
        // 记录主角的战斗隐藏状态，存档也需要追加记录
        var cursor = Game.player.sceneObject;
        // -- 变为光标前玩家的场景对象记录
        recordBeforeBattleState.avatarID = cursor.avatarID;
        recordBeforeBattleState.moveAutoChangeAction = cursor.moveAutoChangeAction;
        recordBeforeBattleState.through = cursor.through;
        recordBeforeBattleState.layerLevel = cursor.layerLevel;
        recordBeforeBattleState.shadowVisible = cursor.shadow.visible;
        recordBeforeBattleState.moveToGridCenter = WorldData.moveToGridCenter;
        recordBeforeBattleState.selectEnabled = cursor.selectEnabled;
        recordBeforeBattleState.moveSpeed = cursor.moveSpeed;
        // -- 记录当前的背景音乐和环境音效
        recordBeforeBattleState.lastBgmURL = GameAudio.lastBgmURL;
        recordBeforeBattleState.lastBGMPitch = GameAudio.lastBGMPitch;
        recordBeforeBattleState.lastBGMVolume = GameAudio.lastBGMVolume;
        recordBeforeBattleState.lastBgsURL = GameAudio.lastBgsURL;
        recordBeforeBattleState.lastBGSPitch = GameAudio.lastBGSPitch;
        recordBeforeBattleState.lastBGSVolume = GameAudio.lastBGSVolume;
        // -- 记录当前场景和事件触发器ID
        recordBeforeBattleState.battleTriggerID = trigger.id;
        recordBeforeBattleState.battleSceneID = Game.currentScene.id;
        // 如果是场景相关事件需要提前开启控制器
        if (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE) {
            Controller.start();
        }
        // 停止移动
        Game.player.sceneObject.stopMove();
        // 事件中断
        trigger.offset(1);
        trigger.pause = true;
        // 战斗初始化
        GameBattle.init(cp);
        // 设定由玩家设定的角色上场前的默认朝向
        GUI_BattleReady.ACTOR_DEFAULT_ORI = [8, 2, 4, 6][cp.defaultOri];
        // 执行进入战斗前事件处理
        GameCommand.startCommonCommand(14020, [], Callback.New(() => {
            // 主角变为光标
            Game.player.sceneObject.avatarID = 0;
            Game.player.sceneObject.moveAutoChangeAction = false;
            var ani = Game.player.sceneObject.playAnimation(WorldData.battleCursorAni, true, true);
            // ani.mouseEnabled = false;
            // ani.visible = false;
            Game.player.sceneObject.shadow.visible = false;
            Game.player.sceneObject.through = true;
            Game.player.sceneObject.layerLevel = 0;
            Game.player.sceneObject.selectEnabled = false;
            Game.player.sceneObject.moveSpeed = WorldData.cursorSpeedByPlayerControl;
            // 必须移动至格子中心点
            WorldData.moveToGridCenter = true;
            // 所有战斗者坐标校准位置（格子中心点）
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (GameBattleHelper.isBattler(so)) {
                    var gridCenter = GameUtils.getGridCenter(new Point(so.x, so.y));
                    so.setTo(gridCenter.x, gridCenter.y);
                }
            }
        }, this), trigger.trigger as ClientSceneObject, trigger.executor as ClientSceneObject);
    }
    /**
     * 结束战斗
     */
    export function customCommand_5002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5002): void {
        // 未在战斗中则忽略
        if (GameBattle.state == 0) return;
        // 胜利标识
        var isWin: boolean;
        // -- 默认：根据实际战斗胜败
        if (cp.battleOverMode == 0) {
            isWin = GameBattle.resultIsWin;
        }
        // -- 根据设定
        else {
            GameBattle.resultIsWin = isWin = (cp.battleOverMode == 1 ? true : false);
        }
        // 胜利开关修改
        if (GameBattle.setting.battleResultSwitch) Game.player.variable.setSwitch(GameBattle.setting.battleResultSwitch, isWin ? 1 : 0);
        // 停止战斗
        GameBattle.stop(() => {
            // 恢复战前的状态
            var playerSo: ProjectClientSceneObject = Game.player.sceneObject;
            playerSo.avatarID = recordBeforeBattleState.avatarID;
            playerSo.moveAutoChangeAction = recordBeforeBattleState.moveAutoChangeAction;
            playerSo.through = recordBeforeBattleState.through;
            playerSo.layerLevel = recordBeforeBattleState.layerLevel;
            playerSo.shadow.visible = recordBeforeBattleState.shadowVisible;
            playerSo.stopAnimation(WorldData.battleCursorAni);
            playerSo.selectEnabled = recordBeforeBattleState.selectEnabled;
            playerSo.moveSpeed = recordBeforeBattleState.moveSpeed;
            WorldData.moveToGridCenter = recordBeforeBattleState.moveToGridCenter;
            if (recordBeforeBattleState.lastBgmURL) GameAudio.playBGM(recordBeforeBattleState.lastBgmURL, recordBeforeBattleState.lastBGMVolume, 99999, true, 500, recordBeforeBattleState.lastBGMPitch)
            else GameAudio.stopBGM(true, 500);
            if (recordBeforeBattleState.lastBgsURL) GameAudio.playBGS(recordBeforeBattleState.lastBgsURL, recordBeforeBattleState.lastBGSVolume, 99999, true, 500, recordBeforeBattleState.lastBGSPitch)
            else GameAudio.stopBGS(true, 500);
            // 战斗结束时事件（使用Game.player.sceneObject触发以便保证不会由于战斗者被销毁掉了而失效）
            GameCommand.startCommonCommand(14023, [], Callback.New(() => {
                // -- 如果仍然是战斗前的场景的话则恢复事件执行
                if (recordBeforeBattleState.battleSceneID == Game.currentScene.id) {
                    GameCommand.inputMessageAndContinueExecute([], true, 0, recordBeforeBattleState.battleTriggerID);
                }
            }, this), Game.player.sceneObject, Game.player.sceneObject)
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗参数设定
     */
    export function customCommand_5003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5003): void {
        var bool = cp.value == 0 ? true : false;
        switch (cp.paramType) {
            case 0:
                WorldData.deadPlayerActorLeaveParty = bool;
                return;
            case 1:
                WorldData.standbyStepChangeOriEnabled = bool;
                return;
            case 2:
                WorldData.readyStepChangeOriEnabled = bool;
                return;
        }
    }
    /**
     * 增减战斗者的生命
     */
    export function customCommand_5004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5004): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.battlerSetting.battleActor;
        actor.hp += cp.symbol == 0 ? value : -value;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
    }
    /**
     * 增减战斗者的魔法
     */
    export function customCommand_5005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5005): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.battlerSetting.battleActor;
        actor.sp += cp.symbol == 0 ? value : -value;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
    }
    /**
     * 增减战斗者的状态
     */
    export function customCommand_5006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5006): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle) return;
        var statusID = MathUtils.int(cp.statusUseVar ? Game.player.variable.getVariable(cp.statusIDVarID) : cp.statusID);
        var actor = soc.battlerSetting.battleActor;
        if (cp.symbol == 0) {
            GameBattlerHandler.addStatus(soc, statusID, soc, cp.force);
        }
        else if (cp.symbol == 1) {
            GameBattlerHandler.removeStatus(soc, statusID);
        }
        else if (cp.symbol == 2) {
            GameBattlerHandler.removeAllStatus(soc);
        }
        var level = GameBattleHelper.getLevelByActor(actor);
        Game.refreshActorAttribute(actor, level);
    }
    /**
     * 显示伤害
     */
    export function customCommand_5007(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5007): void {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc) return;
        var actor = soc.battlerSetting.battleActor;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        if (cp.type <= 2) value = -value;
        GameBattleAction.showDamage(soc, cp.type, value, cp.isCrit);
    }
    /**
     * 生成战斗者
     */
    export function customCommand_5008(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_5008): void {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        var actorData: Module_Actor = GameData.getModuleData(1, actorID);
        if (!actorData) return;
        if (!GameBattleHelper.isInBattle) return;
        // 如果与触发者阵营相同则判断触发者是否是战斗者
        if (cp.camp == 2 && !GameBattleHelper.isBattler(trigger.trigger as ProjectClientSceneObject)) return;
        // 如果与执行者阵营相同则判断执行者是否是战斗者
        if (cp.camp == 3 && !GameBattleHelper.isBattler(trigger.executor as ProjectClientSceneObject)) return;
        if (cp.gridUseVar) {
            var gridX: number = MathUtils.int(Game.player.variable.getVariable(cp.xVarID));
            var gridY: number = MathUtils.int(Game.player.variable.getVariable(cp.yVarID));
        }
        else {
            gridX = MathUtils.int(cp.x);
            gridY = MathUtils.int(cp.y);
        }
        var posGridP = new Point(gridX, gridY);
        var posP = GameUtils.getGridCenterByGrid(posGridP);
        var persetSceneObject = {
            x: posP.x,
            y: posP.y,
            avatarID: actorData.avatar,
            avatarOri: GUI_BattleReady.ACTOR_DEFAULT_ORI
        }
        var soc = Game.currentScene.addNewSceneObject(1, persetSceneObject) as ProjectClientSceneObject;
        soc.moveSpeed = actorData.moveSpeed;
        // 战斗者设定
        soc.battlerSetting.isBattler = true;
        soc.battlerSetting.battleActor = GameData.newModuleData(1, actorID);
        soc.battlerSetting.usePlayerActors = false;
        soc.battlerSetting.mustInBattle = false;
        soc.battlerSetting.playerCantCtrl = !cp.playerCtrlEnabled;
        switch (cp.camp) {
            case 0:
                soc.battlerSetting.battleCamp = 0;
                break;
            case 1:
                soc.battlerSetting.battleCamp = 1;
                break;
            case 2:
                soc.battlerSetting.battleCamp = (trigger.trigger as ProjectClientSceneObject).battlerSetting.battleCamp;
                break;
            case 3:
                soc.battlerSetting.battleCamp = (trigger.executor as ProjectClientSceneObject).battlerSetting.battleCamp;
                break;
        }
        var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
        lv = Math.max(1, Math.min(lv, soc.battlerSetting.battleActor.MaxLv));
        soc.battlerSetting.level = lv;
        // 刷新阵营
        GameBattlerHandler.refreshCampAndNewBattles();
        // 储存至数值变量
        if (cp.saveNewSoIndex) {
            Game.player.variable.setVariable(cp.newSoIndexVarID, soc.index);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 增减装备
     */
    export function customCommand_6001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_6001): void {
        var equipID = p.useVar1 ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        // 找不到预设装备的话则忽略
        if (!GameData.getModuleData(4, equipID)) return;
        // 浮动装备设定
        if (p.attributeRand && p.equipRandSetting.length > 0 && p.symbol == 0) {
            var equipAttributeNames = ["maxHP", "maxSP", "atk", "def", "mag", "magDef", "agi", "moveGrid", "hit", "crit", "magCrit"];
            // 计算总概率和
            var probabilityCount = 0;
            for (var i = 0; i < p.equipRandSetting.length; i++) {
                probabilityCount += p.equipRandSetting[i].probability;
            }
            if (probabilityCount < 100) probabilityCount = 100;
            // 生成装备
            for (var n = 0; n < num; n++) {
                var newEquip: Module_Equip = GameData.newModuleData(4, equipID, true);
                for (var i = 0; i < p.equipRandSetting.length; i++) {
                    var thisSetting = p.equipRandSetting[i];
                    var thisPer = thisSetting.probability / probabilityCount;
                    if (Math.random() < thisPer) {
                        // 计算属性变化率
                        for (var s = 0; s < equipAttributeNames.length; s++) {
                            var per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                            var newValue = newEquip[equipAttributeNames[s]] * per;
                            newEquip[equipAttributeNames[s]] = Math.ceil(newValue);
                        }
                        break;
                    }
                }
                ProjectPlayer.addEquipByInstance(newEquip);
            }
        }
        else {
            ProjectPlayer.changeItemNumber(equipID, p.symbol == 0 ? num : -num, true);
        }
    }
    /**
     * 替换队伍角色
     */
    export function customCommand_6002(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6002): void {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        if (!GameData.getModuleData(1, actorID)) return;
        if (cp.type == 0) {
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            ProjectPlayer.addPlayerActorByActorID(actorID, lv);
        }
        else {
            ProjectPlayer.removePlayerActorByActorID(actorID);
        }
    }
    /**
     * 替换角色的技能
     */
    export function customCommand_6003(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6003): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取技能编号
        var skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        // 学习技能
        if (cp.symbol == 0) {
            Game.actorLearnSkill(actor, skillID);
        }
        // 忘记技能
        else if (cp.symbol == 1) {
            Game.actorForgetSkill(actor, skillID);
        }
        // 忘记全部技能
        else if (cp.symbol == 2) {
            Game.actorForgetAllSkills(actor);
        }
    }
    /**
     * 替换角色的装备
     */
    export function customCommand_6004(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6004): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        // 获取装备编号
        var equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
        // 判断是否是玩家的角色
        var inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        // 记录卸下的装备
        var takeOffEquip: Module_Equip;
        // 穿戴
        if (cp.symbol == 0) {
            if (inPartyActorDS && cp.fromPlayerPackage) {
                // -- 如果该装备存在于玩家的背包的话则穿戴
                var fromPackageEquip = ProjectPlayer.getItemDS(equipID, true);
                if (fromPackageEquip) ProjectPlayer.wearPlayerActorEquip(inPartyActorIndex, fromPackageEquip.equip);
            }
            else {
                // 新建一件装备进行穿戴
                if (GameData.getModuleData(4, equipID)) {
                    var newEquip = GameData.newModuleData(4, equipID);
                    Game.wearActorEquip(actorDS.actor, newEquip);
                }
            }
        }
        // 卸下/移除
        else if (cp.symbol == 1 || cp.symbol == 3) {
            // 使用部件卸下
            if (cp.usePartID) {
                if (inPartyActorDS && cp.symbol == 1) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, cp.partID);
                else takeOffEquip = Game.takeOffActorEquipByPartID(actor, cp.partID);
            }
            // 否则查找该件装备是否已经穿戴上了
            else {
                var thisEquip = Game.getActorEquipByEquipID(actor, equipID);
                if (thisEquip) {
                    var thisEquipPartID = thisEquip.partID;
                    if (inPartyActorDS && cp.symbol == 1) takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, thisEquipPartID);
                    else takeOffEquip = Game.takeOffActorEquipByPartID(actor, thisEquipPartID);
                }
            }
        }
        // 卸下/移除全部装备
        else if (cp.symbol == 2 || cp.symbol == 4) {
            if (inPartyActorDS && cp.symbol == 2) ProjectPlayer.takeOffPlayerActorAllEquips(inPartyActorIndex);
            else Game.takeOffActorAllEquips(actor);
        }
        // 刷新属性
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor));
        // 记录卸下的装备编号
        if (cp.isTakeOffEquipSaveToVar) {
            var takeOffEquipID = takeOffEquip ? takeOffEquip.id : -1;
            Game.player.variable.setVariable(cp.takeOffEquipSaveToVar, takeOffEquipID);
        }
    }
    /**
     * 永久增加属性
     */
    export function customCommand_6005(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6005): void {
        // 获取角色
        var actor: Module_Actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
                cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
                cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS) return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor) return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        // 判断是否是玩家的角色
        var inPartyActorDS: DataStructure_inPartyActor = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        // 增加永久属性
        switch (cp.attributeType) {
            case 0:
                actor.increaseMaxHP += value;
                break;
            case 1:
                actor.increaseMaxSP += value;
                break;
            case 2:
                actor.increasePow += value;
                break;
            case 3:
                actor.increaseMag += value;
                break;
            case 4:
                actor.increaseEnd += value;
                break;
            case 5:
                actor.increaseAgi += value;
                break;
            case 6:
                if (inPartyActorIndex != -1) {
                    ProjectPlayer.increaseExpByIndex(inPartyActorIndex, value);
                }
                break;
            case 7:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv += value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
            case 8:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv -= value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
        }
        // 刷新属性
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor));
    }
    /**
     * 更改角色的名称
     */
    var changeActorNameInfo: { [actorID: number]: string } = {};
    export function customCommand_6006(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], cp: CustomCommandParams_6006): void {
        // 获取角色
        var actor: Module_Actor;
        var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID,
            cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID,
            null, null, null, null, trigger);
        if (!actorDS) return;
        actor = actorDS.actor;
        if (!actor) return;
        // 更改该角色的名称
        let newName = cp.valueUseVar ? Game.player.variable.getString(cp.valueVarID) : cp.value;
        for (let i = 0; i < Game.player.data.party.length; i++) {
            let inPartyActor = Game.player.data.party[i];
            let actorID = inPartyActor.actor.id;
            if (actorID == actor.id) {
                inPartyActor.actor.name = newName;
            }
        }
        // 记录更改项以便恢复存档时重新需要设置该值
        changeActorNameInfo[actor.id] = newName;
    }
    /**
     * 使用SinglePlayerGame需要在非行为编辑器模式下
     */
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("___changeActorName", Callback.New(() => {
            return changeActorNameInfo;
        }, null));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(() => {
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(() => {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    let restoryChangeActorNameInfo = SinglePlayerGame.getSaveCustomData("___changeActorName");
                    if (restoryChangeActorNameInfo) {
                        changeActorNameInfo = restoryChangeActorNameInfo;
                        for (let i = 0; i < Game.player.data.party.length; i++) {
                            let actorID = Game.player.data.party[i].actor.id;
                            if (changeActorNameInfo[actorID]) {
                                Game.player.data.party[i].actor.name = changeActorNameInfo[actorID];
                            }
                        }
                    }
                }
            }, null));
        }, null), true);
    }
}