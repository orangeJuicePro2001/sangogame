














var GUI_BattlerExchangeItem = (function (_super) {
    __extends(GUI_BattlerExchangeItem, _super);
    function GUI_BattlerExchangeItem() {
        var _this = _super.call(this) || this;
        GUI_Manager.standardList(_this.itemPackageList1);
        GUI_Manager.standardList(_this.itemPackageList2);
        stage.on(EventObject.KEY_DOWN, _this, _this.onKeyDown);
        _this.actorPanel1.on(EventObject.MOUSE_DOWN, _this, _this.onListMouseDown, [_this.itemPackageList1]);
        _this.actorPanel2.on(EventObject.MOUSE_DOWN, _this, _this.onListMouseDown, [_this.itemPackageList2]);
        _this.itemPackageList1.on(UIList.ITEM_CLICK, _this, _this.onItemClick, [_this.itemPackageList1]);
        _this.itemPackageList2.on(UIList.ITEM_CLICK, _this, _this.onItemClick, [_this.itemPackageList1]);
        stage.on(EventObject.RIGHT_CLICK, _this, _this.onRightMouseDown);
        return _this;
    }
    GUI_BattlerExchangeItem.prototype.setData = function (battler1, battler2) {
        this.battler1 = battler1;
        this.battler2 = battler2;
        this.actor1 = this.battler1.battlerSetting.battleActor;
        this.actor2 = this.battler2.battlerSetting.battleActor;
        this.actorFace1.image = this.actor1.face;
        this.actorFace2.image = this.actor2.face;
        this.actorName1.text = this.actor1.name;
        this.actorName2.text = this.actor2.name;
        this.refreshItem(this.itemPackageList1, this.actor1);
        this.refreshItem(this.itemPackageList2, this.actor2);
        this.itemPackageList2.selectedIndex = -1;
        UIList.focus = this.itemPackageList1;
    };
    GUI_BattlerExchangeItem.prototype.onKeyDown = function (e) {
        if (!this.stage)
            return;
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            if (this.exChangeFromItemInfo)
                return;
            this.itemPackageList2.selectedIndex = -1;
            UIList.focus = this.itemPackageList1;
            this.itemPackageList1.selectedIndex = 0;
            GameAudio.playSE(WorldData.selectSE);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            if (this.exChangeFromItemInfo)
                return;
            this.itemPackageList1.selectedIndex = -1;
            UIList.focus = this.itemPackageList2;
            this.itemPackageList2.selectedIndex = 0;
            GameAudio.playSE(WorldData.selectSE);
        }
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            if (this.exChangeFromItemInfo) {
                this.cancelExChangeItem();
            }
            else {
                GameCommand.startUICommand(this.closeBtn, 0);
            }
        }
    };
    GUI_BattlerExchangeItem.prototype.onRightMouseDown = function (e) {
        if (!this.stage)
            return;
        if (this.exChangeFromItemInfo) {
            this.cancelExChangeItem();
        }
        else {
            GameCommand.startUICommand(this.closeBtn, 0);
        }
    };
    GUI_BattlerExchangeItem.prototype.onItemClick = function (e) {
        if (!this.exChangeFromItemInfo) {
            this.startExChangeItem();
        }
        else {
            this.doExChangeItem();
        }
    };
    GUI_BattlerExchangeItem.prototype.onListMouseDown = function (list) {
        if (this.exChangeFromItemInfo)
            return;
        if (UIList.focus != list) {
            UIList.focus = list;
            var anotherList = UIList.focus == this.itemPackageList1 ? this.itemPackageList2 : this.itemPackageList1;
            anotherList.selectedIndex = -1;
            GameAudio.playSE(WorldData.selectSE);
        }
    };
    GUI_BattlerExchangeItem.prototype.refreshItem = function (list, actor) {
        var arr = [];
        var lastSelectedIndex = list.selectedIndex;
        if (lastSelectedIndex == -1)
            lastSelectedIndex = 0;
        var actorItemMax = WorldData.actorItemMax;
        for (var i = 0; i < actorItemMax; i++) {
            var item = actor.items[i];
            var d = new ListItem_1031;
            if (item) {
                d.data = item;
                d.icon = item.icon;
                d.itemName = item.name;
            }
            else {
                d.icon = "";
                d.itemName = "--------";
            }
            arr.push(d);
        }
        list.items = arr;
        list.selectedIndex = lastSelectedIndex;
    };
    GUI_BattlerExchangeItem.prototype.startExChangeItem = function () {
        var fromActor = UIList.focus == this.itemPackageList1 ? this.actor1 : this.actor2;
        var fromList = UIList.focus;
        var toList = UIList.focus == this.itemPackageList1 ? this.itemPackageList2 : this.itemPackageList1;
        var itemPostion = UIList.focus.selectedIndex;
        if (itemPostion < 0 || itemPostion >= WorldData.actorItemMax)
            return;
        var fromItem = fromActor.items[itemPostion];
        if (!fromItem) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        var fromItemUI = fromList.getItemUI(itemPostion);
        fromItemUI.alpha = 0.5;
        this.exChangeFromItemInfo = { actor: fromActor, itemPostion: itemPostion, fromList: fromList };
        UIList.focus = toList;
        toList.selectedIndex = 0;
    };
    GUI_BattlerExchangeItem.prototype.doExChangeItem = function () {
        var toList = UIList.focus == this.itemPackageList1 ? this.itemPackageList1 : this.itemPackageList2;
        var toActor = UIList.focus == this.itemPackageList1 ? this.actor1 : this.actor2;
        var toPostion = toList.selectedIndex;
        var toItem = toActor.items[toPostion];
        var fromItem = this.exChangeFromItemInfo.actor.items[this.exChangeFromItemInfo.itemPostion];
        this.exChangeFromItemInfo.actor.items[this.exChangeFromItemInfo.itemPostion] = toItem;
        toActor.items[toPostion] = fromItem;
        this.refreshItem(this.itemPackageList1, this.actor1);
        this.refreshItem(this.itemPackageList2, this.actor2);
        if (toList != this.exChangeFromItemInfo.fromList) {
            this.exChangeFromItemInfo.fromList.selectedIndex = -1;
        }
        this.exChangeFromItemInfo = null;
    };
    GUI_BattlerExchangeItem.prototype.cancelExChangeItem = function () {
        if (this.exChangeFromItemInfo) {
            var toList = UIList.focus == this.itemPackageList1 ? this.itemPackageList1 : this.itemPackageList2;
            toList.selectedIndex = -1;
            UIList.focus = this.exChangeFromItemInfo.fromList;
            this.exChangeFromItemInfo.fromList.getItemUI(this.exChangeFromItemInfo.itemPostion).alpha = 1;
            this.exChangeFromItemInfo = null;
            GameAudio.playSE(WorldData.cancelSE);
        }
    };
    return GUI_BattlerExchangeItem;
}(GUI_26));
//# sourceMappingURL=GUI_BattlerExchangeItem.js.map