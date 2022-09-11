/**
 * UI控件的相关事件类别实现
 * Created by 黑暗之神KDS on 2019-08-07 13:18:39.
 */
//------------------------------------------------------------------------------------------------------
// 界面组件扩展
//------------------------------------------------------------------------------------------------------
// 监听每个组件的构造事件（创建预设界面时才会派发，而自行创建的组件不会派发该事件）
EventUtils.addEventListener(UIBase, UIBase.EVENT_COMPONENT_CONSTRUCTOR_INIT, Callback.New(uiComponentInit, this, [false]));
/**
 * 组件初始化
 * @param isRoot 是否根容器（界面本体）
 * @param uiComp 组件
 */
function uiComponentInit(isRoot: boolean, uiComp: UIBase) {
    // 界面组件的自定义事件：可在菜单-自定义编辑器-触发事件类别-界面组件事件类别中设置
    var hasMouseEvent = false;
    var hasCommandName = isRoot ? "hasRootCommand" : "hasCommand";
    // 对应事件
    var allEvents = [
        EventObject.CLICK,
        EventObject.MOUSE_OVER,
        EventObject.MOUSE_OUT,
        EventObject.DISPLAY,
        EventObject.UNDISPLAY,
        EventObject.MOUSE_DOWN,
        EventObject.MOUSE_UP,
        EventObject.DOUBLE_CLICK,
        EventObject.MOUSE_MOVE,
        EventObject.RIGHT_MOUSE_DOWN,
        EventObject.RIGHT_MOUSE_UP,
        EventObject.RIGHT_CLICK
    ];
    // 遍历所有组件事件
    for (var i = 0; i < 12; i++) {
        var hasCommand = uiComp[hasCommandName][i];
        if (hasCommand) {
            // 除了显示事件和消失事件外表示存在鼠标事件，
            if (i != 3 && i != 4) {
                hasMouseEvent = true;
            }
            // 需要追加额外特殊效果的事件后面单独处理
            if (i == 1) continue;
            // 注册事件
            var evType = allEvents[i];
            uiComp.on(evType, uiComp, (uiComp: UIBase, i: number) => {
                if (i == 3 && !uiComp.visible) return;
                else if (i == 4 && !uiComp.visible) return;
                // 获取该组件绑定的玩家提交信息。主要用于绑定后将该信息提交到事件里面
                // 在事件页中可通过玩家输入值来获取（事件中的脚本则是：trigger.inputMessage）
                var commandInputMessage;
                if (uiComp.commandInputMessage instanceof Callback) {
                    commandInputMessage = (uiComp.commandInputMessage as Callback).run();
                }
                else {
                    commandInputMessage = uiComp.commandInputMessage;
                }
                // 开始执行界面组件事件
                GameCommand.startUICommand(uiComp, i, commandInputMessage);
            }, [uiComp, i]);
        }
    }
    // 向上开启允许鼠标响应的事件
    if (hasMouseEvent) {
        var p = uiComp;
        while (p) {
            p.mouseEnabled = true;
            if (p == uiComp.guiRoot) {
                break;
            }
            p = p.parent as any;
        }
    }
    // 注册悬停鼠标事件
    if (uiComp instanceof UIButton || uiComp[hasCommandName][1]) {
        uiComp.on(EventObject.MOUSE_OVER, uiComp, (uiComp: UIBase) => {
            // 按钮的情况：如果未能在焦点中的话就视为选中
            if (uiComp instanceof UIButton && FocusButtonsManager.inFocusState(uiComp) == 1) {
                GameAudio.playSE(ClientWorld.data.selectSE);
                FocusButtonsManager.setFocusButton(uiComp);
            }
            // 存在悬停可视化事件
            if (uiComp[hasCommandName][1]) {
                var commandInputMessage;
                if (uiComp.commandInputMessage instanceof Callback) {
                    commandInputMessage = (uiComp.commandInputMessage as Callback).run();
                }
                else {
                    commandInputMessage = uiComp.commandInputMessage;
                }
                GameCommand.startUICommand(uiComp, 1, commandInputMessage);
            }
        }, [uiComp]);
    }
    // 显示和消失事件
    if (uiComp[hasCommandName][3] || uiComp[hasCommandName][4]) {
        uiComp.on(UIBase.ON_VISIBLE_CHANGE, uiComp, () => {
            var commandInputMessage;
            if (uiComp.commandInputMessage instanceof Callback) {
                commandInputMessage = (uiComp.commandInputMessage as Callback).run();
            }
            else {
                commandInputMessage = uiComp.commandInputMessage;
            }
            if (uiComp[hasCommandName][3] && uiComp.visible) {
                GameCommand.startUICommand(uiComp, 3, commandInputMessage);
            }
            else if (uiComp[hasCommandName][4] && !uiComp.visible) {
                GameCommand.startUICommand(uiComp, 4, commandInputMessage);
            }
        });
    }
}
// 界面添加时处理
EventUtils.addEventListener(GameUI, GameUI.EVENT_CREATE_UI, Callback.New((ui: GUI_BASE) => {
    uiComponentInit.apply(ui, [true, ui]);
}, this));
//------------------------------------------------------------------------------------------------------
// 对话框扩展：
// -- 当关闭对话框时
//------------------------------------------------------------------------------------------------------
var ___lastListFocus: UIList;
var ___lastButtonsFocus: FocusButtonsManager;
var ___lastFocusIsList = false;
var ___isRecordFoucs = false;
var playDialogSEEnabled = false;
// 监听对话框开启事件：记录焦点
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_START, Callback.New((isOption: boolean, content: string, options: string[], name: string, head: string | number, expression: number, audioURL: string, speed: number) => {
    // 记录上一个焦点
    if (!___isRecordFoucs) {
        if (UIList.focus) {
            ___lastListFocus = UIList.focus;
            UIList.focus = null;
            ___lastFocusIsList = true;
            ___isRecordFoucs = true;
        }
        else if (FocusButtonsManager.focus) {
            ___lastFocusIsList = false;
            ___isRecordFoucs = true;
            ___lastButtonsFocus = FocusButtonsManager.focus;
        }
    }
    // 文字音效允许
    playDialogSEEnabled = !isOption && speed != 5
}, this));
// 监听对话框开启事件：记录焦点
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_AFTER_DIALOG_START, Callback.New((isOption: boolean) => {
    // 选项
    if (isOption) {
        var optionList: UIList = GameDialog.lastDialog.optionList;
        optionList.selectedImageAlpha = 1;
        optionList.overImageAlpha = 1;
        if (optionList["___onSelected"]) optionList.off(EventObject.CHANGE, optionList, optionList["___onSelected"]);
        var f: Function = (state: number) => {
            if (state == 0) {
                var optionBtns = GameDialog.lastDialog.optionUIs;
                if (!optionBtns) return;
                for (var i = 0; i < optionBtns.length; i++) {
                    var optionSp: GameSprite = optionList.getItemUI(i) as any;
                    var btn: UIButton = optionBtns[i];
                    var e = new EventObject();
                    e.target = btn;
                    if (i == optionList.selectedIndex) {
                        optionSp.event(EventObject.MOUSE_OVER, [i]);
                        btn.event(EventObject.MOUSE_OVER, [e]);
                    }
                    else {
                        optionSp.event(EventObject.MOUSE_OUT, [i]);
                        btn.event(EventObject.MOUSE_OUT, [e]);
                    }
                }
            }
        }
        optionList.on(EventObject.CHANGE, optionList, f);
        optionList["___onSelected"] = f;
        f(0);
    }
}, this));
// 监听对话框关闭事件：恢复焦点
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_END, Callback.New((gameDialog: GameDialog) => {
    // 关闭的情况：恢复焦点
    if (___lastFocusIsList) {
        UIList.focus = ___lastListFocus;
        ___lastListFocus = null;
    }
    else {
        FocusButtonsManager.focus = ___lastButtonsFocus;
        ___lastButtonsFocus = null;
    }
    ___isRecordFoucs = false;
}, this));
// 监听对话框播放文字事件：播放音效
EventUtils.addEventListener(GameDialog, GameDialog.EVENT_DIALOG_WORD_PLAY, Callback.New(() => {
    if (playDialogSEEnabled && WorldData.dialogSEEnabled) GameAudio.playSE(ClientWorld.data.dialogSE);
}, this));
//------------------------------------------------------------------------------------------------------
// UIList焦点动画效果
//------------------------------------------------------------------------------------------------------
(function () {
    var ani: GCAnimation = null;
    // 监听UIList焦点改变事件
    EventUtils.addEventListener(UIList, UIList.EVENT_FOCUS_CHANGE, Callback.New(function (lastFocus: UIList, currentFocus: UIList) {
        // 如果设置了动画且不存在动画时需要创建一次动画
        if (!ani && WorldData.uiCompFocusAnimation) {
            ani = new GCAnimation;
            ani.id = WorldData.uiCompFocusAnimation;
            ani.loop = true;
        }
        if (!ani) return;
        // 动画绑定到该列表选中项图片中
        if (currentFocus && (!GameDialog.lastDialog || (GameDialog.lastDialog && !currentFocus.isInherit(GameDialog.lastDialog)))) {
            ani.target = currentFocus.selectedImage;
            ani.play();
        }
        else {
            ani.stop(ani.currentFrame);
        }
    }, this));
})();
//------------------------------------------------------------------------------------------------------
// UIList-音效：键盘操控和鼠标操控移动光标音效
//------------------------------------------------------------------------------------------------------
var UIListOnListKeyDown = UIList["onListKeyDown"];
UIList["onListKeyDown"] = function (e: EventObject) {
    if (!this._focus || !this._focus.stage) return;
    var keyCode = e.keyCode;
    var lastIndex = this._focus.selectedIndex;
    UIListOnListKeyDown.apply(this, arguments)
    if (UIList.KEY_LEFT.indexOf(keyCode) != -1 || UIList.KEY_RIGHT.indexOf(keyCode) != -1 ||
        UIList.KEY_UP.indexOf(keyCode) != -1 || UIList.KEY_DOWN.indexOf(keyCode) != -1) {
        if (lastIndex != this._focus.selectedIndex) {
            GameAudio.playSE(ClientWorld.data.selectSE);
        }
    }
}
var UIListitemInit = UIList.prototype["itemInit"];
UIList.prototype["itemInit"] = function (ui: UIRoot, data: UIListItemData, index: number) {
    ui.on(EventObject.MOUSE_DOWN, this, (ui: UIRoot, data: UIListItemData, index: number) => {
        if (this.selectedItem != data) {
            GameAudio.playSE(ClientWorld.data.selectSE);
        }
    }, [ui, data, index]);
    UIListitemInit.apply(this, arguments)
}