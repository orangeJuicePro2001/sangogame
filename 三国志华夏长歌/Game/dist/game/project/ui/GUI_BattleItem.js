














var GUI_BattleItem = (function (_super) {
    __extends(GUI_BattleItem, _super);
    function GUI_BattleItem() {
        var _this = _super.call(this) || this;
        GUI_Manager.standardList(_this.itemList);
        _this.on(EventObject.DISPLAY, _this, _this.onDisplay);
        _this.itemList.on(EventObject.CHANGE, _this, _this.onActorItemChange);
        _this.itemList.on(UIList.ITEM_CLICK, _this, _this.onItemUIItemClick);
        _this.itemList.onCreateItem = Callback.New(_this.onCreateItemUIItem, _this);
        return _this;
    }
    GUI_BattleItem.prototype.onDisplay = function () {
        this.refreshItemList();
        UIList.focus = this.itemList;
        this.refreshDescribe();
    };
    GUI_BattleItem.prototype.refreshItemList = function () {
        var battler = GameBattleController.currentOperationBattler;
        if (!battler) {
            this.itemList.items = [];
            return;
        }
        var battlerActor = battler.battlerSetting.battleActor;
        var arr = [];
        for (var i = 0; i < WorldData.actorItemMax; i++) {
            var item = battlerActor.items[i];
            if (item && item.isUse) {
                var d = new ListItem_1008;
                d.icon = item.icon;
                d.data = item;
                arr.push(d);
            }
        }
        if (arr.length == 0) {
            var d = new ListItem_1008;
            arr.push(d);
        }
        this.itemList.items = arr;
    };
    GUI_BattleItem.prototype.onActorItemChange = function () {
        this.refreshDescribe();
    };
    GUI_BattleItem.prototype.onItemUIItemClick = function () {
        var battler = GameBattleController.currentOperationBattler;
        var item = this.itemList.selectedItem ? this.itemList.selectedItem.data : null;
        if (!battler || !item)
            return;
        var useEnabled = GameBattleHelper.canUseOneItem(battler, item);
        if (!useEnabled) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        GameCommand.startCommonCommand(15022);
        Callback.CallLaterBeforeRender(function () {
            EventUtils.happen(GUI_BattleItem, GUI_BattleItem.EVENT_SELECT_ITEM, [item]);
        }, this);
    };
    GUI_BattleItem.prototype.onCreateItemUIItem = function (ui, data, index) {
        var item = data.data;
        ui.icon.visible = item ? true : false;
        if (item) {
            var battler = GameBattleController.currentOperationBattler;
            if (!battler)
                return;
            var useEnabled = GameBattleHelper.canUseOneItem(battler, item);
            if (!useEnabled) {
                if (WorldData.iconDisabledAni) {
                    var disabledAni = new GCAnimation;
                    disabledAni.id = WorldData.iconDisabledAni;
                    disabledAni.loop = true;
                    disabledAni.target = ui.icon;
                }
                else {
                    ui.icon.setTonal(0, 0, 0, 100);
                }
            }
            else {
                ui.icon.setTonal(0, 0, 0, 0);
            }
        }
    };
    GUI_BattleItem.prototype.refreshDescribe = function () {
        var battler = GameBattleController.currentOperationBattler;
        if (!battler || !this.itemList.selectedItem)
            return;
        var name = "";
        var desc = "";
        if (UIList.focus == this.itemList) {
            var itemData = this.itemList.selectedItem;
            var item = itemData.data;
            if (item) {
                name = item.name;
                desc = GUI_Manager.itemDesc(item);
            }
        }
        this.tipsUI.descName.text = name;
        this.tipsUI.descText.text = desc;
        this.tipsUI.descText.height = this.tipsUI.descText.textHeight;
        this.tipsUI.descTextBox.refresh();
        this.tipsUI.cdBox.visible = false;
    };
    GUI_BattleItem.EVENT_SELECT_ITEM = "GUI_BattleItemEVENT_SELECT_ITEM";
    return GUI_BattleItem;
}(GUI_18));
//# sourceMappingURL=GUI_BattleItem.js.map