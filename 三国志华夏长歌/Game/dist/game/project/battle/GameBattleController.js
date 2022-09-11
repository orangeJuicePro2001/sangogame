var GameBattleController = (function () {
    function GameBattleController() {
    }
    GameBattleController.init = function () {
    };
    GameBattleController.start = function () {
        this.currentOperationBattler = null;
        this.playerControlBattlerStage = 0;
        this.cursorPosGrid = new Point(-1, -1);
        Game.layer.sceneLayer.on(EventObject.MOUSE_DOWN, this, this.onMouseDown);
        stage.on(EventObject.RIGHT_MOUSE_DOWN, this, this.onRightMouseUp);
        Game.layer.sceneLayer.on(EventObject.MOUSE_MOVE, this, this.onMouseMove);
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        EventUtils.addEventListenerFunction(GUI_BattleSkill, GUI_BattleSkill.EVENT_SELECT_SKILL, this.battleCommand_onSkillSelect, this);
        EventUtils.addEventListenerFunction(GUI_BattleItem, GUI_BattleItem.EVENT_SELECT_ITEM, this.battleCommand_onItemSelect, this);
        os.add_ENTERFRAME(this.onEnterFrame, this);
    };
    GameBattleController.stop = function () {
        Game.layer.sceneLayer.off(EventObject.MOUSE_DOWN, this, this.onMouseDown);
        stage.off(EventObject.RIGHT_MOUSE_DOWN, this, this.onRightMouseUp);
        Game.layer.sceneLayer.off(EventObject.MOUSE_MOVE, this, this.onMouseMove);
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        os.remove_ENTERFRAME(this.onEnterFrame, this);
        EventUtils.removeEventListenerFunction(GUI_BattleSkill, GUI_BattleSkill.EVENT_SELECT_SKILL, this.battleCommand_onSkillSelect, this);
        EventUtils.removeEventListenerFunction(GUI_BattleItem, GUI_BattleItem.EVENT_SELECT_ITEM, this.battleCommand_onItemSelect, this);
        EventUtils.removeEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, this.reOpenBattleMenu, this);
        GameBattleAction.closeCurrentBattlerWindow();
        GameBattleAction.closeTargetBattlerWindow();
    };
    GameBattleController.battleCommand_standby = function () {
        var battler = this.currentOperationBattler;
        if (!battler)
            return;
        this.recordMovedBattler = null;
        if (WorldData.standbyStepChangeOriEnabled) {
            GameBattleController.playerControlBattlerStage = GameBattleController.WAIT_CHANGE_ORI;
            WorldData.playCtrlEnabled = false;
            GameCommand.startCommonCommand(14029, [], null, battler, battler);
        }
        else {
            GameBattlerHandler.setBattlerStandby(battler);
            if (!GameBattleHelper.nextPlayerControlBattler) {
                GameBattle.nextPlayerControl();
            }
        }
    };
    GameBattleController.battleCommand_controlComplete = function (skipAIOperaction) {
        var nextPlayerControlBattler;
        while (nextPlayerControlBattler = GameBattleHelper.nextPlayerControlBattler) {
            GameBattlerHandler.setBattlerStandby(nextPlayerControlBattler);
        }
        if (skipAIOperaction) {
            GameBattle.nextStep();
        }
        else {
            GameBattle.nextPlayerControl();
        }
    };
    GameBattleController.battleCommand_openMoveIndicator = function () {
        var battler = this.currentOperationBattler;
        if (!battler)
            return;
        if (!GameBattleHelper.canMove(battler))
            return;
        this.playerControlBattlerStage = GameBattleController.OPEN_MOVE_INDICATOR;
        GameBattleAction.openMoveIndicator(battler);
        MouseControl.stop();
    };
    GameBattleController.battleCommand_openAtkIndicator = function () {
        var battler = this.currentOperationBattler;
        if (!battler)
            return;
        if (!GameBattleHelper.canAttack(battler))
            return;
        this.playerControlBattlerStage = GameBattleController.OPEN_ATK_INDICATOR;
        var isAtkUseSkill = battler.battlerSetting.battleActor.atkMode != 0;
        var atkSkill = battler.battlerSetting.battleActor.atkSkill;
        if (isAtkUseSkill && atkSkill) {
            if (atkSkill.targetType >= 3 && atkSkill.targetType <= 4) {
                this.currentBattleSkill = atkSkill;
                this.selectBattleTargetOrArea();
                return;
            }
            this.currentBattleType = 1;
            this.currentBattleSkill = battler.battlerSetting.battleActor.atkSkill;
            GameBattleAction.openSkillIndicator(battler, battler.battlerSetting.battleActor.atkSkill);
        }
        else {
            this.currentBattleType = 0;
            GameBattleAction.openAtkIndicator(battler);
        }
    };
    GameBattleController.battleCommand_onSkillSelect = function (skill) {
        var battler = this.currentOperationBattler;
        this.closeBattlerMenu();
        this.currentBattleSkill = skill;
        this.playerControlBattlerStage = GameBattleController.OPEN_SKILL_INDICATOR;
        if (skill.targetType >= 3 && skill.targetType <= 4) {
            this.selectBattleTargetOrArea();
        }
        else {
            GameBattleAction.openSkillIndicator(battler, skill);
        }
    };
    GameBattleController.battleCommand_onItemSelect = function (item) {
        var battler = this.currentOperationBattler;
        this.closeBattlerMenu();
        this.currentBattleItem = item;
        GameBattleAction.openItemIndicator(battler);
        this.playerControlBattlerStage = GameBattleController.OPEN_ITEM_INDICATOR;
    };
    GameBattleController.battleCommand_openItemExchangeIndicator = function () {
        var battler = this.currentOperationBattler;
        if (!battler)
            return;
        this.playerControlBattlerStage = GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR;
        this.currentBattleType = 3;
        GameBattleAction.openExchangeIndicator(battler);
    };
    GameBattleController.applyChangeBattlerOri = function () {
        if (GameBattle.state == 1) {
            var readyUI = GameUI.get(13);
            readyUI.nextSceneObjectCtrlOri();
        }
        else if (GameBattle.state == 2) {
            this.applyBattleStandByOri();
        }
    };
    GameBattleController.openBattlerMenu = function (battler) {
        GameBattleController.currentOperationBattler = battler;
        GameCommand.startCommonCommand(15014);
        GameBattleAction.showCurrentBattlerWindow(battler);
        GameBattleAction.closeTargetBattlerWindow();
        GameBattleAction.closeMoveIndicator();
    };
    GameBattleController.closeBattlerMenu = function () {
        GameCommand.startCommonCommand(15015);
    };
    GameBattleController.openBattleCommonMenu = function () {
        GameCommand.startCommonCommand(15016);
    };
    GameBattleController.closeBattleCommonMenu = function () {
        GameCommand.startCommonCommand(15017);
    };
    GameBattleController.reOpenSkillMenu = function () {
        GameCommand.startCommonCommand(15020);
    };
    GameBattleController.closeSkillMenu = function () {
        GameCommand.startCommonCommand(15019);
    };
    GameBattleController.reOpenItemMenu = function () {
        GameCommand.startCommonCommand(15023);
    };
    GameBattleController.closeItemMenu = function () {
        GameCommand.startCommonCommand(15022);
    };
    GameBattleController.openStatusMenu = function () {
        GameCommand.startCommonCommand(15024);
    };
    GameBattleController.closeStatusMenu = function () {
        GameCommand.startCommonCommand(15025);
    };
    GameBattleController.closeMenu = function () {
        var battleMenus = [[19, this.closeStatusMenu], [17, this.closeSkillMenu], [18, this.closeItemMenu], [14, this.closeBattlerMenu], [15, this.closeBattleCommonMenu]];
        for (var i = 0; i < battleMenus.length; i++) {
            var battleMenuInfo = battleMenus[i];
            var uiID = battleMenuInfo[0];
            var closeFunction = battleMenuInfo[1];
            var battlerMenu = GameUI.get(uiID);
            if (battlerMenu && battlerMenu.stage) {
                closeFunction.apply(this);
                return true;
            }
        }
        return false;
    };
    GameBattleController.onKeyDown = function (e) {
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog)
            return;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            this.onControllerBack();
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (GameBattleHelper.isOpendBattleMenu)
                return;
            this.onControllerSure();
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI)
                GameBattleController.currentOperationBattler.avatarOri = 8;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI)
                GameBattleController.currentOperationBattler.avatarOri = 2;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI)
                GameBattleController.currentOperationBattler.avatarOri = 4;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            if (this.playerControlBattlerStage == GameBattleController.WAIT_CHANGE_ORI)
                GameBattleController.currentOperationBattler.avatarOri = 6;
        }
    };
    GameBattleController.onMouseDown = function (e) {
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog)
            return;
        if (GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19))
            return;
        if (GameUI.isOpened(15))
            return;
        var mouseSelectedBattler = MouseControl.selectSceneObject;
        if (!GameBattleHelper.isBattler(mouseSelectedBattler) || mouseSelectedBattler.battlerSetting.isDead)
            mouseSelectedBattler = null;
        var inSceneMouseGridPoint = GameBattleHelper.inSceneMouseGridPoint;
        var inSceneMouseGridCenter = GameBattleHelper.inSceneMouseGridCenter;
        if (this.playerControlBattlerStage > 0) {
            this.onControllerSure(true);
        }
        else {
            if (mouseSelectedBattler) {
                var isAlreadySelected = GameBattleHelper.overCursorNoDeadBattler == mouseSelectedBattler;
                if (GameBattleHelper.isPlayerCamp(mouseSelectedBattler)) {
                    if (GameBattleHelper.overCursorPlayerCtrlEnabledBattler) {
                        GameBattleController.openBattlerMenu(mouseSelectedBattler);
                        return;
                    }
                }
                if (isAlreadySelected) {
                    this.openStatusMenu();
                }
                else {
                    GameBattleController.closeBattlerMenu();
                }
            }
            else {
                Game.currentScene.camera.sceneObject = null;
                GameBattleAction.cursorJumpToGridPoint(inSceneMouseGridPoint);
                GameBattleController.closeBattlerMenu();
            }
            return;
        }
    };
    GameBattleController.onMouseMove = function (e) {
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog)
            return;
        if (GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19))
            return;
        if (GameUI.isOpened(15))
            return;
        var inSceneMouseGridPoint = GameBattleHelper.inSceneMouseGridPoint;
        var inSceneMouseGridCenter = GameBattleHelper.inSceneMouseGridCenter;
        if (!GameUI.isOpened(14)) {
            GameBattleAction.cursorJumpToGridPoint(inSceneMouseGridPoint);
        }
        if (this.playerControlBattlerStage > 0) {
            if (this.playerControlBattlerStage == GameBattleController.OPEN_MOVE_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR ||
                this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR) {
                if (ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr, { x: inSceneMouseGridPoint.x, y: inSceneMouseGridPoint.y }, true).length != 0) {
                    GameBattleHelper.cursor.setTo(inSceneMouseGridCenter.x, inSceneMouseGridCenter.y);
                    var so = GameBattleHelper.overCursorNoDeadBattler;
                    if (so)
                        this.onEnterFrame(so.posGrid, true);
                    else
                        GameBattleAction.closeTargetBattlerWindow();
                }
            }
        }
        else if (!GameBattleHelper.isOpendBattleMenu) {
            var so = MouseControl.selectSceneObject;
            if (!so)
                so = GameBattleHelper.overCursorNoDeadBattler;
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
    };
    GameBattleController.onRightMouseUp = function (e) {
        if (!GameBattle.playerControlEnabled || GameDialog.isInDialog)
            return;
        this.onControllerBack();
    };
    GameBattleController.onControllerSure = function (useMouse) {
        if (useMouse === void 0) { useMouse = false; }
        if (this.playerControlBattlerStage > 0) {
            switch (this.playerControlBattlerStage) {
                case GameBattleController.OPEN_MOVE_INDICATOR:
                    this.operactionBattleMoveToCursorPostion();
                    return;
                case GameBattleController.WAIT_CHANGE_ORI:
                    if (!useMouse)
                        this.applyBattleStandByOri();
                    return;
                case GameBattleController.OPEN_ATK_INDICATOR:
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_SKILL_INDICATOR:
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_ITEM_INDICATOR:
                    this.selectBattleTargetOrArea();
                    return;
                case GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR:
                    this.selectBattleTargetOrArea();
                    return;
            }
        }
        if (GameBattleHelper.overCursorPlayerCtrlEnabledBattler) {
            GameBattleController.openBattlerMenu(GameBattleHelper.overCursorPlayerCtrlEnabledBattler);
        }
        else if (GameBattleHelper.overCursorNoDeadBattler) {
            this.openStatusMenu();
        }
    };
    GameBattleController.onControllerBack = function () {
        if (!(GameUI.isOpened(17) || GameUI.isOpened(18) || GameUI.isOpened(19))) {
            if (this.playerControlBattlerStage == 0 && this.recordMovedBattler) {
                this.cancelBattleMoveCommand();
                return;
            }
        }
        var isClosedMenu = this.closeMenu();
        if (isClosedMenu)
            return;
        if (this.playerControlBattlerStage > 0) {
            switch (this.playerControlBattlerStage) {
                case GameBattleController.OPEN_MOVE_INDICATOR:
                    this.cancelBattleMoveIndicator();
                    break;
                case GameBattleController.WAIT_CHANGE_ORI:
                    this.cancelBattleStandByOri();
                    break;
                case GameBattleController.OPEN_ATK_INDICATOR:
                    this.cancelAtkIndicator();
                    break;
                case GameBattleController.OPEN_SKILL_INDICATOR:
                    this.cancelSkillIndicator();
                    break;
                case GameBattleController.OPEN_ITEM_INDICATOR:
                    this.cancelItemIndicator();
                    break;
                case GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR:
                    this.cancelAtkIndicator();
                    break;
            }
            return;
        }
        this.openBattleCommonMenu();
    };
    GameBattleController.onEnterFrame = function (pointGrid, mouseMode) {
        if (pointGrid === void 0) { pointGrid = null; }
        if (mouseMode === void 0) { mouseMode = false; }
        if (GameBattleHelper.isOpendBattleMenu || !WorldData.playCtrlEnabled)
            return;
        GameBattleHelper.cameraCorrect();
        if (ProjectUtils.lastControl == 0) {
            ProjectUtils.pointHelper.x = Game.currentScene.localX;
            ProjectUtils.pointHelper.y = Game.currentScene.localY;
            var mouseGrid = GameUtils.getGridPostion(ProjectUtils.pointHelper);
            GameBattleAction.cursorJumpToGridPoint(mouseGrid);
        }
        if (!mouseMode && ProjectUtils.lastControl != 1)
            return;
        if (!pointGrid)
            pointGrid = GameBattleHelper.cursor.posGrid;
        if (this.cursorPosGrid.x == pointGrid.x && this.cursorPosGrid.y == pointGrid.y)
            return;
        this.cursorPosGrid.x = pointGrid.x;
        this.cursorPosGrid.y = pointGrid.y;
        var battler = GameBattleHelper.getNoDeadBattlerByGrid(pointGrid);
        var isOpenIndicator = this.playerControlBattlerStage == GameBattleController.OPEN_MOVE_INDICATOR || this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR
            || this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR || this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR ||
            this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR;
        if (isOpenIndicator) {
            GameBattleAction.showCurrentBattlerWindow(this.currentOperationBattler);
            battler ? GameBattleAction.showTargetBattlerWindow(battler) : GameBattleAction.closeTargetBattlerWindow();
        }
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
    };
    GameBattleController.operactionBattleMoveToCursorPostion = function (inSceneMouseGridPoint) {
        var _this = this;
        if (inSceneMouseGridPoint === void 0) { inSceneMouseGridPoint = null; }
        var cursorGridPoint = inSceneMouseGridPoint;
        if (cursorGridPoint == null)
            cursorGridPoint = GameBattleHelper.cursor.posGrid;
        if (ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr, { x: cursorGridPoint.x, y: cursorGridPoint.y }, true).length != 0) {
            var battler = GameBattleController.currentOperationBattler;
            if (cursorGridPoint.x == battler.posGrid.x && cursorGridPoint.y == battler.posGrid.y)
                return;
            this.recordBattlerPostion = new Point(battler.x, battler.y);
            this.recordMovedBattler = battler;
            this.recordBattlerOldOri = battler.avatar.orientation;
            GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
            GameBattleAction.startMove(battler, cursorGridPoint.x, cursorGridPoint.y, Callback.New(function () {
                MouseControl.start();
                _this.openBattlerMenu(battler);
                GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = true;
            }, this));
            this.playerControlBattlerStage = 0;
            return true;
        }
    };
    GameBattleController.applyBattleStandByOri = function () {
        this.playerControlBattlerStage = 0;
        var battler = GameBattleController.currentOperationBattler;
        GameCommand.startCommonCommand(14030, [], null, battler, battler);
        GameBattlerHandler.setBattlerStandby(GameBattleController.currentOperationBattler);
        WorldData.playCtrlEnabled = true;
        GameBattle.nextPlayerControl();
    };
    GameBattleController.selectBattleTargetOrArea = function () {
        var _this = this;
        var doAction = function () {
            _this.recordMovedBattler = null;
            _this.playerControlBattlerStage = 0;
        };
        var currentGridPos = new Point(GameBattleHelper.cursor.posGrid.x, GameBattleHelper.cursor.posGrid.y);
        var currentActor = this.currentOperationBattler.battlerSetting.battleActor;
        var atkUseSkill = false;
        if (this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR && currentActor.atkMode == 1 && currentActor.atkSkill) {
            this.currentBattleSkill = currentActor.atkSkill;
            atkUseSkill = true;
        }
        if (this.playerControlBattlerStage == GameBattleController.OPEN_ATK_INDICATOR && !atkUseSkill) {
            var target = GameBattleHelper.getAttackTargetOnGrid(this.currentOperationBattler, currentGridPos);
            if (!target)
                return;
            this.whenBattleActionCompleteReOpenBattleMenu();
            GameBattleAction.attack(this.currentOperationBattler, target);
            doAction.apply(this);
        }
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_SKILL_INDICATOR || atkUseSkill) {
            var targetRes = GameBattleHelper.getSkillTargetOnGrid(this.currentOperationBattler, this.currentBattleSkill, currentGridPos);
            if (!targetRes || !targetRes.allow)
                return;
            this.whenBattleActionCompleteReOpenBattleMenu();
            GameBattleAction.useSkill(this.currentOperationBattler, this.currentBattleSkill, currentGridPos, targetRes.targets);
            doAction.apply(this);
        }
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_INDICATOR) {
            var target = GameBattleHelper.getItemTargetOnGrid(this.currentOperationBattler, currentGridPos);
            if (!target || !WorldData.actorItemAllowToOthers && target != this.currentOperationBattler)
                return;
            this.whenBattleActionCompleteReOpenBattleMenu();
            GameBattleAction.useItem(this.currentOperationBattler, target, this.currentBattleItem);
            doAction.apply(this);
        }
        else if (this.playerControlBattlerStage == GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR) {
            var target = GameBattleHelper.getItemTargetOnGrid(this.currentOperationBattler, currentGridPos);
            if (!target || target == this.currentOperationBattler || !GameBattleHelper.isFriendlyRelationship(this.currentOperationBattler, target))
                return;
            GameBattleAction.closeBattleIndicator();
            GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
            GameCommand.startCommonCommand(15033, [], null, GameBattleController.currentOperationBattler, target);
            this.recordMovedBattler = null;
            this.playerControlBattlerStage = 0;
            GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        }
    };
    GameBattleController.whenBattleActionCompleteReOpenBattleMenu = function () {
        GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = false;
        EventUtils.addEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, this.reOpenBattleMenu, this, null, true);
    };
    GameBattleController.reOpenBattleMenu = function () {
        GameBattle.playerControlEnabled = WorldData.playCtrlEnabled = true;
        if (this.currentOperationBattler.battlerSetting.isDead) {
            GameBattle.nextPlayerControl();
        }
        else {
            this.openBattlerMenu(GameBattleController.currentOperationBattler);
        }
    };
    GameBattleController.cancelBattleStandByOri = function () {
        this.playerControlBattlerStage = 0;
        WorldData.playCtrlEnabled = true;
        var battler = GameBattleController.currentOperationBattler;
        GameCommand.startCommonCommand(14030, [], null, battler, battler);
        this.openBattlerMenu(battler);
    };
    GameBattleController.cancelBattleMoveIndicator = function () {
        this.playerControlBattlerStage = 0;
        MouseControl.start();
        GameBattleAction.closeMoveIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        this.openBattlerMenu(GameBattleController.currentOperationBattler);
    };
    GameBattleController.cancelBattleMoveCommand = function () {
        this.recordMovedBattler.battlerSetting.moved = false;
        this.recordMovedBattler.setTo(this.recordBattlerPostion.x, this.recordBattlerPostion.y);
        this.recordMovedBattler.avatarOri = this.recordBattlerOldOri;
        GameBattleHelper.cursor.setTo(this.recordMovedBattler.x, this.recordMovedBattler.y);
        this.openBattlerMenu(this.recordMovedBattler);
        this.recordBattlerPostion = null;
        this.recordMovedBattler = null;
    };
    GameBattleController.cancelAtkIndicator = function () {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        this.openBattlerMenu(GameBattleController.currentOperationBattler);
    };
    GameBattleController.cancelSkillIndicator = function () {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        GameBattleHelper.cursor.setTo(GameBattleController.currentOperationBattler.x, GameBattleController.currentOperationBattler.y);
        this.reOpenSkillMenu();
    };
    GameBattleController.cancelItemIndicator = function () {
        this.playerControlBattlerStage = 0;
        GameBattleAction.closeBattleIndicator();
        this.reOpenItemMenu();
    };
    GameBattleController.OPEN_MOVE_INDICATOR = 1;
    GameBattleController.WAIT_CHANGE_ORI = 3;
    GameBattleController.OPEN_ATK_INDICATOR = 4;
    GameBattleController.OPEN_SKILL_INDICATOR = 5;
    GameBattleController.OPEN_ITEM_INDICATOR = 6;
    GameBattleController.OPEN_ITEM_EXCHANGE_INDICATOR = 7;
    GameBattleController.playerControlBattlerStage = 0;
    GameBattleController.currentBattleType = 0;
    return GameBattleController;
}());
//# sourceMappingURL=GameBattleController.js.map