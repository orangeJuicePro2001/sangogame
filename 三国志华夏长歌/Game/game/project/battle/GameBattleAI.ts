/**
 * 战斗者AI-处理器
 * 
 * ==== 关于系统AI ====
 * -- 获取一个参考敌对目标（根据仇恨/就近）
 * -- 尝试使用技能：遍历所有技能，满足施放条件则开始施放（计算能够施放到的最多目标点，如果需要移动的话则会加入移动参考点，以便先移动后施放）
 * -- 尝试使用道具：满足条件则使用
 * -- 尝试攻击，如果普通攻击是技能则与技能处理方式一致
 * -- 移动；存在移动参考点则根据参考点进行移动，否则如果存在敌对目标则接近目标或与目标保持最远攻击距离
 * 
 * 
 * Created by 黑暗之神KDS on 2021-01-14 14:26:09.
 */
class GameBattleAI {
    /**
     * 行动结束后回调
     */
    private static onActionComplete: Callback;
    /**
     * 当前战斗者
     */
    private static currentBattler: ProjectClientSceneObject;
    /**
     * 参考目标敌人
     */
    private static currentEnemy: ProjectClientSceneObject;
    /**
     * 锁定一次敌人
     */
    private static lockOnceEnemy: ProjectClientSceneObject;
    /**
     * 正在行动中
     */
    private static isInAction: boolean;
    /**
     * 作用敌方的技能作用距离参考
     */
    private static applyEnemySkillDistanceArr: number[] = [];
    /**
     * 辅助类技能作用距离参考
     */
    private static applyFriendSkillDistanceArr: number[] = [];
    /**
     * 移动参考点
     */
    private static referenceMoveGrids: Point[] = [];
    //------------------------------------------------------------------------------------------------------
    // 实现用
    //------------------------------------------------------------------------------------------------------
    /**
     * 同步任务用关键词
     */
    private static doActionSyncTask: string = "GameBattleAI_doActionSyncTask";

