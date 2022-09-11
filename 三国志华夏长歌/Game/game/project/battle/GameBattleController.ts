/**
 * 战斗控制器
 * Created by 黑暗之神KDS on 2021-01-14 15:08:03.
 */
class GameBattleController {
    //------------------------------------------------------------------------------------------------------
    // 用以枚举
    //------------------------------------------------------------------------------------------------------
    /**
     * 阶段:开启了移动指示器
     */
    private static OPEN_MOVE_INDICATOR: number = 1;
    /**
     * 阶段:待机等待更换朝向
     */
    private static WAIT_CHANGE_ORI: number = 3;
    /**
     * 阶段:开启了攻击指示器
     */
    private static OPEN_ATK_INDICATOR: number = 4;
    /**
     * 阶段:开启了技能指示器
     */
    private static OPEN_SKILL_INDICATOR: number = 5;
    /**
     * 阶段:开启了道具指示器
     */
    private static OPEN_ITEM_INDICATOR: number = 6;
    /**
     * 阶段:开启了道具交换指示器
     */
    private static OPEN_ITEM_EXCHANGE_INDICATOR: number = 7;
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 记录移动角色前的位置，并以此作为标识允许撤回
     */
    private static recordBattlerPostion: Point;
    /**
     * 记录移动过的战斗者
     */
    private static recordMovedBattler: ProjectClientSceneObject;
    /**
     * 记录移动者原面向
     */
    private static recordBattlerOldOri: number;
    /**
     * 玩家控制角色的阶段
     */
    private static playerControlBattlerStage: number = 0;
    /**
      * 当前玩家操作的战斗角色
      */
    static currentOperationBattler: ProjectClientSceneObject;
    /**
     * 当前控制角色的战斗方式 0-普通攻击 1-使用技能 2-使用道具 3-交换道具
     */
    private static currentBattleType: number = 0;
    /**
     * 当前控制角色的技能
     */
    private static currentBattleSkill: Module_Skill;
    /**
     * 当前控制角色的道具
     */
    private static currentBattleItem: Module_Item;
    //------------------------------------------------------------------------------------------------------
    // 实现用的变量
    //------------------------------------------------------------------------------------------------------
    private static cursorPosGrid: Point;
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 初始化
     */
    static init(): void {

    }
    /**
     * 启动
     */
    static start(): void {
        // 初始化
        this.currentOperationBattler = null;
        this.playerControlBattlerStage = 0;
        this.cursorPosGrid = new Point(-1, -1);
        // 鼠标事件
        Game.layer.sceneLayer.on(EventObject.MOUSE_DOWN, this, this.onMouseDown);
        stage.on(EventObject.RIGHT_MOUSE_DOWN, this, this.onRightMouseUp);
        Game.layer.sceneLayer.on(EventObject.MOUSE_MOVE, this, this.onMouseMove);
        // 键盘事件
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        // 监听技能选择
        EventUtils.addEventListenerFunction(GUI_BattleSkill, GUI_BattleSkill.EVENT_SELECT_SKILL, this.battleCommand_onSkillSelect, this);
        // 监听道具选择
        EventUtils.addEventListenerFunction(GUI_BattleItem, GUI_BattleItem.EVENT_SELECT_ITEM, this.battleCommand_onItemSelect, this);
        // 帧刷函数
        os.add_ENTERFRAME(this.onEnterFrame, this);
    }
    /**
     * 停止
     */
    static stop(): void {
        // 取消鼠标事件
        Game.layer.sceneLayer.off(EventObject.MOUSE_DOWN, this, this.onMouseDown);
        stage.off(EventObject.RIGHT_MOUSE_DOWN, this, this.onRightMouseUp);
        Game.layer.sceneLayer.off(EventObject.MOUSE_MOVE, this, this.onMouseMove);
        // 取消键盘事件
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        // 帧数
        os.remove_ENTERFRAME(this.onEnterFrame, this);
        // 取消监听
        EventUtils.removeEventListenerFunction(GUI_BattleSkill, GUI_BattleSkill.EVENT_SELECT_SKILL, this.battleCommand_onSkillSelect, this);
        EventUtils.removeEventListenerFunction(GUI_BattleItem, GUI_BattleItem.EVENT_SELECT_ITEM, this.battleCommand_onItemSelect, this);
        EventUtils.removeEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, this.reOpenBattleMenu, this);
        // 关闭窗口
        GameBattleAction.closeCurrentBattlerWindow();
        GameBattleAction.closeTargetBattlerWindow();
    }
    //------------------------------------------------------------------------------------------------------
    // 菜单接口
    //------------------------------------------------------------------------------------------------------
    /**
     * 待机：当前玩家可控角色对象进入待机
     */
    static battleCommand_standby() {
        // 不存在当前操作的角色或已行动过则忽略
        var battler = this.currentOperationBattler;
        if (!battler) return;
        // 清除允许撤回移动的标识
        this.recordMovedBattler = null;
        // 允许待机更换战斗者朝向时
        if (WorldData.standbyStepChangeOriEnabled) {
            // 待机等待更换朝向的状态
            GameBattleController.playerControlBattlerStage = GameBattleController.WAIT_CHANGE_ORI;
            WorldData.playCtrlEnabled = false;
            // 执行片段事件：开始更改战斗者朝向时事件
            GameCommand.startCommonCommand(14029, [], null, battler, battler);
        }
        // 否则直接待机
        else {
            // 待机效果
            GameBattlerHandler.setBattlerStandby(battler);
            // 如果不存在任何可控制角色的话立刻跳到下一个阶段
            if (!GameBattleHelper.nextPlayerControlBattler) {
                GameBattle.nextPlayerControl();
            }
        }
    }
    /**
     * 操作完成
     * -- 结束控制角色行动
     * -- 结束回合且略过AI行动
     * @param skipAIOperaction 是否跳过我方AI操作
     */
    static battleCommand_controlComplete(skipAIOperaction: boolean) {
        var nextPlayerControlBattler: ProjectClientSceneObject;
        while (nextPlayerControlBattler = GameBattleHelper.nextPlayerControlBattler) {
            GameBattlerHandler.setBattlerStandby(nextPlayerControlBattler);
        }
        // 跳过电脑操作
        if (skipAIOperaction) {
            GameBattle.nextStep();
        }
        else {
            GameBattle.nextPlayerControl();
        }
    }
    /**
     * 开启移动指示器：当前玩家可控角色对象开启移动范围显示
     */
    static battleCommand_openMoveIndicator(): void {
        // 不存在当前操作的角色或已行动过则忽略
        var battler = this.currentOperationBattler;
        if (!battler) return;
        // 忽略无法移动的场合
        if (!GameBattleHelper.canMove(battler)) return;
        // 设置玩家控制角色的阶段
        this.playerControlBattlerStage = GameBattleController.OPEN_MOVE_INDICATOR;
        // 打开移动范围显示
        GameBattleAction.openMoveIndicator(battler);
        // 禁止操作
        MouseControl.stop();
    }
    /**
     * 开启攻击指示器：当前玩家可控角色对象开启攻击范围显示
     */
    static battleCommand_openAtkIndicator(): void {
        // 不存在当前操作的角色或已行动过则忽略
        var battler = this.currentOperationBattler;
        if (!battler) return;
        // 忽略无法攻击的场合
        if (!GameBattleHelper.canAttack(battler)) return;
        // 设置玩家控制角色的阶段
        this.playerControlBattlerStage = GameBattleController.OPEN_ATK_INDICATOR;
        // 玩家控制开启了攻击指示器
        var isAtkUseSkill = battler.battlerSetting.battleActor.atkMode != 0;
        var atkSkill: Module_Skill = battler.battlerSetting.battleActor.atkSkill;
        if (isAtkUseSkill && atkSkill) {
            // 如果是全体技能则直接释放技能
            if (atkSkill.targetType >= 3 && atkSkill.targetType <= 4) {
                this.currentBattleSkill = atkSkill;
                this.selectBattleTargetOrArea();
                return;
            }
            // 设定为使用技能
            this.currentBattleType = 1;
            this.currentBattleSkill = battler.battlerSetting.battleActor.atkSkill;
            // 打开技能指示器
            GameBattleAction.openSkillIndicator(battler, battler.battlerSetting.battleActor.atkSkill);
        }
        else {
            // 设定为攻击
            this.currentBattleType = 0;
            // 打开攻击指示器
            GameBattleAction.openAtkIndicator(battler);
        }
    }
    /**
     * 开启技能指示器：当前玩家可控角色对象开启攻击范围显示
     * @param battler 战斗者
     * @param skill 技能
     */
    private static battleCommand_onSkillSelect(skill: Module_Skill) {
        var battler = this.currentOperationBattler;
        // 关闭战斗菜单
        this.closeBattlerMenu();
        // 记录当前选中的道具
        this.currentBattleSkill = skill;
        // 设置玩家控制角色的阶段
        this.playerControlBattlerStage = GameBattleController.OPEN_SKILL_INDICATOR;
        // 如果是全体技能则直接释放技能
        if (skill.targetType >= 3 && skill.targetType <= 4) {
            this.selectBattleTargetOrArea();
        }
        else {
            // 打开技能指示器
            GameBattleAction.openSkillIndicator(battler, skill);
        }
    }
    /**
     * 当道具选择时
     * @param battler 战斗者
     * @param item 道具
     */
    private static battleCommand_onItemSelect(item: Module_Item): void {
        var battler = this.currentOperationBattler;
        // 关闭战斗菜单
        this.closeBattlerMenu();
        // 记录当前选中的道具
        this.currentBattleItem = item;
        // 打开道具指示器
        GameBattleAction.openItemIndicator(battler);
        // 设置玩家控制角色的阶段
        this.playerControlBattlerStage = GameBattleController.OPEN_ITEM_INDICATOR;
    }
    /**
     * 打开道具交换指示器
     */
    static battleCommand_openItemExchangeIndicator(): void {
        // 不存在当前操作的角色或已行动过则忽略
        var battler = this.currentOperationBattler;
        if (!battler) return;
        // 设置玩家控制角色的阶段
        this.playerControlBattlerStage = GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR;
        // 设定为攻击
        this.currentBattleType = 3;
        // 打开攻击指示器
        GameBattleAction.openExchangeIndicator(battler);
    }
    /**
     * 确认更改朝向
     */
    static applyChangeBattlerOri() {
        // 准备阶段
        if (GameBattle.state == 1) {
            var readyUI: GUI_BattleReady = GameUI.get(13) as any;
            readyUI.nextSceneObjectCtrlOri();
        }
        // 战斗阶段
        else if (GameBattle.state == 2) {
            this.applyBattleStandByOri();
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 呼出和关闭菜单
    //------------------------------------------------------------------------------------------------------
    /**
     * 打开战斗者菜单
     * @param battler 
     */
    static openBattlerMenu(battler: ProjectClientSceneObject) {
        // 记录当前的操作对象
        GameBattleController.currentOperationBattler = battler;
        // 打开战斗者菜单
        GameCommand.startCommonCommand(15014);
        // 显示当前操作者
        GameBattleAction.showCurrentBattlerWindow(battler);
        GameBattleAction.closeTargetBattlerWindow();
        // 关闭可能存在的移动指示器
        GameBattleAction.closeMoveIndicator();
    }
    /**
     * 关闭战斗者菜单
     */
    static closeBattlerMenu() {
        GameCommand.startCommonCommand(15015);
    }
    /**
     * 打开通用菜单
     */
    static openBattleCommonMenu() {
        GameCommand.startCommonCommand(15016);
    }
    /**
     * 关闭通用菜单
     */
    static closeBattleCommonMenu() {
        GameCommand.startCommonCommand(15017);
    }
    /**
     * 重新打开技能栏
     */
    static reOpenSkillMenu() {
        GameCommand.startCommonCommand(15020);
    }
    /**
     * 关闭技能栏
     */
    static closeSkillMenu() {
        GameCommand.startCommonCommand(15019);
    }
    /**
     * 重新打开道具栏
     */
    static reOpenItemMenu() {
        GameCommand.startCommonCommand(15023);
    }
    /**
     * 关闭道具栏
     */
    static closeItemMenu() {
        GameCommand.startCommonCommand(15022);
    }
    /**
     * 打开状态栏
     */
    static openStatusMenu() {
        GameCommand.startCommonCommand(15024);
    }
    /**
     * 关闭状态栏
     */
    static closeStatusMenu() {
        GameCommand.startCommonCommand(15025);
    }
    //------------------------------------------------------------------------------------------------------
    // 关闭菜单
    //------------------------------------------------------------------------------------------------------
    /**
     * 关闭战斗相关的菜单
     * @return [boolean] 是否关闭了菜单
     */
    private static closeMenu(): boolean {
        // 按照检查以下界面是否打开，打开的话则关闭掉
        var battleMenus = [[19, this.closeStatusMenu], [17, this.closeSkillMenu], [18, this.closeItemMenu], [14, this.closeBattlerMenu], [15, this.closeBattleCommonMenu]];
        for (var i = 0; i < battleMenus.length; i++) {
            var battleMenuInfo = battleMenus[i];
            var uiID = battleMenuInfo[0] as number;
            var closeFunction: Function = battleMenuInfo[1] as any;
            var battlerMenu = GameUI.get(uiID);
            if (battlerMenu && battlerMenu.stage) {
                closeFunction.apply(this);
                return true;
            }
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 鼠标键盘操作
    //------------------------------------------------------------------------------------------------------
    /**
     * 当按键按下时
     * @param e 
     */
    static onKeyDown(e: EventObject): void {
        // 非玩家自由行动阶段时不允许操作
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog) return;
        // 退出按键
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            this.onControllerBack();
        }
        // 确定键
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            // 开启了战斗者菜单的话不允许操作
            if (GameBattleHelper.isOpendBattleMenu) return;
            this.onControllerSure();
        }
        // 方向键：更改朝向
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI) GameBattleController.currentOperationBattler.avatarOri = 8;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI) GameBattleController.currentOperationBattler.avatarOri = 2;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI) GameBattleController.currentOperationBattler.avatarOri = 4;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI) GameBattleController.currentOperationBattler.avatarOri = 6;
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 鼠标操作
    //------------------------------------------------------------------------------------------------------
    /**
     * 当鼠标点击时
     * @param e 
     */
    static onMouseDown(e: EventObject): void {
        // 非玩家自由行动阶段时不允许操作
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog) return;
        // 已打开技能栏、道具栏、状态栏：忽略
        if (GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19)) return;
        // 已打开通用菜单的情况
        if (GameUI.isOpened(15)) return;
        // 获取鼠标选中的战斗者
        var mouseSelectedBattler = MouseControl.selectSceneObject;
        if (!GameBattleHelper.isBattler(mouseSelectedBattler) || mouseSelectedBattler.battlerSetting.isDead) mouseSelectedBattler = null;
        // 获取光标所在位置
        var inSceneMouseGridPoint = GameBattleHelper.inSceneMouseGridPoint;
        var inSceneMouseGridCenter = GameBattleHelper.inSceneMouseGridCenter;
        // 已打开指示器
        if (this.playerControlBattlerStage > 0) {
            this.onControllerSure(true);
        }
        // 未打开指示器的情况
        else {
            if (mouseSelectedBattler) {
                var isAlreadySelected = GameBattleHelper.overCursorNoDeadBattler == mouseSelectedBattler;
                // 我方阵营
                if (GameBattleHelper.isPlayerCamp(mouseSelectedBattler)) {
                    if (GameBattleHelper.overCursorPlayerCtrlEnabledBattler) {
                        GameBattleController.openBattlerMenu(mouseSelectedBattler);
                        return;
                    }
                }
                // 已选中的话：查看状态
                if (isAlreadySelected) {
                    this.openStatusMenu();
                }
                // 未选中的情况则：选中
                else {
                    GameBattleController.closeBattlerMenu();
                }
            }
            // 仅移动光标
            else {
                Game.currentScene.camera.sceneObject = null;
                GameBattleAction.cursorJumpToGridPoint(inSceneMouseGridPoint);
                GameBattleController.closeBattlerMenu();
            }
            return;
        }
    }
    /**
     * 鼠标移动
     * @param e 
     */
    static onMouseMove(e: EventObject): void {
        // 非玩家自由行动阶段时不允许操作
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog) return;
        // 已打开技能栏、道具栏、状态栏：忽略
        if (GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19)) return;
        // 已打开通用菜单的情况
        if (GameUI.isOpened(15)) return;
        // 获取光标所在位置
        var inSceneMouseGridPoint = GameBattleHelper.inSceneMouseGridPoint;
        var inSceneMouseGridCenter = GameBattleHelper.inSceneMouseGridCenter;
        // 光标实时跟随
        if (!GameUI.isOpened(14)) {
            GameBattleAction.cursorJumpToGridPoint(inSceneMouseGridPoint);
        }
        // 已打开指示器
        if (this.playerControlBattlerStage > 0) {
            if (this.playerControlBattlerStage == GameBattleController.OPEN_MOVE_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR) {
                if (ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr,
                    { x: inSceneMouseGridPoint.x, y: inSceneMouseGridPoint.y }, true).length != 0) {
                    GameBattleHelper.cursor.setTo(inSceneMouseGridCenter.x, inSceneMouseGridCenter.y);
                    var so = GameBattleHelper.overCursorNoDeadBattler;
                    if (so) this.onEnterFrame(so.posGrid, true);
                    else GameBattleAction.closeTargetBattlerWindow();
                }
            }
        }
        // 未打开指示器的情况下
        else if (!GameBattleHelper.isOpendBattleMenu) {
            var so = MouseControl.selectSceneObject;
            if (!so) so = GameBattleHelper.overCursorNoDeadBattler;
            if (so) {
                if (GameBattleHelper.isBattler(so) && !so.battlerSetting.isDead) {
                    this.onEnterFrame(so.posGrid, true);
                    return;
                }
            }
            GameBattleAction.closeMoveIndicator();
            GameBattleAction.closeTargetBattlerWindow();
            this.cursorPosGrid.setTo(-1, -1);
        }
    }
    /**
     * 右键
     * @param e 
     */
    static onRightMouseUp(e: EventObject): void {
        // 非玩家自由行动阶段时不允许操作
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog) return;
        this.onControllerBack();
    }
    //------------------------------------------------------------------------------------------------------
    // 
    //------------------------------------------------------------------------------------------------------
    /**
     * 操作确定
     */
    private static onControllerSure(useMouse: boolean = false) {
        // 存在玩家控制阶段时
        if (this.playerControlBattlerStage > 0) {
            switch (this.playerControlBattlerStage) {
                case GameBattleController.OPEN_MOVE_INDICATOR:
                    // 移动操作的角色
                    this.operactionBattleMoveToCursorPostion();
                    return;
                case GameBattleController.WAIT_CHANGE_ORI:
                    // 应用待机朝向
                    if (!useMouse) this.applyBattleStandByOri();
                    return;
                case GameBattleController.OPEN_ATK_INDICATOR:
                    // 攻击：选择战斗目标或区域
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_SKILL_INDICATOR:
                    // 技能：选择战斗目标或区域
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_ITEM_INDICATOR:
                    // 道具：选择战斗目标或区域
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR:
                    // 交换道具：选择战斗目标或区域
                    this.selectBattleTargetOrArea();
                    return;
            }
        }
        // 当前光标选中的可控角色的话，显示战斗者菜单
        if (GameBattleHelper.overCursorPlayerCtrlEnabledBattler) {
            GameBattleController.openBattlerMenu(GameBattleHelper.overCursorPlayerCtrlEnabledBattler);
        }
        // 否则非死亡的敌人则显示状态菜单
        else if (GameBattleHelper.overCursorNoDeadBattler) {
            this.openStatusMenu();
        }
    }
    /**
     * 操作返回
     */
    private static onControllerBack() {
        // 存在移动记录则撤回移动：未打开技能栏、道具栏、状态栏的情况下允许
        if (!(GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19))) {
            if (this.playerControlBattlerStage == 0 && this.recordMovedBattler) {
                this.cancelBattleMoveCommand();
                return;
            }
        }
        // 存在战斗菜单的话：关闭
        var isClosedMenu = this.closeMenu();
        if (isClosedMenu) return;
        // 存在玩家控制阶段时
        if (this.playerControlBattlerStage > 0) {
            switch (this.playerControlBattlerStage) {
                case GameBattleController.OPEN_MOVE_INDICATOR:
                    // 取消移动指示器
                    this.cancelBattleMoveIndicator();
                    break;
                case GameBattleController.WAIT_CHANGE_ORI:
                    // 取消待机指令
                    this.cancelBattleStandByOri();
                    break;
                case GameBattleController.OPEN_ATK_INDICATOR:
                    // 取消攻击指示器
                    this.cancelAtkIndicator();
                    break;
                case GameBattleController.OPEN_SKILL_INDICATOR:
                    // 取消技能指示器
                    this.cancelSkillIndicator();
                    break;
                case GameBattleController.OPEN_ITEM_INDICATOR:
                    // 取消道具指示器
                    this.cancelItemIndicator();
                    break;
                case GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR:
                    // 取消交换道具指示器
                    this.cancelAtkIndicator();
                    break;
            }
            return;
        }

        // 打开通用菜单
        this.openBattleCommonMenu();
    }
    /**
     * 帧刷：光标位置改变时
     * -- 刷新目标窗口
     */
    private static onEnterFrame(pointGrid: Point = null, mouseMode: boolean = false): void {
        // 打开战斗者菜单后禁止玩家操作时忽略后续逻辑执行
        if (GameBattleHelper.isOpendBattleMenu || !WorldData.playCtrlEnabled) return;
        // 镜头修正，以便镜头能够跟随到光标的位置
        GameBattleHelper.cameraCorrect();
        // 鼠标模式下需要实时将光标位置跟随鼠标所在的格子
        if (ProjectUtils.lastControl == 0) {
            ProjectUtils.pointHelper.x = Game.currentScene.localX;
            ProjectUtils.pointHelper.y = Game.currentScene.localY;
            let mouseGrid = GameUtils.getGridPostion(ProjectUtils.pointHelper);
            GameBattleAction.cursorJumpToGridPoint(mouseGrid);
        }
        // 非鼠标模式下如果未能按下方向键时
        if (!mouseMode && ProjectUtils.lastControl != 1) return;
        if (!pointGrid) pointGrid = GameBattleHelper.cursor.posGrid;
        if (this.cursorPosGrid.x == pointGrid.x && this.cursorPosGrid.y == pointGrid.y) return;
        this.cursorPosGrid.x = pointGrid.x;
        this.cursorPosGrid.y = pointGrid.y;
        var battler = GameBattleHelper.getNoDeadBattlerByGrid(pointGrid);
        var isOpenIndicator = this.playerControlBattlerStage == GameBattleController.OPEN_MOVE_INDICATOR || this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR
            || this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR || this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR ||
            this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR;
        // 如果开启了指示器：当前战斗者头像为当前控制的战斗者，目标头像则为光标指向的目标
        if (isOpenIndicator) {
            GameBattleAction.showCurrentBattlerWindow(this.currentOperationBattler);
            battler ? GameBattleAction.showTargetBattlerWindow(battler) : GameBattleAction.closeTargetBattlerWindow();
        }
        // 否则如果存在光标指向的目标时仅显示光标指向的目标
        else {
            if (mouseMode) {
                if (battler) {
                    GameBattleAction.openMoveIndicator(battler);
                    GameBattleAction.showTargetBattlerWindow(battler);
                }
                else {
                    GameBattleAction.closeMoveIndicator();
                }
                return;
            }
            if (battler) {
                if (battler.battlerSetting.battleCamp == 0) {
                    GameBattleAction.showCurrentBattlerWindow(battler);
                    GameBattleAction.closeTargetBattlerWindow();
                }
                else {
                    GameBattleAction.openMoveIndicator(battler);
                    GameBattleAction.showTargetBattlerWindow(battler);
                    GameBattleAction.closeCurrentBattlerWindow();
                }
            }
            else {
                GameBattleAction.closeMoveIndicator();
                GameBattleAction.closeCurrentBattlerWindow();
                GameBattleAction.closeTargetBattlerWindow();
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 发出行动指令
    //------------------------------------------------------------------------------------------------------
    /**
     * 操作角色到当前光标位置上移动，当开启了移动指示器
     */
    private static operactionBattleMoveToCursorPostion(inSceneMouseGridPoint: Point = null): boolean {
        // 获取光标位置
        var cursorGridPoint = inSceneMouseGridPoint;
        if (cursorGridPoint == null) cursorGridPoint = GameBattleHelper.cursor.posGrid;
        // 在允许的移动格子范围内的话
        if (ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr, { x: cursorGridPoint.x, y: cursorGridPoint.y }, true).length != 0) {
            // 获取移动者
            var battler = GameBattleController.currentOperationBattler;
            // 如果坐标相等则无法移动
            if (cursorGridPoint.x == battler.posGrid.x && cursorGridPoint.y == battler.posGrid.y) return;
            // 记录角色的原位置
            this.recordBattlerPostion = new Point(battler.x, battler.y);
            this.recordMovedBattler = battler;
            this.recordBattlerOldOri = battler.avatar.orientation;
            // 禁止玩家操作
            GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
            // 移动，当移动结束后恢复控制和镜头恢复锁定光标
            GameBattleAction.startMove(battler, cursorGridPoint.x, cursorGridPoint.y, Callback.New(() => {
                // 允许操作
                MouseControl.start();
                // 继续开启战斗者菜单
                this.openBattlerMenu(battler);
                // 允许玩家操作
                GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = true;
            }, this));
            // 清理玩家控制角色的阶段
            this.playerControlBattlerStage = 0;
            return true;
        }
    }
    /**
     * 确定待机朝向
     */
    private static applyBattleStandByOri() {
        // 清理玩家控制角色的阶段
        this.playerControlBattlerStage = 0;
        // 获取当前操作的战斗者
        var battler = GameBattleController.currentOperationBattler;
        // 执行事件片段：停止更换战斗者朝向时事件
        GameCommand.startCommonCommand(14030, [], null, battler, battler);
        // 设置战斗角色待机效果
        GameBattlerHandler.setBattlerStandby(GameBattleController.currentOperationBattler);
        WorldData.playCtrlEnabled = true;
        // 自动索引下一个角色
        GameBattle.nextPlayerControl();
    }
    /**
     * 选择战斗目标或区域
     */
    private static selectBattleTargetOrArea() {
        // 实际执行了行为的情况
        var doAction = () => {
            this.recordMovedBattler = null;
            this.playerControlBattlerStage = 0;
        }
        // 获取当前光标所在的格子
        var currentGridPos = new Point(GameBattleHelper.cursor.posGrid.x, GameBattleHelper.cursor.posGrid.y);
        // 获取当前的角色数据
        var currentActor = this.currentOperationBattler.battlerSetting.battleActor;
        // 普通攻击作为技能的话
        var atkUseSkill = false;
        if (this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR && currentActor.atkMode == 1 && currentActor.atkSkill) {
            this.currentBattleSkill = currentActor.atkSkill;
            atkUseSkill = true;
        }
        // 攻击
        if (this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR && !atkUseSkill) {
            // -- 获取指定战斗者的攻击目标，根据指定的格子位置，如果不存在则不允许攻击
            var target = GameBattleHelper.getAttackTargetOnGrid(this.currentOperationBattler, currentGridPos);
            if (!target) return;
            // -- 等待行为结束后重新操作角色
            this.whenBattleActionCompleteReOpenBattleMenu();
            // -- 发起攻击目标的行为
            GameBattleAction.attack(this.currentOperationBattler, target);
            // -- 实际执行了行为后的处理
            doAction.apply(this);
        }
        // 技能
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR || atkUseSkill) {
            // -- 获取技能范围内的作用目标
            var targetRes = GameBattleHelper.getSkillTargetOnGrid(this.currentOperationBattler, this.currentBattleSkill, currentGridPos);
            if (!targetRes || !targetRes.allow) return;
            // -- 当行为结束后恢复控制战斗者
            this.whenBattleActionCompleteReOpenBattleMenu();
            // -- 使用技能
            GameBattleAction.useSkill(this.currentOperationBattler, this.currentBattleSkill, currentGridPos, targetRes.targets);
            // -- 实际执行了行为后的处理
            doAction.apply(this);
        }
        // 道具
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR) {
            // 获取道具目标
            var target = GameBattleHelper.getItemTargetOnGrid(this.currentOperationBattler, currentGridPos);
            // 无目标或不允许给他人使用的话且目标不是自己则忽略掉
            if (!target || !WorldData.actorItemAllowToOthers && target != this.currentOperationBattler) return;
            // -- 等待行为结束后重新操作角色
            this.whenBattleActionCompleteReOpenBattleMenu();
            // -- 使用道具
            GameBattleAction.useItem(this.currentOperationBattler, target, this.currentBattleItem);
            // -- 实际执行了行为后的处理
            doAction.apply(this);
        }
        // 交换道具
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR) {
            // 获取道具目标
            var target = GameBattleHelper.getItemTargetOnGrid(this.currentOperationBattler, currentGridPos);
            // 无目标或不是队友的话忽略掉
            if (!target || target == this.currentOperationBattler || !GameBattleHelper.isFriendlyRelationship(this.currentOperationBattler, target)) return;
            // -- 关闭指示器
            GameBattleAction.closeBattleIndicator();
            // -- 不允许控制
            GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
            // -- 打开交换道具面板
            GameCommand.startCommonCommand(15033, [], null, GameBattleController.currentOperationBattler, target);
            // -- 清理并返回
            this.recordMovedBattler = null;
            this.playerControlBattlerStage = 0;
            GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 行动完毕后处理
    //------------------------------------------------------------------------------------------------------
    /**
     * 当一次战斗行为结束后重新打开菜单
     */
    private static whenBattleActionCompleteReOpenBattleMenu() {
        GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
        EventUtils.addEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, this.reOpenBattleMenu, this, null, true);
    }
    /**
     * 重新打开战斗者菜单
     */
    private static reOpenBattleMenu() {
        // 允许玩家操作
        GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = true;
        // 如果当前操作者已经死亡的话
        if (this.currentOperationBattler.battlerSetting.isDead) {
            // 操控下一个角色
            GameBattle.nextPlayerControl();
        }
        else {
            // 继续开启战斗者菜单
            this.openBattlerMenu(GameBattleController.currentOperationBattler);
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 撤回
    //------------------------------------------------------------------------------------------------------
    /**
     * 撤回待机选择朝向
     */
    private static cancelBattleStandByOri(): void {
        this.playerControlBattlerStage = 0;
        WorldData.playCtrlEnabled = true;
        var battler = GameBattleController.currentOperationBattler;
        // 执行事件片段：停止更换战斗者朝向时事件
        GameCommand.startCommonCommand(14030, [], null, battler, battler);
        this.openBattlerMenu(battler);
    }
    /**
     * 撤回移动指示器
     */
    private static cancelBattleMoveIndicator(): void {
        this.playerControlBattlerStage = 0;
        MouseControl.start();
        GameBattleAction.closeMoveIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        this.openBattlerMenu(GameBattleController.currentOperationBattler);
    }
    /**
     * 撤回移动指令
     */
    private static cancelBattleMoveCommand(): void {
        // 设置为未移动过
        this.recordMovedBattler.battlerSetting.moved = false;
        // 返回到记录坐标点和朝向
        this.recordMovedBattler.setTo(this.recordBattlerPostion.x, this.recordBattlerPostion.y);
        this.recordMovedBattler.avatarOri = this.recordBattlerOldOri;
        // 重新选中该战斗者
        GameBattleHelper.cursor.setTo(this.recordMovedBattler.x, this.recordMovedBattler.y);
        this.openBattlerMenu(this.recordMovedBattler);
        // 清理移动记录
        this.recordBattlerPostion = null;
        this.recordMovedBattler = null;
    }
    /**
     * 取消攻击指示器
     */
    private static cancelAtkIndicator(): void {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        this.openBattlerMenu(GameBattleController.currentOperationBattler);
    }
    /**
     * 取消技能指示器
     */
    private static cancelSkillIndicator(): void {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        // 恢复战斗技能栏
        this.reOpenSkillMenu();
    }
    /**
     * 取消道具指示器
     */
    private static cancelItemIndicator(): void {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        // 恢复战斗道具栏
        this.reOpenItemMenu();
    }
}