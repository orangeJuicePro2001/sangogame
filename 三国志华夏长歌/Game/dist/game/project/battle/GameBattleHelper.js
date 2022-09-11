var GameBattleHelper = (function () {
    function GameBattleHelper() {
    }
    GameBattleHelper.getLevelByActor = function (actor) {
        var playerActorDS = ArrayUtils.matchAttributes(Game.player.data.party, { actor: actor }, true)[0];
        if (playerActorDS) {
            return playerActorDS.lv;
        }
        else {
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (this.isBattler(so) && so.battlerSetting.battleActor == actor) {
                    return so.battlerSetting.level;
                }
            }
        }
        return 1;
    };
    Object.defineProperty(GameBattleHelper, "allBattlers", {
        get: function () {
            var arr = [];
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (GameBattleHelper.isBattler(so)) {
                    arr.push(so);
                }
            }
            return arr;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "isInBattle", {
        get: function () {
            return GameBattle.state != 0;
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.isBattler = function (so) {
        return so && so.modelID == 1 && so.battlerSetting.isBattler;
    };
    GameBattleHelper.isPlayerCamp = function (so) {
        return this.isBattler(so) && so.battlerSetting.battleCamp == 0;
    };
    GameBattleHelper.isEnemyCamp = function (so) {
        return this.isBattler(so) && so.battlerSetting.battleCamp == 1;
    };
    GameBattleHelper.isInPlayerParty = function (so) {
        return this.isPlayerCamp(so) && ProjectPlayer.getPlayerActorIndexByActor(so.battlerSetting.battleActor) >= 0;
    };
    GameBattleHelper.isFriendlyRelationship = function (so1, so2) {
        return this.isBattler(so1) && this.isBattler(so2) && so1.battlerSetting.battleCamp == so2.battlerSetting.battleCamp;
    };
    GameBattleHelper.isHostileRelationship = function (so1, so2) {
        return this.isBattler(so1) && this.isBattler(so2) && so1.battlerSetting.battleCamp != so2.battlerSetting.battleCamp;
    };
    GameBattleHelper.isPlayerControlEnabledBattler = function (so) {
        return this.isPlayerCamp(so) && !so.battlerSetting.playerCantCtrl && !so.battlerSetting.battleActor.AI;
    };
    GameBattleHelper.isInEffectGrid = function (gridPos) {
        if (!GameBattleAction.battlerEffectIndicatorGridArr)
            return false;
        return ArrayUtils.matchAttributes(GameBattleAction.battlerEffectIndicatorGridArr, { x: gridPos.x, y: gridPos.y }, true).length == 1;
    };
    Object.defineProperty(GameBattleHelper, "isOpendBattleMenu", {
        get: function () {
            var battlerMenu = GameUI.get(14);
            if (battlerMenu && battlerMenu.stage) {
                return true;
            }
            var commonMenu = GameUI.get(15);
            if (commonMenu && commonMenu.stage) {
                return true;
            }
            return false;
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.isHostileSkill = function (skill) {
        return skill.skillType <= 1 && (skill.targetType == 2 || skill.targetType == 4 || skill.targetType == 6);
    };
    GameBattleHelper.isFriendlySkill = function (skill) {
        return skill.skillType <= 1 && !this.isHostileSkill(skill);
    };
    GameBattleHelper.getBattlerStatus = function (battler, statusID) {
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true)[0];
    };
    GameBattleHelper.isIncludeStatus = function (battler, statusID) {
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true).length == 1;
    };
    GameBattleHelper.canSuperpositionLayer = function (battler, statusID) {
        var status = ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { id: statusID }, true)[0];
        if (status && status.currentLayer >= status.maxlayer)
            return false;
        return true;
    };
    GameBattleHelper.canMove = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.battlerSetting.moved || battler.battlerSetting.operationComplete || battler.battlerSetting.isDead)
            return false;
        if (battler.battlerSetting.battleActor.MoveGrid <= 0)
            return false;
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantMove: true }, true).length == 0;
    };
    GameBattleHelper.canAttack = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.battlerSetting.actioned || battler.battlerSetting.operationComplete || battler.battlerSetting.isDead)
            return false;
        var actor = battler.battlerSetting.battleActor;
        if (actor.atkMode == 1 && (!actor.atkSkill || actor.atkSkill.currentCD != 0 || actor.atkSkill.costSP > battler.battlerSetting.battleActor.sp))
            return false;
        return ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantAtk: true }, true).length == 0;
    };
    GameBattleHelper.canUseSkill = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead)
            return false;
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseSkill: true }, true).length == 1)
            return false;
        return true;
    };
    GameBattleHelper.canUseOneSkill = function (battler, skill, checkUseSkillCommconCondition) {
        if (checkUseSkillCommconCondition === void 0) { checkUseSkillCommconCondition = true; }
        if (checkUseSkillCommconCondition && !this.canUseSkill(battler))
            return false;
        if (skill.skillType == 2)
            return false;
        return !(skill.currentCD != 0 || skill.costSP > battler.battlerSetting.battleActor.sp || (skill.costActionPower && battler.battlerSetting.actioned));
    };
    GameBattleHelper.conUseItem = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead)
            return false;
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseItem: true }, true).length == 1)
            return false;
        return true;
    };
    GameBattleHelper.canUseOneItem = function (battler, item) {
        if (!GameBattleHelper.isBattler(battler))
            return false;
        if (ArrayUtils.matchAttributes(battler.battlerSetting.battleActor.status, { cantUseItem: true }, true).length == 1)
            return false;
        if (battler.battlerSetting.operationComplete || battler.battlerSetting.isDead)
            return false;
        return !(item.costActionPower && battler.battlerSetting.actioned);
    };
    Object.defineProperty(GameBattleHelper, "cursorGridPoint", {
        get: function () {
            var p = Game.player.sceneObject;
            return p.posGrid;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "cursor", {
        get: function () {
            return Game.player.sceneObject;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "inSceneMouseGridPoint", {
        get: function () {
            var localX = Game.currentScene.localX;
            var localY = Game.currentScene.localY;
            return GameUtils.getGridPostion(new Point(localX, localY));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "inSceneMouseGridCenter", {
        get: function () {
            var localX = Game.currentScene.localX;
            var localY = Game.currentScene.localY;
            return GameUtils.getGridCenter(new Point(localX, localY));
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.cameraCorrect = function () {
        var cursorX = GameBattleHelper.cursor.x;
        var cursorY = GameBattleHelper.cursor.y;
        if (ProjectUtils.lastControl == 0) {
            cursorX = Game.currentScene.localX;
            cursorY = Game.currentScene.localY;
        }
        var screenRect = Game.currentScene.camera.viewPort.clone();
        var range = Config.SCENE_GRID_SIZE;
        screenRect.x += range;
        screenRect.y += range;
        screenRect.width -= range * 2;
        screenRect.height -= range * 2;
        if (!screenRect.contains(cursorX, cursorY)) {
            var cameraToX = screenRect.x;
            if (cursorX < screenRect.x) {
                cameraToX = cursorX;
            }
            else if (cursorX > screenRect.right) {
                cameraToX = cursorX - screenRect.width;
            }
            var cameraToY = screenRect.y;
            if (cursorY < screenRect.y) {
                cameraToY = cursorY;
            }
            else if (cursorY > screenRect.bottom) {
                cameraToY = cursorY - screenRect.height;
            }
            cameraToX -= range;
            cameraToY -= range;
            if (ProjectUtils.lastControl != 0) {
                GameFunction.cameraMove(0, cameraToX += Math.round(Config.WINDOW_WIDTH / 2), cameraToY += Math.round(Config.WINDOW_HEIGHT / 2), 0, true, 1);
            }
            else {
                var mouseMoveScreenSpeed = 15;
                if (Game.currentScene.camera.viewPort.x != cameraToX) {
                    Game.currentScene.camera.viewPort.x += Game.currentScene.camera.viewPort.x > cameraToX ? -mouseMoveScreenSpeed : mouseMoveScreenSpeed;
                }
                if (Game.currentScene.camera.viewPort.y != cameraToY) {
                    Game.currentScene.camera.viewPort.y += Game.currentScene.camera.viewPort.y > cameraToY ? -mouseMoveScreenSpeed : mouseMoveScreenSpeed;
                }
                if (Game.currentScene.camera.viewPort.x < 0)
                    Game.currentScene.camera.viewPort.x = 0;
                else if (Game.currentScene.camera.viewPort.right > Game.currentScene.width)
                    Game.currentScene.camera.viewPort.x = Game.currentScene.width - Game.currentScene.camera.viewPort.width;
                if (Game.currentScene.camera.viewPort.y < 0)
                    Game.currentScene.camera.viewPort.y = 0;
                else if (Game.currentScene.camera.viewPort.bottom > Game.currentScene.height)
                    Game.currentScene.camera.viewPort.y = Game.currentScene.height - Game.currentScene.camera.viewPort.height;
            }
        }
    };
    GameBattleHelper.getSceneObjectByGrid = function (posGridP, ignoreDeadUnit) {
        if (ignoreDeadUnit === void 0) { ignoreDeadUnit = false; }
        if (Game.currentScene.sceneUtils.isOutsideByGrid(posGridP))
            return;
        var targetSceneObjects = Game.currentScene.sceneUtils.gridSceneObjects[posGridP.x][posGridP.y].concat();
        ArrayUtils.remove(targetSceneObjects, GameBattleHelper.cursor);
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
    };
    Object.defineProperty(GameBattleHelper, "overCursorSceneObject", {
        get: function () {
            var p = GameBattleHelper.cursor;
            var posGridP = new Point(p.posGrid.x, p.posGrid.y);
            return this.getSceneObjectByGrid(posGridP);
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.getNoDeadBattlerByGrid = function (posGridP) {
        var so = this.getSceneObjectByGrid(posGridP, true);
        if (so && this.isBattler(so) && !so.battlerSetting.isDead)
            return so;
        return null;
    };
    Object.defineProperty(GameBattleHelper, "overCursorNoDeadBattler", {
        get: function () {
            var p = GameBattleHelper.cursor;
            var posGridP = new Point(p.posGrid.x, p.posGrid.y);
            return this.getNoDeadBattlerByGrid(posGridP);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "overCursorPlayerCampNoDeadBattler", {
        get: function () {
            var overCursorNoDeadBattler = this.overCursorNoDeadBattler;
            if (!overCursorNoDeadBattler || overCursorNoDeadBattler.battlerSetting.battleCamp != 0)
                return null;
            return overCursorNoDeadBattler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "overCursorEnemyCampNoDeadBattler", {
        get: function () {
            var overCursorNoDeadBattler = this.overCursorNoDeadBattler;
            if (!overCursorNoDeadBattler || overCursorNoDeadBattler.battlerSetting.battleCamp != 1)
                return null;
            return overCursorNoDeadBattler;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "overCursorPlayerCtrlEnabledBattler", {
        get: function () {
            var overCursorPlayerCampNoDeadBattler = this.overCursorPlayerCampNoDeadBattler;
            if (!overCursorPlayerCampNoDeadBattler || overCursorPlayerCampNoDeadBattler.battlerSetting.playerCantCtrl
                || overCursorPlayerCampNoDeadBattler.battlerSetting.battleActor.AI || overCursorPlayerCampNoDeadBattler.battlerSetting.operationComplete)
                return null;
            return overCursorPlayerCampNoDeadBattler;
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.getAttackTargetOnGrid = function (battler, gridPos) {
        if (!this.isInEffectGrid(gridPos))
            return null;
        var target = this.getNoDeadBattlerByGrid(gridPos);
        if (!target || !GameBattleHelper.isHostileRelationship(battler, target))
            return null;
        return target;
    };
    GameBattleHelper.getItemTargetOnGrid = function (battler, gridPos) {
        if (!this.isInEffectGrid(gridPos))
            return null;
        var target = this.getNoDeadBattlerByGrid(gridPos);
        if (!target)
            return null;
        return target;
    };
    GameBattleHelper.getSkillTargetOnGrid = function (fromBattler, skill, gridPos) {
        if (skill.targetType != 3 && skill.targetType != 4 && !this.isInEffectGrid(gridPos))
            return null;
        if (skill.skillType == 2)
            return null;
        if (skill.targetType == 0) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (target != fromBattler)
                return null;
            return { allow: true, targets: [target] };
        }
        else if (skill.targetType == 1) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (!this.isFriendlyRelationship(fromBattler, target))
                return null;
            return { allow: true, targets: [target] };
        }
        else if (skill.targetType == 2) {
            var target = this.getNoDeadBattlerByGrid(gridPos);
            if (!this.isHostileRelationship(fromBattler, target))
                return null;
            return { allow: true, targets: [target] };
        }
        else if (skill.targetType == 3) {
            var targets = fromBattler.battlerSetting.battleCamp == 0 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            targets = ArrayUtils.matchAttributesD2(targets, "battlerSetting", { isDead: false }, false);
            return { allow: true, targets: targets };
        }
        else if (skill.targetType == 4) {
            var targets = fromBattler.battlerSetting.battleCamp == 1 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            targets = ArrayUtils.matchAttributesD2(targets, "battlerSetting", { isDead: false }, false);
            return { allow: true, targets: targets };
        }
        else if (skill.targetType == 5 || skill.targetType == 6) {
            if (skill.mustOpenSpace) {
                var target = this.getSceneObjectByGrid(gridPos);
                if (target && !target.through)
                    return { allow: false, targets: [] };
            }
            var targets = [];
            var releasePointLength = GameBattleAction.battlerRelaseIndicatorGridArr.length;
            var cursorGrid = GameBattleHelper.cursorGridPoint;
            for (var i = 0; i < releasePointLength; i++) {
                var localGrid = GameBattleAction.battlerRelaseIndicatorGridArr[i];
                var inSceneGridX = localGrid.x + cursorGrid.x;
                var inSceneGridY = localGrid.y + cursorGrid.y;
                var sceneGrid = new Point(inSceneGridX, inSceneGridY);
                if (Game.currentScene.sceneUtils.isOutsideByGrid(sceneGrid)) {
                    continue;
                }
                var target = this.getNoDeadBattlerByGrid(sceneGrid);
                if ((skill.targetType == 5 && this.isFriendlyRelationship(fromBattler, target)) ||
                    (skill.targetType == 6 && this.isHostileRelationship(fromBattler, target))) {
                    targets.push(target);
                }
            }
            return { allow: true, targets: targets };
        }
    };
    Object.defineProperty(GameBattleHelper, "nextPlayerControlBattler", {
        get: function () {
            for (var i = 0; i < GameBattle.playerBattlers.length; i++) {
                var playerBattler = GameBattle.playerBattlers[i];
                if (playerBattler.battlerSetting.isDead)
                    continue;
                if (GameBattleHelper.isPlayerControlEnabledBattler(playerBattler) && !playerBattler.battlerSetting.operationComplete) {
                    return playerBattler;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "nextPlayerCampComputerControlBattler", {
        get: function () {
            for (var i = 0; i < GameBattle.playerBattlers.length; i++) {
                var playerBattler = GameBattle.playerBattlers[i];
                if (playerBattler.battlerSetting.isDead)
                    continue;
                if (!GameBattleHelper.isPlayerControlEnabledBattler(playerBattler) && !playerBattler.battlerSetting.operationComplete) {
                    return playerBattler;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameBattleHelper, "nextEnemyControlBattler", {
        get: function () {
            for (var i = 0; i < GameBattle.enemyBattlers.length; i++) {
                var enemyBattler = GameBattle.enemyBattlers[i];
                if (enemyBattler.battlerSetting.isDead)
                    continue;
                if (!enemyBattler.battlerSetting.operationComplete) {
                    return enemyBattler;
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    GameBattleHelper.getSkillEffectRangeGrid = function (posGrid, skill) {
        var obstacleMode = 1;
        var rangeMode;
        var range;
        var minRange;
        var customRangeData;
        var customReleaseRangeData;
        rangeMode = skill.effectRangeType;
        if (rangeMode == 0) {
            range = skill.effectRange1;
        }
        else if (rangeMode == 1) {
            minRange = skill.effectRange2A;
            range = skill.effectRange2B;
        }
        else if (rangeMode == 2) {
            customRangeData = skill.effectRange3;
        }
        if (skill.targetType == 0) {
            rangeMode = 0;
            range = 0;
        }
        if ((skill.targetType == 5 || skill.targetType == 6) && skill.mustOpenSpace) {
            obstacleMode = 0;
        }
        return GameBattleHelper.getEffectRange(posGrid, range, obstacleMode, rangeMode, minRange, customRangeData, skill.isThroughObstacle);
    };
    GameBattleHelper.getEffectRange = function (firstGrid, range, obstacleMode, rangeMode, minRange, customRangeData, isThroughObstacle, addGridsList, fromBattler) {
        if (obstacleMode === void 0) { obstacleMode = 0; }
        if (rangeMode === void 0) { rangeMode = 0; }
        if (minRange === void 0) { minRange = 0; }
        if (customRangeData === void 0) { customRangeData = null; }
        if (isThroughObstacle === void 0) { isThroughObstacle = false; }
        if (addGridsList === void 0) { addGridsList = null; }
        if (fromBattler === void 0) { fromBattler = null; }
        var calcDistance = rangeMode != 2;
        var battlerThroughGridMap = this.getDestinationThroughGridMap(firstGrid, range, obstacleMode, calcDistance, customRangeData, fromBattler);
        var grids = battlerThroughGridMap.grids;
        var throughGridMap = battlerThroughGridMap.throughGridMap;
        for (var i = 0; i < grids.length; i++) {
            var targetGrid = grids[i];
            if (rangeMode == 1) {
                var dis = Math.abs(targetGrid.x - firstGrid.x) + Math.abs(targetGrid.y - firstGrid.y);
                if (dis <= minRange) {
                    grids.splice(i, 1);
                    i--;
                    continue;
                }
            }
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
            if (calcDistance) {
                var toGridX = targetGrid.x - firstGrid.x + range;
                var toGridY = targetGrid.y - firstGrid.y + range;
                if (isThroughObstacle) {
                    continue;
                }
                var realLineArr = AstarUtils.routeGrid(range, range, toGridX, toGridY, range, throughGridMap, new Point(), true, true);
                if (!realLineArr || realLineArr.length > range || (rangeMode == 1 && realLineArr.length <= minRange)) {
                    grids.splice(i, 1);
                    i--;
                    continue;
                }
            }
        }
        if (addGridsList)
            grids = grids.concat(addGridsList);
        return grids;
    };
    GameBattleHelper.getSkillReleaseRangeGrid = function (skill) {
        if (skill.targetType == 5 || skill.targetType == 6) {
            var customReleaseData = skill.releaseRange;
            var grids = [];
            if (!customReleaseData || !customReleaseData.gridData)
                return grids;
            var gridData = customReleaseData.gridData;
            var centerX = Math.floor(customReleaseData.size / 2);
            var centerY = Math.floor(customReleaseData.size / 2);
            for (var x = 0; x < customReleaseData.size; x++) {
                for (var y = 0; y < customReleaseData.size; y++) {
                    var gridDataXArr = gridData[x];
                    if (!gridDataXArr)
                        continue;
                    if (!gridDataXArr[y])
                        continue;
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
    };
    GameBattleHelper.getDestinationThroughGridMap = function (posGrid, range, obstacleMode, caleDistance, customRangeData, fromBattler) {
        if (obstacleMode === void 0) { obstacleMode = 0; }
        if (caleDistance === void 0) { caleDistance = true; }
        if (customRangeData === void 0) { customRangeData = null; }
        if (fromBattler === void 0) { fromBattler = null; }
        var grids = [];
        var firstGrid = posGrid;
        var throughGridMap = [];
        var gridData = null;
        if (customRangeData) {
            range = Math.floor(customRangeData.size / 2);
            gridData = customRangeData.gridData;
        }
        if (range == null)
            range = 0;
        if (firstGrid) {
            var startX = firstGrid.x - range;
            var endX = firstGrid.x + range;
            var startY = firstGrid.y - range;
            var endY = firstGrid.y + range;
            for (var x = startX; x <= endX; x++) {
                if (x < 0 || x >= Game.currentScene.gridWidth)
                    continue;
                var throughGridMapXArr = throughGridMap[x - startX] = [];
                for (var y = startY; y <= endY; y++) {
                    if (y < 0 || y >= Game.currentScene.gridHeight)
                        continue;
                    if (caleDistance) {
                        var dis = Math.abs(x - firstGrid.x) + Math.abs(y - firstGrid.y);
                        if (dis > range)
                            continue;
                    }
                    else {
                        var localX = x - startX;
                        var localY = y - startY;
                        if (!gridData || localX >= customRangeData.size || localY >= customRangeData.size)
                            continue;
                        var gridDataXArr = gridData[localX];
                        if (!gridDataXArr)
                            continue;
                        if (!gridDataXArr[localY])
                            continue;
                    }
                    ProjectUtils.pointHelper.x = x;
                    ProjectUtils.pointHelper.y = y;
                    var isObstacleGrid = false;
                    if (firstGrid.x != x || firstGrid.y != y) {
                        if (obstacleMode == 0) {
                            isObstacleGrid = Game.currentScene.sceneUtils.isObstacleGrid(ProjectUtils.pointHelper);
                        }
                        else if (obstacleMode == 1) {
                            isObstacleGrid = Game.currentScene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper);
                        }
                        else if (obstacleMode == 3) {
                            var fixedObstacleGrid = Game.currentScene.sceneUtils.isFixedObstacleGrid(ProjectUtils.pointHelper);
                            if (!fixedObstacleGrid) {
                                var gridSceneObjectArr = Game.currentScene.sceneUtils.gridSceneObjects[x][y];
                                if (gridSceneObjectArr.length > 0) {
                                    for (var i = 0; i < gridSceneObjectArr.length; i++) {
                                        var targetSo = gridSceneObjectArr[i];
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
                        if (isObstacleGrid)
                            continue;
                    }
                    throughGridMapXArr[y - startY] = true;
                    grids.push(new Point(x, y));
                }
            }
        }
        return { grids: grids, throughGridMap: throughGridMap };
    };
    GameBattleHelper.createEffectGrid = function (gridX, gridY, mode, battler) {
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
    };
    GameBattleHelper.getNearestToTheTarget = function (throughMapGrids, targetGrids, minDistance) {
        if (minDistance === void 0) { minDistance = 0; }
        var min = Number.MAX_VALUE;
        var nearestGrid;
        for (var i = 0; i < throughMapGrids.length; i++) {
            var thisGrid = throughMapGrids[i];
            var dis = Math.abs(thisGrid.x - targetGrids.x) + Math.abs(thisGrid.y - targetGrids.y);
            if (dis < min && dis >= minDistance) {
                min = dis;
                nearestGrid = thisGrid;
            }
        }
        return nearestGrid;
    };
    GameBattleHelper.getBattlerDistance = function (battler1, battler2) {
        return Math.abs(battler1.posGrid.x - battler2.posGrid.x) + Math.abs(battler1.posGrid.y - battler2.posGrid.y);
    };
    GameBattleHelper.getGridDistance = function (grid1, grid2) {
        return Math.abs(grid1.x - grid2.x) + Math.abs(grid1.y - grid2.y);
    };
    GameBattleHelper.calculationHitResult = function (fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status) {
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        var res;
        var fromActor = fromBattler.battlerSetting.battleActor;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        var addTargetBattlerStatusArr = [];
        var addFromBattlerStatusArr = [];
        var removeTargetBattlerStatusArr = [];
        var targetOriStatus = targetBattlerActor.status.concat();
        var damageType = -2;
        var hpChangeValue = 0;
        var spChangeValue = 0;
        var hitRemoveStatus = false;
        var critPer;
        var magCritPer;
        var isCrit;
        var isMagCrit;
        if (isHitSuccess) {
            isCrit = MathUtils.rand(100) < fromActor.CRIT ? true : false;
            isMagCrit = MathUtils.rand(100) < fromActor.MagCrit ? true : false;
            critPer = isCrit ? 2 : 1;
            magCritPer = isMagCrit ? 2 : 1;
            if (actionType == 0) {
                addFromBattlerStatusArr = addFromBattlerStatusArr.concat(fromActor.hitTargetSelfAddStatus);
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(fromActor.hitTargetStatus);
            }
            else if (actionType == 1) {
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(skill.addStatus);
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(skill.removeStatus);
            }
            else if (actionType == 2) {
                addTargetBattlerStatusArr = addTargetBattlerStatusArr.concat(item.addStatus);
                removeTargetBattlerStatusArr = removeTargetBattlerStatusArr.concat(item.removeStatus);
            }
            for (var i = 0; i < addTargetBattlerStatusArr.length; i++) {
                var addStatusID = addTargetBattlerStatusArr[i];
                GameBattlerHandler.addStatus(targetBattler, addStatusID, fromBattler);
            }
            for (var i = 0; i < removeTargetBattlerStatusArr.length; i++) {
                var removeStatusID = removeTargetBattlerStatusArr[i];
                GameBattlerHandler.removeStatus(targetBattler, removeStatusID);
            }
            for (var i = 0; i < addFromBattlerStatusArr.length; i++) {
                var addStatusID = addFromBattlerStatusArr[i];
                GameBattlerHandler.addStatus(fromBattler, addStatusID, fromBattler);
            }
            if (addTargetBattlerStatusArr.length > 0 || removeTargetBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level);
            }
            if (addFromBattlerStatusArr.length > 0) {
                var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                Game.refreshActorAttribute(targetBattlerActor, level);
            }
        }
        if (!isHitSuccess) {
            damageType = -1;
            res = { damageType: -1, damage: hpChangeValue, isCrit: false };
        }
        else if (actionType == 0) {
            damageType = 0;
            hpChangeValue = -Math.max(1, fromActor.ATK - targetBattlerActor.DEF) * critPer;
            res = { damageType: 0, damage: hpChangeValue, isCrit: isCrit };
            hitRemoveStatus = true;
        }
        else if (actionType == 1) {
            var skillDamage = 0;
            if (skill.useDamage) {
                var damageShowCrit = false;
                damageType = skill.damageType;
                skillDamage = skill.damageValue;
                if (skill.useAddition) {
                    var actorAttributeValue = skill.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                    var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                    skillDamage += addDamageValue;
                }
                if (damageType == 0) {
                    hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.DEF) * critPer;
                    hitRemoveStatus = true;
                    damageShowCrit = isCrit;
                }
                else if (damageType == 1) {
                    hpChangeValue = -Math.max(1, skillDamage - targetBattlerActor.MagDef) * magCritPer;
                    hitRemoveStatus = true;
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 2) {
                    hpChangeValue = -Math.max(1, skillDamage);
                    hitRemoveStatus = true;
                }
                else if (damageType == 3) {
                    hpChangeValue = Math.max(0, skillDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                else if (damageType == 4) {
                    spChangeValue = Math.max(0, skillDamage) * magCritPer;
                    damageShowCrit = isMagCrit;
                }
                if (hpChangeValue != 0) {
                    res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
                }
                else if (spChangeValue != 0) {
                    res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
                }
            }
            if (skill.useHate) {
                GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, skill, skillDamage);
            }
        }
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
        else if (actionType == 3) {
            damageType = status.damageType;
            var damageShowCrit = false;
            var statusDamage = status.damageValue;
            if (status.useAddition) {
                var actorAttributeValue = status.additionMultipleType == 0 ? fromActor.ATK : fromActor.MAG;
                var addDamageValue = status.additionMultiple / 100 * actorAttributeValue;
                statusDamage += addDamageValue;
            }
            if (damageType == 0) {
                hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.DEF);
                hitRemoveStatus = true;
                damageShowCrit = isCrit;
            }
            else if (damageType == 1) {
                hpChangeValue = -Math.max(1, statusDamage - targetBattlerActor.MagDef);
                hitRemoveStatus = true;
                damageShowCrit = isMagCrit;
            }
            else if (damageType == 2) {
                hpChangeValue = -Math.max(1, statusDamage);
                hitRemoveStatus = true;
            }
            else if (damageType == 3) {
                hpChangeValue = Math.max(0, statusDamage);
                damageShowCrit = isMagCrit;
            }
            else if (damageType == 4) {
                spChangeValue = Math.max(0, statusDamage);
                damageShowCrit = isMagCrit;
            }
            hpChangeValue *= status.currentLayer;
            spChangeValue *= status.currentLayer;
            if (hpChangeValue != 0) {
                res = { damageType: damageType, damage: hpChangeValue, isCrit: damageShowCrit };
            }
            else if (spChangeValue != 0) {
                res = { damageType: damageType, damage: spChangeValue, isCrit: damageShowCrit };
            }
            GameBattlerHandler.increaseHateByHit(fromBattler, targetBattler, status, statusDamage);
        }
        if (WorldData.hurtAni)
            targetBattler.stopAnimation(WorldData.hurtAni);
        if (!targetBattler.battlerSetting.isDead)
            targetBattler.avatar.actionID = 1;
        hpChangeValue = Math.floor(hpChangeValue);
        spChangeValue = Math.floor(spChangeValue);
        if (hpChangeValue != 0)
            targetBattlerActor.hp += hpChangeValue;
        if (spChangeValue != 0)
            targetBattlerActor.sp += spChangeValue;
        targetBattlerActor.hp = Math.max(Math.min(targetBattlerActor.hp, targetBattlerActor.MaxHP), 0);
        targetBattlerActor.sp = Math.max(Math.min(targetBattlerActor.sp, targetBattlerActor.MaxSP), 0);
        if (hitRemoveStatus) {
            var hitRemoveStatusSuccess = false;
            if ((actionType == 0 || actionType == 1 || actionType == 3) && damageType <= 2) {
                for (var i = 0; i < targetOriStatus.length; i++) {
                    var needRemoveStatus = targetOriStatus[i];
                    if (needRemoveStatus.removeWhenInjured && MathUtils.rand(100) < needRemoveStatus.removePer) {
                        if (GameBattlerHandler.removeStatus(targetBattler, needRemoveStatus.id))
                            hitRemoveStatusSuccess = true;
                    }
                }
                if (hitRemoveStatusSuccess) {
                    var level = GameBattleHelper.getLevelByActor(targetBattlerActor);
                    Game.refreshActorAttribute(targetBattlerActor, level);
                }
            }
        }
        return res;
    };
    return GameBattleHelper;
}());
//# sourceMappingURL=GameBattleHelper.js.map