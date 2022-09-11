














var GUI_Package = (function (_super) {
    __extends(GUI_Package, _super);
    function GUI_Package() {
        var _this = _super.call(this) || this;
        GUI_Manager.standardList(_this.list, false);
        GUI_Manager.standardList(_this.actorList, false);
        _this.on(EventObject.DISPLAY, _this, _this.onDisplay);
        _this.list.on(EventObject.CHANGE, _this, _this.refreshItemInfo);
        _this.list.on(UIList.ITEM_CLICK, _this, _this.onItemClick);
        EventUtils.addEventListenerFunction(ProjectPlayer, ProjectPlayer.EVENT_CHANGE_ITEM_NUMBER, _this.onItemChange, _this);
        _this.list.on(UIList.ITEM_CREATE, _this, _this.onCreateItemUI);
        _this.actorList.on(UIList.ITEM_CLICK, _this, _this.onActorItemClick);
        return _this;
    }
    GUI_Package.prototype.onDisplay = function () {
        UIList.focus = this.list;
        this.refreshItems(0);
        this.refreshItemInfo();
        this.targetPanel.visible = false;
    };
    GUI_Package.prototype.onItemChange = function () {
        Callback.CallLaterBeforeRender(this.refreshItems, this, [0]);
    };
    GUI_Package.prototype.onCreateItemUI = function (ui, data, index) {
        var itemDS = data.data;
        if (!itemDS)
            ui.alpha = 0;
    };
    GUI_Package.prototype.onItemClick = function () {
        var _this = this;
        if (this.useItemLock)
            return;
        var selectedItem = this.list.selectedItem;
        if (selectedItem && selectedItem.data) {
            var itemDS = selectedItem.data;
            if (itemDS.isEquip) {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
            var item = itemDS.item;
            if (item.isUse && item.useType != 2 && itemDS.number > 0) {
                if (item.isSingleTarget) {
                    this.startSelectTarget(function () { _this.onUseItem(itemDS); });
                }
                else {
                    this.onUseItem(itemDS);
                }
            }
            else {
                GameAudio.playSE(WorldData.disalbeSE);
                return;
            }
        }
    };
    GUI_Package.prototype.onUseItem = function (itemDS) {
        var _this = this;
        if (itemDS.number <= 0) {
            GameAudio.playSE(WorldData.disalbeSE);
            return;
        }
        var item = itemDS.item;
        if (item.se)
            GameAudio.playSE(item.se);
        this.useItemLock = true;
        var trigger = CommandPage.startTriggerFragmentEvent(item.callEvent, Game.player.sceneObject, Game.player.sceneObject, Callback.New(function () {
            _this.refreshTargetPanel();
            _this.useItemLock = false;
        }, this));
        if (!trigger)
            this.useItemLock = false;
        if (item.isConsumables)
            ProjectPlayer.changeItemNumber(item.id, -1, false);
    };
    GUI_Package.prototype.onActorItemClick = function () {
        GUI_Package.actorSelectedIndex = this.actorList.selectedIndex;
        this.onSelectTargetUseItem.apply(this);
    };
    GUI_Package.prototype.startSelectTarget = function (onSelectTargetUseItem) {
        GameAudio.playSE(WorldData.sureSE);
        this.targetPanel.visible = true;
        this.refreshTargetPanel();
        UIList.focus = this.actorList;
        this.onSelectTargetUseItem = onSelectTargetUseItem;
    };
    GUI_Package.prototype.refreshItems = function (state) {
        if (state != 0)
            return;
        var arr = [];
        for (var i = 0; i < Game.player.data.package.length; i++) {
            var d = new ListItem_1002;
            var itemDS = Game.player.data.package[i];
            d.data = itemDS;
            if (itemDS.isEquip) {
                d.icon = itemDS.equip.icon;
                d.itemName = itemDS.equip.name;
            }
            else {
                d.icon = itemDS.item.icon;
                d.itemName = itemDS.item.name;
            }
            d.itemNum = itemDS.number.toString() + "x";
            arr.push(d);
        }
        if (Game.player.data.package.length == 0) {
            var emptyItem = new ListItem_1002;
            emptyItem.icon = "";
            emptyItem.itemName = "";
            emptyItem.itemNum = "";
            arr.push(emptyItem);
        }
        this.list.items = arr;
    };
    GUI_Package.prototype.refreshItemInfo = function () {
        var selectedItem = this.list.selectedItem;
        if (!selectedItem || !selectedItem.data) {
            this.itemName.text = "";
            this.itemIntro.text = "";
        }
        else {
            var itemDS = selectedItem.data;
            if (itemDS.isEquip) {
                this.itemName.text = itemDS.equip.name;
                this.itemIntro.text = GUI_Manager.equipDesc(itemDS.equip);
            }
            else {
                this.itemName.text = itemDS.item.name;
                this.itemIntro.text = itemDS.item.intro;
            }
        }
        this.itemIntro.height = this.itemIntro.textHeight;
        this.itemIntroRoot.refresh();
    };
    GUI_Package.prototype.refreshTargetPanel = function () {
        var items = [];
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var d = new ListItem_1010;
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            var actorClass = GameData.getModuleData(2, actor.class);
            Game.refreshActorAttribute(actor, actorDS.lv);
            d.actorFace = actor.smallFace;
            d.actorName = actor.name;
            d.actorLv = actorDS.actor.growUpEnabled ? actorDS.lv.toString() : "--";
            d.hpText = actor.MaxHP.toString();
            d.spText = actor.MaxSP.toString();
            d.actorClassIcon = actorClass ? actorClass.icon : "";
            d.hpSlider = 100;
            d.spSlider = 100;
            items.push(d);
        }
        this.actorList.items = items;
    };
    return GUI_Package;
}(GUI_4));
//# sourceMappingURL=GUI_Package.js.map