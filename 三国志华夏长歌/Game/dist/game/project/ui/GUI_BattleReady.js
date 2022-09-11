














var GUI_BattleReady = (function (_super) {
    __extends(GUI_BattleReady, _super);
    function GUI_BattleReady() {
        var _this = _super.call(this) || this;
        _this.actorInSceneBattlers = [];
        _this.readyInBattleAreaAniArr = [];
        _this.changeOriState = false;
        GUI_Manager.standardList(_this.actorList);
        _this.on(EventObject.DISPLAY, _this, _this.onDisplay);
        _this.on(EventObject.UNDISPLAY, _this, _this.onUnDisplay);
        _this.actorList.onCreateItem = Callback.New(_this.onCreateActorItem, _this);
        _this.actorList.on(UIList.ITEM_CLICK, _this, _this.onActorListItemClick);
        stage.on(EventObject.KEY_DOWN, _this, _this.onKeyDown);
        Game.layer.sceneLayer.on(EventObject.MOUSE_DOWN, _this, _this.onMouseDown);
        stage.on(EventObject.RIGHT_MOUSE_DOWN, _this, _this.onRightMouseDown);
        return _this;
    }
    GUI_BattleReady.readyStageComplete = function () {
        if (GameBattle.state != 1) {
            return;
        }
        WorldData.playCtrlEnabled = false;
        var ui = GameUI.get(13);
        ui.actorList.mouseEnabled = false;
        if (ui.currentChangePostionBattler) {
            ui.stopChangeBattlerPostion(ui.currentChangePostionBattler);
        }
        if (WorldData.readyStepChangeOriEnabled) {
            ui.setReadyStep(2);
            ui.changeOriState = true;
            ui.currentChangeOriSceneObjectIndex = 0;
            ui.needChangeOriSceneObjects = [];
            for (var i in Game.currentScene.sceneObjects) {
                var so = Game.currentScene.sceneObjects[i];
                if (GameBattleHelper.isPlayerControlEnabledBattler(so)) {
                    ui.needChangeOriSceneObjects.push(so);
                }
            }
            ui.nextSceneObjectCtrlOri();
        }
        else {
            GameBattle.start();
        }
    };
    GUI_BattleReady.prototype.onDisplay = function () {
        UIList.KEY_BOARD_ENABLED = false;
        this.actorInSceneBattlers = [];
        GUI_BattleReady.readyBattleActorCount = 0;
        this.initScenePresetBattler();
        this.actorList.on(EventObject.CHANGE, this, this.onActorListChange);
        this.refreshPlayerActorList();
        this.actorList.selectedIndex = 0;
        this.onActorListChange(0);
        UIList.focus = this.actorList;
        this.createReadyInBattleAreaSignAnimations();
        this.setReadyStep(0);
        this.changeOriState = false;
        this.actorList.mouseEnabled = true;
        Game.currentScene.camera.sceneObject = null;
        os.add_ENTERFRAME(this.onEnterFrame, this);
    };
    GUI_BattleReady.prototype.onUnDisplay = function () {
        this.actorList.selectedIndex = -1;
        this.actorList.items = [];
        this.actorList.off(EventObject.CHANGE, this, this.onActorListChange);
        this.actorInfo.setActor(null);
        this.disposeReadyInBattleAreaSignAnimations();
        os.remove_ENTERFRAME(this.onEnterFrame, this);
    };
    GUI_BattleReady.prototype.onEnterFrame = function () {
        GameBattleHelper.cameraCorrect();
    };
    GUI_BattleReady.prototype.initScenePresetBattler = function () {
        GameBattlerHandler.initScenePresetBattler();
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(so.battlerSetting.battleActor);
                if (inPlayerActorIndex != -1) {
                    if (!this.actorInSceneBattlers[inPlayerActorIndex])
                        GUI_BattleReady.readyBattleActorCount++;
                    this.actorInSceneBattlers[inPlayerActorIndex] = so;
                }
            }
        }
    };
    GUI_BattleReady.prototype.createReadyInBattleAreaSignAnimations = function () {
        var readyInBattleAreaSignArr = Game.currentScene.dataLayers[3];
        var gridWidth = Game.currentScene.gridWidth;
        var gridHeight = Game.currentScene.gridHeight;
        for (var x = 0; x < gridWidth; x++) {
            var readyInBattleAreaSignArrX = readyInBattleAreaSignArr[x];
            if (!readyInBattleAreaSignArrX)
                continue;
            for (var y = 0; y < gridHeight; y++) {
                if (readyInBattleAreaSignArrX[y]) {
                    var effectGrid = GameBattleHelper.createEffectGrid(x, y, 0, null);
                    this.readyInBattleAreaAniArr.push(effectGrid);
                }
            }
        }
    };
    GUI_BattleReady.prototype.disposeReadyInBattleAreaSignAnimations = function () {
        for (var i = 0; i < this.readyInBattleAreaAniArr.length; i++) {
            this.readyInBattleAreaAniArr[i].dispose();
        }
        this.readyInBattleAreaAniArr.length = 0;
    };
    GUI_BattleReady.prototype.setReadyStep = function (step) {
        var task = "battleReadyStageTask";
        new SyncTask(task, function (step) {
            var _this = this;
            var fragmentEvent = [14024, 14025, 14026][step];
            Callback.CallLaterBeforeRender(function () {
                GameCommand.startCommonCommand(fragmentEvent, [], Callback.New(function () {
                    SyncTask.taskOver(task);
                }, _this), Game.player.sceneObject, Game.player.sceneObject);
            }, this);
        }, [step]);
    };
    GUI_BattleReady.prototype.onCreateActorItem = function (ui, data, index) {
        var actorDS = data.data;
        if (!actorDS)
            return;
        ui.ai.visible = actorDS.actor.AI ? true : false;
        ui.inScene.visible = this.actorInSceneBattlers[index] ? true : false;
    };
    GUI_BattleReady.prototype.refreshPlayerActorList = function () {
        var arr = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            Game.refreshActorAttribute(actor, actorDS.lv);
            actor.hp = actor.MaxHP;
            actor.sp = actor.MaxSP;
            actorDS.actor.status.length = 0;
            var d = new ListItem_1004;
            d.data = actorDS;
            d.avatar = actorDS.actor.avatar;
            arr.push(d);
        }
        this.actorList.items = arr;
    };
    GUI_BattleReady.prototype.onActorListChange = function (state) {
        if (state == 0) {
            var selectedPlayerActorData = this.selectedPlayerActorData;
            if (!selectedPlayerActorData)
                return;
            var actor = selectedPlayerActorData.actor;
            this.actorInfo.setActor(actor);
        }
    };
    GUI_BattleReady.prototype.onActorListItemClick = function () {
        if (this.currentChangePostionBattler)
            return;
        var overCursorSceneObject = GameBattleHelper.overCursorSceneObject;
        var actorInSceneBattler = this.actorInSceneBattlers[this.actorList.selectedIndex];
        if (actorInSceneBattler) {
            GameBattleHelper.cursor.stopMove();
            GameBattleHelper.cursor.setTo(actorInSceneBattler.x, actorInSceneBattler.y);
            GameFunction.cameraMove(0, GameBattleHelper.cursor.x, GameBattleHelper.cursor.y, 0, true, WorldData.cameraTweenFrame);
        }
        else if (!overCursorSceneObject) {
            this.addBattlerOrRmoveBattle();
        }
    };
    Object.defineProperty(GUI_BattleReady.prototype, "selectedPlayerActorData", {
        get: function () {
            var selectedItem = this.actorList.selectedItem;
            if (!selectedItem)
                return;
            var actorDS = selectedItem.data;
            return actorDS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GUI_BattleReady.prototype, "canInBattleActorLength", {
        get: function () {
            var s = 0;
            for (var i = 0; i < Game.player.data.party.length; i++) {
                var actorDS = Game.player.data.party[i];
                if (actorDS && !this.actorInSceneBattlers[i])
                    s++;
            }
            return s;
        },
        enumerable: false,
        configurable: true
    });
    GUI_BattleReady.prototype.putActorInScene = function (actorIndex, grid, actorDS) {
        var posGridP = new Point(grid.x, grid.y);
        var posP = GameUtils.getGridCenterByGrid(posGridP);
        var persetSceneObject = {
            x: posP.x,
            y: posP.y,
            avatarID: actorDS.actor.avatar,
            avatarOri: GUI_BattleReady.ACTOR_DEFAULT_ORI
        };
        var soc = Game.currentScene.addNewSceneObject(1, persetSceneObject);
        if (!this.actorInSceneBattlers[actorIndex])
            GUI_BattleReady.readyBattleActorCount++;
        this.actorInSceneBattlers[actorIndex] = soc;
        soc.battlerSetting.isBattler = true;
        soc.battlerSetting.battleCamp = 0;
        soc.battlerSetting.battleActor = actorDS.actor;
        soc.battlerSetting.usePlayerActors = true;
        soc.battlerSetting.mustInBattle = false;
        GameBattlerHandler.onBattlerAppear(soc);
        var actorItemUI = this.actorList.getItemUI(actorIndex);
        actorItemUI.inScene.visible = true;
        if (this.canInBattleActorLength == 0) {
            GUI_Manager.setWarning(2);
        }
    };
    GUI_BattleReady.prototype.backActorFromScene = function (actorIndex, soc) {
        if (this.actorInSceneBattlers[actorIndex])
            GUI_BattleReady.readyBattleActorCount--;
        this.actorInSceneBattlers[actorIndex] = null;
        soc.dispose();
        var actorItemUI = this.actorList.getItemUI(actorIndex);
        actorItemUI.inScene.visible = false;
        this.actorList.selectedIndex = actorIndex;
    };
    GUI_BattleReady.prototype.startChangeBattlerPostion = function (soc) {
        this.setReadyStep(1);
        this.currentChangePostionBattler = soc;
        GameCommand.startCommonCommand(14027, [], null, soc, soc);
    };
    GUI_BattleReady.prototype.stopChangeBattlerPostion = function (soc) {
        this.setReadyStep(0);
        this.currentChangePostionBattler = null;
        GameCommand.startCommonCommand(14028, [], null, soc, soc);
    };
    GUI_BattleReady.prototype.addBattlerOrRmoveBattle = function () {
        var selectedIndex = this.actorList.selectedIndex;
        if (selectedIndex < 0)
            return;
        var overCursorSceneObject = GameBattleHelper.overCursorSceneObject;
        var cursorGridPoint = GameBattleHelper.cursorGridPoint;
        var cursorPoint = GameUtils.getGridCenterByGrid(cursorGridPoint);
        var isReadyGrid = Game.currentScene.getDataGridState(3, cursorGridPoint.x, cursorGridPoint.y) == 1;
        var actorInSceneBattler = this.actorInSceneBattlers[selectedIndex];
        var selectedPlayerActorData = this.selectedPlayerActorData;
        if (this.currentChangePostionBattler) {
            if (overCursorSceneObject == this.currentChangePostionBattler) {
                this.stopChangeBattlerPostion(overCursorSceneObject);
                var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(overCursorSceneObject.battlerSetting.battleActor);
                if (inPlayerActorIndex >= 0 && overCursorSceneObject.battlerSetting.usePlayerActors && !overCursorSceneObject.battlerSetting.mustInBattle) {
                    this.backActorFromScene(inPlayerActorIndex, overCursorSceneObject);
                }
                else {
                    GUI_Manager.setWarning(0);
                    GameAudio.playSE(ClientWorld.data.disalbeSE);
                }
            }
            else {
                if (isReadyGrid) {
                    if (overCursorSceneObject) {
                        if (!GameBattleHelper.isPlayerCamp(overCursorSceneObject)) {
                            GameAudio.playSE(ClientWorld.data.disalbeSE);
                            return;
                        }
                        overCursorSceneObject.setTo(this.currentChangePostionBattler.x, this.currentChangePostionBattler.y);
                    }
                    this.currentChangePostionBattler.setTo(cursorPoint.x, cursorPoint.y);
                    this.stopChangeBattlerPostion(this.currentChangePostionBattler);
                }
                else {
                    GameAudio.playSE(ClientWorld.data.disalbeSE);
                }
            }
        }
        else {
            if (overCursorSceneObject) {
                if (isReadyGrid && GameBattleHelper.isPlayerCamp(overCursorSceneObject)) {
                    var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(overCursorSceneObject.battlerSetting.battleActor);
                    if (inPlayerActorIndex != -1)
                        this.actorList.selectedIndex = inPlayerActorIndex;
                    this.startChangeBattlerPostion(overCursorSceneObject);
                }
                else {
                    GameAudio.playSE(ClientWorld.data.disalbeSE);
                }
            }
            else if (isReadyGrid && !actorInSceneBattler) {
                this.putActorInScene(selectedIndex, cursorGridPoint, selectedPlayerActorData);
                for (var i = selectedIndex; i < this.actorList.length; i++) {
                    if (!this.actorInSceneBattlers[i]) {
                        this.actorList.selectedIndex = i;
                        break;
                    }
                }
            }
            else {
                GameAudio.playSE(ClientWorld.data.disalbeSE);
            }
        }
    };
    GUI_BattleReady.prototype.onKeyDown = function (e) {
        if (!this.stage)
            return;
        if (GameDialog.isInDialog)
            return;
        if (GameBattle.state != 1)
            return;
        var selectedIndex = this.actorList.selectedIndex;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.L1)) {
            if (this.changeOriState)
                return;
            selectedIndex--;
            if (selectedIndex < 0)
                selectedIndex = 0;
            this.actorList.selectedIndex = selectedIndex;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.R1)) {
            if (this.changeOriState)
                return;
            selectedIndex++;
            if (selectedIndex >= this.actorList.length)
                selectedIndex = this.actorList.length - 1;
            this.actorList.selectedIndex = selectedIndex;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
            if (this.changeOriState)
                this.currentChangeOriSceneObject.avatarOri = 8;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            if (this.changeOriState)
                this.currentChangeOriSceneObject.avatarOri = 2;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            if (this.changeOriState)
                this.currentChangeOriSceneObject.avatarOri = 4;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            if (this.changeOriState)
                this.currentChangeOriSceneObject.avatarOri = 6;
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (this.changeOriState) {
                this.nextSceneObjectCtrlOri();
            }
            else {
                this.addBattlerOrRmoveBattle();
            }
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            if (this.currentChangePostionBattler) {
                this.stopChangeBattlerPostion(this.currentChangePostionBattler);
            }
            else if (!this.changeOriState) {
                GUI_Manager.setWarning(1);
            }
        }
    };
    GUI_BattleReady.prototype.onMouseDown = function (e) {
        if (!this.stage)
            return;
        if (GameBattle.state != 1)
            return;
        if (this.changeOriState)
            return;
        if (this.currentChangePostionBattler)
            return;
        if (MouseControl.selectSceneObject) {
            var cursorGridPoint = MouseControl.selectSceneObject.posGrid;
            var isReadyGrid = Game.currentScene.getDataGridState(3, cursorGridPoint.x, cursorGridPoint.y) == 1;
            if (isReadyGrid && GameBattleHelper.isPlayerCamp(MouseControl.selectSceneObject)) {
                MouseControl.selectSceneObject.root.startDrag();
                MouseControl.selectSceneObject.root.on(EventObject.DRAG_MOVE, this, this.onDragSceneObjectMove, [MouseControl.selectSceneObject]);
                stage.once(EventObject.MOUSE_UP, this, this.onMouseUp, [MouseControl.selectSceneObject, MouseControl.selectSceneObject.x, MouseControl.selectSceneObject.y]);
                return;
            }
        }
        var inSceneMouseGridPoint = GameBattleHelper.inSceneMouseGridPoint;
        GameBattleAction.cursorJumpToGridPoint(inSceneMouseGridPoint);
    };
    GUI_BattleReady.prototype.onMouseUp = function (selectSceneObject, oldX, oldY) {
        var cursorPoint = new Point(selectSceneObject.root.x, selectSceneObject.root.y);
        var cursorGridPoint = GameUtils.getGridPostion(cursorPoint);
        cursorPoint = GameUtils.getGridCenter(cursorPoint);
        var isReadyGrid = Game.currentScene.getDataGridState(3, cursorGridPoint.x, cursorGridPoint.y) == 1;
        if (isReadyGrid) {
            var targetSceneObjects = Game.currentScene.sceneUtils.gridSceneObjects[cursorGridPoint.x][cursorGridPoint.y].concat();
            ArrayUtils.remove(targetSceneObjects, GameBattleHelper.cursor);
            ArrayUtils.remove(targetSceneObjects, selectSceneObject);
            var overCursorSceneObject = targetSceneObjects[0];
            if (overCursorSceneObject) {
                if (!GameBattleHelper.isPlayerCamp(overCursorSceneObject)) {
                    GameAudio.playSE(ClientWorld.data.disalbeSE);
                    selectSceneObject.setTo(oldX, oldY);
                    return;
                }
                overCursorSceneObject.setTo(selectSceneObject.x, selectSceneObject.y);
            }
            selectSceneObject.setTo(cursorPoint.x, cursorPoint.y);
        }
        else {
            var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(selectSceneObject.battlerSetting.battleActor);
            if (inPlayerActorIndex >= 0 && selectSceneObject.battlerSetting.usePlayerActors && !selectSceneObject.battlerSetting.mustInBattle) {
                this.backActorFromScene(inPlayerActorIndex, selectSceneObject);
                MouseControl.selectSceneObject = null;
            }
            else {
                GUI_Manager.setWarning(0);
                GameAudio.playSE(ClientWorld.data.disalbeSE);
                selectSceneObject.setTo(oldX, oldY);
            }
        }
        selectSceneObject.root.stopDrag();
    };
    GUI_BattleReady.prototype.onRightMouseDown = function (e) {
        if (!this.stage)
            return;
        if (GameDialog.isInDialog)
            return;
        if (GameBattle.state != 1)
            return;
        if (this.currentChangePostionBattler) {
            this.stopChangeBattlerPostion(this.currentChangePostionBattler);
        }
        else if (!this.changeOriState) {
            GUI_Manager.setWarning(1);
        }
    };
    GUI_BattleReady.prototype.onDragSceneObjectMove = function (selectSceneObject) {
        selectSceneObject.refreshCoordinate(false, false, false);
    };
    GUI_BattleReady.prototype.nextSceneObjectCtrlOri = function () {
        var _this = this;
        if (this.isInChangeSceneObjectOri)
            return;
        this.isInChangeSceneObjectOri = true;
        var doNextSceneObjectCtrlOri = function () {
            _this.isInChangeSceneObjectOri = false;
            var targetSo = _this.needChangeOriSceneObjects[_this.currentChangeOriSceneObjectIndex];
            if (targetSo == null) {
                GameBattle.start();
                return;
            }
            _this.currentChangeOriSceneObject = targetSo;
            var targetSoinPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(targetSo.battlerSetting.battleActor);
            if (targetSoinPlayerActorIndex >= 0) {
                _this.actorList.selectedIndex = targetSoinPlayerActorIndex;
            }
            else {
                _this.actorInfo.setActor(targetSo.battlerSetting.battleActor);
            }
            GameCommand.startCommonCommand(14029, [], null, targetSo, targetSo);
            GameBattleHelper.cursor.setTo(targetSo.x, targetSo.y);
            _this.currentChangeOriSceneObjectIndex++;
        };
        if (this.currentChangeOriSceneObject) {
            GameCommand.startCommonCommand(14030, [], Callback.New(function () {
                doNextSceneObjectCtrlOri.apply(_this);
            }, this), this.currentChangeOriSceneObject, this.currentChangeOriSceneObject);
        }
        else {
            doNextSceneObjectCtrlOri.apply(this);
        }
    };
    GUI_BattleReady.readyBattleActorCount = 0;
    return GUI_BattleReady;
}(GUI_13));
//# sourceMappingURL=GUI_BattleReady.js.map