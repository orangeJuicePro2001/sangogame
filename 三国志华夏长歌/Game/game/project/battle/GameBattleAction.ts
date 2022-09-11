/**
 * 战斗行为
 * Created by 黑暗之神KDS on 2021-01-16 02:10:21.
 */
class GameBattleAction {
    //------------------------------------------------------------------------------------------------------
    // 事件
    //------------------------------------------------------------------------------------------------------
    /**
     * 事件：当一次行为结束时派发的事件 onOnceActionComplete();
     */
    static EVENT_ONCE_ACTION_COMPLETE: string = "GameBattleActionEVENT_AFTER_ONCE_ACTION";
    //------------------------------------------------------------------------------------------------------
    // 变量
    //------------------------------------------------------------------------------------------------------
    /**
     * 战斗者作用范围格子数据
     */
    static battlerEffectIndicatorGridArr: Point[];
    /**
     * 战斗者释放范围格子数据（相对于0,0点）
     */
    static battlerRelaseIndicatorGridArr: Point[];
    /**
     * 当前行为的战斗者
     */
    static fromBattler: ProjectClientSceneObject;
    /**
     * 当前行为的战斗者使用的技能
     */
    static fromBattlerSkill: Module_Skill;
    /**
     * 当前行为的战斗者施放的地点
     */
    static fromBattlerSkillGridPos: Point;
    /**
     * 当前行为的战斗者使用的道具
     */
    static fromBattlerItem: Module_Item;
    /**
     * 当前的行为  0-普通攻击 1-使用技能 2-使用道具
     */
    static currentActionType: number;
    /**
     * 战斗者作用范围格子集
     */
    private static battlerEffectGridAniArr: GCAnimation[] = [];
    /**
     * 战斗者作用范围格子-额外集合（如显示可能的攻击范围）
     */
    private static battlerEffectExtGridAniArr: GCAnimation[] = [];
    /**
     * 战斗者释放范围格子集
     */
    private static battlerEffectReleaseGridAniArr: GCAnimation[] = [];
    /**
     * 开启释放范围
     */
    private static _openReleaseGridCursor: boolean;
    /**
     * 当前作用目标数
     */
    private static currentHitTarget: number;
    /**
     * 作用目标的总数
     */
    private static totalHitTarget: number;
    /**
     * 当前作用次数
     */
    private static currentHitTimes: number;
    /**
     * 作用次数
     */
    private static totalHitTimes: number;
    /**
     * 显示目标窗口
     */
    private static showTargetBattleBriefWindow = false;
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
        EventUtils.clear(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE);
    }
    //------------------------------------------------------------------------------------------------------
    // 镜头和光标
    //------------------------------------------------------------------------------------------------------
    /**
     * 镜头锁定战斗者
     * @param battler 战斗者
     * @return useTweenTime=是否需要使用镜头缓动镜头时间 cameraLockChange=是否需要锁定光标的镜头
     */
    static cameraMoveToBattler(battler: ProjectClientSceneObject): { useTweenTime: boolean; cameraLockChange: boolean; } {
        // 是否使用缓动镜头效果：镜头锁定光标时，光标位置不在该战斗者上或镜头未能锁定光标时
        var cursor = GameBattleHelper.cursor;
        // 获取当前镜头位置
        var cameraPos = Game.currentScene.camera.sceneObject ? new Point(Game.currentScene.camera.sceneObject.x, Game.currentScene.camera.sceneObject.y) : new Point(Game.currentScene.camera.viewPort.x, Game.currentScene.camera.viewPort.y);
        // 是否需要使用镜头缓动镜头时间
        var useTweenTime = cameraPos.x != battler.x || cameraPos.y != battler.y;
        // 是否需要锁定光标的镜头
        var cameraLockChange = Game.currentScene.camera.sceneObject != cursor;
        // 只要需要镜头缓动时间的的，则先让镜头停止在当前，并移动光标
        if (useTweenTime) {
            Game.currentScene.camera.sceneObject = null;
            cursor.setTo(battler.x, battler.y);
        }
        // 如果需要锁定镜头为光标的话或需要缓动时间移动镜头的话则
        if (useTweenTime || cameraLockChange) GameFunction.cameraMove(1, 0, 0, cursor.index, true, useTweenTime ? WorldData.cameraTweenFrame : 1);
        return { useTweenTime: useTweenTime, cameraLockChange: cameraLockChange };
    }
    /**
     * 光标移动至指定位置上
     * @param x 相对于场景的像素坐标X
     * @param y 相对于场景的像素坐标Y
     * @param onFin 
     */
    static cursorMoveTo(x: number, y: number, onFin: Function): void {
        var pos = GameBattleHelper.cursor.pos;
        if (x == pos.x && y == pos.y) {
            onFin.apply(this);
        }
        else {
            // 使用四方向计算寻路
            var realLineArr = AstarUtils.moveTo(pos.x, pos.y, x, y, Game.currentScene.gridWidth, Game.currentScene.gridHeight, Game.currentScene, true, true, true);
            GameBattleHelper.cursor.once(ProjectClientSceneObject.MOVE_OVER, this, onFin);
            GameBattleHelper.cursor.startMove(realLineArr, 0);
        }
    }
    /**
     * 光标移动至指定位置上-格子坐标版本
     * @param grid 相对于场景的格子坐标
     * @param onFin 完成时回调
     */
    static cursorMoveToGridPoint(grid: Point, onFin: Function): void {
        var castPoint = GameUtils.getGridCenterByGrid(grid);
        this.cursorMoveTo(castPoint.x, castPoint.y, onFin);
    }
    /**
     * 光标跳跃
     * @param grid 相对于场景的格子坐标
     */
    static cursorJumpToGridPoint(grid: Point): void {
        var realPoint = GameUtils.getGridCenterByGrid(grid);
        Game.currentScene.sceneUtils.limitInside(realPoint, true);
        var cursor = GameBattleHelper.cursor;
        cursor.setTo(realPoint.x, realPoint.y);
    }
    //------------------------------------------------------------------------------------------------------
    // 界面
    //------------------------------------------------------------------------------------------------------
    /**
     * 显示当前战斗者的界面
     * @param battler 当前战斗者 
     */
    static showCurrentBattlerWindow(battler: ProjectClientSceneObject): void {
        GameCommand.startCommonCommand(15027, [], null, battler, battler);
    }
    /**
     * 显示目标战斗者的界面
     * @param battler 目标战斗者
     */
    static showTargetBattlerWindow(battler: ProjectClientSceneObject): void {
        GameCommand.startCommonCommand(15030, [], null, battler, battler);
    }
    /**
     * 关闭当前战斗者的界面
     */
    static closeCurrentBattlerWindow(): void {
        GameCommand.startCommonCommand(15028, [], null, GameBattleHelper.cursor, GameBattleHelper.cursor);
    }
    /**
     * 关闭目标战斗者的界面
     */
    static closeTargetBattlerWindow(): void {
        GameCommand.startCommonCommand(15031, [], null, GameBattleHelper.cursor, GameBattleHelper.cursor);
    }
    //------------------------------------------------------------------------------------------------------
    // 战斗者：行为
    //------------------------------------------------------------------------------------------------------
    /**
     * 开始移动
     * @param battler 战斗者
     * @param toGridX 格子坐标X
     * @param toGridY 格子坐标Y
     * @param onComplete [可选] 默认值=null 当移动完成时回调
     * @param cameraLockBattler [可选] 默认值=true 镜头是否锁定战斗者
     * 
     */
    static startMove(battler: ProjectClientSceneObject, toGridX: number, toGridY: number, onComplete: Callback = null, cameraLockBattler: boolean = true) {
        // 快速播放演出时移动加速
        if (GameBattle.fastPlayMode && battler.battlerSetting.battleCamp == 1) {
            battler["__recordMoveSpeed"] = battler.moveSpeed;
            battler.moveSpeed = 800;
        }
        // 记录当前行为的战斗者
        this.fromBattler = battler;
        // 关闭移动指示器
        GameBattleAction.closeMoveIndicator();
        // 镜头锁定移动的角色
        if (cameraLockBattler) GameFunction.cameraMove(1, 0, 0, battler.index, true, WorldData.cameraTweenFrame);
        else Game.currentScene.camera.sceneObject = null;
        setFrameout(() => {
            // 获取移动范围
            var range = battler.battlerSetting.battleActor.MoveGrid;
            // 获取战斗者周围的range步数的地图格子数据
            var battlerThroughGridMap = GameBattleHelper.getDestinationThroughGridMap(battler.posGrid, range);
            // 移动：优化计算，只计算以战斗者为中心range+1范围内的移动路径
            var firstGrid = battler.posGrid;
            toGridX = toGridX - firstGrid.x + range;
            toGridY = toGridY - firstGrid.y + range;
            var realLineArr = AstarUtils.routeGrid(range, range, toGridX, toGridY, range, battlerThroughGridMap.throughGridMap, new Point(firstGrid.x - range, firstGrid.y - range), true, true, true);
            battler.startMove(realLineArr, 0, true, Callback.New(() => {
                if (battler["__recordMoveSpeed"]) {
                    battler.moveSpeed = battler["__recordMoveSpeed"];
                    battler["__recordMoveSpeed"] = null;
                }
                onComplete.run();
            }, this));
            // 更改已移动过的标识
            battler.battlerSetting.moved = true;
        }, Math.floor(WorldData.cameraTweenFrame * 0.5));
    }
    /**
     * 普通攻击
     * 播放攻击动作，直接击中目标，无弹道效果
     * @param fromBattler 攻击者
     * @param targetBattler 目标
     */
    static attack(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject): void {
        this.currentActionType = 0;
        // 记录当前行为的战斗者
        this.fromBattler = fromBattler;
        // 等待一次击中算作完成行为
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        // 关闭指示器
        GameBattleAction.closeBattleIndicator();
        // 消耗行动力
        fromBattler.battlerSetting.actioned = true;
        // 显示当前攻击者和目标的界面
        this.showTargetBattleBriefWindow = true;
        this.showCurrentBattlerWindow(fromBattler);
        this.showTargetBattlerWindow(targetBattler);
        // 未被击中的标识
        targetBattler.battlerSetting.hitBy = false;
        // 攻击
        var doAttack = () => {
            // 战场判定处理
            GameBattle.battlerfieldDetermineHandle(() => {
                // 如果已经被击中过或死亡则跳过此次战斗行为（比如事件中制作了战斗演出等事件）
                if (targetBattler.battlerSetting.hitBy || targetBattler.battlerSetting.isDead) {
                    this.actionComplete(true, true);
                    return;
                }
                GameBattlerHandler.releaseAction(fromBattler, 3, fromBattler.battlerSetting.battleActor.hitFrame, 1, () => {
                    this.hitTarget(fromBattler, targetBattler, 0);
                });
            });
        }
        // 执行片段事件-战斗过程：普通攻击
        GameCommand.startCommonCommand(14035, [], Callback.New(doAttack, this), fromBattler, targetBattler);
    }
    /**
     * 使用技能
     * @param fromBattler 技能使用者
     * @param skill 技能
     * @param gridPos 施放格子坐标点
     * @param targets [可选] 默认值=null 作用的目标集合（如没有则会动态计算）
     * @param firstUse [可选] 默认值=true 是否首次使用，否则视为连击
     */
    static useSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, gridPos: Point, targets: ProjectClientSceneObject[] = null, firstUse: boolean = true) {
        this.currentActionType = 1;
        // 记录当前行为的战斗者
        this.fromBattler = fromBattler;
        this.fromBattlerSkill = skill;
        this.fromBattlerSkillGridPos = gridPos;
        // 如果不存在目标的话，获取目标
        if (!targets) {
            var targetRes = GameBattleHelper.getSkillTargetOnGrid(fromBattler, skill, gridPos);
            if (!targetRes || !targetRes.allow) {
                this.actionComplete(true, true);
                return;
            }
            targets = targetRes.targets;
        }
        // 显示当前攻击者和目标的界面
        this.showCurrentBattlerWindow(fromBattler);
        var onlyOneTarget: ProjectClientSceneObject = null;
        if (targets.length == 1) {
            onlyOneTarget = targets[0];
            this.showTargetBattleBriefWindow = true;
            this.showTargetBattlerWindow(onlyOneTarget);
            // 未被击中的标识
            onlyOneTarget.battlerSetting.hitBy = false;
        }
        else {
            this.showTargetBattleBriefWindow = false;
        }
        if (firstUse) {
            // 关闭指示器
            GameBattleAction.closeBattleIndicator();
            // 技能消耗
            fromBattler.battlerSetting.battleActor.sp -= skill.costSP;
            // 技能冷却计时
            skill.currentCD = skill.totalCD;
            // 消耗行动力
            if (skill.costActionPower) fromBattler.battlerSetting.actioned = true;
        }
        // 使用技能
        var doUseSkill = () => {
            // 战场判定处理
            GameBattle.battlerfieldDetermineHandle(() => {
                // 如果仅有一个目标且已经被击中过或死亡则跳过此次战斗行为（比如事件中制作了战斗演出等事件）
                if (onlyOneTarget && (onlyOneTarget.battlerSetting.hitBy || onlyOneTarget.battlerSetting.isDead)) {
                    this.actionComplete(true, true);
                    return;
                }
                // 存在释放动作的话：播放攻击释放后进入下一个阶段
                GameBattlerHandler.releaseAction(fromBattler, skill.releaseActionID, skill.releaseFrame, 1, () => {
                    this.releaseSkill(fromBattler, skill, gridPos, targets, firstUse);
                });
                // 播放释放动画
                if (skill.releaseAnimation) {
                    fromBattler.playAnimation(skill.releaseAnimation, false, true);
                }
            });
        };
        if (firstUse) {
            // 执行技能的独有事件
            var doCallSkillEvent = () => {
                // 战场判定处理
                GameBattle.battlerfieldDetermineHandle(() => {
                    // 如果仅有一个目标且已经被击中过或死亡则跳过此次战斗行为（比如事件中制作了战斗演出等事件）
                    if (onlyOneTarget && (onlyOneTarget.battlerSetting.hitBy || onlyOneTarget.battlerSetting.isDead)) {
                        this.actionComplete(true, true);
                        return;
                    }
                    if (skill.releaseEvent) CommandPage.startTriggerFragmentEvent(skill.releaseEvent, fromBattler, onlyOneTarget ? onlyOneTarget : fromBattler, Callback.New(doUseSkill, this));
                    else doUseSkill.apply(this);
                });
            }
            // 执行片段事件-战斗过程：使用技能
            GameCommand.startCommonCommand(14036, [], Callback.New(doCallSkillEvent, this), fromBattler, onlyOneTarget ? onlyOneTarget : fromBattler);
        }
        else {
            doUseSkill.apply(this);
        }
    }
    /**
     * 使用道具
     * @param fromBattler 来源战斗者
     * @param item 道具
     */
    static useItem(fromBattler: ProjectClientSceneObject, toBattler: ProjectClientSceneObject, item: Module_Item): void {
        this.currentActionType = 3;
        // 记录当前行为的战斗者
        this.fromBattler = fromBattler;
        this.fromBattlerItem = item;
        // 等待一次击中算作完成行为
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        // 未被击中的标识
        fromBattler.battlerSetting.hitBy = false;
        // 显示当前攻击者和目标的界面
        this.showTargetBattleBriefWindow = true;
        this.showCurrentBattlerWindow(fromBattler);
        this.showTargetBattlerWindow(toBattler);
        // 关闭指示器
        GameBattleAction.closeBattleIndicator();
        // 消耗品的话则移除掉它
        if (item.isConsumables) {
            var itemIndex = fromBattler.battlerSetting.battleActor.items.indexOf(item);
            Game.unActorItemByItemIndex(fromBattler.battlerSetting.battleActor, itemIndex);
        }
        // 消耗行动力
        if (item.costActionPower) fromBattler.battlerSetting.actioned = true;
        // 使用道具
        var doUseItem = () => {
            // 战场判定处理
            GameBattle.battlerfieldDetermineHandle(() => {
                // 如果已经被击中过或死亡则跳过此次战斗行为（比如事件中制作了战斗演出等事件）
                if ((fromBattler.battlerSetting.hitBy || fromBattler.battlerSetting.isDead)) {
                    this.actionComplete(true, true);
                    return;
                }
                // 存在释放动作的话：播放释放动作后进入下一个阶段
                var hasUseItemAction = fromBattler.avatar.hasActionID(WorldData.useItemActID);
                if (hasUseItemAction) {
                    // 监听当动作播放完毕时，恢复待机动作
                    fromBattler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, () => {
                        if (!fromBattler.battlerSetting.isDead && fromBattler.battlerSetting.battleActor.hp != 0) fromBattler.avatar.actionID = 1;
                    });
                    // 切换至释放动作，从第6帧开始播放
                    fromBattler.avatar.currentFrame = 1;
                    fromBattler.avatar.actionID = WorldData.useItemActID;
                }
                this.hitTarget(fromBattler, toBattler, 2, null, item);
            });
        }
        // 执行片段事件-战斗过程：使用道具
        GameCommand.startCommonCommand(14037, [], Callback.New(doUseItem, this), fromBattler, toBattler);
    }
    //------------------------------------------------------------------------------------------------------
    // 结算阶段
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否需要结算战斗者状态
     */
    static isNeedCalcBattlersStatus(): boolean {
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            if (battler.battlerSetting.isDead) continue;
            var battlerActor = battler.battlerSetting.battleActor;
            for (var s = 0; s < battlerActor.status.length; s++) {
                var status = battlerActor.status[s];
                if (!status.overtime) continue;
                return true;
            }
        }
        return false;
    }
    /**
     * 结算战斗者状态
     * @param onFin 完成时回调 
     */
    static calcBattlersStatus(onFin: Callback): void {
        // 使用同步任务，每个任务逐一完成后才能进行回调
        var taskName = "playStatusAnimation";
        SyncTask.clear(taskName);
        // 遍历每个角色开始显示DOT/HOT
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            if (battler.battlerSetting.isDead) continue;
            var battlerActor = battler.battlerSetting.battleActor;
            for (var s = 0; s < battlerActor.status.length; s++) {
                var status = battlerActor.status[s];
                if (!status.overtime) continue;
                new SyncTask(taskName, (battler: ProjectClientSceneObject, status: Module_Status) => {
                    this.hitByStatus(battler, status, Callback.New(() => {
                        SyncTask.taskOver(taskName);
                    }, this));
                }, [battler, status]);
            }
        }
        new SyncTask(taskName, () => {
            // -- 计算击杀奖励
            GameBattlerHandler.calcHitReward(this.fromBattler, Callback.New(() => {
                onFin.run();
                SyncTask.taskOver(taskName);
            }, this));
        });
    }
    //------------------------------------------------------------------------------------------------------
    // 内部行为流程实现
    //------------------------------------------------------------------------------------------------------
    /**
     * 释放技能
     * @param fromBattler 来源战斗者
     * @param skill 施放的技能
     * @param gridPos 施放的格子坐标
     * @param targets 包含的目标集
     */
    private static releaseSkill(fromBattler: ProjectClientSceneObject, skill: Module_Skill, gridPos: Point, targets: ProjectClientSceneObject[], firstUse: boolean) {
        // 等待一次击中算作完成行为
        this.currentHitTarget = 0;
        this.totalHitTarget = targets.length;
        // 首次时初始化连击次数
        if (firstUse) {
            this.currentHitTimes = 0;
            this.totalHitTimes = skill.releaseTimes;
        }
        // 是否击中地面
        var isHitGround = skill.targetType >= 5 && skill.targetType <= 6;
        // 直接
        if (skill.skillType == 0) {
            // 击中地面的情况
            if (isHitGround) {
                this.hitGround(fromBattler, skill, gridPos, targets);
            }
            // 目标
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.hitTarget(fromBattler, targets[i], 1, skill);
                }
            }
        }
        // 弹幕
        else if (skill.skillType == 1) {
            // 击中地面的情况
            if (isHitGround) {
                this.releaseBullet(fromBattler, skill, gridPos, null, targets);
            }
            // 目标
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.releaseBullet(fromBattler, skill, gridPos, targets[i], targets);
                }
            }
        }
    }
    /**
     * 发射子弹
     * @param skill 技能
     * @param posGrid 目的地所在格子位置
     * @param targetBattler 战斗者
     */
    private static releaseBullet(fromBattler: ProjectClientSceneObject, skill: Module_Skill, gridPos: Point, targetBattler: ProjectClientSceneObject = null, targets: ProjectClientSceneObject[]) {
        // 是否击中地面
        var isHitGround = skill.targetType >= 5 && skill.targetType <= 6;
        // 创建子弹动画
        var bullet = new GCAnimation();
        bullet.id = skill.bulletAnimation;
        bullet.loop = true;
        bullet.play();
        Game.currentScene.animationHighLayer.addChild(bullet);
        // 子弹起始位置
        var startPoint = new Point(fromBattler.pos.x, fromBattler.pos.y);
        // 子弹位置修正，根据起始点与目的地的角度
        var destinationPoint = targetBattler ? targetBattler.pos : new Point(gridPos.x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5, gridPos.y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5);
        var angle = MathUtils.direction360(destinationPoint.x, destinationPoint.y, startPoint.x, startPoint.y);
        var dx = Math.sin(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        var dy = Math.cos(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2 - Config.SCENE_GRID_SIZE / 2;
        startPoint.x += -dx;
        startPoint.y += dy;
        // 计算距离和需要的帧数
        var dis = Point.distance(startPoint, destinationPoint);
        var totalFrame = Math.max(Math.ceil(dis / skill.bulletSpeed * 60), 1);
        var currentFrame = 1;
        bullet.x = startPoint.x;
        bullet.y = startPoint.y;
        // 子弹面向
        var rotation = MathUtils.direction360(startPoint.x, startPoint.y, destinationPoint.x, destinationPoint.y);
        bullet.rotation = rotation;
        os.add_ENTERFRAME(() => {
            // 刷新子弹当前位置
            var per = currentFrame / totalFrame;
            bullet.x = (destinationPoint.x - startPoint.x) * per + startPoint.x;
            bullet.y = (destinationPoint.y - startPoint.y) * per + startPoint.y;
            // 推进1帧，当击中目标时进入下一阶段
            currentFrame++;
            if (currentFrame > totalFrame) {
                // 清除帧刷
                //@ts-ignore
                os.remove_ENTERFRAME(arguments.callee, this);
                // 清除子弹
                bullet.dispose();
                // 到下一个阶段
                if (isHitGround || !targetBattler) this.hitGround(fromBattler, skill, gridPos, targets);
                else this.hitTarget(fromBattler, targetBattler, 1, skill);
            }
        }, this);
    }
    /**
     * 击中地面
     * @param fromBattler 来源战斗者
     * @param skill 技能
     * @param gridPos 目的地所在格子位置
     * @param targets 击中的目标战斗者集合
     */
    private static hitGround(fromBattler: ProjectClientSceneObject, skill: Module_Skill, gridPos: Point, targets: ProjectClientSceneObject[]): void {
        // 击中后处理
        var afterHitOpenSpace = () => {
            // 如果命中目标则进入命中目标的阶段
            if (targets.length > 0) {
                for (var i = 0; i < targets.length; i++) {
                    this.hitTarget(fromBattler, targets[i], 1, skill);
                }
            }
            // 此次行为结束
            else {
                this.actionComplete(true);
            }
        }
        // 击中地面
        var doHitOpenSpace = () => {
            // 战场判定处理
            GameBattle.battlerfieldDetermineHandle(() => {
                var hitAniID = skill.targetGridAnimation;
                // 存在击中动画：显示击中动画
                if (hitAniID) {
                    // 已进入伤害显示阶段标识
                    var alreadyActionComplete = false;
                    // 播放击中动画
                    var hitAni = new GCAnimation();
                    hitAni.id = hitAniID;
                    if (skill.targetGridAniLayer == 0) Game.currentScene.animationLowLayer.addChild(hitAni);
                    else Game.currentScene.animationHighLayer.addChild(hitAni);
                    var posCenter = GameUtils.getGridCenterByGrid(gridPos);
                    hitAni.x = posCenter.x;
                    hitAni.y = posCenter.y;
                    hitAni.play();
                    hitAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                        if (!alreadyActionComplete) afterHitOpenSpace.apply(this);
                        hitAni.dispose();
                    });
                    // 监听动画抛出的信号，以便提前进入显示伤害阶段
                    hitAni.once(GCAnimation.SIGNAL, this, (signalID: number) => {
                        if (signalID == 1) {
                            alreadyActionComplete = true;
                            afterHitOpenSpace.apply(this);
                        }
                    });
                }
                // 不存在时：直接进入下一个阶段
                else {
                    afterHitOpenSpace.apply(this);
                }
            });
        };
        // 执行片段事件：击中地面的事件，执行完毕后再继续击中地面
        if (skill.mustOpenSpace && skill.hitOpenSpaceEvent) CommandPage.startTriggerFragmentEvent(skill.hitOpenSpaceEvent, fromBattler, GameBattleHelper.cursor, Callback.New(doHitOpenSpace, this));
        else doHitOpenSpace.apply(this);
    }
    /**
     * 击中目标：攻击、技能、道具、状态
     * -- 计算命中率
     * -- 播放击中动画
     * -- 调用击中片段事件
     * -- 进入伤害结算
     * @param fromBattler 来源战斗者
     * @param targetBattler 目标战斗者
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 使用的技能
     * @param item [可选] 默认值=null 使用的道具
     * @param status [可选] 默认值=null 使用的状态（DOT/HOT跳伤害）
     */
    private static hitTarget(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): void {
        // 获取战斗者的角色数据
        var fromActor = fromBattler.battlerSetting.battleActor;
        var battleActor = targetBattler.battlerSetting.battleActor;
        // 是否命中标识，根据对应行为计算命中率
        var isHitSuccess = true;
        // 击中动画
        var hitAniID = 0;
        // 是否显示目标受伤动作
        var showTargetHurtAnimation = false;
        // 普通攻击：(攻击者命中率 - 目标躲避率)%
        if (actionType == 0) {
            isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            hitAniID = fromBattler.battlerSetting.battleActor.hitAnimation;
            showTargetHurtAnimation = true;
        }
        // 使用技能：(技能命中率)%
        else if (actionType == 1) {
            if (skill == fromBattler.battlerSetting.battleActor.atkSkill) {
                isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            }
            else {
                isHitSuccess = MathUtils.rand(100) < skill.hit;
            }
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = GameBattleHelper.isHostileRelationship(fromBattler, targetBattler);
        }
        // 使用道具：100%
        else if (actionType == 2) {
            isHitSuccess = true;
            hitAniID = item.releaseAnimation;
        }
        // 状态:DOT/HOT
        else if (actionType == 3) {
            showTargetHurtAnimation = false;
        }
        // 内部函数
        var callNextStep = () => {
            // -- 已经结束战斗的情况
            if (GameBattle.state == 0 || GameBattle.state == 3 || targetBattler.battlerSetting.isDead) {
                this.actionComplete();
            }
            else {
                this.hitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
            }
        }
        var callHitEvent = () => {
            // 执行片段事件-战斗过程：击中事件
            if (actionType == 1 && isHitSuccess && skill.hitEvent) CommandPage.startTriggerFragmentEvent(skill.hitEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else if (actionType == 2 && item.callEvent) CommandPage.startTriggerFragmentEvent(item.callEvent, fromBattler, targetBattler, Callback.New(callNextStep, this));
            else callNextStep.apply(this);
        }
        // 存在击中动画：显示击中动画
        if (hitAniID) {
            // 已进入伤害显示阶段标识
            var alreadyInShowDamageStage = false;
            // 命中的话显示受伤动作和动画
            if (isHitSuccess && showTargetHurtAnimation) {
                // -- 受伤动作
                if (targetBattler.avatar.hasActionID(9)) {
                    targetBattler.avatar.actionID = 9;
                    targetBattler.avatar.currentFrame = 1;
                }
                // -- 受伤动画
                if (WorldData.hurtAni) targetBattler.playAnimation(WorldData.hurtAni, true, true);
            }
            // 播放击中动画
            var hitAni = targetBattler.playAnimation(hitAniID, false, isHitSuccess);
            hitAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                if (!alreadyInShowDamageStage) callHitEvent.apply(this);
            });
            // 监听提前进入显示伤害阶段
            hitAni.once(GCAnimation.SIGNAL, this, (signalID: number) => {
                if (signalID == 1) {
                    alreadyInShowDamageStage = true;
                    callHitEvent.apply(this);
                }
            });
        }
        // 不存在时：直接进入下一个阶段
        else {
            callHitEvent.apply(this);
        }
    }
    /**
     * 计算击中后的效果
     * -- 状态变更
     * -- 计算伤害
     * -- 计算仇恨
     * -- 死亡判定
     * @param fromBattler 
     * @param targetBattler 
     * @param isHitSuccess 
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 
     * @param item [可选] 默认值=null 
     * @param status [可选] 默认值=null 
     * @param playEffect [可选] 默认值=true 播放效果 
     */
    private static hitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): void {
        // 等待播放效果播放完毕后算作「行动完成」
        var animationCount = 2;
        var onAnimationCompleteCallback = Callback.New(() => {
            animationCount--;
            if (animationCount == 0) {
                this.actionComplete();
            }
        }, this);
        // 计算击中结果
        var res = GameBattleHelper.calculationHitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status)
        if (res) {
            animationCount++;
            this.showDamage(targetBattler, res.damageType, res.damage, res.isCrit, onAnimationCompleteCallback);
        }
        // 停止受伤动画
        if (WorldData.hurtAni) targetBattler.stopAnimation(WorldData.hurtAni);
        // 恢复待机动作
        if (!targetBattler.battlerSetting.isDead) targetBattler.avatar.actionID = 1;
        // 检查来源者和目标是否死亡
        GameBattle.checkBattlerIsDead(fromBattler, () => {
            if (fromBattler.battlerSetting.isDead) this.showCurrentBattlerWindow(fromBattler);
            onAnimationCompleteCallback.run();
        });
        GameBattle.checkBattlerIsDead(targetBattler, () => {
            if (this.showTargetBattleBriefWindow && targetBattler.battlerSetting.isDead) this.showTargetBattlerWindow(targetBattler);
            onAnimationCompleteCallback.run();
        });
        // -- 刷新头像信息
        this.showCurrentBattlerWindow(fromBattler);
        if (this.showTargetBattleBriefWindow) {
            this.showTargetBattlerWindow(targetBattler);
        }
    }
    /**
     * 行为结束:派发战斗行为阶段事件
     * 检查多目标完毕和连击完毕
     */
    private static actionComplete(skipHitMultipleTarget: boolean = false, skipHitTimes: boolean = false): void {
        if (!skipHitMultipleTarget) this.currentHitTarget++;
        // 多目标全部完毕时
        if (skipHitMultipleTarget || this.currentHitTarget == this.totalHitTarget) {
            // 战场判定处理
            GameBattle.battlerfieldDetermineHandle(() => {
                this.currentHitTimes++;
                // 多连击完毕时
                if (GameBattleHelper.isBattler(this.fromBattler) && !this.fromBattler.battlerSetting.isDead &&
                    !skipHitTimes && this.currentHitTimes != this.totalHitTimes) {
                    this.useSkill(this.fromBattler, this.fromBattlerSkill, this.fromBattlerSkillGridPos, null, false);
                    return;
                }
                // 结算奖励后派发行动完成事件
                GameBattlerHandler.calcHitReward(this.fromBattler, Callback.New(() => {
                    EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE);
                }, this));
            });
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 内部实现：结算阶段
    //------------------------------------------------------------------------------------------------------
    /**
     * 来自状态的击中
     * @param battler 战斗者
     * @param status 状态
     * @param onFin 当完成时回调
     */
    private static hitByStatus(battler: ProjectClientSceneObject, status: Module_Status, onFin: Callback): void {
        this.cameraMoveToBattler(battler);
        // 这里需要播放N次DOT/HOT，而不是目前的一次性全部显示。
        EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, onFin, true);
        // 等待一次击中算作完成行为
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        // 获取来源者
        var fromBattler = Game.currentScene.sceneObjects[status.fromBattlerID];
        // 记录当前行为的战斗者
        this.fromBattler = fromBattler;
        if (!GameBattleHelper.isBattler(fromBattler)) fromBattler = battler;
        this.hitTarget(fromBattler, battler, 3, null, null, status);
    }
    //------------------------------------------------------------------------------------------------------
    // 其他演出效果显示
    //------------------------------------------------------------------------------------------------------
    /**
     * 显示伤害
     * @param targetBattler 目标战斗者
     * @param damageType  -2-无 -1-Miss 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值
     * @param damage [可选] 默认值=0 伤害
     * @param isCrit [可选] 默认值=false 是否暴击
     * @param onFin [可选] 默认值=null 回调
     */
    static showDamage(targetBattler: ProjectClientSceneObject, damageType: number, damage: number = 0, isCrit: boolean = false, onFin: Callback = null): void {
        var lastRelease = this.currentHitTimes == this.totalHitTimes - 1;
        // 取整
        damage = Math.floor(damage);
        // 伤害显示对应的界面
        var uiID: number;
        switch (damageType) {
            case -2:
                uiID = 0;
                break;
            case -1:
                uiID = 1041;
                break;
            default:
                uiID = 1042 + damageType;
                break;
        }
        // 显示伤害（治疗）文字效果
        if (uiID != 0) {
            var damageUI = GameUI.load(uiID, true);
            damageUI.x = targetBattler.x;
            damageUI.y = targetBattler.y;
            Game.currentScene.animationHighLayer.addChild(damageUI);
            var targetUI = damageUI["target"];
            if (!targetUI) targetUI = damageUI.getChildAt(0);
            if (targetUI) {
                if (damageType >= 0) {
                    var damageLabel: UIString = damageUI["damage"];
                    if (damageLabel && damageLabel instanceof UIString) {
                        damageLabel.text = (damage > 0 ? "+" : "") + damage.toString();
                    }
                }
                var damageAni = new GCAnimation();
                damageAni.target = targetUI;
                damageAni.once(GCAnimation.PLAY_COMPLETED, this, () => {
                    damageAni.dispose();
                    damageUI.dispose();
                    if (lastRelease) {
                        onFin && onFin.run();
                    }
                });
                damageAni.id = isCrit ? 1047 : 1046;
                damageAni.play();
                if (!lastRelease) {
                    onFin && onFin.run();
                }
                return;
            }
        }
        onFin && onFin.run();
    }
    //------------------------------------------------------------------------------------------------------
    // 指示器
    //------------------------------------------------------------------------------------------------------
    /**
     * 开启移动指示器
     * @param battler 战斗者
     */
    static openMoveIndicator(battler: ProjectClientSceneObject): void {
        let atkRangeRef = WorldData.showAtkRangeRef ? GameBattlerHandler.getBattlerAtkRangeReference(battler) : 0;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, battler.battlerSetting.battleActor.MoveGrid, 0, 0, 0, null, atkRangeRef, true);
    }
    /**
     * 开启攻击指示器
     */
    static openAtkIndicator(battler: ProjectClientSceneObject): void {
        var atkRange = 1;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, atkRange, 1);
    }
    /**
     * 开启技能指示器
     */
    static openSkillIndicator(battler: ProjectClientSceneObject, skill: Module_Skill): void {
        // 被动技能
        if (skill.skillType == 2) return;
        // 打开技能指示器
        this.battlerEffectIndicatorGridArr = this.openBattlerSkillEffectRangeGird(battler, skill);
        // 多体的情况则会开启释放范围显示
        if (skill.targetType == 5 || skill.targetType == 6) {
            this.battlerRelaseIndicatorGridArr = this.openBattlerReleaseRangeGrid(skill, battler);
        }
    }
    /**
     * 打开道具指示器
     */
    static openItemIndicator(battler: ProjectClientSceneObject): void {
        var itemRange = WorldData.actorItemAllowToOthers ? 1 : 0;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, itemRange, 2);
    }
    /**
     * 开启交换指示器
     */
    static openExchangeIndicator(battler: ProjectClientSceneObject): void {
        var exchangeItemRange = 1;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, exchangeItemRange, 1);
    }
    /**
     * 关闭移动指示器
     */
    static closeMoveIndicator(): void {
        this.closeBattlerEffectRangeGrid();
    }
    /**
     * 关闭技能指示器
     */
    static closeBattleIndicator(): void {
        this.closeBattlerEffectRangeGrid();
        this.closeBattlerReleaseRangeGrid();
    }
    /**
     * 打开战斗者的技能作用范围
     */
    private static openBattlerSkillEffectRangeGird(battler: ProjectClientSceneObject, skill: Module_Skill) {
        // 关闭作用范围
        this.closeBattlerEffectRangeGrid();
        // 获得作用范围格子数据
        var grids = GameBattleHelper.getSkillEffectRangeGrid(battler.posGrid, skill);
        // 创建作用范围显示对象
        for (var i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var effectGridAni = GameBattleHelper.createEffectGrid(grid.x, grid.y, 1, battler);
            this.battlerEffectGridAniArr.push(effectGridAni);
        }
        return grids;
    }
    /**
     * 打开战斗者的作用范围
     * @param battler 战斗者
     * @param range 范围格子数
     * @param obstacleMode 计算障碍的模式 默认值=0 计算障碍的模式 0-计算所有障碍 1-仅计算地图固定障碍 2-不计算障碍
     * @param rangeMode [可选] 默认值=0 范围模式 0-普通范围 1-min-range范围 2-自定义范围
     * @param minRange [可选] 默认值=0 最短值，低于该值不允许出现
     * @param customRangeData [可选] 默认值=null 自定义范围数据
     * @param extraGridRange [可选] 默认值=0 额外的格子显示范围  
     * @param includeSelfBattler [可选] 默认值=false 包含自己
     */
    private static openBattlerEffectRangeGrid(battler: ProjectClientSceneObject, range: number, obstacleMode: number = 0, rangeMode: number = 0, minRange: number = 0,
        customRangeData: { size: number, gridData: number[][] } = null, extraGridRange: number = 0, includeSelfBattler: boolean = false): Point[] {
        // 关闭作用范围
        this.closeBattlerEffectRangeGrid();
        // 获得作用范围格子数据
        let addGridsList = null;
        if (includeSelfBattler) {
            addGridsList = [battler.posGrid];
        }
        let grids = GameBattleHelper.getEffectRange(battler.posGrid, range, obstacleMode, rangeMode, minRange, customRangeData, false, addGridsList);
        // 创建作用范围显示对象
        for (let i = 0; i < grids.length; i++) {
            let grid = grids[i];
            let effectGridAni = GameBattleHelper.createEffectGrid(grid.x, grid.y, 1, battler);
            this.battlerEffectGridAniArr.push(effectGridAni);
        }
        // 剔除掉存在grids的坐标（仅计算地图固定障碍的模式作为对比参考-计算出额外（可攻击）的范围）
        if (extraGridRange != 0) {
            // 获取指定range的范围-敌军不作为障碍计算
            let normalGrids = grids;//GameBattleHelper.getEffectRange(battler.posGrid, range, obstacleMode, rangeMode, minRange, customRangeData, false, null, battler);
            let extraGrids = GameBattleHelper.getEffectRange(battler.posGrid, range + extraGridRange, 3, rangeMode, Math.max(0, minRange - extraGridRange), customRangeData, false, null, battler);
            for (let i = 0; i < extraGrids.length; i++) {
                let extraGrid = extraGrids[i];
                // -- 如果不在normalGrids的话则添加
                if (ArrayUtils.matchAttributes(normalGrids, { x: extraGrid.x, y: extraGrid.y }, true).length == 0) {
                    if (aroundHasNormalGrid(extraGrid, normalGrids)) {
                        // -- 且该格子邻近的1格内存在normalGrids
                        let effectGridAni = GameBattleHelper.createEffectGrid(extraGrid.x, extraGrid.y, 2, battler);
                        this.battlerEffectExtGridAniArr.push(effectGridAni);
                    }
                }
            }
        }
        /**
         * 游戏制作
         * @param extraGrid 
         * @param normalGrids 
         * @return [boolean] 
         */
        function aroundHasNormalGrid(extraGrid: Point, normalGrids: Point[]): boolean {
            const around = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (let i = 0; i < 4; i++) {
                let dp = around[i];
                let tpX = extraGrid.x + dp[0];
                let tpY = extraGrid.y + dp[1];
                if (ArrayUtils.matchAttributes(normalGrids, { x: tpX, y: tpY }, true).length == 1) {
                    return true;
                }
            }
            return false;
        }

        return grids;
    }
    /**
     * 打开释放范围
     */
    private static openBattlerReleaseRangeGrid(skill: Module_Skill, battler: ProjectClientSceneObject): Point[] {
        // 关闭作用范围
        this.closeBattlerReleaseRangeGrid();
        var grids = GameBattleHelper.getSkillReleaseRangeGrid(skill);
        // 创建作用范围显示对象
        for (var i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var effectGridAni = GameBattleHelper.createEffectGrid(0, 0, 2, battler);
            if (effectGridAni) {
                effectGridAni.data = grid;
                this.battlerEffectReleaseGridAniArr.push(effectGridAni);
            }
        }
        // 开启释放范围
        this.openReleaseGridCursor = true;
        return grids;
    }
    /**
     * 打开释放范围光标效果（注册帧刷事件跟随光标）
     */
    private static set openReleaseGridCursor(v: boolean) {
        this._openReleaseGridCursor = v;
        if (v) {
            os.remove_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
            os.add_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
            this.onUpdateReleaseGridCursor();
        }
        else {
            os.remove_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
        }
    }
    private static get openReleaseGridCursor(): boolean {
        return this._openReleaseGridCursor;
    }
    /**
     * 刷新释放范围光标
     */
    private static onUpdateReleaseGridCursor() {
        var cursorGridPos = GameBattleHelper.cursorGridPoint;
        var cursor = GameBattleHelper.cursor;
        // 战斗
        for (var i = 0; i < this.battlerEffectReleaseGridAniArr.length; i++) {
            var releaseAni = this.battlerEffectReleaseGridAniArr[i];
            var localGrid: Point = releaseAni.data;
            var inSceneGridX = cursorGridPos.x + localGrid.x;
            var inSceneGridY = cursorGridPos.y + localGrid.y;
            // 场景越界则忽略显示
            if (Game.currentScene.sceneUtils.isOutsideByGrid(new Point(inSceneGridX, inSceneGridY))) {
                releaseAni.visible = false;
                continue;
            }
            releaseAni.visible = true;
            var aniX = inSceneGridX * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
            var aniY = inSceneGridY * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
            // 释放函数
            releaseAni.x = aniX;
            releaseAni.y = aniY;
        }
    }
    /**
     * 关闭作用范围
     */
    private static closeBattlerEffectRangeGrid(): void {
        for (var i = 0; i < this.battlerEffectGridAniArr.length; i++) {
            let ani = this.battlerEffectGridAniArr[i];
            ani && ani.dispose();
        }
        this.battlerEffectGridAniArr.length = 0;
        for (var i = 0; i < this.battlerEffectExtGridAniArr.length; i++) {
            let ani = this.battlerEffectExtGridAniArr[i];
            ani && ani.dispose();
        }
        this.battlerEffectExtGridAniArr.length = 0;
    }
    /**
     * 关闭释放范围
     */
    private static closeBattlerReleaseRangeGrid(): void {
        for (var i = 0; i < this.battlerEffectReleaseGridAniArr.length; i++) {
            this.battlerEffectReleaseGridAniArr[i].dispose();
        }
        this.battlerEffectReleaseGridAniArr.length = 0;
        this.openReleaseGridCursor = false;
    }
}