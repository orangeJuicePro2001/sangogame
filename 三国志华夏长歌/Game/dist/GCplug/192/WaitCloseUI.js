(function (CommandExecute) {
    function customCommand_15001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var _this = this;
        var uiID = p.useVar == 1 ? Game.player.variable.getVariable(p.uiVar) : p.uiID;
        var ui = GameUI.get(uiID);
        if (ui && ui.stage) {
            trigger.pause = true;
            trigger.offset(1);
            EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, function (closeUIID) {
                if (closeUIID == uiID) {
                    EventUtils.removeEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, arguments.callee, _this);
                    CommandPage.executeEvent(trigger, []);
                }
            }, this);
        }
    }
    CommandExecute.customCommand_15001 = customCommand_15001;
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=WaitCloseUI.js.map