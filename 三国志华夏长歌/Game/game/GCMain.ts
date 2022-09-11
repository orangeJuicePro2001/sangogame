//------------------------------------------------------------------------------------------------------
// 「SRPG游戏模板-光之阵」
// 模板功能：
// -- 游戏类型：Strategy Role-Playing Game 俯视角度策略角色扮演游戏
// -- 控制器支持：鼠标+键盘
// 
// 模板设计：黑暗之神KDS
// 程序开发：黑暗之神KDS
// 素材设计：GC默认素材-经典像素游戏套（月散、Mr.UAV、理世子）
// 润色助力：阿赖耶石
//------------------------------------------------------------------------------------------------------
// 创建Game类，全局使用
var Game: ProjectGame = new ProjectGame();
// 全局临时数据
var GlobalTempData: any = {};
// 非处于行为编辑器的环境下开始游戏
//（行为编辑器也运行了一个小窗口，包含了运行了这些脚本，以便实时预览项目层设计的行为效果）
if (!Config.BEHAVIOR_EDIT_MODE) {
    GameGate.start();
}