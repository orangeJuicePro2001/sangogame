/**
 * A星算法 
 * -- 以前使用AS3编写的翻译成TS后先使用，后期可优化
 * -- 支持四方向和八方向寻路
 * Created by 黑暗之神KDS on 2013-5-07 15:02:01.
 */
class AstarUtils {
    static ROAD_FIND_MAX: number = 200;
    private startPoint: AstarBox;//寻路起点
    private endPoint: AstarBox;//要到达的目的地
    private mapArr: any[];//地图信息
    private w: number;//地图的横向节点数
    private h: number;//地图的纵向节点数
    private openList: any[] = new Array();//开启列表
    private closeList: any[] = new Array();//关闭列表
    private roadArr: any[] = new Array();//返回的路径
    private isPath: Boolean;//是否找到路径
    private isSearch: Boolean;//寻路状态,即是否正在寻路
    private ori4: boolean;

    /**
     * 移动至
     * 只在起点周围计算A星
     * @param x_x1 起点X
     * @param x_y1 起点Y
     * @param x_x2 终点X
     * @param x_y2 终点Y
     * @param gridW 格子宽
     * @param gridH 格子高
     * @param obsArr 障碍数组 [x][y] = true/false
     * @param toGridAsThroughEnabled 目的地看作是可通行点
     * @param throughMode 是否穿透模式，忽略障碍
     * @return [string] 返回移动路线结果 [有效路径]=|x,y|x,y|x,y|x,y [无效路径]=null
     */
    public static moveTo(x_x1: number, x_y1: number, x_x2: number, x_y2: number, gridW: number, gridH: number, scene: ProjectClientScene, ori4: boolean = false, toGridAsThroughEnabled: boolean = false, throughMode: boolean = false): number[][] {
        var sceneUtils: SceneUtils = scene.sceneUtils;
        var GRID_SIZE = Config.SCENE_GRID_SIZE;
        var GRID_SIZE_HALF = Math.floor(Config.SCENE_GRID_SIZE / 2) //- 1;
        //初始化地图信息
        var x_mapw: number = gridW;
        var x_maph: number = gridH;
        //范围数值#32 与角色相差多少,如+-10，角色在中间 比如10范围就代表总共21，前10，中我，后10
        var rangeW: number = Math.floor(Config.WINDOW_WIDTH / GRID_SIZE) + 1;
        var rangeH: number = Math.floor(Config.WINDOW_HEIGHT / GRID_SIZE) + 1;
        //范围X1，Y1，X2，Y2 (根据这个来计算范围内的值..就是在角色周围)
        var n_f_x1: number = Math.floor(x_x1 / GRID_SIZE) - rangeW
        var n_f_y1: number = Math.floor(x_y1 / GRID_SIZE) - rangeH
        var n_f_x2: number = Math.floor(x_x1 / GRID_SIZE) + rangeW
        var n_f_y2: number = Math.floor(x_y1 / GRID_SIZE) + rangeH
        //超出范围的话就return
        if (Math.abs(x_x2 - x_x1) > rangeW * GRID_SIZE || Math.abs(x_y2 - x_y1) > rangeH * GRID_SIZE) { return null }
        //只有起点为0,有效，其他另外在做
        var mapmapmap: any[] = []
        var thisBox: AstarBox
        //先偏移，在一个虚拟的范围内根据这里的障碍物返回坐标，然后再偏移回去计算哦。
        n_f_x1 = n_f_x1 < 0 ? 0 : n_f_x1
        n_f_y1 = n_f_y1 < 0 ? 0 : n_f_y1
        n_f_x2 = n_f_x2 > x_mapw ? x_mapw : n_f_x2
        n_f_y2 = n_f_y2 > x_maph ? x_maph : n_f_y2
        //偏移量是n_f_x1与0之间的差异具体有多少，n_f_y1与0的差异有多少
        var offsetX: number = n_f_x1 - 0
        var offsetY: number = n_f_y1 - 0
        var yLen: number = (n_f_y2 - n_f_y1);
        var xLen: number = (n_f_x2 - n_f_x1);
        //allmap 虚拟的范围 范围内地图添加（仅用于计算路径，而不是显示）
        for (var y = 0; y < yLen; y++) // *** <=yLen
        {
            var mapmapmapY = mapmapmap[y] = []
            for (var x = 0; x < xLen; x++) // *** <=xLen
            {
                thisBox = new AstarBox() // 
                mapmapmapY.push(thisBox);
                thisBox.px = x;
                thisBox.py = y;
                thisBox.go = 0;
            }
        }
        var n_obx, n_oby, i
        var helpP = new Point();
        //增加障碍物 scene.isObstacleGrid(helpP)  || !scene.isDynamicThrough(helpP)
        if (!throughMode) {
            for (var _x = n_f_x1; _x < n_f_x2; _x++) {
                for (var _y = n_f_y1; _y < n_f_y2; _y++) {
                    helpP.x = _x;
                    helpP.y = _y;
                    if (sceneUtils.isObstacleGrid(helpP)) {
                        mapmapmap[_y - offsetY][_x - offsetX].go = 1
                    }
                }
            }
        }
        //出发点 AstarBox
        var goX = Math.floor(x_y1 / GRID_SIZE) - offsetY;
        var mapGoXs = mapmapmap[goX];
        if (!mapGoXs) return null;
        var goY = Math.floor(x_x1 / GRID_SIZE) - offsetX;
        var actor_go = mapGoXs[goY];
        if (!actor_go) return null;
        //目的地 AstarBox
        var toX = Math.floor(x_y2 / GRID_SIZE) - offsetY;
        var mapToXs = mapmapmap[toX];
        if (!mapToXs) return null;
        var toY = Math.floor(x_x2 / GRID_SIZE) - offsetX;
        var actor_to = mapToXs[toY];
        if (!actor_to) return null;
        // 目的地看作是可通行点
        if (toGridAsThroughEnabled) {
            actor_to.go = 0;
        }
        // 查询路线
        var _ARoad: AstarUtils = new AstarUtils();
        _ARoad.ori4 = ori4;
        var roadList = _ARoad.searchRoad(actor_go, actor_to, mapmapmap);
        // 如果计算不出就返回NULL
        if (roadList.length < 1) { return null }
        //返回路径试试看..给回偏移量
        var roadLines: number[][] = [];
        for (i = roadList.length - 1; i > 0; i--) {
            var n_px_real: number = roadList[i].px + offsetX;
            var n_py_real: number = roadList[i].py + offsetY;
            roadLines.push([n_px_real * GRID_SIZE + GRID_SIZE_HALF, n_py_real * GRID_SIZE + GRID_SIZE_HALF]);
        }
        roadLines.push([x_x2, x_y2]);
        return roadLines;
    }
    /**
     * 计算格子可通行路径
     * @param startGridX 起始格子
     * @param startGridY 起始格子
     * @param toGridX 终点格子
     * @param toGridY 终点格子
     * @param range 范围，以起点为中心点的范围，利用此项计算偏移
     * @param throughGridMap 格子图通行数据参考 true 表示允许通行 从0开始的坐标系
     * @param roadLineOffset [可选] 默认值=null 返回结果的路径偏移量 null表示不偏移
     * @param ori4 [可选] 默认值=true 是否四方向，否则八方向
     * @param toGridAsThroughEnabled [可选] 默认值=false 是否目的地看作是可通行点
     * @param resaultToPx  [可选] 默认值=false  结果是否返回像素坐标而非格子坐标
     * @return [number] 
     */
    static routeGrid(startGridX: number, startGridY: number, toGridX: number, toGridY: number, range: number, throughGridMap: boolean[][], roadLineOffset: Point = null, ori4: boolean = true, toGridAsThroughEnabled: boolean = false, resaultToPx: boolean = false): number[][] {
        var _ARoad: AstarUtils = new AstarUtils();
        _ARoad.ori4 = true;
        var mapmapmap: any[] = [];
        var thisBox: AstarBox;
        var mapSize = range * 2 + 1;
        for (var y = 0; y < mapSize; y++) {
            var mapmapmapY = mapmapmap[y] = [];
            for (var x = 0; x < mapSize; x++) {
                thisBox = new AstarBox()
                mapmapmapY.push(thisBox);
                thisBox.px = x;
                thisBox.py = y;
                var throughGridMapX = throughGridMap[x];
                if (!throughGridMapX || !throughGridMapX[y]) {
                    thisBox.go = 1;
                }
                else {
                    thisBox.go = 0;
                }
            }
        }
        var goX = mapmapmap[startGridY];
        if (!goX) return null;
        var go = goX[startGridX];
        if (!go) return null;
        var toX = mapmapmap[toGridY];
        if (!toX) return null;
        var to = toX[toGridX];
        if (!to) return null;
        // 目的地看作是可通行点
        if (toGridAsThroughEnabled) {
            to.go = 0;
        }
        var roadList = _ARoad.searchRoad(go, to, mapmapmap);
        // 如果计算不出就返回NULL
        if (roadList.length < 1) { return null }
        // 返回路径试试看..给回偏移量
        var roadLines: number[][] = [];
        var offsetX = roadLineOffset ? roadLineOffset.x : 0;
        var offsetY = roadLineOffset ? roadLineOffset.y : 0;
        for (var i = roadList.length - 1; i > 0; i--) {
            var targetGridX: number = roadList[i].px + offsetX;
            var targetGridY: number = roadList[i].py + offsetY;
            roadLines.push([targetGridX, targetGridY]);
        }
        roadLines.push([toGridX + offsetX, toGridY + offsetY]);
        if (resaultToPx) {
            var roadLinesLen = roadLines.length;
            for (var i = 0; i < roadLinesLen; i++) {
                var g = roadLines[i];
                var gridP = new Point(g[0], g[1]);
                var pos = GameUtils.getGridCenterByGrid(gridP);
                roadLines[i] = [pos.x, pos.y];
            }
        }
        return roadLines;
    }
    //------------------------------------------------------------------------------------------------------
    // 大地图移动
    //------------------------------------------------------------------------------------------------------
    private static big_mapmapmap: any[]
    /**
     * 大地图移动模式缓存
     * @param gridW 
     * @param gridH 
     * @param obsArr 
     */
    static def_bigMoveTo(gridW: number, gridH: number, obsArr: boolean[][]): void {
        var n_f_x1 = 0
        var n_f_y1 = 0
        var n_f_x2 = gridW
        var n_f_y2 = gridH

        //只有起点为0,有效，其他另外在做
        var mapmapmap: any[] = []
        var thisBox: AstarBox

        //偏移量是n_f_x1与0之间的差异具体有多少，n_f_y1与0的差异有多少
        var offsetX: number = n_f_x1 - 0
        var offsetY: number = n_f_y1 - 0
        var yLen: number = (n_f_y2 - n_f_y1);
        var xLen: number = (n_f_x2 - n_f_x1);
        //allmap 虚拟的范围 范围内地图添加（仅用于计算路径，而不是显示）
        for (var y = 0; y <= yLen; y++) {
            mapmapmap[y] = []
            for (var x = 0; x <= xLen; x++) {
                thisBox = new AstarBox() // *是否存在内存溢出？
                mapmapmap[y].push(thisBox);
                mapmapmap[y][x].px = x;
                mapmapmap[y][x].py = y;
                mapmapmap[y][x].go = 0
            }
        }

        var n_obx, n_oby, i
        //增加障碍物
        for (var _x = n_f_x1; _x < n_f_x2; _x++) {
            for (var _y = n_f_y1; _y < n_f_y2; _y++) {
                if (obsArr[_x][_y]) {
                    mapmapmap[_y - offsetY][_x - offsetX].go = 1
                }
            }
        }

        this.big_mapmapmap = mapmapmap
    }
    /**
     * 大地图移动
     * @param x_x1 起点
     * @param x_y1 起点
     * @param x_x2 终点
     * @param x_y2 终点
     * @return [string] 
     */
    static bigMoveTo(x_x1: number, x_y1: number, x_x2: number, x_y2: number): number[][] {
        var GRID_SIZE = Config.SCENE_GRID_SIZE;
        var GRID_SIZE_HALF = Math.floor(Config.SCENE_GRID_SIZE / 2) - 1;

        var mapmapmap = this.big_mapmapmap;
        //出发点 AstarBox
        var actor_go = mapmapmap[Math.floor(x_y1 / GRID_SIZE)][Math.floor(x_x1 / GRID_SIZE)]
        //目的地 AstarBox
        var actor_to = mapmapmap[Math.floor(x_y2 / GRID_SIZE)][Math.floor(x_x2 / GRID_SIZE)]
        //查询路线
        var _ARoad: AstarUtils = new AstarUtils();
        var roadList = _ARoad.searchRoad(actor_go, actor_to, mapmapmap);
        //如果计算不出就返回NULL
        if (roadList.length < 1) { return null }
        //返回路径试试看..给回偏移量
        var roadLines: number[][] = [];
        for (var i = roadList.length - 1; i > 0; i--) {
            var n_px_real: number = roadList[i].px
            var n_py_real: number = roadList[i].py
            roadLines.push([n_px_real * GRID_SIZE + GRID_SIZE_HALF, n_py_real * GRID_SIZE + GRID_SIZE_HALF]);
        }
        roadLines.push([x_x2, x_y2]);
        return roadLines;
    }

