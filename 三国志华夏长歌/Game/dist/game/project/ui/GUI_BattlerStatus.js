














var GUI_BattlerStatus = (function (_super) {
    __extends(GUI_BattlerStatus, _super);
    function GUI_BattlerStatus() {
        var _this = _super.call(this) || this;
        _this.on(EventObject.DISPLAY, _this, _this.onDisplay);
        return _this;
    }
    GUI_BattlerStatus.prototype.onDisplay = function () {
        this.refreshActorDataPanel();
        this.refreshStatus();
    };
    GUI_BattlerStatus.prototype.refreshActorDataPanel = function () {
        var battler = GameBattleHelper.overCursorNoDeadBattler;
        if (!battler)
            return;
        var selectedActor = battler.battlerSetting.battleActor;
        var lv = GameBattleHelper.getLevelByActor(selectedActor);
        this.actorFace.image = selectedActor.face;
        this.actorName.text = selectedActor.name;
        this.smallAvatar.avatarID = selectedActor.avatar;
        var classData = GameData.getModuleData(2, selectedActor.class);
        this.actorClass.text = classData ? classData.name : "";
        if (selectedActor.growUpEnabled) {
            this.actorLv.text = "LV." + lv;
            var nextExp = Game.getLevelUpNeedExp(selectedActor, lv);
            this.actorExpInfo.text = selectedActor.currentEXP + "/" + nextExp;
            this.actorExpSlider.value = selectedActor.currentEXP * 100 / nextExp;
        }
        else {
            this.actorLv.text = "-----";
            this.actorExpInfo.text = "-----";
            this.actorExpSlider.value = 100;
        }
        this.maxHP.text = selectedActor.MaxHP.toString();
        this.maxSP.text = selectedActor.MaxSP.toString();
        this.atk.text = selectedActor.ATK.toString();
        this.def.text = selectedActor.DEF.toString();
        this.agi.text = selectedActor.AGI.toString();
        this.mag.text = selectedActor.MAG.toString();
        this.magDef.text = selectedActor.MagDef.toString();
        this.pow.text = selectedActor.POW.toString();
        this.end.text = selectedActor.END.toString();
        this.moveGrid.text = selectedActor.MoveGrid.toString();
        this.hit.text = selectedActor.HIT.toString();
        this.dod.text = selectedActor.DOD.toString();
        this.crit.text = selectedActor.CRIT.toString();
        this.magCrit.text = selectedActor.MagCrit.toString();
    };
    GUI_BattlerStatus.prototype.refreshStatus = function () {
        var battler = GameBattleHelper.overCursorNoDeadBattler;
        if (!battler)
            return;
        var selectedActor = battler.battlerSetting.battleActor;
        var arr = [];
        for (var i = 0; i < selectedActor.status.length; i++) {
            var status = selectedActor.status[i];
            var d = new ListItem_1028;
            d.icon = status.icon;
            d.tipsLabel = GUI_Manager.statusDesc(status);
            arr.push(d);
        }
        this.statusList.items = arr;
    };
    return GUI_BattlerStatus;
}(GUI_19));
//# sourceMappingURL=GUI_BattlerStatus.js.map