    //------------------------------------------------------------------------------------------------------
    // 初始化
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init(): void {

    }
    /**
     * 开始
     */
    static start(): void {

    }
    /**
     * 结束
     */
    static stop(): void {
        this.lockOnceEnemy = null;
        SyncTask.taskOver(this.doActionSyncTask);
    }
    //------------------------------------------------------------------------------------------------------
    // 接口
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始行动
     * @param battler 行动的战斗者
     * @param onActionComplete 当行动完毕时回调
     */
    static action(battler: ProjectClientSceneObject, onActionComplete: Callback) {
        // -- 记录当前行动的战斗者
        this.currentBattler = battler;
        // -- 记录行动完毕时回调
        this.onActionComplete = onActionComplete;
        // -- 初始化
        this.isInAction = false;
        this.applyEnemySkillDistanceArr.length = 0;
        this.applyFriendSkillDistanceArr.length = 0;
        // -- 显示当前行动者
        GameBattleAction.showCurrentBattlerWindow(this.currentBattler);
        // -- 开始行动
        this.doAction();
    }
    //------------------------------------------------------------------------------------------------------
    // 获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取当前操作的战斗者的角色数据
     */
    private static get currentBattlerActor(): Module_Actor {
        return this.currentBattler.battlerSetting.battleActor;
    }
    //------------------------------------------------------------------------------------------------------
    // 流程
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始行动
     */
    private static doAction(): void {
        // 获取当前行动的战斗者
        var battler = this.currentBattler;
        var currentBattlerActor = this.currentBattlerActor;
        // 移动参考点置空，每次需要重新计算需要移动的参考点
        this.referenceMoveGrids.length = 0;
        // 重置行动中状态
        this.isInAction = false;
        // 获取一个参考敌人
        this.currentEnemy = this.lockOnceEnemy ? this.lockOnceEnemy : this.getOneEnemy();
        this.lockOnceEnemy = null;
        // 如果已经不是战斗者或死亡的话
        if (!GameBattleHelper.isBattler(battler) || battler.battlerSetting.isDead) {
            this.tryActionComplete();
            return;
        }
        // 如果不行动或没有目标敌人的情况，结束整个行动
        if (!this.currentEnemy || currentBattlerActor.aiType == 2) {
            this.cameraMoveToCurrentBattler();
            Callback.New(this.tryActionComplete, this).delayRun(WorldData.noActionWaitTime);
            return;
        }
        // 镜头指向该角色
        this.cameraMoveToCurrentBattler();
        // 尝试使用技能
        this.tryUseSkill();
        // 尝试使用有益道具
        this.tryUseBeneficialItem();
        // 尝试使用有害道具
        this.tryUseBarmfulItem();
        // 尝试攻击
        this.tryAtk();
        // 尝试移动
        this.tryMove();
        // 尝试结束行动
        this.tryActionComplete();
    }
    //------------------------------------------------------------------------------------------------------
    // 功能效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 镜头移动至当前战斗者角色
     */
    private static cameraMoveToCurrentBattler(): void {
        new SyncTask(this.doActionSyncTask, () => {
            GameFunction.cameraMove(1, 0, 0, this.currentBattler.index, true, WorldData.cameraTweenFrame);
            GameBattleHelper.cursor.setTo(this.currentBattler.x, this.currentBattler.y);
            setFrameout(() => {
                SyncTask.taskOver(this.doActionSyncTask);
            }, WorldData.cameraTweenFrame)
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 行为
    //------------------------------------------------------------------------------------------------------
    /**
     * 使用技能，遍历所有的技能
     * -- 在范围内的话直接使用，优先使用在范围内允许使用的技能
     * -- 预先计算包含移动范围内的最优解（即能够作用到的最多目标）
     */
    private static tryUseSkill() {
        // -- 正在行动中时无法使用
        if (this.isInAction) return;
        // -- 获取战斗者
        var battler = this.currentBattler;
        var actor = battler.battlerSetting.battleActor;
        // -- 未满足使用技能的通用条件则无法使用
        if (!GameBattleHelper.canUseSkill(battler)) return;
        // -- 遍历该战斗者的技能
        var isUseSkill = false;
        for (var i = 0; i < actor.skills.length; i++) {
            var skill = actor.skills[i];
            // 如果该技能无法使用的情况，则检查下一个
            if (!GameBattleHelper.canUseOneSkill(battler, skill, false)) continue;
            // 加入任务队列的方式尝试使用技能，如果已有要使用的技能了后续的任务则失效
            // 在一个任务未完成的时候，其他任务都在等待队列中
            new SyncTask(this.doActionSyncTask, (skill: Module_Skill) => {
                // 已有技能使用的情况直接结束该任务
                if (isUseSkill) {
                    SyncTask.taskOver(this.doActionSyncTask);
                    return;
                }
                // 获取技能的作用目标
                var isHostileSkill = GameBattleHelper.isHostileSkill(skill);
                var skillTarget: ProjectClientSceneObject = this.getSkillTarget(skill, isHostileSkill);
                // 没有目标的情况
                if (!skillTarget) {
                    SyncTask.taskOver(this.doActionSyncTask);
                    return;
                }
                // 获取技能的施放点，存在的话
                var useSkillSuccess = this.doUseSkill(skill, skillTarget);
                if (useSkillSuccess) {
                    isUseSkill = true;
                    SyncTask.taskOver(this.doActionSyncTask);
                    return;
                }
                // 延迟一帧后执行下一个任务，以便多个技能时分摊帧计算
                setFrameout(() => { SyncTask.taskOver(this.doActionSyncTask); }, 0);
            }, [skill], this);
        }
    }
    /**
     * 使用有益道具
     */
    private static tryUseBeneficialItem() {
        new SyncTask(this.doActionSyncTask, () => {
            if (!this.isInAction) {
                var battler = this.currentBattler;
                var actor = battler.battlerSetting.battleActor;
                for (var i = 0; i < actor.items.length; i++) {
                    var item = actor.items[i];
                    if (!item) continue;
                    // 忽略有害道具
                    if (item.harmful) continue;
                    // 不允许使用的话则忽略
                    if (!GameBattleHelper.canUseOneItem(battler, item)) continue;
                    // 附加状态：如果目标仍然允许叠加该状态的话
                    for (var s = 0; s < item.addStatus.length; s++) {
                        var addStatus = item.addStatus[s];
                        if (GameBattleHelper.canSuperpositionLayer(battler, addStatus)) {
                            this.doUseItem(item);
                            return;
                        }
                    }
                    // 解除状态：如果目标拥有该状态的话
                    for (var s = 0; s < item.removeStatus.length; s++) {
                        var removeStatus = item.removeStatus[s];
                        if (GameBattleHelper.isIncludeStatus(battler, removeStatus)) {
                            this.doUseItem(item);
                            return;
                        }
                    }
                    // 恢复生命值或恢复魔法值
                    if ((item.recoveryHP > 0 && (actor.MaxHP - actor.hp >= item.recoveryHP || actor.hp / actor.MaxHP < 0.5)) ||
                        (item.recoverySP > 0 && (actor.MaxSP - actor.sp >= item.recoverySP || actor.sp / actor.MaxSP < 0.5))) {
                        this.doUseItem(item);
                        return;
                    }
                }
            }
            SyncTask.taskOver(this.doActionSyncTask);
        });
    }
    /**
     * 使用有害道具
     */
    private static tryUseBarmfulItem() {
        new SyncTask(this.doActionSyncTask, () => {
            // 如果未在行动中 && 
            if (!this.isInAction && GameBattleHelper.conUseItem(this.currentBattler) && this.currentEnemy) {
                let actor = this.currentBattler.battlerSetting.battleActor;
                let atkTarget: ProjectClientSceneObject = this.getAtkTarget();
                if (atkTarget) {
                    if (atkTarget.battlerSetting.isDead) {
                        atkTarget = this.getAtkTarget();
                    }
                }
                // 获取一个有害的道具
                let useItem: Module_Item = null;
                for (let i = 0; i < actor.items.length; i++) {
                    let item = actor.items[i];
                    if (!item) continue;
                    // 忽略无害道具
                    if (!item.harmful) continue;
                    // 不允许使用的话则忽略
                    if (!GameBattleHelper.canUseOneItem(this.currentBattler, item)) continue;
                    let continueThisItem = false;
                    // 附加状态：如果目标不允许叠加该状态的话则无需给目标使用该道具
                    for (let s = 0; s < item.addStatus.length; s++) {
                        let addStatus = item.addStatus[s];
                        if (!GameBattleHelper.canSuperpositionLayer(atkTarget, addStatus)) {
                            continueThisItem = true;
                            break;
                        }
                    }
                    if (continueThisItem) continue;
                    // 解除状态：如果目标未拥有任何可以解除的状态的话则无需给目标使用该道具
                    let targetOwnStatusCount = item.removeStatus.length;
                    for (var s = 0; s < item.removeStatus.length; s++) {
                        var removeStatus = item.removeStatus[s];
                        if (!GameBattleHelper.isIncludeStatus(atkTarget, removeStatus)) {
                            targetOwnStatusCount--;
                        }
                    }
                    if (targetOwnStatusCount == 0 && item.removeStatus.length != 0) continue;
                    // 直接使用
                    useItem = item;
                }
                // 选择目标使用
                if (useItem && atkTarget) {
                    let currentBattlerPosGrid = this.currentBattler.posGrid;
                    // -- 在范围内则直接攻击
                    let effectRangeGridArr = GameBattleHelper.getEffectRange(currentBattlerPosGrid, 1, 1);
                    for (let i = 0; i < effectRangeGridArr.length; i++) {
                        let effectRangeGrid = effectRangeGridArr[i];
                        let targetBattler = GameBattleHelper.getNoDeadBattlerByGrid(effectRangeGrid);
                        if (atkTarget == targetBattler) {
                            this.doUseBarmfulItem(useItem);
                            return;
                        }
                    }
                    // -- 否则不在范围内的话添加接近目标的趋势
                    let moveMapGrids = GameBattleHelper.getEffectRange(currentBattlerPosGrid, this.currentBattler.battlerSetting.battleActor.MoveGrid);
                    let min = Number.MAX_VALUE;
                    let moveToGrid: Point = null;
                    for (let s = 0; s < moveMapGrids.length; s++) {
                        let moveMapGrid = moveMapGrids[s];
                        let distanceTargetEnemy = Math.abs(moveMapGrid.x - atkTarget.posGrid.x) + Math.abs(moveMapGrid.y - atkTarget.posGrid.y);
                        if (distanceTargetEnemy < min) {
                            min = distanceTargetEnemy;
                            moveToGrid = moveMapGrid;
                        }
                    }
                    // -- 如果存在移动目的地且非当前所在格子
                    if (moveToGrid && moveToGrid.x != this.currentBattler.posGrid.x && moveToGrid.y != this.currentBattler.posGrid.y) {
                        this.referenceMoveGrids.push(moveToGrid);
                    }
                }
            }
            SyncTask.taskOver(this.doActionSyncTask);
        });
    }
    /**
     * 普通攻击
     */
    private static tryAtk() {
        new SyncTask(this.doActionSyncTask, () => {
            // 如果未在行动中 && 
            if (!this.isInAction && GameBattleHelper.canAttack(this.currentBattler) && this.currentEnemy) {
                var actor = this.currentBattler.battlerSetting.battleActor;
                // 普通攻击使用技能代替
                if (actor.atkMode == 1 && actor.atkSkill) {
                    var isHostileSkill = GameBattleHelper.isHostileSkill(actor.atkSkill);
                    var skillTarget: ProjectClientSceneObject = this.getSkillTarget(actor.atkSkill, isHostileSkill);
                    var atkSuccess = this.doUseSkill(actor.atkSkill, skillTarget)
                    if (!atkSuccess) {
                        SyncTask.taskOver(this.doActionSyncTask);
                        return;
                    }
                }
                // 普通攻击
                else if (actor.atkMode == 0) {
                    var atkTarget: ProjectClientSceneObject = this.getAtkTarget();
                    if (atkTarget) {
                        if (atkTarget.battlerSetting.isDead) {
                            atkTarget = this.getAtkTarget();
                        }
                        var currentBattlerPosGrid = this.currentBattler.posGrid;
                        // -- 在范围内则直接攻击
                        var effectRangeGridArr = GameBattleHelper.getEffectRange(currentBattlerPosGrid, 1, 1);
                        for (var i = 0; i < effectRangeGridArr.length; i++) {
                            var effectRangeGrid = effectRangeGridArr[i];
                            var targetBattler = GameBattleHelper.getNoDeadBattlerByGrid(effectRangeGrid);
                            if (atkTarget == targetBattler) {
                                this.doAtk();
                                return;
                            }
                        }
                        // -- 否则不在范围内的话添加接近目标的趋势
                        var moveMapGrids = GameBattleHelper.getEffectRange(currentBattlerPosGrid, this.currentBattler.battlerSetting.battleActor.MoveGrid);
                        var min = Number.MAX_VALUE;
                        var moveToGrid: Point;
                        for (var s = 0; s < moveMapGrids.length; s++) {
                            var moveMapGrid = moveMapGrids[s];
                            var distanceTargetEnemy = Math.abs(moveMapGrid.x - atkTarget.posGrid.x) + Math.abs(moveMapGrid.y - atkTarget.posGrid.y);
                            if (distanceTargetEnemy < min) {
                                min = distanceTargetEnemy;
                                moveToGrid = moveMapGrid;
                            }
                        }
                        if (moveToGrid && moveToGrid.x != this.currentBattler.posGrid.x && moveToGrid.y != this.currentBattler.posGrid.y) {
                            this.referenceMoveGrids.push(moveToGrid);
                        }
                    }
                }
            }
            SyncTask.taskOver(this.doActionSyncTask);
        });
    }
    /**
     * 移动
     */
    private static tryMove() {
        // -- 正在行动中时无法使用
        new SyncTask(this.doActionSyncTask, () => {
            if (!this.isInAction && GameBattleHelper.canMove(this.currentBattler)) {
                // -- 如果没有移动参考点且攻击使用技能的话则计算攻击技能的最佳施放点以便移动至那个点
                if (this.currentBattlerActor.atkMode == 1 && this.currentBattlerActor.atkSkill) {
                    this.getSkillCastPlace(this.currentBattlerActor.atkSkill, this.currentEnemy);
                }
                // -- 剔除掉自身格子
                for (var i = 0; i < this.referenceMoveGrids.length; i++) {
                    var moveToGrid = this.referenceMoveGrids[i];
                    if (moveToGrid.x == this.currentBattler.posGrid.x && moveToGrid.y == this.currentBattler.posGrid.y) {
                        this.referenceMoveGrids.splice(i, 1)
                        continue;
                    }
                }
                // -- 如果已有参考点则移动至参考点
                if (this.referenceMoveGrids.length > 0) {
                    var moveToGrid = this.referenceMoveGrids[0];
                    GameBattleAction.openMoveIndicator(this.currentBattler);
                    this.isInAction = true;
                    setTimeout(() => {
                        var gridArr = GameBattleAction.battlerEffectIndicatorGridArr;
                        if (ArrayUtils.matchAttributes(gridArr, { x: moveToGrid.x, y: moveToGrid.y }, true)[0]) {
                            var moveToPoint = GameUtils.getGridCenterByGrid(moveToGrid);
                            GameBattleHelper.cursor.setTo(moveToPoint.x, moveToPoint.y)
                            setTimeout(() => {
                                GameBattleAction.startMove(this.currentBattler, moveToGrid.x, moveToGrid.y, Callback.New(() => {
                                    SyncTask.taskOver(this.doActionSyncTask);
                                    this.doAction();
                                }, this));
                            }, WorldData.actionReflectionTime);
                        }
                        else {
                            SyncTask.taskOver(this.doActionSyncTask);
                        }
                    }, WorldData.actionReflectionTime)
                    return;
                }
                // 否则如果存在敌对目标则接近
                else if (this.currentEnemy) {
                    // 获取所有格子
                    var moveMapGrids = GameBattleHelper.getEffectRange(this.currentBattler.posGrid, this.currentBattler.battlerSetting.battleActor.MoveGrid);
                    // 计算距离目标最近的格子（必须小于当前格）
                    if (this.currentBattlerActor.moveType == 0) {
                        var minDis = 0;
                    }
                    else {
                        var minDis = this.currentBattlerActor.atkMode == 0 ? 0 : GameBattleAI.getSkillMaxEffectDistance(this.currentBattlerActor.atkSkill);
                    }
                    var nearestGrid = GameBattleHelper.getNearestToTheTarget(moveMapGrids, this.currentEnemy.posGrid, minDis);
                    if (nearestGrid && GameBattleHelper.getGridDistance(nearestGrid, this.currentEnemy.posGrid) < GameBattleHelper.getBattlerDistance(this.currentBattler, this.currentEnemy)) {
                        GameBattleAction.openMoveIndicator(this.currentBattler);
                        this.isInAction = true;
                        var moveToPoint = GameUtils.getGridCenterByGrid(nearestGrid);
                        GameBattleHelper.cursor.setTo(moveToPoint.x, moveToPoint.y)
                        setTimeout(() => {
                            GameBattleAction.startMove(this.currentBattler, nearestGrid.x, nearestGrid.y, Callback.New(() => {
                                SyncTask.taskOver(this.doActionSyncTask);
                                this.doAction();
                            }, this));
                        }, WorldData.actionReflectionTime);
                        return;
                    }
                }
            }
            SyncTask.taskOver(this.doActionSyncTask);
        })
    }
    /**
     * 尝试结束行动
     */
    private static tryActionComplete() {
        new SyncTask(this.doActionSyncTask, () => {
            SyncTask.taskOver(this.doActionSyncTask);
            // 如果没有执行行为的话
            if (!this.isInAction) {
                GameBattleAction.closeCurrentBattlerWindow()
                GameBattlerHandler.setBattlerStandby(this.currentBattler);
                this.onActionComplete.run();
            }
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 播放效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 执行使用技能指令
     * @param skill 
     * @param skillTarget 
     * @return [boolean] 成功使用
     */
    private static doUseSkill(skill: Module_Skill, skillTarget: ProjectClientSceneObject): boolean {
        // 不存在技能或目标的话，使用失败
        if (!skill || !skillTarget) return false;
        // 获取指定作用目标的最佳施放地，可能需要先移动
        var skillCastPlace = this.getSkillCastPlace(skill, skillTarget);
        if (skillCastPlace) {
            // 行动中标记
            this.isInAction = true;
            // -- 当行为结束后恢复控制战斗者
            EventUtils.addEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, () => {
                SyncTask.taskOver(this.doActionSyncTask);
                this.isInAction = false;
                this.doAction();
            }, this, null, true);
            // -- 全体技能直接释放
            if (skill.targetType == 3 || skill.targetType == 4) {
                GameBattleAction.useSkill(this.currentBattler, skill, skillCastPlace.castPoint, skillCastPlace.targets);
                return true;
            }
            // -- 打开技能指示器
            GameBattleAction.openSkillIndicator(this.currentBattler, skill);
            // -- 光标移动后使用技能
            GameBattleAction.cursorMoveToGridPoint(skillCastPlace.castPoint, () => {
                setTimeout(() => {
                    GameBattleAction.useSkill(this.currentBattler, skill, skillCastPlace.castPoint, skillCastPlace.targets);
                }, WorldData.actionReflectionTime);
            });
            return true;
        }
        return false;
    }
    /**
     * 执行使用道具指令
     * @param item 
     */
    private static doUseItem(item: Module_Item) {
        this.isInAction = true;
        // 打开技能指示器
        GameBattleAction.openItemIndicator(this.currentBattler);
        setTimeout(() => {
            // -- 当行为结束后恢复控制战斗者
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(() => {
                SyncTask.taskOver(this.doActionSyncTask);
                this.isInAction = false;
                this.doAction();
            }, this), true);
            // -- 使用道具
            GameBattleAction.useItem(this.currentBattler, this.currentBattler, item);
        }, WorldData.actionReflectionTime);
    }
    /**
     * 执行攻击指令
     */
    private static doAtk() {
        this.isInAction = true;
        GameBattleAction.openAtkIndicator(this.currentBattler);
        setTimeout(() => {
            // -- 当行为结束后恢复控制战斗者
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(() => {
                SyncTask.taskOver(this.doActionSyncTask);
                this.isInAction = false;
                this.doAction();
            }, this), true);
            // -- 攻击
            GameBattleAction.attack(this.currentBattler, this.currentEnemy);
        }, WorldData.actionReflectionTime);
    }
    /**
     * 执行使用有害道具
     */
    private static doUseBarmfulItem(item: Module_Item): void {
        this.isInAction = true;
        // 打开技能指示器
        GameBattleAction.openItemIndicator(this.currentBattler);
        setTimeout(() => {
            // -- 当行为结束后恢复控制战斗者
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(() => {
                SyncTask.taskOver(this.doActionSyncTask);
                this.isInAction = false;
                this.doAction();
            }, this), true);
            // -- 使用道具
            GameBattleAction.useItem(this.currentBattler, this.currentEnemy, item);
        }, WorldData.actionReflectionTime);
    }
    //------------------------------------------------------------------------------------------------------
    // 获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取一个参考敌人：根据主动/被动以及就近或仇恨方式获取目标
     */
    private static getOneEnemy(ignoreEnemys: ProjectClientSceneObject[] = []): ProjectClientSceneObject {
        var actor = this.currentBattler.battlerSetting.battleActor;
        var hateList = this.currentBattler.battlerSetting.hateList;
        // 不行动的情况，不获取目标
        if (actor.aiType == 2) return;
        // 判定获取目标的方式
        var isGetNearEmeny: boolean = false;
        // 主动攻击
        if (actor.aiType == 0) {
            // -- 就近获取或者仇恨获取时仇恨列表为空的话
            if (actor.aiGetTargetMode == 1 || hateList.length == 0) {
                isGetNearEmeny = true;
            }
        }
        // 被动攻击
        else if (actor.aiType == 1) {
            // -- 无仇恨列表的情况
            if (hateList.length == 0) return;
        }
        // 不行动
        else if (actor.aiType == 2) {
            return;
        }
        // 就近
        if (isGetNearEmeny) {
            // -- 如果是警戒方式
            var myGrid = this.currentBattler.posGrid;
            // -- 获取敌对列表
            var enemyList = this.currentBattler.battlerSetting.battleCamp == 1 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            // -- 遍历敌人，找到最近距离的敌人
            var minDistance = Number.MAX_VALUE;
            var minDistanceEnemy: ProjectClientSceneObject = null;
            for (var i = 0; i < enemyList.length; i++) {
                var enemy = enemyList[i];
                // -- 忽略已死亡的目标
                if (enemy.battlerSetting.isDead) continue;
                // -- 忽略在忽略名单中的目标
                if (ignoreEnemys.indexOf(enemy) != -1) continue;
                // -- 获取与目标的距离
                var enemyGrid = enemy.posGrid;
                var distance = Math.abs(enemyGrid.x - myGrid.x) + Math.abs(enemyGrid.y - myGrid.y);
                // -- 存在警戒范围的话忽略距离外的
                if (actor.aiVigilance && distance > actor.aiVigilanceRange) continue;
                if (distance < minDistance) {
                    if (actor.aiVigilance && actor.aiVigilanceRange < distance) continue;
                    minDistance = distance;
                    minDistanceEnemy = enemy;
                }
            }
            return minDistanceEnemy;
        }
        // 仇恨值（被动攻击或根据仇恨方式获取目标）
        else if (actor.aiGetTargetMode == 0 || actor.aiType == 1) {
            // -- 获取最大仇恨值目标（该目标当前必须是敌对关系）
            for (var i = 0; i < hateList.length; i++) {
                var targetIndex = hateList[i].targetIndex;
                var targetSo = Game.currentScene.sceneObjects[targetIndex];
                // -- 忽略在忽略名单中的目标
                if (ignoreEnemys.indexOf(targetSo) != -1) continue;
                return targetSo;
            }
        }
        return null;
    }
    /**
     * 获取一个技能目标，可能为空
     * @param skill 技能
     * @param isHostileSkill 是否作用敌方的技能 
     * @return [ProjectClientSceneObject] 
     */
    private static getSkillTarget(skill: Module_Skill, isHostileSkill: boolean): ProjectClientSceneObject {
        var realTarget: ProjectClientSceneObject;
        var currentBattlerActor = this.currentBattlerActor;
        // 获取目标组
        var targetArr: ProjectClientSceneObject[] = [];
        // -- 如果是针对敌方的技能
        if (isHostileSkill) {
            targetArr = this.currentBattler.battlerSetting.battleCamp == 0 ? GameBattle.enemyBattlers.concat() : GameBattle.playerBattlers.concat();
            // -- 优先让参考敌对目标放到最前方
            ArrayUtils.remove(targetArr, this.currentEnemy);
            targetArr.unshift(this.currentEnemy);
        }
        // -- 如果是作用自己的技能
        else if (skill.targetType == 0) {
            targetArr = [this.currentBattler];
        }
        else {
            targetArr = this.currentBattler.battlerSetting.battleCamp == 1 ? GameBattle.enemyBattlers.concat() : GameBattle.playerBattlers.concat();
        }
        // 剔除掉无法作为技能目标的对象
        for (var i = 0; i < targetArr.length; i++) {
            var target = targetArr[i];
            if (target.battlerSetting.isDead) {
                targetArr.splice(i, 1);
                i--;
                continue;
            }
        }
        // 找不到目标的情况
        if (targetArr.length == 0) return;
        // 附加状态的技能，需要确认目标该状态是否拥有该状态或允许继续叠加
        for (var s = 0; s < skill.addStatus.length; s++) {
            var st = skill.addStatus[s];
            for (var i = 0; i < targetArr.length; i++) {
                realTarget = targetArr[i];
                if (GameBattleHelper.canSuperpositionLayer(realTarget, st)) {
                    return realTarget;
                }
            }
        }
        // 如果存在状态但无法作用到任何目标的话则视为无目标
        if (skill.addStatus.length > 0) {
            return null;
        }
        // 移除状态的技能，需要确认目标是否拥有该状态
        for (var s = 0; s < skill.removeStatus.length; s++) {
            var st = skill.removeStatus[s];
            for (var i = 0; i < targetArr.length; i++) {
                realTarget = targetArr[i];
                if (GameBattleHelper.isIncludeStatus(realTarget, st)) {
                    return realTarget;
                }
            }
        }
        // 如果存在状态但无法作用到任何目标的话则视为无目标
        if (skill.removeStatus.length > 0) {
            return null;
        }
        // 恢复
        if (!isHostileSkill && skill.useDamage) {
            var skillDamage = skill.damageValue;
            // -- 计算技能伤害加成
            if (skill.useAddition) {
                var actorAttributeValue = skill.additionMultipleType == 0 ? currentBattlerActor.ATK : currentBattlerActor.MAG;
                var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                skillDamage += addDamageValue;
            }
            // -- 恢复生命值
            if (skill.damageType == 3) {
                for (var i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    var targetActor = realTarget.battlerSetting.battleActor;
                    if (targetActor.MaxHP - targetActor.hp >= skillDamage || targetActor.hp / targetActor.MaxHP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
            // -- 恢复魔法值
            else if (skill.damageType == 4) {
                for (var i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    var targetActor = realTarget.battlerSetting.battleActor;
                    if (targetActor.MaxSP - targetActor.sp >= skillDamage || targetActor.sp / targetActor.MaxSP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
            else {
                return targetArr[0];
            }
        }
        if (isHostileSkill) {
            return this.currentEnemy;
        }
        else {
            return this.currentBattler;
        }
    }
    /**
     * 获取一个攻击目标
     */
    private static getAtkTarget(): ProjectClientSceneObject {
        // -- 已在最近的距离则直接返回
        if (this.currentEnemy && GameBattleHelper.getBattlerDistance(this.currentBattler, this.currentEnemy) == 1) {
            return this.currentEnemy;
        }
        var ignoreEnemys = [];
        var firstCurrentEnemy = this.currentEnemy;
        // -- 如果对方四周没有空位置的情况则查找下一个敌对目标
        while (this.currentEnemy) {
            var grids = GameBattleHelper.getEffectRange(this.currentEnemy.posGrid, 1);
            if (grids.length == 0) {
                ignoreEnemys.push(this.currentEnemy);
                this.currentEnemy = this.getOneEnemy(ignoreEnemys);
            }
            else {
                break;
            }
        }
        // -- 如果未能获取到任何目标的话回到第一个目标
        if (!this.currentEnemy) {
            this.currentEnemy = firstCurrentEnemy;
        }
        return this.currentEnemy;
    }
    /**
     * 获取指定作用目标的最佳施放地，可能需要先移动
     * -- 预计算所有可能释放的点（含移动过后）的最优解（作用最多的目标）
     *    如果需要移动的话返回null，待移动到指定地点后再重新行动
     * @param skill 技能
     * @param target 目标战斗者
     * @param skillFirstGrid [可选] 默认值=null 
     * @return castPoint=释放点 targets= 
     */
    private static getSkillCastPlace(skill: Module_Skill, target: ProjectClientSceneObject, skillFirstGrid: Point = null): { castPoint: Point, targets: ProjectClientSceneObject[] } {
        // -- 全体技能，直接获取
        if (skill.targetType == 3 || skill.targetType == 4) {
            return { castPoint: this.currentBattler.posGrid, targets: null };
        }
        // -- 获取释放技能者
        var releaseBattler = this.currentBattler;
        // -- 获取作用范围
        var effectRangeGridArr = GameBattleHelper.getSkillEffectRangeGrid(skillFirstGrid ? skillFirstGrid : releaseBattler.posGrid, skill);
        // -- 获取释放范围
        var relaseIndicatorGridArr = GameBattleHelper.getSkillReleaseRangeGrid(skill);
        // -- 获取目标所在位置
        var targetPosGrid = target.posGrid;
        // -- 当前战斗者所在位置能够释放的点集合
        var currentPositionCastArr: { castPoint: Point, targets: ProjectClientSceneObject[] }[] = [];
        // -- 必须指定空地的话则随机选择一个空地格子
        if ((skill.targetType == 5 || skill.targetType == 6) && skill.mustOpenSpace) {
            if (effectRangeGridArr.length > 0) {
                var toGrid = null;
                // -- 接近的情况，则优先找到与目标最近的点
                if (GameBattleHelper.isFriendlyRelationship(this.currentBattler, target)) {
                    toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid);
                }
                // -- 敌对关系，根据移动类型接近或远离目标
                else {
                    if (this.currentBattlerActor.moveType == 0) {
                        toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid);
                    }
                    else {
                        var minDis = this.currentBattlerActor.atkMode == 0 ? 0 : GameBattleAI.getSkillMaxEffectDistance(this.currentBattlerActor.atkSkill);
                        toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid, minDis);
                    }
                }
                if (toGrid) return { castPoint: toGrid, targets: null };
                else return null;
            }
            else {
                return;
            }
        }
        // -- 遍历目标所在位置周围允许技能释放的点
        for (var i = 0; i < relaseIndicatorGridArr.length; i++) {
            var localGrid = relaseIndicatorGridArr[i];
            var needReleaseMapGrid = new Point(targetPosGrid.x - localGrid.x, targetPosGrid.y - localGrid.y);
            // -- 如果该释放点已经在技能作用范围内
            var inEffectRangeGrid: Point = ArrayUtils.matchAttributes(effectRangeGridArr, { x: needReleaseMapGrid.x, y: needReleaseMapGrid.y }, true)[0];
            if (inEffectRangeGrid) {
                var targets = [];
                // -- 获取该释放点能够作用到的所有目标集合
                for (var s = 0; s < relaseIndicatorGridArr.length; s++) {
                    var localGrid2 = relaseIndicatorGridArr[s];
                    var releaseRangeGrid = new Point(needReleaseMapGrid.x + localGrid2.x, needReleaseMapGrid.y + localGrid2.y);
                    var releaseRangeGridBattler = GameBattleHelper.getNoDeadBattlerByGrid(releaseRangeGrid);
                    if (releaseRangeGridBattler == target || GameBattleHelper.isFriendlyRelationship(releaseRangeGridBattler, target)) {
                        targets.push(releaseRangeGridBattler);
                    }
                }
                currentPositionCastArr.push({ castPoint: inEffectRangeGrid, targets: targets });
            }
        }
        // 当前位置上的最优解
        var currentPositionBestCastPoint = getBestCastPoint(currentPositionCastArr);
        // 如果可以移动的话预先计算移动后的最优解
        if (!skillFirstGrid && GameBattleHelper.canMove(this.currentBattler)) {
            var moveMapGrids = GameBattleHelper.getEffectRange(this.currentBattler.posGrid, this.currentBattler.battlerSetting.battleActor.MoveGrid);
            var preResArr: { castPoint: Point, targets: ProjectClientSceneObject[], moveMapGrid: Point }[] = [];
            for (var s = 0; s < moveMapGrids.length; s++) {
                var moveMapGrid = moveMapGrids[s];
                var preRes: any = this.getSkillCastPlace(skill, target, moveMapGrid);
                if (preRes && preRes.moveMapGrid && preRes.moveMapGrid.x == releaseBattler.posGrid.x && preRes.moveMapGrid.y == releaseBattler.posGrid.y) {
                    preRes.moveMapGrid = moveMapGrid;
                    preResArr.push(preRes);
                }
            }
            if (preResArr.length > 0) {
                var needMoveBestCastPoint = getBestCastPoint(preResArr);
                this.referenceMoveGrids.push(needMoveBestCastPoint.moveMapGrid);
                // 如果目标是敌对关系则锁定一次该敌对目标，移动后不需要重新获取目标了
                if (GameBattleHelper.isHostileRelationship(this.currentBattler, target)) {
                    this.lockOnceEnemy = target;
                }
                // 如果该方案比当前位置上的最优解更好的话则放弃此次结算，让角色以参考点进行移动
                if (currentPositionBestCastPoint && currentPositionBestCastPoint.targets.length < needMoveBestCastPoint.targets.length) {
                    currentPositionBestCastPoint = null;
                }
            }
        }
        // 内部方法：获取最大性价比的施放地点
        function getBestCastPoint(castPointArr: { castPoint: Point, targets: ProjectClientSceneObject[] }[]) {
            var len = castPointArr.length;
            var maxTargetLength = 0;
            var castPointInfo: any = null;
            for (var i = 0; i < len; i++) {
                var targetLength = castPointArr[i].targets.length;
                if (maxTargetLength < targetLength) {
                    maxTargetLength = targetLength;
                    castPointInfo = castPointArr[i];
                }
            }
            return castPointInfo;
        }
        return currentPositionBestCastPoint;
    }
    /**
     * 获取技能的最大作用距离范围
     */
    static getSkillMaxEffectDistance(skill: Module_Skill): number {
        if (skill.targetType == 0) return 0;
        if (skill.targetType == 3 || skill.targetType == 4) return 5;
        if (skill.effectRangeType == 0) return skill.effectRange1;
        if (skill.effectRangeType == 1) return skill.effectRange2B;
        return 0;
    }

}