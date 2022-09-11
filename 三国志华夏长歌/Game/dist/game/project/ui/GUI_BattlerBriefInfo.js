














var GUI_BattlerBriefInfo = (function (_super) {
    __extends(GUI_BattlerBriefInfo, _super);
    function GUI_BattlerBriefInfo() {
        return _super.call(this) || this;
    }
    GUI_BattlerBriefInfo.prototype.setActor = function (actor, battler) {
        if (battler === void 0) { battler = null; }
        var isSameActor = actor == this.actor;
        this.actor = actor;
        if (!this.actor) {
            return;
        }
        this.battler = battler;
        this.refreshHP(isSameActor && battler && !battler.battlerSetting.isDead);
        this.refreshSP(isSameActor && battler && !battler.battlerSetting.isDead);
        this.refreshStatus();
        this.refreshLevel();
        if (!isSameActor) {
            this.actorName.text = actor.name;
            this.actorFace.image = actor.face;
            this.actorCamp.selected = battler ? (battler.battlerSetting.battleCamp == 1) : false;
            var classData = GameData.getModuleData(2, actor.class);
            this.actorClassName.text = classData.name;
            this.actorClassIcon.image = classData.icon;
        }
        if (battler)
            this.deadSign.visible = battler && battler.battlerSetting.isDead;
        else
            this.deadSign.visible = false;
    };
    GUI_BattlerBriefInfo.prototype.refreshHP = function (showEffect) {
        if (showEffect === void 0) { showEffect = true; }
        if (!this.actor)
            return;
        if (showEffect) {
            var toHP = this.actor.hp;
            Tween.to(this, { hp: toHP }, 200);
        }
        else {
            this.hp = this.actor.hp;
        }
    };
    GUI_BattlerBriefInfo.prototype.refreshSP = function (showEffect) {
        if (showEffect === void 0) { showEffect = true; }
        if (!this.actor)
            return;
        if (showEffect) {
            Tween.to(this, { sp: this.actor.sp }, 200);
        }
        else {
            this.sp = this.actor.sp;
        }
    };
    GUI_BattlerBriefInfo.prototype.refreshStatus = function () {
        var arr = [];
        for (var i = 0; i < this.actor.status.length; i++) {
            var status = this.actor.status[i];
            var d = new ListItem_1026;
            d.icon = status.icon;
            d.layer = status.currentLayer == 1 ? "" : status.currentLayer.toString();
            arr.push(d);
        }
        this.statusList.items = arr;
    };
    GUI_BattlerBriefInfo.prototype.refreshLevel = function () {
        var level = GameBattleHelper.getLevelByActor(this.actor);
        this.actorLv.text = level.toString();
    };
    Object.defineProperty(GUI_BattlerBriefInfo.prototype, "hp", {
        get: function () {
            return this._hp;
        },
        set: function (v) {
            this._hp = v;
            this.hpText.text = Math.floor(v).toString();
            this.hpSlider.value = v * 100 / this.actor.MaxHP;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GUI_BattlerBriefInfo.prototype, "sp", {
        get: function () {
            return this._sp;
        },
        set: function (v) {
            this._sp = v;
            this.spText.text = Math.floor(v).toString();
            this.spSlider.value = v * 100 / this.actor.MaxSP;
        },
        enumerable: false,
        configurable: true
    });
    GUI_BattlerBriefInfo.effectTime = 200;
    return GUI_BattlerBriefInfo;
}(GUI_1025));
//# sourceMappingURL=GUI_BattlerBriefInfo.js.map