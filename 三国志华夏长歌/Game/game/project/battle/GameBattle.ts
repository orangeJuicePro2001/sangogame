/**
 * 战斗核心流程类
 * Created by 黑暗之神KDS on 2021-01-14 09:47:28.
 */
class GameBattle {
    //------------------------------------------------------------------------------------------------------
    // 系统
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗参数设定
     */
    static setting: CustomCommandParams_5001;
    /**
     * 战斗标识 0-无 1-准备阶段 2-战斗阶段 3-结束阶段
     */
    static state: number = 0;
    /**
     * 战斗加速演示
     */
    private static _fastPlayMode: boolean;
    private static fastPlayRecordInfo: number[];
    static get fastPlayMode(): boolean {
        return this._fastPlayMode;
    }
    static set fastPlayMode(v: boolean) {
        if (v) {
            // 非战斗或已处于加速状态或者玩家回合则忽略
            let isPlayerTurn = (GameBattle.firstCamp == 0 && GameBattle.inTurnStage == 2) || (GameBattle.firstCamp == 1 && GameBattle.inTurnStage == 3);
            if (!GameBattleHelper.isInBattle || this.fastPlayRecordInfo || isPlayerTurn) return;
            this.fastPlayRecordInfo = [WorldData.cameraTweenFrame, WorldData.cursorSpeedByComputerControl, WorldData.actionReflectionTime, WorldData.noActionWaitTime, WorldData.aiOpenIndicator ? 1 : 0];
            WorldData.cameraTweenFrame = 0;
            WorldData.cursorSpeedByComputerControl = 2400;
            WorldData.actionReflectionTime = 0;
            WorldData.noActionWaitTime = 0;
            WorldData.aiOpenIndicator = false;
        }
        else if (this.fastPlayRecordInfo) {
            WorldData.cameraTweenFrame = this.fastPlayRecordInfo[0];
            WorldData.cursorSpeedByComputerControl = this.fastPlayRecordInfo[1];
            WorldData.actionReflectionTime = this.fastPlayRecordInfo[2];
            WorldData.noActionWaitTime = this.fastPlayRecordInfo[3];
            WorldData.aiOpenIndicator = this.fastPlayRecordInfo[4] ? true : false;
            this.fastPlayRecordInfo = null;
        }
        this._fastPlayMode = v;
    }
    //------------------------------------------------------------------------------------------------------
    // 流程相关
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗回合
     */
    static battleRound: number = 0;
    /**
     * 先行方
     */
    static firstCamp: number;
    /**
     * 回合内阶段步骤
     */
    static inTurnStage: number;
    /**
     * 玩家自由操作标识
     */
    static playerControlEnabled: boolean;
    /**
     * 我方战斗成员
     */
    static playerBattlers: ProjectClientSceneObject[] = [];
    /**
     * 敌方战斗成员
     */
    static enemyBattlers: ProjectClientSceneObject[] = [];
    //------------------------------------------------------------------------------------------------------
    // 结果
    //------------------------------------------------------------------------------------------------------
    /**
     * 上次战斗胜负
     */
    static resultIsWin: boolean;
    /**
     * 是否游戏结束
     */
    static resultIsGameOver: boolean;
    //------------------------------------------------------------------------------------------------------
    // 实现用变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 已使用的玩家角色记录：[playerActor] => battler
     */
    static usedPlayerActorRecord: Dictionary = new Dictionary();
    /**
     * 
     */
    private static nextStepCB: Callback;
    //------------------------------------------------------------------------------------------------------
    // 开始
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗开始前处理
     */
    static init(cp: CustomCommandParams_5001): void {
        // 记录战斗参数设定
        GameBattle.setting = cp;
        // 设定为准备阶段
        GameBattle.state = 1;
        // 战斗控制器启动
        GameBattleController.init();
        // AI管理启动
        GameBattleAI.init();
        // 行为管理启动
        GameBattleAction.init();
        // 战斗者处理器启动
        GameBattlerHandler.init();
        // 清理
        this.resultIsWin = false;
        this.resultIsGameOver = false;
        this.usedPlayerActorRecord.clear();
        this.inTurnStage = 0;
        this.battleRound = 0;
        // 决定先手和后手方
        if (this.setting.firstActionCamp == 2) this.firstCamp = Math.random() < 0.5 ? 0 : 1;
        else this.firstCamp = this.setting.firstActionCamp;
    }
    /**
     * 开始战斗
     */
    static start(): void {
        if (!this.nextStepCB) this.nextStepCB = Callback.New(this.nextStep, this)
        // 战斗中标识
        GameBattle.state = 2;
        // 如果跳过了准备阶段需要初始化场上的战斗者
        if (!GameBattle.setting.isPlayerDecisionBattler) GameBattlerHandler.initScenePresetBattler();
        // 战斗正式开始时事件
        GameCommand.startCommonCommand(14021, [], Callback.New(() => {
            // 恢复列表快捷键
            UIList.KEY_BOARD_ENABLED = WorldData.hotKeyListEnabled;
            // 战斗控制器启动
            GameBattleController.start();
            // AI管理启动
            GameBattleAI.start();
            // 行为管理启动
            GameBattleAction.start();
            // 战斗者处理器启动
            GameBattlerHandler.start();
            // 镜头锁定光标
            Game.currentScene.camera.sceneObject = GameBattleHelper.cursor;
            // 进入新的回合
            this.nextStep();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    }
    //------------------------------------------------------------------------------------------------------
    // 结束
    //------------------------------------------------------------------------------------------------------
    /**
     * 停止战斗：通常来自结束战斗指令的调用（无论是主动结束战斗或是满足条件自动结束战斗）
     * -- 满足胜负条件：GameBattle.checkBattleIsComplete => WorldData.reachBattleCompelteConditionEvent => 调用结束战斗指令
     * -- 主动结束：调用结束战斗指令
     */
    static stop(onFin: Function): void {
        // 清理战斗中标识
        GameBattle.state = 0;
        // 战斗控制器结束
        GameBattleController.stop();
        // AI管理结束
        GameBattleAI.stop();
        // 行为管理启动
        GameBattleAction.stop();
        // 战斗者处理器启动
        GameBattlerHandler.stop();
        // 如果不是游戏结束
        if (!GameBattle.resultIsGameOver) {
            if (GameBattle.setting.isAddEvents) {
                if (GameBattle.resultIsWin && GameBattle.setting.battleStage2_beforeWin) {
                    CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage2_beforeWin, Game.player.sceneObject, Game.player.sceneObject, Callback.New(doStop, this));
                    return;
                }
                else if (!GameBattle.resultIsWin && GameBattle.setting.battleStage3_beforeLose) {
                    CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage3_beforeLose, Game.player.sceneObject, Game.player.sceneObject, Callback.New(doStop, this));
                    return;
                }
            }
            doStop();
        }
        function doStop() {
            // 死亡角色离队
            GameBattle.deadActorLeaveParty();
            // 清场：清理战斗者
            GameBattle.clearBattlersSceneObject();
            // 重置全部角色数据
            GameBattle.resetActorParty();
            // 回调
            onFin();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 战斗内部流程
    //------------------------------------------------------------------------------------------------------
    /**
     * 执行下一个阶段
     */
    static nextStep(): void {
        // 检查战斗结束，如果战斗已经结束则不再继续
        this.battlerfieldDetermineHandle(() => {
            // 取消战斗者们的待机效果
            GameBattlerHandler.closeAllBattlersStandbyEffect();
            // 初始化
            this.playerControlEnabled = false;
            WorldData.playCtrlEnabled = false;
            // 战斗阶段累加，如果超出则回到第一个步骤
            var currentInTurnStage = this.inTurnStage++;
            if (this.inTurnStage > 3) this.inTurnStage = 0;
            // 流程1：新的回合阶段
            if (currentInTurnStage == 0) {
                this.newTurnStep();
            }
            // 流程2：先行方行动阶段
            else if (currentInTurnStage == 1) {
                this.firstCampStartActionStep();
            }
            // 流程3：后行方行动阶段
            else if (currentInTurnStage == 2) {
                this.secondCampStartActionStep();
            }
            // 流程4：结算阶段
            else {
                this.settlementStep();
            }
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 阶段
    //------------------------------------------------------------------------------------------------------
    /**
     * 新的回合
     */
    private static newTurnStep(): void {
        // 回合数累加
        this.battleRound++;
        // 遍历所有战斗者
        var allBattlers = this.playerBattlers.concat(this.enemyBattlers);
        for (var i in allBattlers) {
            var battler = allBattlers[i];
            // 刷新行动
            battler.battlerSetting.operationComplete = false;
            battler.battlerSetting.moved = false;
            battler.battlerSetting.actioned = false;
            // 获取角色数据
            var actor = battler.battlerSetting.battleActor;
            // -- 普通攻击是技能的情况，刷新冷却时间
            if (actor.atkMode == 1 && actor.atkSkill) {
                if (actor.atkSkill.currentCD > 0) actor.atkSkill.currentCD--;
            }
            // -- 刷新技能冷却时间
            for (var s = 0; s < actor.skills.length; s++) {
                var skill = actor.skills[s];
                if (skill.currentCD > 0) skill.currentCD--;
            }
            // -- 刷新状态时间，到期解除
            if (this.battleRound != 1) {
                for (var s = 0; s < actor.status.length; s++) {
                    var status = actor.status[s];
                    status.currentDuration--;
                    if (status.currentDuration <= 0) {
                        var isRemove = GameBattlerHandler.removeStatus(battler, status.id);
                        if (isRemove) s--;
                    }
                }
            }
        }
        // -- 如果存在局部事件的话，优先执行局部事件再执行全局事件然后进入下一个阶段
        if (GameBattle.setting.isAddEvents && GameBattle.setting.battleStage1_newTurn) {
            // -- 追加执行该次战斗的额外的片段事件「战斗阶段：新的回合」
            CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage1_newTurn, Game.player.sceneObject, Game.player.sceneObject, Callback.New(() => {
                // -- 战场判定处理
                this.battlerfieldDetermineHandle(() => {
                    // -- 执行通用的片段事件「战斗阶段：新的回合」
                    GameCommand.startCommonCommand(14031, [], Callback.New(this.nextStep, this), Game.player.sceneObject, Game.player.sceneObject);
                });
            }, this));
        }
        // -- 否则仅运行全局事件然后进入下一个阶段
        else {
            GameCommand.startCommonCommand(14031, [], Callback.New(this.nextStep, this), Game.player.sceneObject, Game.player.sceneObject);
        }
    }
    /**
     * 先行方行动
     */
    private static firstCampStartActionStep(): void {
        // 进入先行方行动的事件处理
        GameCommand.startCommonCommand(14032, [], Callback.New(() => {
            // 决定玩家行动或敌方行动
            if (this.firstCamp == 0) this.nextPlayerControl();
            else this.nextEnemyControl();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    }
    /**
     * 后行方行动
     */
    private static secondCampStartActionStep(): void {
        // 进入后行方行动的事件处理
        GameCommand.startCommonCommand(14033, [], Callback.New(() => {
            // 决定玩家行动或敌方行动
            if (this.firstCamp == 1) this.nextPlayerControl();
            else this.nextEnemyControl();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    }
    /**
     * 结算阶段
     */
    private static settlementStep(): void {
        // 不需要结算DOT/HOT的情况
        if (!GameBattleAction.isNeedCalcBattlersStatus()) {
            this.nextStep();
            return;
        }
        // 进入结算阶段的事件处理
        GameCommand.startCommonCommand(14034, [], Callback.New(() => {
            // 战场判定处理
            this.battlerfieldDetermineHandle(() => {
                GameBattleAction.calcBattlersStatus(this.nextStepCB);
            })
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    }
    //------------------------------------------------------------------------------------------------------
    // 我方行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 下一个玩家控制
     */
    static nextPlayerControl(): void {
        // 玩家控制阶段
        this.fastPlayMode = false;
        // 战场判定处理
        this.battlerfieldDetermineHandle(() => {
            // 获取下一个自由控制的战斗角色，如果不存在的话则
            var nextPlayerControlBattler = GameBattleHelper.nextPlayerControlBattler;
            if (nextPlayerControlBattler) {
                // 我方自由控制的标识 & 允许控制光标
                GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByPlayerControl;
                this.playerControlEnabled = WorldData.playCtrlEnabled = true;
                GameBattleAction.cameraMoveToBattler(nextPlayerControlBattler);
                GameBattleController.openBattlerMenu(nextPlayerControlBattler);
            }
            else {
                GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByComputerControl;
                // 我方无法控制的标识 & 禁止控制光标
                this.playerControlEnabled = WorldData.playCtrlEnabled = false;
                // 获取下一个玩家阵营的电脑控制的角色开始行动，行动完毕后循环执行，直到所有角色被电脑控制完毕
                var nextPlayerCampComputerControlBattler = GameBattleHelper.nextPlayerCampComputerControlBattler;
                if (nextPlayerCampComputerControlBattler) {
                    GameBattleAI.action(nextPlayerCampComputerControlBattler, Callback.New(this.nextPlayerControl, this));
                }
                // 没有任何可供电脑操作的角色就自动进行到下一步
                else {
                    this.nextStep();
                }
            }
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 敌方行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 下一个敌人控制
     */
    private static nextEnemyControl(): void {
        GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByComputerControl;
        // 战场判定处理
        this.battlerfieldDetermineHandle(() => {
            // 获取下一个玩家阵营的电脑控制的角色开始行动，行动完毕后循环执行，直到所有角色被电脑控制完毕
            var nextEnemyControlBattler = GameBattleHelper.nextEnemyControlBattler;
            if (nextEnemyControlBattler) {
                GameBattleAI.action(nextEnemyControlBattler, Callback.New(this.nextEnemyControl, this));
            }
            // 没有任何可供电脑操作的角色就自动进行到下一步
            else {
                this.nextStep();
            }
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 战场判定处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 战场判定处理：如果未结束战斗才继续
     * -- 刷新参战者所在的阵营以及检查新战斗者加入
     * -- 死亡者判定
     * -- 胜负判定
     * 由于在调用片段事件时可能改变了战场相关的数据，需要进行刷新处理。如：
     * -- 变更战斗者阵营
     * -- 由于出现条件满足而改变了场景对象的状态页
     * -- 增加战斗者
     * -- 杀死战斗者
     * -- 销毁战斗者
     * -- 更换了场景
     * -- 强制结束战斗
     * -- .........
     * @param onFin 当完成时回调
     * @param checkIsDeadBattlers [可选] 默认值=null 需要检查是否死亡的战斗者集合
     */
    static battlerfieldDetermineHandle(onFin: Function): void {
        // -- 已经结束战斗的情况
        if (GameBattle.state == 0 || GameBattle.state == 3) return;
        // -- 刷新参战者所在的阵营以及检查新战斗者加入
        GameBattlerHandler.refreshCampAndNewBattles();
        // -- 死亡者判定
        var allBattlers = GameBattleHelper.allBattlers;
        var allBattlersCount = allBattlers.length;
        if (allBattlersCount > 0) {
            for (var i = 0; i < allBattlers.length; i++) {
                var battler = allBattlers[i];
                this.checkBattlerIsDead(battler, () => {
                    allBattlersCount--;
                    if (allBattlersCount == 0) {
                        // -- 胜负判定
                        var isComplete = GameBattle.checkBattleIsComplete();
                        if (!isComplete) onFin.apply(this);
                    }
                });
            }
        }
        else {
            // -- 胜负判定
            var isComplete = GameBattle.checkBattleIsComplete();
            if (!isComplete) onFin.apply(this);
        }
    }
    /**
     * 检查战斗者是否死亡
     * @param battler 战斗者 
     * @param onFin 
     */
    static checkBattlerIsDead(battler: ProjectClientSceneObject, onFin: Function): void {
        // 当生命值归零的时候
        if (!battler.battlerSetting.isDead && battler.battlerSetting.battleActor.hp == 0) {
            // 执行死亡者事件
            GameCommand.startCommonCommand(14042, [], Callback.New(() => {
                // -- 刷新参战者所在的阵营以及检查新战斗者加入
                GameBattlerHandler.refreshCampAndNewBattles();
                // -- 仍然是战斗者且死亡的话则进行死亡处理
                if (!battler.isDisposed && GameBattleHelper.isBattler(battler) && battler.battlerSetting.battleActor.hp == 0) {
                    GameBattlerHandler.dead(battler);
                }
                onFin.apply(this);
            }, this), battler, battler);
        }
        else {
            onFin.apply(this);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 检查战斗的结束状态，满足以下任意条件则结束战斗
     * -- 我方指定的任意角色死亡
     * -- 我方全员阵亡
     * -- 敌方全员阵亡
     * @return [number] 0-无 1-胜利 2-失败
     */
    private static getBattleCompleteState(): number {
        // 失败的条件：我方指定的任意人员阵亡
        // -- 遍历追加的不能阵亡人员名单
        for (var i = 0; i < GameBattle.setting.addFailConditions.length; i++) {
            // -- 获取其角色编号
            var actorID = GameBattle.setting.addFailConditions[i];
            // -- 根据角色编号找到玩家拥有的该角色对应的战斗者集合
            var thisActorBattlers: ProjectClientSceneObject[] = ArrayUtils.matchAttributesD3(this.playerBattlers, "battlerSetting", "battleActor", { id: actorID }, false);
            // -- 获取其中的死亡角色
            var thisActorDeadBattlers: ProjectClientSceneObject[] = ArrayUtils.matchAttributesD2(thisActorBattlers, "battlerSetting", { isDead: true }, false);
            // -- 查询这些死亡角色是否是玩家拥有的角色
            for (var s = 0; s < thisActorDeadBattlers.length; s++) {
                var thisActorBattler = thisActorDeadBattlers[s];
                if (GameBattleHelper.isInPlayerParty(thisActorBattler)) {
                    return 2;
                }
            }
        }
        // 我方全员阵亡的情况
        if (ArrayUtils.matchAttributesD2(this.playerBattlers, "battlerSetting", { isDead: true }, false).length == this.playerBattlers.length) {
            return 2;
        }
        // 敌方全员阵亡的情况：阵亡或已不再是战斗者
        if (ArrayUtils.matchAttributesD2(this.enemyBattlers, "battlerSetting", { isDead: true }, false).length == this.enemyBattlers.length) {
            return 1;
        }
        return 0;
    }
    /**
     * 战斗结束后清理战斗者
     */
    private static clearBattlersSceneObject(): void {
        // 重置相关标识
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                so.battlerSetting.isInited = false;
                so.battlerSetting.isExecuteAppearEvent = false;
                so.battlerSetting.hateList.length = 0;
                GameBattlerHandler.removeAllStatus(so);
            }
        }
        // 清理战场，根据战斗预设
        if (GameBattle.setting.winClearBattlefieldType != 2) {
            // 清理我方战斗者
            for (var i = 0; i < this.playerBattlers.length; i++) {
                var playerBattler = this.playerBattlers[i];
                // 保留阵亡者的情况，不清理
                if (GameBattle.setting.keepDeadBattler && playerBattler.battlerSetting.isDead) continue;
                playerBattler.dispose();
                i--;
            }
            // 如果需要清理全部战斗者的话则还清理敌方战斗者
            if (GameBattle.setting.winClearBattlefieldType == 0) {
                for (var i = 0; i < this.enemyBattlers.length; i++) {
                    var enemyBattler = this.enemyBattlers[i];
                    // 保留阵亡者的情况，不清理
                    if (GameBattle.setting.keepDeadBattler && enemyBattler.battlerSetting.isDead) continue;
                    enemyBattler.dispose();
                    i--;
                }
            }
        }
        // 未能清理的战斗者直接调用片段事件：battlerClearEvent
        for (var i = 0; i < this.playerBattlers.length; i++) {
            var playerBattler = this.playerBattlers[i];
            GameCommand.startCommonCommand(14043, [], null, playerBattler, playerBattler);
        }
        for (var i = 0; i < this.enemyBattlers.length; i++) {
            var enemyBattler = this.enemyBattlers[i];
            GameCommand.startCommonCommand(14043, [], null, enemyBattler, enemyBattler);
        }
    }
    /**
     * 战斗结束后死亡的角色离开队伍
     */
    private static deadActorLeaveParty(): void {
        if (WorldData.deadPlayerActorLeaveParty) {
            for (var i = 0; i < this.playerBattlers.length; i++) {
                var playerBattler = this.playerBattlers[i];
                // 如果是玩家拥有的角色且死亡的话
                if (playerBattler.battlerSetting.isDead && GameBattleHelper.isInPlayerParty(playerBattler)) {
                    // 离开队伍：需要重新计算所在位置，因为可能移除后导致位置变更了
                    var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(playerBattler.battlerSetting.battleActor);
                    if (inPlayerActorIndex >= 0) {
                        ProjectPlayer.removePlayerActorByInPartyIndex(inPlayerActorIndex);
                        this.playerBattlers.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    }
    /**
     * 战斗结束后重置角色数据：刷新属性
     */
    private static resetActorParty(): void {
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            Game.refreshActorAttribute(actor, actorDS.lv);
            actor.hp = actor.MaxHP;
            actor.sp = actor.MaxSP;
        }
    }
    /**
     * 由系统检查战斗是否完成（满足了胜负条件）
     */
    static checkBattleIsComplete(): boolean {
        // 已结束的情况
        if (GameBattle.state == 0 || GameBattle.state == 3) return true;
        // 如果需要结束的情况
        var battleOverState = this.getBattleCompleteState();
        var isBattleOver = battleOverState != 0;
        // 执行战斗结束事件
        if (isBattleOver) {
            GameBattle.state = 3;
            var isWin = battleOverState == 1
            GameBattle.resultIsWin = isWin;
            GameBattle.resultIsGameOver = !isWin;
            // 如果战败后继续的话，不视为游戏结束
            if (GameBattle.setting.battleFailHandleType == 1) {
                GameBattle.resultIsGameOver = false;
            }
            // 结算击杀奖励
            GameBattlerHandler.calcHitReward(GameBattleAction.fromBattler, Callback.New(() => {
                // 执行胜负满足时事件
                GameCommand.startCommonCommand(14022, [], null, Game.player.sceneObject, Game.player.sceneObject);
            }, this));
            return true;
        }
        return false;
    }
}