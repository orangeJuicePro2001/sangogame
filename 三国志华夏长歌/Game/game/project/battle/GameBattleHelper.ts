/**
 * 战斗相关辅助计算类
 * Created by 黑暗之神KDS on 2021-01-14 13:52:47.
 */
class GameBattleHelper {
    //------------------------------------------------------------------------------------------------------
    // 获取
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取等级根据角色数据
     * 因为战斗者区分玩家拥有的角色和非玩家拥有的角色，储存等级的地方不一样
     * @param actor 角色数据 
     * @return [number] 等级
     */
    static getLevelByActor(actor: Module_Actor): number {
        // -- 如果是玩家拥有的角色时则从玩家队伍的该角色中获取等级
        var playerActorDS: DataStructure_inPartyActor = ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
        if (playerActorDS) {
            return playerActorDS.lv;
        }
        // -- 否则根据场上的战斗者获取等级
        else {
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (this.isBattler(so) && so.battlerSetting.battleActor == actor) {
                    return so.battlerSetting.level;
                }
            }
        }
        return 1;
    }
    /**
     * 获取所有战斗者
     * @return [ProjectClientSceneObject] 
     */
    static get allBattlers(): ProjectClientSceneObject[] {
        var arr = [];
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                arr.push(so);
            }
        }
        return arr;
    }
    //------------------------------------------------------------------------------------------------------
    // 判定
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否处于战斗中
     */
    static get isInBattle(): boolean {
        return GameBattle.state != 0;
    }
    /**
     * 是否战斗者
     * @param so 场景对象
     * @return [boolean]  
     */
    static isBattler(so: ProjectClientSceneObject): boolean {
        return so && so.modelID == 1 && so.battlerSetting.isBattler;
    }
    /**
     * 是否玩家阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isPlayerCamp(so: ProjectClientSceneObject): boolean {
        return this.isBattler(so) && so.battlerSetting.battleCamp == 0;
    }
    /**
     * 是否敌对阵营
     * @param so 场景对象
     * @return [boolean] 
     */
    static isEnemyCamp(so: ProjectClientSceneObject): boolean {
        return this.isBattler(so) && so.battlerSetting.battleCamp == 1;
    }
    /**
     * 是否属于玩家队伍
     * @param so 场景对象
     * @return [boolean] 
     */
    static isInPlayerParty(so: ProjectClientSceneObject): boolean {
        return this.isPlayerCamp(so) && ProjectPlayer.getPlayerActorIndexByActor(so.battlerSetting.battleActor) >= 0;
    }
    /**
     * 两个战斗者之间是否队友关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isFriendlyRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        return this.isBattler(so1) && this.isBattler(so2) && so1.battlerSetting.battleCamp == so2.battlerSetting.battleCamp;
    }
    /**
     * 两个战斗者之间是否敌对关系
     * @param so1 战斗者1
     * @param so2 战斗者2
     * @return [boolean] 
     */
    static isHostileRelationship(so1: ProjectClientSceneObject, so2: ProjectClientSceneObject): boolean {
        return this.isBattler(so1) && this.isBattler(so2) && so1.battlerSetting.battleCamp != so2.battlerSetting.battleCamp;
    }
    /**
     * 是否玩家可控制的战斗角色
     */
    static isPlayerControlEnabledBattler(so: ProjectClientSceneObject): boolean {
        return this.isPlayerCamp(so) && !so.battlerSetting.playerCantCtrl && !so.battlerSetting.battleActor.AI;
    }
    /**
     * 指定的格子坐标是否在作用范围内
     * @param gridPos 指定的格子坐标 
     * @return [boolean] 
     */
    static isInEffectGrid(gridPos: Point): boolean {
        if (!GameBattleAction.battlerEffectIndicatorGridArr) return false;
        return ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr, { x: gridPos.x, y: gridPos.y }, true).length == 1;
    }
    /**
     * 是否开启了战斗相关的菜单
     */
    static get isOpendBattleMenu(): boolean {
        // 存在战斗者菜单的话
        var battlerMenu = GameUI.get(14) as GUI_14;
        if (battlerMenu && battlerMenu.stage) {
            return true;
        }
        // 存在通用菜单的话
        var commonMenu = GameUI.get(15) as GUI_15;
        if (commonMenu && commonMenu.stage) {
            return true;
        }
        return false;
    }
    //------------------------------------------------------------------------------------------------------
    // 技能
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否是作用敌人的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isHostileSkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && (skill.targetType == 2 || skill.targetType == 4 || skill.targetType == 6);
    }
    /**
     * 是否是作用我方的技能
     * @param skill 技能
     * @return [boolean] 
     */
    static isFriendlySkill(skill: Module_Skill): boolean {
        return skill.skillType <= 1 && !this.isHostileSkill(skill);
    }
    //------------------------------------------------------------------------------------------------------
    // 状态
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取战斗者的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static getBattlerStatus(battler: ProjectClientSceneObject, statusID: number): Module_Status {
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true)[0];
    }
    /**
     * 检查战斗者是否包含指定的状态
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static isIncludeStatus(battler: ProjectClientSceneObject, statusID: number): boolean {
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true).length == 1;
    }
    /**
     * 检查战斗者是否允许叠加状态，如果已拥有且最大层的话则不允许
     * @param battler 战斗者
     * @param statusID 状态编号
     * @return [boolean] 
     */
    static canSuperpositionLayer(battler: ProjectClientSceneObject, statusID: number): boolean {
        var status: Module_Status = ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true)[0];
        if (status && status.currentLayer >= status.maxlayer) return false;
        return true;
    }
    //------------------------------------------------------------------------------------------------------
    // 是否允许行动
    //------------------------------------------------------------------------------------------------------
    /**
     * 是否允许移动
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canMove(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 当前回合已移动或已待机或死亡的话则不允许
        if (battler.battlerSetting.moved || battler.battlerSetting.operationComplete || battler.battlerSetting.isDead) return false;
        // 移动力不足不允许移动
        if (battler.battlerSetting.battleActor.MoveGrid <= 0) return false;
        // 存在无法移动的状态则不允许
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantMove: true }, true).length == 0;
    }
    /**
     * 是否允许攻击
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canAttack(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 当前回合已行动或已待机或死亡的话则不允许
        if (battler.battlerSetting.actioned || battler.battlerSetting.operationComplete || battler.battlerSetting.isDead) return false;
        // 使用技能代替普通攻击的模式下，未配置技能或技能不满足使用的话不允许攻击
        var actor = battler.battlerSetting.battleActor;
        if (actor.atkMode == 1 && (!actor.atkSkill || actor.atkSkill.currentCD != 0 || actor.atkSkill.costSP > battler.battlerSetting.battleActor.sp)) return false;
        // 存在无法攻击的状态则不允许
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantAtk: true }, true).length == 0;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @return [boolean] 
     */
    static canUseSkill(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 已待机或死亡的话则不允许
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead) return false;
        // 存在无法使用技能的状态则不允许
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseSkill: true }, true).length == 1) return false;
        return true;
    }
    /**
     * 是否允许使用技能
     * @param battler 战斗者
     * @param skill 技能
     * @param checkUseSkillCommconCondition [可选] 默认值=true 检查使用技能的通用条件
     * @return [boolean] 
     */
    static canUseOneSkill(battler: ProjectClientSceneObject, skill: Module_Skill, checkUseSkillCommconCondition: boolean = true): boolean {
        // 非战斗者不允许
        if (checkUseSkillCommconCondition && !this.canUseSkill(battler)) return false;
        // 被动技能不允许
        if (skill.skillType == 2) return false;
        // 技能未冷却、不足的消耗、行动力不允许的情况不允许使用
        return !(skill.currentCD != 0 || skill.costSP > battler.battlerSetting.battleActor.sp || (skill.costActionPower && battler.battlerSetting.actioned));
    }
    /**
     * 是否允许使用道具
     * @param battler 战斗者
     * @return [boolean] 
     */
    static conUseItem(battler: ProjectClientSceneObject): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 已待机或死亡的话则不允许
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead) return false;
        // 存在无法使用道具的状态则不允许
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseItem: true }, true).length == 1) return false;
        return true;
    }
    /**
     * 道具是否可用：行动力允许
     * @param battler 战斗者
     * @param skill 技能
     * @return [boolean] 
     */
    static canUseOneItem(battler: ProjectClientSceneObject, item: Module_Item): boolean {
        // 非战斗者不允许
        if (!GameBattleHelper.isBattler(battler)) return false;
        // 拥有无法使用道具的状态则不允许
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseItem: true }, true).length == 1) return false;
        // 已待机或死亡的话则不允许
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead) return false;
        // 需要消耗行动力且已经行动过的话不允许使用
        return !(item.costActionPower && battler.battlerSetting.actioned);
    }
    //------------------------------------------------------------------------------------------------------
    // 光标
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取光标位置
     */
    static get cursorGridPoint(): Point {
        var p = Game.player.sceneObject;
        return p.posGrid;
    }
    /**
     * 获取光标对象
     */
    static get cursor(): ProjectClientSceneObject {
        return Game.player.sceneObject;
    }
    /**
     * 获取鼠标所在的格子坐标
     */
    static get inSceneMouseGridPoint(): Point {
        var localX = Game.currentScene.localX;
        var localY = Game.currentScene.localY;
        return GameUtils.getGridPostion(new Point(localX, localY));
    }
    /**
     * 获取鼠标所在的格子中心点实际坐标
     */
    static get inSceneMouseGridCenter(): Point {
        var localX = Game.currentScene.localX;
        var localY = Game.currentScene.localY;
        return GameUtils.getGridCenter(new Point(localX, localY));
    }
    //------------------------------------------------------------------------------------------------------
    //  镜头
    //------------------------------------------------------------------------------------------------------
    /**
     * 镜头矫正：根据光标所在的位置
     */
    static cameraCorrect(): void {
        // 当光标超出可视范围时移动镜头至可视范围内
        let cursorX = GameBattleHelper.cursor.x;
        let cursorY = GameBattleHelper.cursor.y;
        if (ProjectUtils.lastControl == 0) {
            cursorX = Game.currentScene.localX;
            cursorY = Game.currentScene.localY;
        }
        let screenRect = Game.currentScene.camera.viewPort.clone();
        // 以光标为中心的范围
        let range = Config.SCENE_GRID_SIZE;
        screenRect.x += range;
        screenRect.y += range;
        screenRect.width -= range * 2;
        screenRect.height -= range * 2;
        // 如果不在范围内，修正至在范围内的位置
        if (!screenRect.contains(cursorX, cursorY)) {
            let cameraToX = screenRect.x;
            if (cursorX < screenRect.x) {
                cameraToX = cursorX;
            }
            else if (cursorX > screenRect.right) {
                cameraToX = cursorX - screenRect.width;
            }
            let cameraToY = screenRect.y;
            if (cursorY < screenRect.y) {
                cameraToY = cursorY;
            }
            else if (cursorY > screenRect.bottom) {
                cameraToY = cursorY - screenRect.height;
            }
            // 转化坐标
            cameraToX -= range;
            cameraToY -= range;
            // 转化
            if (ProjectUtils.lastControl != 0) {
                GameFunction.cameraMove(0, cameraToX += Math.round(Config.WINDOW_WIDTH / 2), cameraToY += Math.round(Config.WINDOW_HEIGHT / 2), 0, true, 1);
            }
            else {
                let mouseMoveScreenSpeed = 15;
                if (Game.currentScene.camera.viewPort.x != cameraToX) {
                    Game.currentScene.camera.viewPort.x += Game.currentScene.camera.viewPort.x > cameraToX ? -mouseMoveScreenSpeed : mouseMoveScreenSpeed;
                }
                if (Game.currentScene.camera.viewPort.y != cameraToY) {
                    Game.currentScene.camera.viewPort.y += Game.currentScene.camera.viewPort.y > cameraToY ? -mouseMoveScreenSpeed : mouseMoveScreenSpeed;
                }
                // 限制在地图范围内不能超出
                if (Game.currentScene.camera.viewPort.x < 0) Game.currentScene.camera.viewPort.x = 0
                else if (Game.currentScene.camera.viewPort.right > Game.currentScene.width) Game.currentScene.camera.viewPort.x = Game.currentScene.width - Game.currentScene.camera.viewPort.width;
                if (Game.currentScene.camera.viewPort.y < 0) Game.currentScene.camera.viewPort.y = 0
                else if (Game.currentScene.camera.viewPort.bottom > Game.currentScene.height) Game.currentScene.camera.viewPort.y = Game.currentScene.height - Game.currentScene.camera.viewPort.height;
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 获取场景对象
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取场景对象根据指定的格子坐标
     * @param posGridP 指定的格子坐标 
     * @param ignoreDeadUnit 是否忽略死亡单位
     * @return [ProjectClientSceneObject] 
     */
    static getSceneObjectByGrid(posGridP: Point, ignoreDeadUnit: boolean = false): ProjectClientSceneObject {
        // 越界
        if (Game.currentScene.sceneUtils.isOutsideByGrid(posGridP)) return;
        // 目标格子
        var targetSceneObjects = Game.currentScene.sceneUtils.gridSceneObjects[posGridP.x][posGridP.y].concat();
        // 排除光标本身
        ArrayUtils.remove(targetSceneObjects, GameBattleHelper.cursor);
        // 排除死亡单位
        if (ignoreDeadUnit) {
            for (var i = 0; i < targetSceneObjects.length; i++) {
                var so = targetSceneObjects[i];
                if (GameBattleHelper.isBattler(so) && so.battlerSetting.isDead) {
                    targetSceneObjects.splice(i, 1);
                    i--;
                }
            }
        }
        return targetSceneObjects[0];
    }
    /**
     * 获取场景光标上的场景对象
     */
    static get overCursorSceneObject(): ProjectClientSceneObject {
        // 获取光标位置（格子）
        var p = GameBattleHelper.cursor;
        var posGridP = new Point(p.posGrid.x, p.posGrid.y);
        return this.getSceneObjectByGrid(posGridP);
    }
    //------------------------------------------------------------------------------------------------------
    // 获取战斗者
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取指定格子上的战斗者
     * @param posGridP 格子位置
     * @return [ProjectClientSceneObject] 
     */
    static getNoDeadBattlerByGrid(posGridP: Point): ProjectClientSceneObject {
        var so = this.getSceneObjectByGrid(posGridP, true);
        if (so && this.isBattler(so) && !so.battlerSetting.isDead) return so;
        return null;
    }
    /**
     * 获取场景光标上的战斗者对象
     */
    static get overCursorNoDeadBattler(): ProjectClientSceneObject {
        var p = GameBattleHelper.cursor;
        var posGridP = new Point(p.posGrid.x, p.posGrid.y);
        return this.getNoDeadBattlerByGrid(posGridP);
    }
    /**
     * 获取场景光标上的玩家阵营的战斗者对象
     */
    static get overCursorPlayerCampNoDeadBattler(): ProjectClientSceneObject {
        var overCursorNoDeadBattler = this.overCursorNoDeadBattler;
        if (!overCursorNoDeadBattler || overCursorNoDeadBattler.battlerSetting.battleCamp != 0) return null;
        return overCursorNoDeadBattler;
    }
    /**
     * 获取场景光标上的敌对阵营的战斗者对象
     */
    static get overCursorEnemyCampNoDeadBattler(): ProjectClientSceneObject {
        var overCursorNoDeadBattler = this.overCursorNoDeadBattler;
        if (!overCursorNoDeadBattler || overCursorNoDeadBattler.battlerSetting.battleCamp != 1) return null;
        return overCursorNoDeadBattler;
    }
    /**
     * 获取场景光标上的玩家可控角色对象（我方阵营+可控制+未行动过）
     */
    static get overCursorPlayerCtrlEnabledBattler(): ProjectClientSceneObject {
        var overCursorPlayerCampNoDeadBattler = this.overCursorPlayerCampNoDeadBattler;
        if (!overCursorPlayerCampNoDeadBattler || overCursorPlayerCampNoDeadBattler.battlerSetting.playerCantCtrl
            || overCursorPlayerCampNoDeadBattler.battlerSetting.battleActor.AI || overCursorPlayerCampNoDeadBattler.battlerSetting.operationComplete) return null;
        return overCursorPlayerCampNoDeadBattler;
    }
    /**
     * 获取指定战斗者的攻击目标，根据指定的格子位置
     * @param battler 指定的战斗者 
     * @param gridPos 指定的格子坐标
     */
    static getAttackTargetOnGrid(battler: ProjectClientSceneObject, gridPos: Point): ProjectClientSceneObject {
        // 不在作用范围则忽略
        if (!this.isInEffectGrid(gridPos)) return null;
        // 获取该格子上的目标
        var target = this.getNoDeadBattlerByGrid(gridPos);
        // 没有目标或者目标不是敌对关系则无法攻击
        if (!target || !GameBattleHelper.isHostileRelationship(battler, target)) return null;
        return target;
    }
    /**
     * 获取指定战斗者的道具目标，根据指定的格子位置
     * @param battler 指定的战斗者 
     * @param gridPos 指定的格子坐标
     */
    static getItemTargetOnGrid(battler: ProjectClientSceneObject, gridPos: Point): ProjectClientSceneObject {
        // 不在作用范围则忽略
        if (!this.isInEffectGrid(gridPos)) return null;
        // 获取该格子上的目标
        var target = this.getNoDeadBattlerByGrid(gridPos);
        // 没有目标
        if (!target) return null;
        return target;
    }
    /**
     * 获取指定战斗者的技能目标，根据指定的格子位置
     * @param fromBattler 指定的战斗者
     * @param skill 技能的目标
     * @param gridPos 格子坐标
     * @return allow=是否允许 targets=目标组
     */
    static getSkillTargetOnGrid(fromBattler: ProjectClientSceneObject, skill: Module_Skill, gridPos: Point): { allow: boolean, targets: ProjectClientSceneObject[] } {
        // 不在作用范围则忽略（全体技能除外）
        if (skill.targetType != 3 && skill.targetType != 4 && !this.isInEffectGrid(gridPos)) return null;
        // 被动技能则忽略
        if (skill.skillType == 2) return null;
        // 目标类别：使用技能者
        if (skill.targetType == 0) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (target != fromBattler) return null;
            return { allow: true, targets: [target] };
        }
        // 目标类别：队友单体
        else if (skill.targetType == 1) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (!this.isFriendlyRelationship(fromBattler, target)) return null;
            return { allow: true, targets: [target] };
        }
        // 目标类别：敌人单体
        else if (skill.targetType == 2) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (!this.isHostileRelationship(fromBattler, target)) return null;
            return { allow: true, targets: [target] };
        }
        // 目标类别：队友全体
        else if (skill.targetType == 3) {
            var targets = fromBattler.battlerSetting.battleCamp == 0 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            targets = ArrayUtils.matchAttributesD2(targets, "battlerSetting", { isDead: false }, false);
            return { allow: true, targets: targets };
        }
        // 目标类别：敌人全体
        else if (skill.targetType == 4) {
            var targets = fromBattler.battlerSetting.battleCamp == 1 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            targets = ArrayUtils.matchAttributesD2(targets, "battlerSetting", { isDead: false }, false);
            return { allow: true, targets: targets };
        }
        // 目标类别：队友多体、敌人多体
        else if (skill.targetType == 5 || skill.targetType == 6) {
            // 仅允许空地的情况，如果发现选中地存在场景对象的话则不允许
            if (skill.mustOpenSpace) {
                var target = this.getSceneObjectByGrid(gridPos);
                if (target && !target.through) return { allow: false, targets: [] };
            }
            var targets: ProjectClientSceneObject[] = [];
            var releasePointLength = GameBattleAction.battlerRelaseIndicatorGridArr.length;
            var cursorGrid = GameBattleHelper.cursorGridPoint;
            // -- 遍历所有释放格子区域
            for (var i = 0; i < releasePointLength; i++) {
                var localGrid = GameBattleAction.battlerRelaseIndicatorGridArr[i];
                var inSceneGridX = localGrid.x + cursorGrid.x;
                var inSceneGridY = localGrid.y + cursorGrid.y;
                var sceneGrid = new Point(inSceneGridX, inSceneGridY);
                // -- 忽略越界的坐标
                if (Game.currentScene.sceneUtils.isOutsideByGrid(sceneGrid)) {
                    continue;
                }
                // -- 获取战斗者
                var target = this.getNoDeadBattlerByGrid(sceneGrid);
                if ((skill.targetType == 5 && this.isFriendlyRelationship(fromBattler, target)) ||
                    (skill.targetType == 6 && this.isHostileRelationship(fromBattler, target))) {
                    targets.push(target);
                }
            }
            return { allow: true, targets: targets };
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 获取下一个战斗角色
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取下一个玩家可控角色
     * @return [ProjectClientSceneObject] 
     */
    static get nextPlayerControlBattler(): ProjectClientSceneObject {
        for (var i = 0; i < GameBattle.playerBattlers.length; i++) {
            var playerBattler = GameBattle.playerBattlers[i];
            if (playerBattler.battlerSetting.isDead) continue;
            if (GameBattleHelper.isPlayerControlEnabledBattler(playerBattler) && !playerBattler.battlerSetting.operationComplete) {
                return playerBattler;
            }
        }
    }
    /**
     * 获取下一个玩家方需要电脑控制的角色
     * @return [ProjectClientSceneObject] 
     */
    static get nextPlayerCampComputerControlBattler(): ProjectClientSceneObject {
        for (var i = 0; i < GameBattle.playerBattlers.length; i++) {
            var playerBattler = GameBattle.playerBattlers[i];
            if (playerBattler.battlerSetting.isDead) continue;
            if (!GameBattleHelper.isPlayerControlEnabledBattler(playerBattler) && !playerBattler.battlerSetting.operationComplete) {
                return playerBattler;
            }
        }
    }
    /**
     * 获取下一个敌方控制的角色
     */
    static get nextEnemyControlBattler(): ProjectClientSceneObject {
        for (var i = 0; i < GameBattle.enemyBattlers.length; i++) {
            var enemyBattler = GameBattle.enemyBattlers[i];
            if (enemyBattler.battlerSetting.isDead) continue;
            if (!enemyBattler.battlerSetting.operationComplete) {
                return enemyBattler;
            }
        }
    }
    //------------------------------------------------------------------------------------------------------
    // 获取范围
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取技能作用范围地图格子（相对于地图坐标系）
     * @param posGrid 指定的格子 
     * @param skill 技能
     * @return [Point] 
     */
    static getSkillEffectRangeGrid(posGrid: Point, skill: Module_Skill): Point[] {
        // 障碍模式 0-计算所有障碍 1-仅计算地图固定障碍 2-不计算障碍
        var obstacleMode: number = 1;
        // 0-普通范围 1-min-range范围 2-自定义范围
        var rangeMode: number;
        // 范围（最大范围）
        var range: number;
        // 最小范围
        var minRange: number;
        // 自定义范围
        var customRangeData: { size: number, gridData: number[][] };
        // 自定义释放范围（如果不存在则表示只有一个格子，否则允许选择多个格子）
        var customReleaseRangeData: { size: number, gridData: number[][] };
        // -- 范围模式和范围值
        rangeMode = skill.effectRangeType;
        // -- 普通范围
        if (rangeMode == 0) {
            range = skill.effectRange1;
        }
        // -- min-max 范围
        else if (rangeMode == 1) {
            minRange = skill.effectRange2A;
            range = skill.effectRange2B;
        }
        // -- 自定义范围
        else if (rangeMode == 2) {
            customRangeData = skill.effectRange3;
        }
        // -- 自己
        if (skill.targetType == 0) {
            rangeMode = 0;
            range = 0;
        }
        // -- 必须空地
        if ((skill.targetType == 5 || skill.targetType == 6) && skill.mustOpenSpace) {
            obstacleMode = 0;
        }
        return GameBattleHelper.getEffectRange(posGrid, range, obstacleMode, rangeMode, minRange, customRangeData, skill.isThroughObstacle);
    }
    /**
     * 获取作用范围，返回所有允许的地图格子坐标
     * @param posGrid 起始点
     * @param range 范围
     * @param obstacleMode [可选] 默认值=0 计算障碍的模式 0-计算所有障碍 1-仅计算地图固定障碍 2-不计算障碍 3-计算所有障碍但不包括敌军（必须填入fromBattler以便区分敌军）
     * @param rangeMode [可选] 默认值=0 范围模式 0-普通范围 1-min-range范围 2-自定义范围
     * @param minRange [可选] 默认值=0 最短值，低于该值不允许出现
     * @param customRangeData [可选] 默认值=null 自定义范围数据
     * @param isThroughObstacle [可选] 默认值=false 是否穿透障碍（如作用范围可穿透墙壁）
     * @param addGridsList [可选] 默认值=null 额外添加的格子合集
     * @param fromBattler [可选] 默认值=null 参考的战斗者
     */
    static getEffectRange(firstGrid: Point, range: number, obstacleMode: number = 0, rangeMode: number = 0, minRange: number = 0,
        customRangeData: { size: number, gridData: number[][] } = null, isThroughObstacle: boolean = false, addGridsList: Point[] = null, fromBattler: ProjectClientSceneObject = null): Point[] {
        var calcDistance = rangeMode != 2;
        var battlerThroughGridMap = this.getDestinationThroughGridMap(firstGrid, range, obstacleMode, calcDistance, customRangeData, fromBattler);
        var grids = battlerThroughGridMap.grids;
        var throughGridMap = battlerThroughGridMap.throughGridMap;
        // 排除掉与首个格子无法连通的格子以及移动到达该地时
        for (var i = 0; i < grids.length; i++) {
            var targetGrid = grids[i];
            // min-range 模式
            if (rangeMode == 1) {
                var dis = Math.abs(targetGrid.x - firstGrid.x) + Math.abs(targetGrid.y - firstGrid.y);
                if (dis <= minRange) {
                    grids.splice(i, 1);
                    i--;
                    continue;
                }
            }
            // 忽略自身
            if (targetGrid.x == firstGrid.x && targetGrid.y == firstGrid.y) {
                if (obstacleMode == 0 || obstacleMode == 3) {
                    grids.splice(i, 1);
                    i--;
                    continue;
                }
                else {
                    continue;
                }

            }
            // 获取路径是否可行
            if (calcDistance) {
                var toGridX = targetGrid.x - firstGrid.x + range;
                var toGridY = targetGrid.y - firstGrid.y + range;
                // 穿透障碍的话
                if (isThroughObstacle) {
                    continue;
                }
                // 否则计算寻路是否能够到达该地方且在范围步数内
                var realLineArr = AstarUtils.routeGrid(range, range, toGridX, toGridY, range, throughGridMap, new Point(), true, true);
                if (!realLineArr || realLineArr.length > range || (rangeMode == 1 && realLineArr.length <= minRange)) {
                    grids.splice(i, 1);
                    i--;
                    continue;
                }
            }
        }
        // 添加额外的格子
        if (addGridsList) grids = grids.concat(addGridsList);
        return grids;
    }
    /**
     * 获取技能释放范围（相对坐标）
     * @param skill 技能
     * @return [Point] 相对位置集合 
     */
    static getSkillReleaseRangeGrid(skill: Module_Skill): Point[] {
        // 获得释放范围格子数据
        if (skill.targetType == 5 || skill.targetType == 6) {
            var customReleaseData = skill.releaseRange
            var grids = [];
            if (!customReleaseData || !customReleaseData.gridData) return grids;
            var gridData = customReleaseData.gridData;
            var centerX = Math.floor(customReleaseData.size / 2);
            var centerY = Math.floor(customReleaseData.size / 2);
            for (var x = 0; x < customReleaseData.size; x++) {
                for (var y = 0; y < customReleaseData.size; y++) {
                    // 不计算距离，则根据自定义范围来决定是否采用该格子
                    var gridDataXArr = gridData[x];
                    if (!gridDataXArr) continue;
                    if (!gridDataXArr[y]) continue;
                    var localX = x - centerX;
                    var localY = y - centerY;
                    grids.push(new Point(localX, localY));
                }
            }
            return grids;
        }
        else {
            return [new Point(0, 0)];
        }
    }
    /**
     * 获取指定格子周围的通行图数据
     * @param posGrid 指定的格子 
     * @param range 范围
     * @param obstacleMode [可选] 默认值=0 计算障碍的模式 0-计算所有障碍 1-仅计算地图固定障碍 2-不计算障碍 3-计算所有障碍但不包括敌军（必须填入fromBattler以便区分敌军）
     * @param caleDistance [可选] 默认值=false 计算距离
     * @param customRangeData [可选] 默认值=null 自定义范围数据，如有的话则根据该范围来计算
     * @param fromBattler [可选] 默认值=null 参考的战斗者
     */
    static getDestinationThroughGridMap(posGrid: Point, range: number, obstacleMode: number = 0, caleDistance: boolean = true,
        customRangeData: { size: number, gridData: number[][] } = null, fromBattler: ProjectClientSceneObject = null): { grids: Point[], throughGridMap: boolean[][] } {
        var grids: Point[] = [];
        // 首个格子
        var firstGrid = posGrid;
        // 通行状态图
        var throughGridMap: boolean[][] = [];
        // 范围获取
        var gridData = null;
        if (customRangeData) {
            range = Math.floor(customRangeData.size / 2);
            gridData = customRangeData.gridData;
        }
        if (range == null) range = 0;
        // 查询周围 range x range 的可通行格
        if (firstGrid) {
            var startX = firstGrid.x - range
            var endX = firstGrid.x + range
            var startY = firstGrid.y - range
            var endY = firstGrid.y + range
            for (var x = startX; x <= endX; x++) {
                if (x < 0 || x >= Game.currentScene.gridWidth) continue;
                var throughGridMapXArr = throughGridMap[x - startX] = [];
                for (var y = startY; y <= endY; y++) {
                    if (y < 0 || y >= Game.currentScene.gridHeight) continue;
                    // 如果无障碍也超出范围的格子则排除掉
                    if (caleDistance) {
                        var dis = Math.abs(x - firstGrid.x) + Math.abs(y - firstGrid.y);
                        if (dis > range) continue;
                    }
                    // 不计算距离，则根据自定义范围来决定是否采用该格子
                    else {
                        var localX = x - startX;
                        var localY = y - startY;
                        if (!gridData || localX >= customRangeData.size || localY >= customRangeData.size) continue;
                        var gridDataXArr = gridData[localX];
                        if (!gridDataXArr) continue;
                        if (!gridDataXArr[localY]) continue;
                    }
                    // 排除掉带有障碍的格子（自身除外）
                    ProjectUtils.pointHelper.x = x;
                    ProjectUtils.pointHelper.y = y;
                    let isObstacleGrid = false;
                    if (firstGrid.x != x || firstGrid.y != y) {
                        if (obstacleMode == 0) {
                            isObstacleGrid = Game.currentScene.sceneUtils.isObstacleGrid(ProjectUtils.pointHelper);
                        }
                        else if (obstacleMode == 1) {
                            isObstacleGrid = Game.currentScene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper);
                        }
                        else if (obstacleMode == 3) {
                            // -- 如果该格子不存在固定障碍的话，则查询动态障碍中是否存在队友
                            let fixedObstacleGrid = Game.currentScene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper);
                            if (!fixedObstacleGrid) {
                                let gridSceneObjectArr = Game.currentScene.sceneUtils.gridSceneObjects[x][y];
                                if (gridSceneObjectArr.length > 0) {
                                    for (let i = 0; i < gridSceneObjectArr.length; i++) {
                                        let targetSo = gridSceneObjectArr[i];
                                        if (targetSo && GameBattleHelper.isFriendlyRelationship(fromBattler, targetSo)) {
                                            isObstacleGrid = true;
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        else {
                            isObstacleGrid = false;
                        }
                        if (isObstacleGrid) continue;
                    }
                    throughGridMapXArr[y - startY] = true;
                    grids.push(new Point(x, y));
                }
            }
        }
        return { grids: grids, throughGridMap: throughGridMap };
    }
    //------------------------------------------------------------------------------------------------------
    // 格子显示效果
    //------------------------------------------------------------------------------------------------------
    /**
     * 创建效果格子
     * @param gridX 格子水平坐标
     * @param gridY 格子垂直坐标
     * @param mode 0=出场格子 1=作用范围格子 2=释放范围格子
     * @return [GCAnimation] 
     */
    static createEffectGrid(gridX: number, gridY: number, mode: number, battler: ProjectClientSceneObject): GCAnimation {
        if (battler && GameBattleHelper.isEnemyCamp(battler) && !WorldData.aiOpenIndicator) {
            return null;
        }
        if (mode == 0) {
            var aniID = WorldData.readyBattlerFieldAni;
        }
        else if (mode == 1) {
            aniID = WorldData.rangeFieldAni;
        }
        else if (mode == 2) {
            aniID = WorldData.releaseFieldAni;
        }
        var aniX = gridX * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
        var aniY = gridY * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
        var layer = Game.currentScene.animationLowLayer;
        var ani = new GCAnimation();
        ani.loop = true;
        ani.id = aniID;
        ani.play();
        ani.x = aniX;
        ani.y = aniY;
        layer.addChild(ani);
        return ani;
    }
    //------------------------------------------------------------------------------------------------------
    // 算法
    //------------------------------------------------------------------------------------------------------
    /**
     * 获取格子坐标组中距离目标格子最近的的坐标
     * @param throughMapGrids 格子坐标组 
     * @param targetGrids 目标格子
     * @param minDis 最小的距离，不能低于该距离
     * @return [Point] 
     */
    static getNearestToTheTarget(throughMapGrids: Point[], targetGrids: Point, minDistance: number = 0): Point {
        var min = Number.MAX_VALUE;
        var nearestGrid: Point;
        for (var i = 0; i < throughMapGrids.length; i++) {
            var thisGrid = throughMapGrids[i];
            var dis = Math.abs(thisGrid.x - targetGrids.x) + Math.abs(thisGrid.y - targetGrids.y);
            if (dis < min && dis >= minDistance) {
                min = dis;
                nearestGrid = thisGrid;
            }
        }
        return nearestGrid;
    }
    /**
     * 获取两个战斗者之间的格子距离
     * @param battler1 战斗者1
     * @param battler2 战斗者2
     */
    static getBattlerDistance(battler1: ProjectClientSceneObject, battler2: ProjectClientSceneObject) {
        return Math.abs(battler1.posGrid.x - battler2.posGrid.x) + Math.abs(battler1.posGrid.y - battler2.posGrid.y);
    }
    /**
     * 获取两个格子距离
     * @param battler1 战斗者1
     * @param battler2 战斗者2
     */
    static getGridDistance(grid1: Point, grid2: Point) {
        return Math.abs(grid1.x - grid2.x) + Math.abs(grid1.y - grid2.y);
    }
    //------------------------------------------------------------------------------------------------------
    // 伤害计算
    //------------------------------------------------------------------------------------------------------
    /**
     * 计算击中结果
     * -- 状态变更
     * -- 计算伤害
     * -- 计算仇恨
     * -- 死亡判定
     * @param fromBattler 
     * @param targetBattler 
     * @param isHitSuccess 
     * @param actionType 0-普通攻击 1-使用技能 2-使用道具 3-状态
     * @param skill [可选] 默认值=null 
     * @param item [可选] 默认值=null 
     * @param status [可选] 默认值=null
     * @return  damageType=伤害类别（-2-无 -1-Miss 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值） damage=伤害 isCrit=是否暴击
    */
    static calculationHitResult(fromBattler: ProjectClientSceneObject, targetBattler: ProjectClientSceneObject, isHitSuccess: boolean, actionType: number, skill: Module_Skill = null, item: Module_Item = null, status: Module_Status = null): {
        damageType: number,
        damage: number,
        isCrit: boolean
    } {
        // 返回值
        var res: {
            damageType: number,
            damage: number,
            isCrit: boolean
        };
        // 来源和目标的角色数据
        var fromActor = fromBattler.battlerSetting.battleActor;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        // 添加的状态组
        var addTargetBattlerStatusArr: number[] = [];
        var addFromBattlerStatusArr: number[] = [];
        var removeTargetBattlerStatusArr: number[] = [];
        // 记录目标原有的状态
        var targetOriStatus = targetBattlerActor.status.concat();
        // 作用类别和相关数值 
        var damageType = -2; // -2-无 -1-MISS 0-物理伤害 1-魔法伤害 2-真实伤害 3-恢复生命值 4-恢复魔法值
        var hpChangeValue = 0;
        var spChangeValue = 0;
        // 击中后移除状态（造成伤害才允许移除）
        var hitRemoveStatus = false;
        // 计算暴击率
        var critPer: number;
        var magCritPer: number;
        var isCrit: boolean;
        var isMagCrit: boolean;
        // 优先计算状态和刷新属性（如技能带有降低对方属性的状态，即当前立刻以降低后的属性来计算伤害）
        if (isHitSuccess) {
            isCrit = MathUtils.rand(100) < fromActor.CRIT ? true : false;
            isMagCrit = MathUtils.rand(100) < fromActor.MagCrit ? true : false;
            critPer = isCrit ? 2 : 1;
            magCritPer = isMagCrit ? 2 : 1;

            // 普通攻击
            if (actionType == 0) {
                // 击中目标后自身附加的状态
                addFromBattlerStatusArr = addFromBattlerStatusArr.concat(fromActor.hitTargetSelfAddStatus);
                // 击中目标后目标附加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(fromActor.hitTargetStatus);
            }
            // 使用技能
            else if (actionType == 1) {
                // -- 添加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(skill.addStatus);
                // -- 减少的状态
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(skill.removeStatus);
            }
            // 使用道具
            else if (actionType == 2) {
                // -- 添加的状态
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(item.addStatus);
                // -- 减少的状态
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(item.removeStatus);
            }
            // 添加目标状态
            for (var i = 0; i < addTargetBattlerStatusArr.length; i++) {
                var addStatusID = addTargetBattlerStatusArr[i];
                GameBattlerHandler.addStatus(targetBattler, addStatusID, fromBattler);
            }
            // 移除目标状态
            for (var i = 0; i < removeTargetBattlerStatusArr.length; i++) {
                var removeStatusID = removeTargetBattlerStatusArr[i];
                GameBattlerHandler.removeStatus(targetBattler, removeStatusID);
            }
            // 添加来源的状态
            for (var i = 0; i < addFromBattlerStatusArr.length; i++) {
                var addStatusID = addFromBattlerStatusArr[i];
                GameBattlerHandler.addStatus(fromBattler, addStatusID, fromBattler);
            }
            // 如果目标更新了状态的话则刷新目标属性
            if (addTargetBattlerStatusArr.length > 0 || removeTargetBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level)
            }
            // 如果来源者更新了状态的话刷新来源的属性
            if (addFromBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level)
            }
        }
        // -- MISS
        if (!isHitSuccess) {
            damageType = -1;
            res = { damageType: -1, damage: hpChangeValue, isCrit: false };
        }
        // -- 普通攻击：(攻击者命中率 - 目标躲避率)%
        else if (actionType == 0) {
            damageType = 0;
            hpChangeValue = -Math.max(1, fromActor.ATK - targetBattlerActor.DEF) * critPer;
            res = { damageType: 0, damage: hpChangeValue, isCrit: isCrit };
            hitRemoveStatus = true;
        }
        // -- 使用技能：
        else if (actionType == 1) {
            var skillDamage = 0;
            // 使用伤害
            if (skill.useDamage) {
                var damageShowCrit: boolean = false;
                damageType = skill.damageType;
                // -- 技能固定伤害
                skillDamage = skill.damageValue;
                // -- 技能伤害加成
                if (skill.useAddition) {
                    var actorAttributeValue = skill.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                    var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                    skillDamage += addDamageValue;
                }
                // -- 物理伤害
                if (damageType == 0) {
                    hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.DEF) * critPer;
                    hitRemoveStatus = true;
                    damageShowCrit = isCrit;
                }
                // -- 魔法伤害
                else if (damageType == 1) {
                    hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.MagDef) * magCritPer;
                    hitRemoveStatus = true;
                    damageShowCrit = isMagCrit;
                }
                // -- 真实伤害
                else if (damageType == 2) {
                    hpChangeValue = -Math.max(1, skillDamage);
                    hitRemoveStatus = true;
                }
                // -- 恢复生命值
                else if (damageType == 3) {
                    hpChangeValue = Math.max(0, skillDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                // -- 恢复魔法值
                else if (damageType == 4) {
                    spChangeValue = Math.max(0, skillDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                // -- 显示伤害 
                if (hpChangeValue != 0) {
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                }
                else if (spChangeValue != 0) {
                    res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                }
            }
            // 造成来源技能的仇恨
            if (skill.useHate) {
                GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, skill, skillDamage);
            }
        }
        // -- 使用道具
        else if (actionType == 2) {
            if (item.recoveryHP) {
                damageType = 3;
                hpChangeValue = item.recoveryHP;
                res = { damageType: damageType, damage: hpChangeValue, isCrit: false };
            }
            if (item.recoverySP) {
                spChangeValue = item.recoverySP;
                if (damageType != 3) {
                    damageType = 4;
                    res = { damageType: damageType, damage: spChangeValue, isCrit: false };
                }
            }
        }
        // -- 状态:DOT/HOT
        else if (actionType == 3) {
            // 使用伤害
            damageType = status.damageType;
            var damageShowCrit: boolean = false;
            // -- 技能固定伤害
            var statusDamage = status.damageValue;
            // -- 技能伤害加成
            if (status.useAddition) {
                var actorAttributeValue = status.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                var addDamageValue = status.additionMultiple / 100 * actorAttributeValue;
                statusDamage += addDamageValue;
            }
            // -- 物理伤害
            if (damageType == 0) {
                hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.DEF);
                hitRemoveStatus = true;
                damageShowCrit = isCrit;
            }
            // -- 魔法伤害
            else if (damageType == 1) {
                hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.MagDef);
                hitRemoveStatus = true;
                damageShowCrit = isMagCrit;
            }
            // -- 真实伤害
            else if (damageType == 2) {
                hpChangeValue = -Math.max(1, statusDamage);
                hitRemoveStatus = true;
            }
            // -- 恢复生命值
            else if (damageType == 3) {
                hpChangeValue = Math.max(0, statusDamage);
                damageShowCrit = isMagCrit;
            }
            // -- 恢复魔法值
            else if (damageType == 4) {
                spChangeValue = Math.max(0, statusDamage);
                damageShowCrit = isMagCrit;
            }
            // 状态叠加层
            hpChangeValue *= status.currentLayer;
            spChangeValue *= status.currentLayer;
            // -- 显示伤害
            if (hpChangeValue != 0) {
                res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
            }
            else if (spChangeValue != 0) {
                res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
            }
            // 造成来源状态的仇恨
            GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, status, statusDamage);
        }
        // 停止受伤动画
        if (WorldData.hurtAni) targetBattler.stopAnimation(WorldData.hurtAni);
        // 恢复待机动作
        if (!targetBattler.battlerSetting.isDead) targetBattler.avatar.actionID = 1;
        // 更改生命值和魔法值
        hpChangeValue = Math.floor(hpChangeValue);
        spChangeValue = Math.floor(spChangeValue);
        if (hpChangeValue != 0) targetBattlerActor.hp += hpChangeValue;
        if (spChangeValue != 0) targetBattlerActor.sp += spChangeValue;
        // 修正生命值和魔法值范围
        targetBattlerActor.hp = Math.max(Math.min(targetBattlerActor.hp, targetBattlerActor.MaxHP), 0);
        targetBattlerActor.sp = Math.max(Math.min(targetBattlerActor.sp, targetBattlerActor.MaxSP), 0);
        // 计算受伤害解除的状态
        if (hitRemoveStatus) {
            // 受伤解除状态
            var hitRemoveStatusSuccess = false;
            if ((actionType == 0 || actionType == 1 || actionType == 3) && damageType <= 2) {
                for (var i = 0; i < targetOriStatus.length; i++) {
                    var needRemoveStatus = targetOriStatus[i];
                    if (needRemoveStatus.removeWhenInjured && MathUtils.rand(100) < needRemoveStatus.removePer) {
                        if (GameBattlerHandler.removeStatus(targetBattler, needRemoveStatus.id)) hitRemoveStatusSuccess = true;
                    }
                }
                if (hitRemoveStatusSuccess) {
                    var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                    Game.refreshActorAttribute(targetBattlerActor, level);
                }
            }
        }
        return res;
    }
}