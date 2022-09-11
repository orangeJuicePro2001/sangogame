/**
 * 战斗者处理器
 * 
 * //------------------------------------------------------------------------------------------------------
 * // 关于仇恨
 * //------------------------------------------------------------------------------------------------------
 * -- 当该角色是通过仇恨方式攻击的话，按照仇恨值从高到底列表中选取敌对目标
 * -- 清理仇恨的情况包含（该战斗者的仇恨列表置空以及其他战斗者的仇恨列表清理对该战斗者的仇恨）：
 *    -- 该战斗者死亡
 *    -- 该战斗者中途改变阵营
 *    -- 该战斗者状态页发生了变更
 *    -- 销毁战斗者时
 *    -- 主动清理仇恨
 * 
 * //------------------------------------------------------------------------------------------------------
 * // 战斗者和角色初始化：当新的战斗者出现时
 * // GameBattlerHandler.onBattlerAppear
 * //------------------------------------------------------------------------------------------------------
 *  -- 场景预先摆放的战斗者
 *  -- 玩家操作摆放的战斗者
 *  -- 中途生成的战斗者（如通过事件）
 * 
 * 【场景对象 SceneObject】 初始化
 * -- isDead = false
 * -- operationComplete = false
 * -- moved = false
 * -- actioned = false
 * -- inPlayerActorIndex 根据是否是玩家的角色而定
 * -- isInited 是否已初始化过的标识
 * -- isExecuteAppearEvent 是否执行过出现事件标识
 * -- hateList 清空
 * -- 如果是玩家的角色的话则角色数据指向玩家的角色
 * -- 片段事件： - WorldData.battlerInitEvent 战斗者出现事件
 * 
 * 【场景对象对应的战斗角色 Actor】 初始化
 * -- 清空全部状态
 * -- 刷新属性
 * -- 生命值和魔法值回满
 * 
 * //------------------------------------------------------------------------------------------------------
 * // 关于阵营变更
 * //------------------------------------------------------------------------------------------------------
 * -- hateList 清空
 * -- 片段事件：- battlerInitEvent 战斗者出现事件
 * 
 * Created by 黑暗之神KDS on 2021-02-07 21:21:56.
 */
