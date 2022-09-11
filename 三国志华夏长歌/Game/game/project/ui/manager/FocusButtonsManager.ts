/**
 * 按钮组焦点管理器
 * 进入新的焦点时可以保留原焦点显示，但动画将会停止
 * 退出焦点时焦点显示会移除
 * Created by 黑暗之神KDS on 2020-09-21 18:41:20.
 */
class FocusButtonsManager {
    /**
     * 激活的按钮组焦点
     */
    static _focus: FocusButtonsManager;
    /**
     * 是否已初始化
     */
    private static inited: boolean;
    /**
     * 是否已经按下确认键
     */
    private keyDownEnter: boolean = false;
    /**
     * 是否已按下取消键
     */
    private keyDownEsc: boolean = false;
    //------------------------------------------------------------------------------------------------------
    // 设置焦点
    //------------------------------------------------------------------------------------------------------
    /**
     * 管理器初始化
     */
    private static init() {
        if (this.inited) return;
        this.inited = true;
        // 当列表焦点改变时
        EventUtils.addEventListener(UIList, UIList.EVENT_FOCUS_CHANGE, Callback.New((lastFocus: UIList, currentFocus: UIList) => {
            // 如果存在列表焦点，且当前存在按钮焦点的话，取消按钮焦点
            if (currentFocus && FocusButtonsManager._focus) {
                FocusButtonsManager._focus.deactivate();
                FocusButtonsManager._focus = null;
            }
        }, this));
    }
    /**
     * 焦点设置和获取
     * @param btnFocusManager 按钮组焦点
     */
    static set focus(btnFocusManager: FocusButtonsManager) {
        if (!WorldData.focusEnabled) return;
        FocusButtonsManager.init();
        // 清空LIST焦点
        UIList.focus = null;
        // 取消激活上一个焦点
        var lastFocus = FocusButtonsManager._focus;
        if (lastFocus) {
            lastFocus.deactivate();
            FocusButtonsManager._focus = null;
        }
        if (btnFocusManager) {
            FocusButtonsManager._focus = btnFocusManager;
            btnFocusManager.activate(lastFocus);
        }
    }
    static get focus(): FocusButtonsManager {
        return FocusButtonsManager._focus;
    }
    /**
     * 关闭
     */
    static closeFocus() {
        if (FocusButtonsManager.focus) {
            if (FocusButtonsManager.focus.selEffectUI) FocusButtonsManager.focus.selEffectUI.removeSelf();
            FocusButtonsManager.focus.selBtn = null;
            FocusButtonsManager.focus.deactivate();
            FocusButtonsManager.focus = null;
        }
    }
    /**
     * 按钮处于焦点中的状态
     * @param btn 按钮
     * @return [number] 0-未启用焦点或未在该焦点组中 1-已在该焦点组中，但未选中 2-已在该焦点组中同时也选中了
     */
    static inFocusState(btn: UIButton): number {
        if (!FocusButtonsManager.focus || FocusButtonsManager.focus.buttons.indexOf(btn) == -1) return 0;
        return FocusButtonsManager.focus.selBtn.btn == btn ? 2 : 1;
    }
    /**
     * 选中焦点
     * @param btn 按钮
     */
    static setFocusButton(btn: UIButton) {
        if (!FocusButtonsManager.focus) return true;
        var selBtnInfo = ArrayUtils.matchAttributes(FocusButtonsManager.focus.btnInfos, { btn: btn }, true)[0];
        if (selBtnInfo) FocusButtonsManager.focus.selectButton(selBtnInfo);
    }
    //------------------------------------------------------------------------------------------------------
    // 实例
    //------------------------------------------------------------------------------------------------------
    /**
     * 所属界面
     */
    private ui: GUI_BASE;
    /**
     * 选中的按钮
     */
    private selBtn: { btn: UIButton, btnPos: Point };
    /**
     * 选中的皮肤界面
     */
    private selEffectUI: UIBase;
    /**
     * 选中的皮肤界面中的target组件（用于动画的目标）
     */
    private selEffectTargetComp: UIBase;
    /**
     * 选中的皮肤播放的动画效果
     */
    private uiCompFocusAnimation: GCAnimation;
    /**
     * 可作为焦点的按钮集
     */
    buttons: UIButton[] = [];
    /**
     * 按钮位置信息
     */
    private btnInfos: { btn: UIButton, btnPos: Point }[] = [];
    /**
     * 快捷键关闭
     */
    shortcutKeyExit: boolean;
    /**
     * 当关闭窗口时回到上一个焦点
     */
    whenExitBackLastFocus: boolean;
    /**
     * 当退出焦点时片段事件
     */
    whenExitEvent: string;
    /**
     * 当关闭窗口时的监听事件
     */
    private onExitBackLastFocusCB: Callback;
    /**
     * 记录来源焦点，以便关闭时能够恢复该焦点
     */
    private lastFocus: FocusButtonsManager;
    /**
     * 构造函数
     * @param ui 所属界面
     * @param isAutoFocus 是否自动选择根容器的第一层子节点中的所有按钮组件作为按键焦点集
     * @param addButtons 额外追加的按钮
     * @param excludeButtons 自动选择后希望剔除掉的按钮
     * @param selEffectUI 选中时皮肤界面的组件
     * @param useFocusAnimation 是否使用焦点动画
     * @param shortcutKeyExit [可选] 默认值=false 快捷键退出
     * @param whenExitBackLastFocus [可选] 默认值=false 当退出时回到上一个焦点
     */
    constructor(ui: GUI_BASE, isAutoFocus: boolean, addButtons: string[], excludeButtons: string[], selEffectUIID: number, useFocusAnimation: boolean, shortcutKeyExit: boolean = false, whenExitBackLastFocus: boolean = false) {
        // if (selEffectUIID == 0) return;
        // 记录
        this.ui = ui;
        // 计算可作为焦点的按钮集
        var buttons = this.buttons;
        if (isAutoFocus) {
            for (var i = 0; i < ui.numChildren; i++) {
                var comp = ui.getChildAt(i);
                if (comp instanceof UIButton && comp.visible) buttons.push(comp);
            }
        }
        for (var i = 0; i < addButtons.length; i++) {
            var buttonName = addButtons[i];
            comp = ui[buttonName] as any;
            if (comp && comp instanceof UIButton && comp.visible) buttons.push(comp);
        }
        for (var i = 0; i < excludeButtons.length; i++) {
            var buttonName = excludeButtons[i];
            comp = ui[buttonName] as any;
            if (comp && comp instanceof UIButton) {
                var idx = buttons.indexOf(comp);
                if (idx != -1) buttons.splice(idx, 1);
            }
        }
        // 去重
        ArrayUtils.removeSameObject(buttons);
        if (buttons.length == 0) return;
        // 选中效果
        this.selEffectUI = GameUI.load(selEffectUIID, true);
        if (this.selEffectUI) {
            if (this.selEffectUI["target"]) this.selEffectTargetComp = this.selEffectUI["target"];
            for (var i = 0; i < this.selEffectUI.numChildren; i++) {
                if (this.selEffectUI.getChildAt(i) instanceof UIBase) {
                    this.selEffectUI = this.selEffectUI.getChildAt(i) as any;
                    break;
                }
            }
        }

        // 如果需要选中皮肤的动画时，判断存在选中界面和target属性的话则绑定动画效果，利用动画的目标效果制作特效
        if (this.selEffectUI && this.selEffectTargetComp && useFocusAnimation && WorldData.uiCompFocusAnimation) {
            var uiCompFocusAnimation = this.uiCompFocusAnimation = new GCAnimation;
            uiCompFocusAnimation.id = WorldData.uiCompFocusAnimation;
            uiCompFocusAnimation.target = this.selEffectTargetComp;
            uiCompFocusAnimation.loop = true;
        }
        if (this.selEffectUI) this.selEffectUI.mouseEnabled = false;
        this.shortcutKeyExit = shortcutKeyExit;
        this.whenExitBackLastFocus = whenExitBackLastFocus;
    }
    /**
     * 销毁
     */
    dispose(): void {
        if (this.uiCompFocusAnimation) this.uiCompFocusAnimation.dispose();
        if (this.selEffectUI) this.selEffectUI.dispose();
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
    }
    /**
     * 获取和设置按钮索引
     */
    get selectedIndex(): number {
        if (!this.selBtn) return -1;
        return this.realButtons.indexOf(this.selBtn.btn);
    }
    set selectedIndex(v: number) {
        if (FocusButtonsManager.focus != this) return;
        this.selectButton(this.btnInfos[v]);
    }
    /**
     * 获取实际存在的焦点按钮（可能焦点按钮不再显示了）
     */
    get realButtons(): UIButton[] {
        var buttons = this.buttons.concat();
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            if (!btn.stage || !btn.visible) {
                buttons.splice(i, 1);
                continue;
            }
        }
        return buttons;
    }
    //------------------------------------------------------------------------------------------------------
    // 私有
    //------------------------------------------------------------------------------------------------------
    /**
     * 选中按钮
     * @param btn 
     * @param btnPos 
     */
    private selectButton(selBtnInfo: { btn: UIButton, btnPos: Point }) {
        if (this.selBtn) {
            var e = new EventObject;
            e.type = EventObject.MOUSE_OUT;
            e.target = this.selBtn.btn;
            this.selBtn.btn.event(EventObject.MOUSE_OUT, [e]);
        }
        // 设置选中的组件记录
        this.selBtn = selBtnInfo;
        // 将选中时皮肤移动到按钮所在的位置上
        // this.selEffectUI.x = selBtnInfo.btnPos.x;
        // this.selEffectUI.y = selBtnInfo.btnPos.y;
        // 根据预设target决定皮肤的宽高设置
        if (!selBtnInfo || !selBtnInfo.btn) return;
        if (this.selEffectTargetComp) {
            this.selEffectTargetComp.width = selBtnInfo.btn.width;
            this.selEffectTargetComp.height = selBtnInfo.btn.height;
        }
        else if (this.selEffectUI) {
            this.selEffectUI.width = selBtnInfo.btn.width;
            this.selEffectUI.height = selBtnInfo.btn.height;
        }
        if (this.selEffectUI) {
            selBtnInfo.btn.addChildAt(this.selEffectUI, 1);
        }

        var e = new EventObject;
        e.type = EventObject.MOUSE_OVER;
        e.target = selBtnInfo.btn;
        selBtnInfo.btn.event(EventObject.MOUSE_OVER, [e]);

        // this.selEffectUI.x = 0;
        // this.selEffectUI.y = 0;
        // this.ui.addChild(this.selEffectUI);
    }
    /**
     * 激活
     */
    private activate(lastFocus: FocusButtonsManager = null) {
        var buttons = this.realButtons;
        var ui = this.ui;
        if (ui.isDisposed || !ui.stage) return;
        // 计算位置信息
        var btnInfos: { btn: UIButton, btnPos: Point }[] = this.btnInfos = [];
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            // 转为同一个坐标系，方便比较
            var btnPos = ui.globalToLocal(btn.localToGlobal(new Point(0, 0)));
            btnInfos.push({ btn: btn, btnPos: btnPos });
        }
        // 如果没有选中组件或已选中的组件已不在该界面里了的话则开始选中组件
        if (!this.selBtn || !this.selBtn.btn.isInherit(ui)) {
            // 找到组件开始选中最上边的进行选中(都一样的话则选择最左边的)
            btnInfos.sort((a: { btn: UIButton, btnPos: Point }, b: { btn: UIButton, btnPos: Point }): number => {
                if (a.btnPos.y == b.btnPos.y) return a.btnPos.x < b.btnPos.x ? -1 : 1;
                return a.btnPos.y < b.btnPos.y ? -1 : 1;
            })
            var selBtnInfo = btnInfos[0];
            this.selectButton(selBtnInfo);
        }
        // 更新 this.selBtn
        var idx = ArrayUtils.matchAttributes(btnInfos, { btn: this.selBtn.btn }, true, "==", true)[0];
        this.selBtn = btnInfos[idx];
        if (this.uiCompFocusAnimation) this.uiCompFocusAnimation.play();
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.on(EventObject.KEY_DOWN, this, this.onKeyDown);
        stage.off(EventObject.KEY_UP, this, this.onKeyUp);
        stage.on(EventObject.KEY_UP, this, this.onKeyUp);
        // 监听当该界面关闭时激活上一个按钮组
        if (lastFocus && this.whenExitBackLastFocus) {
            this.lastFocus = lastFocus;
            this.onExitBackLastFocusCB = Callback.New((myUI: GUI_BASE, lastFocus: FocusButtonsManager, uiID: number) => {
                if (uiID == myUI.guiID) {
                    this.recoveryLastFocus();
                    EventUtils.removeEventListener(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, this.onExitBackLastFocusCB);
                }
            }, this, [this.ui, lastFocus]);
            EventUtils.addEventListener(GameUI, GameUI.EVENT_CLOSE_SYSTEM_UI, this.onExitBackLastFocusCB);
        }
    }
    /**
     * 取消激活
     */
    private deactivate() {
        if (this.uiCompFocusAnimation) this.uiCompFocusAnimation.stop(this.uiCompFocusAnimation.currentFrame);
        stage.off(EventObject.KEY_DOWN, this, this.onKeyDown);
    }
    /**
     * 当按键按下时
     * @param e 
     */
    private onKeyDown(e: EventObject) {
        // 已不在舞台的情况或对话框显示的情况则忽略掉操作
        if (!this.selBtn || !this.ui.stage || GameDialog.isInDialog) return;
        var realButtons = this.realButtons;
        // left
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.LEFT)) {
            var idx: number = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 4);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        // right
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.RIGHT)) {
            var idx: number = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 6);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        // up
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.UP)) {
            var idx: number = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 8);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        // down
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.DOWN)) {
            var idx: number = this.selBtn ? realButtons.indexOf(this.selBtn.btn) : -1;
            var toIdx = ProjectUtils.groupElementsMoveIndex(realButtons, idx, 2);
            if (toIdx != null) {
                var newSelBtnInfo = ArrayUtils.matchAttributes(this.btnInfos, { btn: realButtons[toIdx] }, true)[0];
                this.selectButton(newSelBtnInfo);
                GameAudio.playSE(ClientWorld.data.selectSE);
            }
        }
        // enter
        else if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            if (!this.keyDownEnter) {
                this.keyDownEnter = true;
                this.selBtn.btn.event(EventObject.CLICK);
            }
        }
        // exit：当允许使用快捷键关闭界面的场合 
        else if (this.shortcutKeyExit && GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            if (!this.keyDownEsc) {
                this.keyDownEsc = true;
                var recoverySuccess = this.recoveryLastFocus();
                if (recoverySuccess) GameAudio.playSE(WorldData.cancelSE);
            }
        }
    }
    /**
     * 弹起按键时事件
     * @param e 
     */
    private onKeyUp(e: EventObject) {
        // 弹起ENTER键时允许ENTER再次按下，以避免按下时自动连续调用多次的问题
        if (GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.A)) {
            this.keyDownEnter = false;
        }
        // 弹起ESC键时允许ESC再次按下，以避免按下时自动连续调用多次的问题
        else if (this.shortcutKeyExit && GUI_Setting.IS_KEY(e.keyCode, GUI_Setting.KEY_BOARD.B)) {
            this.keyDownEsc = false;
        }
    }
    /**
     * 恢复上个焦点
     * -- 该界面被关闭时
     * -- 退出焦点时
     */
    private recoveryLastFocus(): boolean {
        if (FocusButtonsManager.focus != this) return false;
        if (!this.whenExitBackLastFocus || (this.lastFocus && this.lastFocus.ui && this.lastFocus.ui.stage)) {
            if (FocusButtonsManager._focus) {
                if (FocusButtonsManager._focus.selEffectUI) {
                    FocusButtonsManager._focus.selEffectUI.removeSelf();
                }
                FocusButtonsManager._focus.selBtn = null;
                FocusButtonsManager._focus.deactivate();
            }
            FocusButtonsManager._focus = this.lastFocus;
            if (this.lastFocus) this.lastFocus.activate();
            // 执行事件
            if (this.whenExitEvent) {
                CommandPage.startTriggerFragmentEvent(this.whenExitEvent, Game.player.sceneObject, Game.player.sceneObject);
            }
            return true;
        }
        return false;
    }
}