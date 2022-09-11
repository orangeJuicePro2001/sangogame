/**
 * 场景对象：基类
 * 场景对象通常只出现在场景上，所有场景对象均继承此类
 * 对象原型来源于指定的对象模型类别，可以在编辑器中预设好模型类别以便不同种类拥有不同的特性（如人物类、装饰物等等）
 * 关于对象模型预设：
 * -- 支持自定义属性
 * -- 支持装载自定义显示对象（行走图、动画、界面）
 * -- 支持绑定脚本（用于实现不通过的特性，可以结合自定义属性和显示对象来制作）
 * 关于存档自动记录：
 * -- 玩家的场景对象的基础属性和自定义属性会在存档时自动记录
 * -- 当前场景下的其他场景对象的基础属性和自定义属性会在存档时自动记录
 * 
 * Created by 黑暗之神KDS on 2018-05-21 02:34:05.
 */
declare class SceneObject {
    //------------------------------------------------------------------------------------------------------
    // 基本属性
    //------------------------------------------------------------------------------------------------------
    /**
     * 对应的场景对象模型ID 
     * 默认值=1
     */
    modelID: number;
    /**
     * 当前的模块ID集合
     */
    get moduleIDs(): number[];
    /**
     * 所在场景的sceneObject列表的位置，也可以看作唯一ID，编辑器中场景对象ID即该属性 默认值=0
     */
    index: number;
    /**
     * 名称 默认值=""
     */
    name: string;
    /**
     * 坐标x（单位：像素）默认值=0
     */
    x: number;
    /**
     * 坐标y（单位：像素）默认值=0
     */
    y: number;
    /**
     * 显示层 0-最底层 1-中间层 2-最高层 对象所在场景的层次可参考[ClientScene] 默认值=1
     */
    layerLevel: number;
    //------------------------------------------------------------------------------------------------------
    // 行走图
    //------------------------------------------------------------------------------------------------------
    /**
     * 行走图自动播放动作 默认值=true
     */
    autoPlayEnable: boolean;
    /**
     * 行走图ID 默认值=1
     */
    avatarID: number;
    /**
     * 角色的面向预设值 默认值=2
     * 参考小键盘以5为中心面向其他数字的方向系统，比如2表示面向下（即5面向2的方向是向下）
     * 7  8  9
     * 4  5  6
     * 1  2  3
     */
    avatarOri: number;
    /**
     * 角色的动作:ID预设值 默认值=1
     */
    avatarAct: number;
    /**
     * 动作播放频率预设值 默认值=12
     */
    avatarFPS: number;
    /**
     * 初始预设帧 默认值=0
     */
    avatarFrame: number;
    /**
     * 透明度预设值 默认值=1
     */
    avatarAlpha: number;
    /**
     * 色相预设值 默认值=0
     */
    avatarHue: number;
    /**
     * 行走图体型预设值 默认值=1
     */
    scale: number;
    //------------------------------------------------------------------------------------------------------
    // 显示对象
    //------------------------------------------------------------------------------------------------------
    /**
     * 显示对象列表数据 type 1-指定行走图类 2-指定固定的界面 3-指定界面类 4-指定固定的动画 5-指定动画类
     * 由编辑器中的场景对象模型预设中预先设定的显示对象列表。默认值={}
     */
    displayList: { [varName: string]: { type: number, id: number } };
    /**
     * 当前所有模块的显示列表数据 默认值=[]
     */
    moduleDisplayList: { [varName: string]: { type: number, id: number } }[];
    //------------------------------------------------------------------------------------------------------
    // 其他
    //------------------------------------------------------------------------------------------------------
    /**
     * 拥有控制权的玩家（所属玩家），非玩家的对象该值为0 主要用于判断用 默认值=0
     */
    playerUID: number;
    /**
     * 所属玩家，非玩家的对象该值为null 主要用于判断用和引用
     */
    player: Player;
    /**
     * 是否拥有事件 [indexType] = 是否拥有事件 默认值=[]
     * 场景对象支持自定义的触发事件类别，此处是否拥有事件是按照自定义触发事件类别的顺序排列的。
     * 比如RPG游戏中场景对象可能存在：点击事件、碰触事件、并行事件等，项目层可以根据此属性判定来执行事件
     */
    hasCommand: boolean[];
    //------------------------------------------------------------------------------------------------------
    //  静态函数
    //------------------------------------------------------------------------------------------------------
    /**
     * 创建场景对象模块（按照模块的默认值）
     * @param moduleID 场景对象的模块ID
     * @param soe 需要安装到的场景对象实体
     * @param presetData [可选] 默认值=null 预设的值数据，如 { abc: 5, def:6 }
     * @return [SceneObjectModule] 模块 
     */
    static createModule(moduleID: number, soe: SceneObjectEntity, presetData?: any): SceneObjectModule;
}