class GameBattlerHandler {
    // 战斗者死亡事件
    static EVENT_BATTLER_DEAD: string = "GameBattlerHandlerEVENT_BATTLER_DEAD";
    /**
     * 记录击杀奖励
     */
    static hitReward: {
        gold: number,
        exp: number,
        items: { itemID: number, num: number }[],
        equips: Module_Equip[],
    } = { gold: 0, exp: 0, items: [], equips: [] };
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init(): void {

    }
    /**
     * 开始
     */
    static start() {
        // 监听场景对象的状态页改变时处理
        EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
        // 刷新阵营和参战者
        this.refreshCampAndNewBattles();
    }
    /**
     * 停止
     */
    static stop() {
        // 取消战斗者的待机显示效果
        this.closeAllBattlersStandbyEffect();
        // 取消监听场景对象的状态页改变时处理
        EventUtils.removeEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    }
    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化场景预设的出场战斗者
     */
    static initScenePresetBattler(): void {
        for (var i in Game.currentScene.sceneObjects) {
            var so = Game.currentScene.sceneObjects[i];
            this.onBattlerAppear(so);
        }
    }
    /**
     * 初始化战斗者，如果对应的角色不存在则会销毁
     * @param battle 战斗者
     * @param forceBin
     */
    static onBattlerAppear(battler: ProjectClientSceneObject): void {
        // 忽略非战斗者
        if (!GameBattleHelper.isBattler(battler)) return;
        // 已初始化完成的话则不再继续
        if (battler.battlerSetting.isInited) return;
        battler.battlerSetting.isInited = true;
        // 获取战斗者的角色编号
        var battlerActorID = battler.battlerSetting.battleActor.id;
        // 如果不存在该战斗角色预设的话则移除掉
        if (!GameData.getModuleData(1, battlerActorID)) {
            battler.dispose();
            return;
        }
        // 如果是玩家拥有的角色的话则指向玩家的角色数据
        this.ifPlayerActorBindingPlayerActorData(battler);
        if (battler.isDisposed) return;
        // 初始化战斗者和角色属性
        var battlerSetting = battler.battlerSetting;
        var actor = battler.battlerSetting.battleActor;
        var level = GameBattleHelper.getLevelByActor(actor);
        // -- 初始化战斗者属性
        battlerSetting.isDead = false;
        battlerSetting.operationComplete = false;
        battlerSetting.moved = false;
        battlerSetting.actioned = false;
        battler.moveSpeed = actor.moveSpeed;
        this.clearHateList(battler);
        // -- 附加自动状态
        GameBattlerHandler.removeAllStatus(battler);
        Game.refreshActorAttribute(actor, level); // 刷新一次属性，以便记录自动状态以便附加这些状态
        if (actor.selfStatus.length != 0) {
            for (var i = 0; i < actor.selfStatus.length; i++) {
                GameBattlerHandler.addStatus(battler, actor.selfStatus[i], battler);
            }
            Game.refreshActorAttribute(actor, level);
        }
        // -- 恢复满状态
        actor.hp = actor.MaxHP;
        actor.sp = actor.MaxSP;
        // -- 全技能冷却
        for (var i = 0; i < actor.skills.length; i++) {
            var skill = actor.skills[i];
            skill.currentCD = 0;
        }
        // 执行初始化片段事件
        this.callBattlerInitFragmentEvent(battler);
        // 监听场景对象销毁事件
        battler.off(GameSprite.ON_DISPOSE, this, this.onBattlerRemoved);
        battler.once(GameSprite.ON_DISPOSE, this, this.onBattlerRemoved, [battler]);
    }
    /**
     * 当战斗者被移除时：不再是战斗者的情况
     * @param battler 战斗者
     */
    static onBattlerRemoved(battler: ProjectClientSceneObject): void {
        // -- 如果是角色的话还要清理掉记录关系
        GameBattle.usedPlayerActorRecord.remove(battler.battlerSetting.battleActor);
        // -- 清理来源是该状态者的状态
        GameBattlerHandler.removeAllBattlerStatusByFromBattler(battler);
        // -- 清理战斗者的仇恨
        this.clearHateList(battler, true);
        // -- 从战斗者阵营列表中移除
        ArrayUtils.remove(GameBattle.playerBattlers, battler);
        ArrayUtils.remove(GameBattle.enemyBattlers, battler);
        // -- 执行移除事件
        GameCommand.startCommonCommand(14043, [], null, battler, battler);
    }
    /**
     * 调用战斗者初始化片段事件
     * @param battler 战斗者
     */
    static callBattlerInitFragmentEvent(battler: ProjectClientSceneObject): void {
        if (!battler.battlerSetting.isExecuteAppearEvent) {
            battler.battlerSetting.isExecuteAppearEvent = true;
            GameCommand.startCommonCommand(14039, [], null, battler, battler);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 取消战斗者们的待机效果
     */
    static closeAllBattlersStandbyEffect() {
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            GameBattlerHandler.clearBattlerStandbyEffect(battler);
        }
    }
    /**
     * 设置战斗角色待机效果
     * @param battler 战斗者
     */
    static setBattlerStandby(battler: ProjectClientSceneObject): void {
        // 当前回合行动完毕标识
        battler.battlerSetting.operationComplete = true;
        // 执行片段事件：战斗者开始待机时事件
        GameCommand.startCommonCommand(14040, [], null, battler, battler);
    }
    /**
     * 战斗角色待机效果
     * @param so 
     */
    static clearBattlerStandbyEffect(battler: ProjectClientSceneObject): void {
        // 如果当前回合行动完毕的话
        if (battler.battlerSetting.operationComplete) {
            // 执行片段事件：战斗者结束待机时事件
            GameCommand.startCommonCommand(14041, [], null, battler, battler);
        }
    }
    /**
     * 让战斗者死亡
     * @param battler 
     */
    static dead(battler: ProjectClientSceneObject): void {
        if (battler.battlerSetting.isDead) return;
        // -- 死亡标记
        battler.battlerSetting.isDead = true;
        // -- 置空
        battler.battlerSetting.battleActor.hp = 0;
        battler.battlerSetting.battleActor.sp = 0;
        GameBattlerHandler.removeAllStatus(battler);
        // -- 清理仇恨
        this.clearHateList(battler, true);
        // -- 派发战斗者死亡事件
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, [battler]);
        // -- 记录击杀奖励：金币、经验、道具、装备
        var battleActor = battler.battlerSetting.battleActor;
        if (battler.battlerSetting.battleCamp == 1 && battleActor.dropEnabled) {
            this.hitReward.gold += battleActor.dropGold;
            this.hitReward.exp += battleActor.dropExp;
            for (var i = 0; i < battleActor.dropItems.length; i++) {
                var dropItemDS = battleActor.dropItems[i];
                if (MathUtils.rand(100) < dropItemDS.dropProbability) {
                    this.hitReward.items.push({ itemID: dropItemDS.item, num: dropItemDS.num });
                }
            }
            for (var i = 0; i < battleActor.dropEquips.length; i++) {
                var dropEquipDS = battleActor.dropEquips[i];
                if (MathUtils.rand(100) < dropEquipDS.dropProbability) {
                    var newEquip = ObjectUtils.depthClone(dropEquipDS.equip);
                    this.hitReward.equips.push(newEquip);
                }
            }
        }
    }
    /**
     * 释放战斗者动作
     * @param battler 战斗者
     * @param actionID 动作
     * @param releaseFrame 释放的帧数 
     * @param whenCompleteActionID 当释放完毕后恢复的动作编号 
     * @param onRelease 当释放完成时回调
     */
    static releaseAction(battler: ProjectClientSceneObject, actionID: number, releaseFrame: number, whenCompleteActionID: number, onRelease: Function): void {
        // 存在该动作的话：播放该动作后进入下一个阶段
        var avatar = battler.avatar;
        var hasAtkAction = avatar.hasActionID(actionID);
        if (hasAtkAction) {
            var isReleaseAction = false;
            var onRender = () => {
                // 超过击中帧数时则进入「击中阶段」
                if (avatar.currentFrame >= releaseFrame) {
                    //@ts-ignore
                    avatar.off(Avatar.RENDER, avatar, arguments.callee);
                    onRelease();
                    isReleaseAction = true;
                }
            }
            // 监听当动作播放完毕时，播放完毕后的动作
            avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                if (battler.isDisposed) return;
                avatar.off(Avatar.RENDER, avatar, onRender);
                // 如果其动作已经被更改了则忽略
                if (avatar.actionID != actionID) return;
                // 如果发生了一些变更
                if (!GameBattleHelper.isBattler(battler) || battler.battlerSetting.isDead) return;
                // 完成后变更的动作
                avatar.actionID = whenCompleteActionID;
                // 如果未能释放则直接释放
                if (!isReleaseAction) onRelease();
            });
            // 监听满足攻击帧数时
            avatar.on(Avatar.RENDER, avatar, onRender);
            // 切换至攻击动作，从第1帧开始播放
            avatar.currentFrame = 1;
            avatar.actionID = actionID;
        }
        // 没有攻击动作时直接进入下一个阶段
        else {
            onRelease();
        }
    }
    /**
     * 刷新参战者所在的阵营以及检查新战斗者加入
     */
    static refreshCampAndNewBattles() {
        // 记录原有阵营
        var oldPlayerBattlers = GameBattle.playerBattlers.concat();
        var oldEnemyBattlers = GameBattle.enemyBattlers.concat();
        // 战斗成员获取（中途也可能加入新的战斗者）
        GameBattle.playerBattlers.length = 0;
        GameBattle.enemyBattlers.length = 0;
        for (var i in Game.currentScene.sceneObjects) {
            var so = Game.currentScene.sceneObjects[i];
            // 我方阵营
            if (GameBattleHelper.isPlayerCamp(so)) {
                this.onBattlerAppear(so);
                GameBattle.playerBattlers.push(so);
            }
            // 敌方阵营
            else if (GameBattleHelper.isEnemyCamp(so)) {
                this.onBattlerAppear(so);
                GameBattle.enemyBattlers.push(so);
            }
        }
        // 对比，如果已改变阵营则调用改变阵营函数（已经销毁或已不是战斗者的情况则忽略）
        for (var s = 0; s < oldPlayerBattlers.length; s++) {
            var oldPlayerBattler = oldPlayerBattlers[s];
            if (oldPlayerBattler.isDisposed || !GameBattleHelper.isBattler(oldPlayerBattler)) continue;
            if (oldPlayerBattler.battlerSetting.battleCamp == 1) {
                this.onChangeSceneObjectCamp(oldPlayerBattler);
            }
        }
        for (var s = 0; s < oldEnemyBattlers.length; s++) {
            var oldEnemyBattler = oldEnemyBattlers[s];
            if (oldEnemyBattler.isDisposed || !GameBattleHelper.isBattler(oldPlayerBattler)) continue;
            if (oldEnemyBattler.battlerSetting.battleCamp == 0) {
                this.onChangeSceneObjectCamp(oldEnemyBattler);
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 结算奖励
    //------------------------------------------------------------------------------------------------------
    static calcHitReward(winner: ProjectClientSceneObject, onFin: Callback): void {
        if (!winner || !GameBattleHelper.isBattler(winner) || winner.battlerSetting.isDead) {
            onFin.run();
            return;
        }
        var winnerActor = winner.battlerSetting.battleActor;
        // 非玩家拥有的角色不结算
        var winnerInPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(winnerActor);
        if (winnerInPlayerActorIndex < 0) {
            // 重置记录的击杀奖励
            this.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
            onFin.run();
            return;
        }
        // 是否获得了奖励
        var isGetReward = this.hitReward.exp || this.hitReward.gold || this.hitReward.items.length != 0 || this.hitReward.equips.length != 0;
        if (!isGetReward) {
            onFin.run();
            return;
        }
        // -- 获得金币
        if (this.hitReward.gold) {
            ProjectPlayer.increaseGold(this.hitReward.gold);
        }
        // -- 获得经验值
        var increaseExpRes = ProjectPlayer.increaseExpByIndex(winnerInPlayerActorIndex, this.hitReward.exp);
        GUI_HitReward.rewardBattler = winner;
        GUI_HitReward.rewardActor = winnerActor;
        GUI_HitReward.increaseExpRes = increaseExpRes;
        if (increaseExpRes && increaseExpRes.isLevelUp) {
            Game.refreshActorAttribute(winnerActor, GameBattleHelper.getLevelByActor(winnerActor));
        }
        // -- 获得道具
        for (var i = 0; i < this.hitReward.items.length; i++) {
            var itemInfo = this.hitReward.items[i];
            ProjectPlayer.changeItemNumber(itemInfo.itemID, itemInfo.num, false);
        }
        // -- 获得装备
        for (var i = 0; i < this.hitReward.equips.length; i++) {
            var newEquip = this.hitReward.equips[i];
            ProjectPlayer.addEquipByInstance(newEquip);
        }
        // -- 执行事件
        GameCommand.startCommonCommand(14038, [], Callback.New(() => {
            // 重置记录的击杀奖励
            this.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
            // 完成时回调
            onFin.run();
        }, this), winner, winner);
    }
    //------------------------------------------------------------------------------------------------------
    // 仇恨系统
    //------------------------------------------------------------------------------------------------------
    /**
     * 清理指定战斗者的仇恨列表
     * @param so 
     */
    static clearHateList(battler: ProjectClientSceneObject, clearAll: boolean = false): void {
        battler.battlerSetting.hateList.length = 0;
        if (clearAll) this.removeHateTargetFromAllList(battler);
    }

    /**
     * 从战斗者的仇恨列表中移除仇恨目标
     * @param so 仇恨列表的拥有者
     * @param hateTarget 仇恨目标
     */
    static removeHateTarget(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject): void {
        var hateIndex: number = ArrayUtils.matchAttributes(battler.battlerSetting.hateList, { targetIndex: hateTarget.index }, true, "==", true)[0];
        if (hateIndex == null) return;
        battler.battlerSetting.hateList.splice(hateIndex, 1);
    }
    /**
     * 从所有仇恨列表中清理指定对象
     * @param hateTarget 
     */
    static removeHateTargetFromAllList(hateTarget: ProjectClientSceneObject): void {
        var sceneObjects = Game.currentScene.sceneObjects;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so = sceneObjects[i];
            if (!GameBattleHelper.isBattler(so)) continue;
            this.removeHateTarget(so, hateTarget);
        }
    }

    /**
     * 增加仇恨
     * @param so 仇恨列表的拥有者
     * @param hateTarget 仇恨目标
     * @param hateValue 仇恨数值
     * @param ignoreNotInHateList [可选] 默认值=false 如果当前不在仇恨列表中则不增加仇恨
     */
    static increaseHate(battler: ProjectClientSceneObject, hateTarget: ProjectClientSceneObject, hateValue: number, ignoreNotInHateList: boolean = false): void {
        // 非敌对势力不允许添加到仇恨列表
        if (!GameBattleHelper.isHostileRelationship(battler, hateTarget)) return;
        // 已死亡无法增加仇恨
        if (battler.battlerSetting.isDead || hateTarget.battlerSetting.isDead) return;
        // 添加仇恨：不在列表中的话就新建一个
        var hateDS: DataStructure_battlerHate = ArrayUtils.matchAttributes(battler.battlerSetting.hateList, { targetIndex: hateTarget.index }, true)[0];
        if (hateDS) {
            hateDS.hateValue += hateValue;
        }
        else {
            if (ignoreNotInHateList) return;
            hateDS = new DataStructure_battlerHate;
            hateDS.targetIndex = hateTarget.index;
            hateDS.hateValue = hateValue;
            battler.battlerSetting.hateList.push(hateDS);
        }
        // 刷新仇恨排序
        this.hateListOrderByDESC(battler);
    }
    /**
     * 增加仇恨：根据技能预设
     * @param fromBattler 来源战斗者
     * @param targetBattler 目标战斗者
     * @param skill 技能
     * @param damageValue [可选] 默认值=0 伤害或治疗数值
     */
    static increaseHateByHit(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, hitFrom: Module_Skill | Module_Status, hitValue: number = 0): void {
        // 根据类型决定数值符号
        hitValue = hitFrom.damageType <= 2 ? -hitValue : hitValue;
        // 伤害：直接对目标增加仇恨值
        var hateValue = hitFrom.fixedHeteValue + Math.abs(hitValue) * hitFrom.damageHatePer / 100;
        if (hitValue < 0) {
            this.increaseHate(targetBattler, fromBattler, hateValue);
        }
        // 恢复：如果是友方的话则会增加敌方的仇恨（需要敌方已存在仇恨列表）
        else {
            if (GameBattleHelper.isFriendlyRelationship(fromBattler, targetBattler)) {
                var enemyCampBattlers = fromBattler.battlerSetting.battleCamp == 0 ? GameBattle.enemyBattlers : GameBattle.playerBattlers;
                for (var i = 0; i < enemyCampBattlers.length; i++) {
                    this.increaseHate(enemyCampBattlers[i], fromBattler, hateValue, true);
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 添加目标状态
     * @param targetBattler 目标战斗者
     * @param statusID 状态
     * @return [boolean] 
     */
    static addStatus(targetBattler: ProjectClientSceneObject, statusID: number, fromBattler: ProjectClientSceneObject = null, force: boolean = false): boolean {
        // 获取系统预设的该状态，如果不存在则无法添加
        var systemStatus: Module_Status = GameData.getModuleData(6, statusID);
        if (!systemStatus) return false;
        // 计算命中率
        if (!force && MathUtils.rand(100) >= systemStatus.statusHit) {
            return false;
        }
        if (fromBattler == null) fromBattler = targetBattler;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        // -- 如果目标免疫该状态的话则忽略
        var targetIsImmuneThisStatus = targetBattlerActor.selfImmuneStatus.indexOf(statusID) != -1;
        if (!force && targetIsImmuneThisStatus) return false;;
        var thisStatus: Module_Status = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true)[0];
        if (thisStatus) {
            thisStatus.currentLayer += 1;
            if (thisStatus.currentLayer > thisStatus.maxlayer) thisStatus.currentLayer = thisStatus.maxlayer;
        }
        else {
            thisStatus = GameData.newModuleData(6, statusID);
            thisStatus.fromBattlerID = fromBattler.index;
            targetBattlerActor.status.push(thisStatus);
        }
        // -- 自动动画
        if (thisStatus.animation) targetBattler.playAnimation(thisStatus.animation, true, true);
        // -- 刷新状态的持续回合
        thisStatus.currentDuration = thisStatus.totalDuration;
        // -- 执行状态附加的事件
        if (systemStatus.whenAddEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenAddEvent, targetBattler, fromBattler);
        return true;
    }
    /**
     * 移除目标状态
     */
    static removeStatus(targetBattler: ProjectClientSceneObject, statusID: number): boolean {
        // 获取系统预设的该状态，如果不存在则无法添加
        var systemStatus: Module_Status = GameData.getModuleData(6, statusID);
        if (!systemStatus) return false;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        var thisStatusIdx: number = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true, "==", true)[0];
        if (thisStatusIdx != null) {
            targetBattlerActor.status.splice(thisStatusIdx, 1);
            if (systemStatus.whenRemoveEvent) CommandPage.startTriggerFragmentEvent(systemStatus.whenRemoveEvent, targetBattler, targetBattler);
            // 解除动画
            if (systemStatus.animation) {
                // 如果该动画在其他状态下不存在则直接清除
                if (ArrayUtils.matchAttributes(targetBattlerActor.status, { animation: systemStatus.animation }, true, "==", true).length == 0) {
                    targetBattler.stopAnimation(systemStatus.animation);
                }
            }
            return true;
        }
        return false;
    }
    /**
     * 解除全部状态
     */
    static removeAllStatus(battler: ProjectClientSceneObject): void {
        // 动画效果解除
        var statusArr = battler.battlerSetting.battleActor.status.concat();
        for (var i = 0; i < statusArr.length; i++) {
            var status = statusArr[i];
            this.removeStatus(battler, status.id);
        }
        // 清理状态数据
        battler.battlerSetting.battleActor.status.length = 0;
    }
    /**
     * 解除所有战斗者中来源是指定某个战斗者的状态
     * @param fromBattler 来源战斗者
     */
    static removeAllBattlerStatusByFromBattler(fromBattler: ProjectClientSceneObject): void {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                var statusArr = so.battlerSetting.battleActor.status;
                for (var s = 0; s < statusArr.length; s++) {
                    var status = statusArr[s];
                    if (status.fromBattlerID == fromBattler.index) {
                        if (this.removeStatus(so, status.id)) {
                            s--;
                        }
                    }
                }
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    //  获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取战斗者的攻击范围数值参考
     * @param battler 战斗者
     * @return [number] 
     */
    static getBattlerAtkRangeReference(battler: ProjectClientSceneObject): number {
        let actor = battler.battlerSetting.battleActor;
        // 技能代替攻击
        if (actor.atkMode == 1 && actor.atkSkill) {
            if (actor.atkSkill.effectRangeType == 0) {
                return actor.atkSkill.effectRange1;
            }
            else if (actor.atkSkill.effectRangeType == 1) {
                return actor.atkSkill.effectRange2B;
            }
            else {
                return 1;
            }
        }
        // 普通攻击
        else {
            return 1;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 如果是玩家的战斗者角色则绑定玩家的角色
     * @param battler 指定的战斗者
     * @return 是否绑定成功
     */
    private static ifPlayerActorBindingPlayerActorData(battler: ProjectClientSceneObject): boolean {
        // 如果战斗者使用玩家的角色数据
        if (battler.battlerSetting.battleCamp == 0 && battler.battlerSetting.usePlayerActors) {
            // 如果已经绑定则忽略
            var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(battler.battlerSetting.battleActor);
            if (inPlayerActorIndex != -1 && GameBattle.usedPlayerActorRecord.get(battler.battlerSetting.battleActor) == battler) return true;
            // 是否绑定玩家角色
            var isBindingPlayerActor = false;
            // -- 遍历玩家队伍的角色
            for (var s = 0; s < Game.player.data.party.length; s++) {
                // -- 获取该玩家角色
                var playerActor = Game.player.data.party[s].actor;
                // -- 查询该角色已经被其他场景对象占用的话则忽略
                if (GameBattle.usedPlayerActorRecord.get(playerActor)) continue;
                // -- 如果角色编号一致的话
                if (playerActor.id == battler.battlerSetting.battleActor.id) {
                    // -- 记录
                    GameBattle.usedPlayerActorRecord.set(playerActor, battler);
                    battler.battlerSetting.battleActor = playerActor;
                    isBindingPlayerActor = true;
                    return true;
                }
            }
            // 找不到匹配的玩家角色时，该战斗者无需存在
            battler.dispose();
        }
        return false;
    }
    /**
     * 当场景对象的状态页更改前
     * @param so 
     */
    private static onChangeSceneObjectStatus(so: ProjectClientSceneObject): void {
        // 如果是战斗者的话则调用移除
        if (GameBattleHelper.isBattler(so)) {
            this.onBattlerRemoved(so);
        }
    }
    /**
     * 当更改阵营时
     * @param soe 
     */
    private static onChangeSceneObjectCamp(soe: ProjectClientSceneObject) {
        // -- 清理仇恨
        this.clearHateList(soe, true);
        // -- 执行战斗者出现事件
        GameCommand.startCommonCommand(14039, [], null, soe, soe);
    }
    /**
     * 仇恨排序-按照仇恨值从大到小降序
     * @param battler 仇恨列表的拥有者
     */
    private static hateListOrderByDESC(battler: ProjectClientSceneObject) {
        battler.battlerSetting.hateList.sort((a: DataStructure_battlerHate, b: DataStructure_battlerHate): number => {
            return a.hateValue < b.hateValue ? 1 : -1;
        });
    }
}