    //寻路
    private searchRoad(start: AstarBox, end: AstarBox, map: any[]) {
        this.startPoint = start;//获得寻路起点
        this.endPoint = end;//获得要到达的目的地
        this.mapArr = map;//获得地图信息
        this.w = this.mapArr[0].length - 1;//获得地图横向的节点数
        this.h = this.mapArr.length - 1;//获得地图纵向的节点数
        this.openList.push(this.startPoint);//将起点加入开启列表
        var ix = 0;
        while (true) {
            ix++;
            if (this.openList.length < 1 || ix >= AstarUtils.ROAD_FIND_MAX) {//无路可走 || (ix>=Config.STV_roadFindTimeMax && !moveControl.isBigMove)
                return this.roadArr;
            }
            var thisPoint: AstarBox = this.openList.splice(this.getMinF(), 1)[0];//每次取出开启列表中的第一个节点
            if (thisPoint == this.endPoint) {//找到路径
                //从终点开始往回找父节点，以生成路径列表，直到父节点为起始点
                while (thisPoint.father != this.startPoint.father) {
                    this.roadArr.push(thisPoint);
                    thisPoint = thisPoint.father;
                }
                return this.roadArr;//返回路径列表
            }
            this.closeList.push(thisPoint);//把当前节点加入关闭列表
            this.addAroundPoint(thisPoint);//开始检查当前节点四周的节点
            /*this.openList.sortOn(["F"]);//对开启列表中的节点按F值排序
           */
        }//End while
    }//End Fun

