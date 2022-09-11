














var GUI_HitReward = (function (_super) {
    __extends(GUI_HitReward, _super);
    function GUI_HitReward() {
        var _this = _super.call(this) || this;
        _this.getExpAnimationTask = "getExpAnimationTask";
        _this.preSkillBlockY = _this.skillBlock.y;
        _this.on(EventObject.DISPLAY, _this, _this.onDisplay);
        _this.dropItemList.on(UIList.ITEM_CREATE, _this, _this.onCreateDropItemListDisplayItem);
        return _this;
    }
    GUI_HitReward.prototype.onDisplay = function () {
        this.itemBlock.visible = false;
        this.skillBlock.visible = false;
        this.taskShowGetExp();
        this.taskShowGetItems();
        this.taskShowLearnSkills();
        this.taskCloseUI();
    };
    GUI_HitReward.prototype.onCreateDropItemListDisplayItem = function (ui, data, index) {
        var goodsInfo = data.data;
        var isEquip = data.data[0];
        ui.itemNumLabel.visible = !isEquip;
        ui.itemNum.visible = !isEquip;
    };
    GUI_HitReward.prototype.taskShowGetExp = function () {
        var _this = this;
        var actor = GUI_HitReward.rewardActor;
        var increaseExpRes = GUI_HitReward.increaseExpRes;
        this.actorFace.image = GUI_HitReward.rewardActor.face;
        this.actorName.text = GUI_HitReward.rewardActor.name;
        this.getExp.text = GameBattlerHandler.hitReward.exp.toString();
        this.getGold.text = GameBattlerHandler.hitReward.gold.toString();
        this.lvBox.visible = true;
        if (!increaseExpRes) {
            this.lv.text = GameBattleHelper.getLevelByActor(GUI_HitReward.rewardActor).toString();
            this.EXPSlider.value = 100;
            this.actorExp.text = "";
            this.lvBox.visible = GUI_HitReward.rewardActor.growUpEnabled;
            return;
        }
        this.lv.text = increaseExpRes.fromLv.toString();
        for (var lv = increaseExpRes.fromLv; lv <= increaseExpRes.toLv; lv++) {
            var thisLvStartExp;
            if (lv == increaseExpRes.fromLv) {
                thisLvStartExp = increaseExpRes.fromExp;
            }
            else {
                thisLvStartExp = 0;
            }
            var thisLvEndExp;
            var thisLvNeedExp = Game.getLevelUpNeedExp(actor, lv);
            if (lv == increaseExpRes.toLv) {
                thisLvEndExp = GUI_HitReward.increaseExpRes.toExp;
            }
            else {
                thisLvEndExp = thisLvNeedExp;
            }
            new SyncTask(this.getExpAnimationTask, function (lv, thisLvStartExp, thisLvEndExp, thisLvNeedExp) {
                _this.lv.text = lv.toString();
                _this.EXPSlider.value = thisLvStartExp * 100 / thisLvNeedExp;
                var toValue = thisLvEndExp * 100 / thisLvNeedExp;
                if (lv != increaseExpRes.fromLv) {
                    GameCommand.startCommonCommand(14044, [], null, GUI_HitReward.rewardBattler, GUI_HitReward.rewardBattler);
                }
                _this.actorShowExpValue = thisLvStartExp;
                _this.actorShowNextExpValue = thisLvNeedExp;
                Tween.to(_this.EXPSlider, { value: toValue }, 1000, null, Callback.New(function () {
                    SyncTask.taskOver(_this.getExpAnimationTask);
                }, _this));
                Tween.to(_this, { actorShowExpValue: thisLvEndExp }, 1000, null, Callback.New(function () {
                }, _this));
            }, [lv, thisLvStartExp, thisLvEndExp, thisLvNeedExp]);
        }
    };
    GUI_HitReward.prototype.taskShowGetItems = function () {
        var _this = this;
        var dropItems = GameBattlerHandler.hitReward.items;
        var dropEquips = GameBattlerHandler.hitReward.equips;
        if (dropItems.length == 0 && dropEquips.length == 0) {
            this.dropItemList.items = [];
            return;
        }
        var arr = [];
        for (var i = 0; i < dropItems.length; i++) {
            var dropItemInfo = dropItems[i];
            var dropItem = GameData.getModuleData(5, dropItemInfo.itemID);
            var d = new ListItem_1029;
            d.data = [false, dropItem];
            d.icon = dropItem.icon;
            d.itemNum = dropItemInfo.num.toString();
            d.itemName = dropItem.name;
            arr.push(d);
        }
        for (var i = 0; i < dropEquips.length; i++) {
            var dropEquip = dropEquips[i];
            var d = new ListItem_1029;
            d.data = [true, dropEquip];
            d.icon = dropEquip.icon;
            d.itemNum = "1";
            d.itemName = dropEquip.name;
            arr.push(d);
        }
        this.dropItemList.items = arr;
        new SyncTask(this.getExpAnimationTask, function () {
            _this.itemBlock.visible = true;
            setTimeout(function () {
                SyncTask.taskOver(_this.getExpAnimationTask);
            }, 1000);
        });
    };
    GUI_HitReward.prototype.taskShowLearnSkills = function () {
        var _this = this;
        if (!GUI_HitReward.increaseExpRes)
            return;
        var learnSkills = GUI_HitReward.increaseExpRes.learnSkills;
        if (learnSkills.length == 0) {
            this.learnSkillList.items = [];
            return;
        }
        var arr = [];
        for (var i = 0; i < learnSkills.length; i++) {
            var learnSkill = learnSkills[i];
            var d = new ListItem_1030;
            d.data = learnSkill;
            d.icon = learnSkill.icon;
            arr.push(d);
        }
        this.learnSkillList.items = arr;
        new SyncTask(this.getExpAnimationTask, function () {
            _this.skillBlock.visible = true;
            setTimeout(function () {
                SyncTask.taskOver(_this.getExpAnimationTask);
            }, 1000);
        });
    };
    GUI_HitReward.prototype.taskCloseUI = function () {
        var _this = this;
        new SyncTask(this.getExpAnimationTask, function () {
            setTimeout(function () {
                SyncTask.taskOver(_this.getExpAnimationTask);
                GameUI.hide(_this.guiID);
            }, 1000);
        });
    };
    Object.defineProperty(GUI_HitReward.prototype, "actorShowExpValue", {
        get: function () {
            return this._actorShowExpValue;
        },
        set: function (v) {
            this._actorShowExpValue = v;
            this.actorExp.text = Math.floor(v) + "/" + this.actorShowNextExpValue;
        },
        enumerable: false,
        configurable: true
    });
    return GUI_HitReward;
}(GUI_22));
//# sourceMappingURL=GUI_HitReward.js.map