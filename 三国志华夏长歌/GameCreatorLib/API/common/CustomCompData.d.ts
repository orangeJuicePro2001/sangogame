/**
 * 获得或者设置的自定义组件属性相关数据
 *  --自定义模块数据
 *  --自定义世界数据
 *  --自定义玩家数据
 *  --自定义场景对象数据
 *  ==自定义场景对象模型数据
 */
declare class CustomCompData {
    /**
    * 类别 0:获取属性 1:获取和设置属性 默认值=0
    */
    type: number;
    /**
     * 模块ID 默认值=1
     */
    moduleID: number;
    /**
     * 数据ID 默认值=1
     */
    dataID: number;
    /**
     * 是否使用变量指定数据ID 默认值=false
     */
    dataUserVar: boolean;
    /**
     * 变量ID 默认值=1
     */
    dataVarID: number;
    /**
     * 选中的属性唯一ID 默认值=""
     */
    varID: string;
    /**
     * 选中属性名称 默认值=""
     */
    varName: string;
    /**
     * 设置值类别 0-常量 1-变量 默认值=0
     */
    valueType: number;
    /**
     * 设置的值 默认值={}
     */
    value: any;
}