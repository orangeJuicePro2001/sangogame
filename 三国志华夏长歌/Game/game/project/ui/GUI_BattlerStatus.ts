/**
 * 战斗者的状态
 * Created by 黑暗之神KDS on 2021-01-26 14:30:15.
 */
class GUI_BattlerStatus extends GUI_19 {
    constructor() {
        super();
        this.on(EventObject.DISPLAY, this, this.onDisplay);
    }

    private onDisplay() {
        this.refreshActorDataPanel();
        this.refreshStatus();
    }

    /**
     * 刷新角色数据面板
     */
    private refreshActorDataPanel() {
        var battler = GameBattleHelper.overCursorNoDeadBattler;
        if (!battler) return;
        var selectedActor = battler.battlerSetting.battleActor;
        var lv = GameBattleHelper.getLevelByActor(selectedActor);
        // 基本信息
        this.actorFace.image = selectedActor.face;
        this.actorName.text = selectedActor.name;
        this.smallAvatar.avatarID = selectedActor.avatar;
        var classData: Module_Class = GameData.getModuleData(2, selectedActor.class);
        this.actorClass.text = classData ? classData.name : "";
        // 等级和经验
        if (selectedActor.growUpEnabled) {
            this.actorLv.text = "LV." + lv;
            var nextExp = Game.getLevelUpNeedExp(selectedActor, lv);
            this.actorExpInfo.text = `${selectedActor.currentEXP}/${nextExp}`;
            this.actorExpSlider.value = selectedActor.currentEXP * 100 / nextExp;
        }
        else {
            this.actorLv.text = "-----";
            this.actorExpInfo.text = "-----";
            this.actorExpSlider.value = 100;
        }
        // 属性
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
    }
    /**
     * 刷新状态栏
     */
    private refreshStatus() {
        var battler = GameBattleHelper.overCursorNoDeadBattler;
        if (!battler) return;
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
    }
}