    //检查当前节点四周的八个节点，可通过并不在关闭及开启列表中的节点加入至开启列表
    private addAroundPoint(thisPoint: AstarBox) {
        var thisPx: number = thisPoint.px;//当前节点横向索引
        var thisPy: number = thisPoint.py;//当前节点纵向索引
        //添加左右两个直点的同时过滤四个角点，以提高速度。
        //即如果左边点不存在或不可通过则左上左下两角点就不需检查，右边点不存在或不可通过则右上右下两角点不需检查
        //后面添加四个为角点，角点的判断为，自身可通过&&它相邻的两个当前点的直点都可通过
        if (thisPx > 0 && this.mapArr[thisPy][thisPx - 1].go == 0) {//加入左边点
            if (!this.inArr(this.mapArr[thisPy][thisPx - 1], this.closeList)) {//是否在关闭列表中
                if (!this.inArr(this.mapArr[thisPy][thisPx - 1], this.openList)) {//是否在开启列表中
                    this.setGHF(this.mapArr[thisPy][thisPx - 1], thisPoint, 10);//计算GHF值
                    this.openList.push(this.mapArr[thisPy][thisPx - 1]);//加入节点
                } else {
                    this.checkG(this.mapArr[thisPy][thisPx - 1], thisPoint);//检查G值
                }//End if
            }//End if
            //加入左上点
            if (!this.ori4 && thisPy > 0 && this.mapArr[thisPy - 1][thisPx - 1].go == 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx - 1], this.closeList) && !this.inArr(this.mapArr[thisPy - 1][thisPx - 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy - 1][thisPx - 1], thisPoint, 14);//计算GHF值
                    this.openList.push(this.mapArr[thisPy - 1][thisPx - 1]);//加入节点
                }//End if
            }//End if
            //加入左下点
            if (!this.ori4 && thisPy < this.h && this.mapArr[thisPy + 1][thisPx - 1].go == 0 && this.mapArr[thisPy + 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx - 1], this.closeList) && !this.inArr(this.mapArr[thisPy + 1][thisPx - 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy + 1][thisPx - 1], thisPoint, 14);//计算GHF值
                    this.openList.push(this.mapArr[thisPy + 1][thisPx - 1]);//加入节点
                }//End if
            }//End if
        }//End if
        if (thisPx < this.w && this.mapArr[thisPy][thisPx + 1].go == 0) {//加入右边点
            if (!this.inArr(this.mapArr[thisPy][thisPx + 1], this.closeList)) {//是否在关闭列表中
                if (!this.inArr(this.mapArr[thisPy][thisPx + 1], this.openList)) {//是否在开启列表中
                    this.setGHF(this.mapArr[thisPy][thisPx + 1], thisPoint, 10);//计算GHF值
                    this.openList.push(this.mapArr[thisPy][thisPx + 1]);//加入节点
                } else {
                    this.checkG(this.mapArr[thisPy][thisPx + 1], thisPoint);//检查G值
                }//End if
            }//End if
            //加入右上点
            if (!this.ori4 && thisPy > 0 && this.mapArr[thisPy - 1][thisPx + 1].go == 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx + 1], this.closeList) && !this.inArr(this.mapArr[thisPy - 1][thisPx + 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy - 1][thisPx + 1], thisPoint, 14);//计算GHF值
                    this.openList.push(this.mapArr[thisPy - 1][thisPx + 1]);//加入节点
                }//End if
            }//End if
            //加入右下点
            if (!this.ori4 && thisPy < this.h && this.mapArr[thisPy + 1][thisPx + 1].go == 0 && this.mapArr[thisPy + 1][thisPx].go == 0) {
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx + 1], this.closeList) && !this.inArr(this.mapArr[thisPy + 1][thisPx + 1], this.openList)) {
                    this.setGHF(this.mapArr[thisPy + 1][thisPx + 1], thisPoint, 14);//计算GHF值
                    this.openList.push(this.mapArr[thisPy + 1][thisPx + 1]);//加入节点
                }//End if
            }//End if
        }//End if
        if (thisPy > 0 && this.mapArr[thisPy - 1][thisPx].go == 0) {//加入上面点
            if (!this.inArr(this.mapArr[thisPy - 1][thisPx], this.closeList)) {//是否在关闭列表中
                if (!this.inArr(this.mapArr[thisPy - 1][thisPx], this.openList)) {//是否在开启列表中
                    this.setGHF(this.mapArr[thisPy - 1][thisPx], thisPoint, 10);//计算GHF值
                    this.openList.push(this.mapArr[thisPy - 1][thisPx]);//加入节点
                } else {
                    this.checkG(this.mapArr[thisPy - 1][thisPx], thisPoint);//检查G值
                }//End if
            }//End if
        }//End if
        if (thisPy < this.h && this.mapArr[thisPy + 1][thisPx].go == 0) {//加入下面点
            if (!this.inArr(this.mapArr[thisPy + 1][thisPx], this.closeList)) {//是否在关闭列表中
                if (!this.inArr(this.mapArr[thisPy + 1][thisPx], this.openList)) {//是否在开启列表中
                    this.setGHF(this.mapArr[thisPy + 1][thisPx], thisPoint, 10);//计算GHF值
                    this.openList.push(this.mapArr[thisPy + 1][thisPx]);//加入节点
                } else {
                    this.checkG(this.mapArr[thisPy + 1][thisPx], thisPoint);//检查G值
                }//End if
            }//End if
        }//End if
    }//End Fun
    //判断当前点是否在开启列表中－－－－－－－－－－－－－－－－－－－－－－－－－－－－》
    private inArr(obj: AstarBox, arr: any[]): Boolean {
        for (var m in arr) {
            var mc = arr[m];
            if (obj == mc) {
                return true;
            }//End if
        }//End for
        return false;
    }//End Fun

    //设置节点的G/H/F值－－－－－－－－－－－－－－－－－－－－－－－－－－－－》
    private setGHF(point: AstarBox, thisPoint: AstarBox, G) {
        if (!thisPoint.G) {
            thisPoint.G = 0;
        }
        point.G = thisPoint.G + G;
        //H值为当前节点的横纵向到重点的节点数×10
        point.H = (Math.abs(point.px - this.endPoint.px) + Math.abs(point.py - this.endPoint.py)) * 10;
        point.F = point.H + point.G;//计算F值
        point.father = thisPoint;//指定父节点
    }//End Fun

    //检查新的G值以判断新的路径是否更优
    private checkG(chkPoint: AstarBox, thisPoint: AstarBox) {
        var newG = thisPoint.G + 10;//新G值为当前节点的G值加上10（因为只检查当前节点的直点）
        if (newG <= chkPoint.G) {//如果新的G值比原来的G值低或相等，说明新的路径会更好
            chkPoint.G = newG;//更新G值
            chkPoint.F = chkPoint.H + newG;//同时F值重新被计算
            chkPoint.father = thisPoint;//将其父节点更新为当前点
        }//End if
    }//End Fun

    //获取开启列表中的F值最小的节点，返回的是该节点所在的索引
    private getMinF(): number {
        var tmpF: number = 100000000;//用以存放最小F值（这里先假定了一个很大的数值）
        var id: number = 0;
        var rid: number;
        for (var m in this.openList) {
            var mc = this.openList[m];
            //如果列表中的当前节点的F值比目前存放的F值小，就将F值更新为当前节点的F值，否则就什么都不做
            //这样循环和列表中所有节点的F值比较完成后，最后用以存放最小F值里的F值就是最小的
            if (mc.F < tmpF) {
                tmpF = mc.F;
                rid = id;//同时更新返加的索引值为当前节点的索引
            }
            id++;//因为for each方法是从数组中的第一个对象开始遍历，而每比一次id＋1刚好可以匹配其索引位置
            //也可以使用FOR遍历，但FLASH中用 FOR EACH方法效率更高
        }//End for
        return rid;//比较完成后返回最小F值所在的索引
    }//End fun
}//End Class

class AstarBox {
    G: number
    H: number
    F: number
    father: AstarBox
    px: number
    py: number
    go: number
}