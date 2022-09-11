var GUI_SaveFileManager = (function () {
    function GUI_SaveFileManager() {
    }
    GUI_SaveFileManager.initSaveFileList = function (list, saveMode) {
        if (saveMode === void 0) { saveMode = false; }
        GUI_Manager.standardList(list);
        list.on(EventObject.DISPLAY, this, GUI_SaveFileManager.onSaveFileListDisplay, [list]);
        list.onCreateItem = Callback.New(GUI_SaveFileManager.onCreateSaveFileItem, GUI_SaveFileManager, [saveMode]);
        list.on(UIList.ITEM_CLICK, this, GUI_SaveFileManager.onListItemClick, [list, saveMode]);
        stage.on(EventObject.KEY_DOWN, this, GUI_SaveFileManager.onKeyDown, [list]);
    };
    GUI_SaveFileManager.saveFile = function (id, executeEvent, onFin, waitEventCompleteCallback) {
        var _this = this;
        if (executeEvent === void 0) { executeEvent = true; }
        if (onFin === void 0) { onFin = null; }
        if (waitEventCompleteCallback === void 0) { waitEventCompleteCallback = true; }
        SinglePlayerGame.saveGame(id, Callback.New(function (success) {
            if (executeEvent) {
                if (onFin && !waitEventCompleteCallback)
                    onFin.run();
                if (success) {
                    var saveUI = GameUI.get(5);
                    if (saveUI)
                        GUI_SaveFileManager.refreshSaveFileItem(saveUI.list);
                    GameCommand.startCommonCommand(14008, [], Callback.New(function (onFin) {
                        onFin && onFin.run();
                    }, _this, [waitEventCompleteCallback ? onFin : null]), Game.player.sceneObject, Game.player.sceneObject);
                }
                else {
                    GameCommand.startCommonCommand(14009, [], Callback.New(function (onFin) {
                        onFin && onFin.run();
                    }, _this, [waitEventCompleteCallback ? onFin : null]), Game.player.sceneObject, Game.player.sceneObject);
                }
            }
            else {
                if (onFin)
                    onFin.run();
            }
        }, this), this.getCustomSaveIndexInfo());
    };
    GUI_SaveFileManager.loadFile = function (id, onFin) {
        var _this = this;
        if (onFin === void 0) { onFin = null; }
        if (GUI_SaveFileManager.isLoading)
            return;
        GUI_SaveFileManager.isLoading = true;
        if (Game.currentScene != ClientScene.EMPTY) {
            if (SinglePlayerGame.getSaveInfoByID(id) == null)
                return;
            LocalStorage.setJSON(GUI_SaveFileManager.onceInSceneLoadGameSign, { id: id });
            window.location.reload();
            return;
        }
        SinglePlayerGame.loadGame(id, Callback.New(function (success, customData) {
            if (success) {
                EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(function () {
                    if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                        GUI_SaveFileManager.isLoading = false;
                    }
                }, _this));
            }
            else {
                GameCommand.startCommonCommand(14007, [], null, Game.player.sceneObject, Game.player.sceneObject);
                GUI_SaveFileManager.isLoading = false;
            }
            GUI_SaveFileManager.currentSaveFileCustomData = customData;
            if (onFin)
                onFin.runWith([success]);
        }, this));
    };
    GUI_SaveFileManager.onSaveFileListDisplay = function (list) {
        UIList.focus = list;
        this.refreshSaveFileItem(list);
    };
    GUI_SaveFileManager.onListItemClick = function (list, saveMode) {
        var selectedIndex = list.selectedIndex;
        if (selectedIndex < 0)
            return;
        if (saveMode) {
            GUI_SaveFileManager.saveFile(selectedIndex + 1);
        }
        else {
            var saveFileData = list.selectedItem.data;
            if (!saveFileData)
                return;
            GUI_SaveFileManager.currentSveFileIndexInfo = saveFileData;
            GUI_SaveFileManager.loadFile(selectedIndex + 1);
        }
    };
    GUI_SaveFileManager.onCreateSaveFileItem = function (saveMode, ui, data, index) {
        var saveFileData = data.data;
        if (ui.screenshotImg)
            ui.screenshotImg.visible = (saveFileData ? true : false);
        if (ui.delBtn) {
            ui.delBtn.on(EventObject.MOUSE_DOWN, this, function (e) { e.stopPropagation(); });
            if (saveFileData) {
                ui.delBtn.visible = true;
                ui.delBtn.commandInputMessage = [saveFileData.id];
            }
            else {
                ui.delBtn.visible = false;
            }
        }
    };
    GUI_SaveFileManager.refreshSaveFileItem = function (list) {
        if (!list)
            return;
        var saveInfo = SinglePlayerGame.getSaveInfo();
        var items = [];
        for (var i = 1; i <= WorldData.saveFileMax; i++) {
            var saveFile = ArrayUtils.matchAttributes(saveInfo, { id: i }, true)[0];
            var itemData = new ListItem_1001();
            itemData.no = i.toString();
            if (saveFile) {
                itemData.data = saveFile;
                itemData.screenshotImg = saveFile.indexInfo.screenshotImg;
                itemData.mapName = saveFile.indexInfo.mapName;
                itemData.gameTimeStr = ProjectUtils.timerFormat(saveFile.indexInfo.gameTime);
                itemData.dateStr = ProjectUtils.dateFormat("YYYY-mm-dd HH:MM", new Date(saveFile.now));
            }
            else {
                itemData.screenshotImg = "";
                itemData.mapName = "空";
                itemData.gameTimeStr = "----/----";
                itemData.dateStr = "----/----";
            }
            items.push(itemData);
        }
        list.items = items;
    };
    GUI_SaveFileManager.getCustomSaveIndexInfo = function () {
        var per = 0.1;
        var oldUILayerVisible = Game.layer.uiLayer.visible;
        Game.layer.uiLayer.visible = false;
        var fullScreenTex = AssetManager.drawToTexture(Game.layer, stage.width, stage.height);
        Game.layer.uiLayer.visible = oldUILayerVisible;
        var screenRoot = new GameSprite();
        var screenBitmap = new UIBitmap;
        screenBitmap.texture = fullScreenTex;
        screenRoot.addChild(screenBitmap);
        screenBitmap.scaleX = screenBitmap.scaleY = per;
        var smallScreenTex = AssetManager.drawToTexture(screenRoot, MathUtils.int(stage.width * per), MathUtils.int(stage.height * per));
        fullScreenTex.dispose();
        var smallScreenTexBase64 = AssetManager.textureToBase64(smallScreenTex);
        smallScreenTex.dispose();
        var customSaveIndexInfo = new SaveFileListCustomData;
        customSaveIndexInfo.screenshotImg = smallScreenTexBase64;
        customSaveIndexInfo.gameTime = new Date().getTime() - ProjectGame.gameStartTime.getTime();
        customSaveIndexInfo.mapName = Game.currentScene.name;
        return customSaveIndexInfo;
    };
    GUI_SaveFileManager.onKeyDown = function (list, e) {
        if (list.stage && UIList.focus == list) {
            if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.X)) {
                var ui = list.getItemUI(list.selectedIndex);
                var uiComp = ui.delBtn;
                GameCommand.startUICommand(uiComp, 0, uiComp.commandInputMessage);
            }
        }
    };
    GUI_SaveFileManager.onceInSceneLoadGameSign = "gc_rpg_greenFeather_" + window.location.href;
    GUI_SaveFileManager.isLoading = false;
    return GUI_SaveFileManager;
}());
var SaveFileListCustomData = (function () {
    function SaveFileListCustomData() {
    }
    return SaveFileListCustomData;
}());
//# sourceMappingURL=GUI_SaveFileManager.js.map