/**
 * 等待指定界面关闭后再执行后续的指令
 * Created by 黑暗之神KDS on 2021-04-08 00:51:48.
 */
module CommandExecute {
    /**
     * 等待指定界面关闭
     */
    export function customCommand_15001(commandPage: CommandPage, cmd: Command, trigger: CommandTrigger, triggerPlayer: ClientPlayer, playerInput: any[], p: CustomCommandParams_15001): void {
        // 根据常量或变量或者界面编号
        var uiID = p.useVar == 1 ? Game.player.variable.getVariable(p.uiVar) : p.uiID;
        // 获取该界面（系统组）
        var ui = GameUI.get(uiID);
        // 如果该界面已打开的话则暂停并监听关闭后继续事件
        if (ui && ui.stage) {
            trigger.pause = true;
            trigger.offset(1);
            EventUtils.addEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, (closeUIID: number) => {
                if (closeUIID == uiID) {
                    EventUtils.removeEventListenerFunction(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, arguments.callee, this);
                    CommandPage.executeEvent(trigger, []);
                }
            }, this);
        }
    }
}