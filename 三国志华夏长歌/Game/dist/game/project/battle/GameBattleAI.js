var GameBattleAI = (function () {
    function GameBattleAI() {
    }
    GameBattleAI.init = function () {
    };
    GameBattleAI.start = function () {
    };
    GameBattleAI.stop = function () {
        this.lockOnceEnemy = null;
        SyncTask.taskOver(this.doActionSyncTask);
    };
    GameBattleAI.action = function (battler, onActionComplete) {
        this.currentBattler = battler;
        this.onActionComplete = onActionComplete;
        this.isInAction = false;
        this.applyEnemySkillDistanceArr.length = 0;
        this.applyFriendSkillDistanceArr.length = 0;
        GameBattleAction.showCurrentBattlerWindow(this.currentBattler);
        this.doAction();
    };
    Object.defineProperty(GameBattleAI, "currentBattlerActor", {
        get: function () {
            return this.currentBattler.battlerSetting.battleActor;
        },
        enumerable: false,
        configurable: true
    });
    GameBattleAI.doAction = function () {
        var battler = this.currentBattler;
        var currentBattlerActor = this.currentBattlerActor;
        this.referenceMoveGrids.length = 0;
        this.isInAction = false;
        this.currentEnemy = this.lockOnceEnemy ? this.lockOnceEnemy : this.getOneEnemy();
        this.lockOnceEnemy = null;
        if (!GameBattleHelper.isBattler(battler) || battler.battlerSetting.isDead) {
            this.tryActionComplete();
            return;
        }
        if (!this.currentEnemy || currentBattlerActor.aiType == 2) {
            this.cameraMoveToCurrentBattler();
            Callback.New(this.tryActionComplete, this).delayRun(WorldData.noActionWaitTime);
            return;
        }
        this.cameraMoveToCurrentBattler();
        this.tryUseSkill();
        this.tryUseBeneficialItem();
        this.tryUseBarmfulItem();
        this.tryAtk();
        this.tryMove();
        this.tryActionComplete();
    };
    GameBattleAI.cameraMoveToCurrentBattler = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            GameFunction.cameraMove(1, 0, 0, _this.currentBattler.index, true, WorldData.cameraTweenFrame);
            GameBattleHelper.cursor.setTo(_this.currentBattler.x, _this.currentBattler.y);
            setFrameout(function () {
                SyncTask.taskOver(_this.doActionSyncTask);
            }, WorldData.cameraTweenFrame);
        });
    };
    GameBattleAI.tryUseSkill = function () {
        var _this = this;
        if (this.isInAction)
            return;
        var battler = this.currentBattler;
        var actor = battler.battlerSetting.battleActor;
        if (!GameBattleHelper.canUseSkill(battler))
            return;
        var isUseSkill = false;
        for (var i = 0; i < actor.skills.length; i++) {
            var skill = actor.skills[i];
            if (!GameBattleHelper.canUseOneSkill(battler, skill, false))
                continue;
            new SyncTask(this.doActionSyncTask, function (skill) {
                if (isUseSkill) {
                    SyncTask.taskOver(_this.doActionSyncTask);
                    return;
                }
                var isHostileSkill = GameBattleHelper.isHostileSkill(skill);
                var skillTarget = _this.getSkillTarget(skill, isHostileSkill);
                if (!skillTarget) {
                    SyncTask.taskOver(_this.doActionSyncTask);
                    return;
                }
                var useSkillSuccess = _this.doUseSkill(skill, skillTarget);
                if (useSkillSuccess) {
                    isUseSkill = true;
                    SyncTask.taskOver(_this.doActionSyncTask);
                    return;
                }
                setFrameout(function () { SyncTask.taskOver(_this.doActionSyncTask); }, 0);
            }, [skill], this);
        }
    };
    GameBattleAI.tryUseBeneficialItem = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            if (!_this.isInAction) {
                var battler = _this.currentBattler;
                var actor = battler.battlerSetting.battleActor;
                for (var i = 0; i < actor.items.length; i++) {
                    var item = actor.items[i];
                    if (!item)
                        continue;
                    if (item.harmful)
                        continue;
                    if (!GameBattleHelper.canUseOneItem(battler, item))
                        continue;
                    for (var s = 0; s < item.addStatus.length; s++) {
                        var addStatus = item.addStatus[s];
                        if (GameBattleHelper.canSuperpositionLayer(battler, addStatus)) {
                            _this.doUseItem(item);
                            return;
                        }
                    }
                    for (var s = 0; s < item.removeStatus.length; s++) {
                        var removeStatus = item.removeStatus[s];
                        if (GameBattleHelper.isIncludeStatus(battler, removeStatus)) {
                            _this.doUseItem(item);
                            return;
                        }
                    }
                    if ((item.recoveryHP > 0 && (actor.MaxHP - actor.hp >= item.recoveryHP || actor.hp / actor.MaxHP < 0.5)) ||
                        (item.recoverySP > 0 && (actor.MaxSP - actor.sp >= item.recoverySP || actor.sp / actor.MaxSP < 0.5))) {
                        _this.doUseItem(item);
                        return;
                    }
                }
            }
            SyncTask.taskOver(_this.doActionSyncTask);
        });
    };
    GameBattleAI.tryUseBarmfulItem = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            if (!_this.isInAction && GameBattleHelper.conUseItem(_this.currentBattler) && _this.currentEnemy) {
                var actor = _this.currentBattler.battlerSetting.battleActor;
                var atkTarget = _this.getAtkTarget();
                if (atkTarget) {
                    if (atkTarget.battlerSetting.isDead) {
                        atkTarget = _this.getAtkTarget();
                    }
                }
                var useItem = null;
                for (var i = 0; i < actor.items.length; i++) {
                    var item = actor.items[i];
                    if (!item)
                        continue;
                    if (!item.harmful)
                        continue;
                    if (!GameBattleHelper.canUseOneItem(_this.currentBattler, item))
                        continue;
                    var continueThisItem = false;
                    for (var s_1 = 0; s_1 < item.addStatus.length; s_1++) {
                        var addStatus = item.addStatus[s_1];
                        if (!GameBattleHelper.canSuperpositionLayer(atkTarget, addStatus)) {
                            continueThisItem = true;
                            break;
                        }
                    }
                    if (continueThisItem)
                        continue;
                    var targetOwnStatusCount = item.removeStatus.length;
                    for (var s = 0; s < item.removeStatus.length; s++) {
                        var removeStatus = item.removeStatus[s];
                        if (!GameBattleHelper.isIncludeStatus(atkTarget, removeStatus)) {
                            targetOwnStatusCount--;
                        }
                    }
                    if (targetOwnStatusCount == 0 && item.removeStatus.length != 0)
                        continue;
                    useItem = item;
                }
                if (useItem && atkTarget) {
                    var currentBattlerPosGrid = _this.currentBattler.posGrid;
                    var effectRangeGridArr = GameBattleHelper.getEffectRange(currentBattlerPosGrid, 1, 1);
                    for (var i = 0; i < effectRangeGridArr.length; i++) {
                        var effectRangeGrid = effectRangeGridArr[i];
                        var targetBattler = GameBattleHelper.getNoDeadBattlerByGrid(effectRangeGrid);
                        if (atkTarget == targetBattler) {
                            _this.doUseBarmfulItem(useItem);
                            return;
                        }
                    }
                    var moveMapGrids = GameBattleHelper.getEffectRange(currentBattlerPosGrid, _this.currentBattler.battlerSetting.battleActor.MoveGrid);
                    var min = Number.MAX_VALUE;
                    var moveToGrid = null;
                    for (var s_2 = 0; s_2 < moveMapGrids.length; s_2++) {
                        var moveMapGrid = moveMapGrids[s_2];
                        var distanceTargetEnemy = Math.abs(moveMapGrid.x - atkTarget.posGrid.x) + Math.abs(moveMapGrid.y - atkTarget.posGrid.y);
                        if (distanceTargetEnemy < min) {
                            min = distanceTargetEnemy;
                            moveToGrid = moveMapGrid;
                        }
                    }
                    if (moveToGrid && moveToGrid.x != _this.currentBattler.posGrid.x && moveToGrid.y != _this.currentBattler.posGrid.y) {
                        _this.referenceMoveGrids.push(moveToGrid);
                    }
                }
            }
            SyncTask.taskOver(_this.doActionSyncTask);
        });
    };
    GameBattleAI.tryAtk = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            if (!_this.isInAction && GameBattleHelper.canAttack(_this.currentBattler) && _this.currentEnemy) {
                var actor = _this.currentBattler.battlerSetting.battleActor;
                if (actor.atkMode == 1 && actor.atkSkill) {
                    var isHostileSkill = GameBattleHelper.isHostileSkill(actor.atkSkill);
                    var skillTarget = _this.getSkillTarget(actor.atkSkill, isHostileSkill);
                    var atkSuccess = _this.doUseSkill(actor.atkSkill, skillTarget);
                    if (!atkSuccess) {
                        SyncTask.taskOver(_this.doActionSyncTask);
                        return;
                    }
                }
                else if (actor.atkMode == 0) {
                    var atkTarget = _this.getAtkTarget();
                    if (atkTarget) {
                        if (atkTarget.battlerSetting.isDead) {
                            atkTarget = _this.getAtkTarget();
                        }
                        var currentBattlerPosGrid = _this.currentBattler.posGrid;
                        var effectRangeGridArr = GameBattleHelper.getEffectRange(currentBattlerPosGrid, 1, 1);
                        for (var i = 0; i < effectRangeGridArr.length; i++) {
                            var effectRangeGrid = effectRangeGridArr[i];
                            var targetBattler = GameBattleHelper.getNoDeadBattlerByGrid(effectRangeGrid);
                            if (atkTarget == targetBattler) {
                                _this.doAtk();
                                return;
                            }
                        }
                        var moveMapGrids = GameBattleHelper.getEffectRange(currentBattlerPosGrid, _this.currentBattler.battlerSetting.battleActor.MoveGrid);
                        var min = Number.MAX_VALUE;
                        var moveToGrid;
                        for (var s = 0; s < moveMapGrids.length; s++) {
                            var moveMapGrid = moveMapGrids[s];
                            var distanceTargetEnemy = Math.abs(moveMapGrid.x - atkTarget.posGrid.x) + Math.abs(moveMapGrid.y - atkTarget.posGrid.y);
                            if (distanceTargetEnemy < min) {
                                min = distanceTargetEnemy;
                                moveToGrid = moveMapGrid;
                            }
                        }
                        if (moveToGrid && moveToGrid.x != _this.currentBattler.posGrid.x && moveToGrid.y != _this.currentBattler.posGrid.y) {
                            _this.referenceMoveGrids.push(moveToGrid);
                        }
                    }
                }
            }
            SyncTask.taskOver(_this.doActionSyncTask);
        });
    };
    GameBattleAI.tryMove = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            if (!_this.isInAction && GameBattleHelper.canMove(_this.currentBattler)) {
                if (_this.currentBattlerActor.atkMode == 1 && _this.currentBattlerActor.atkSkill) {
                    _this.getSkillCastPlace(_this.currentBattlerActor.atkSkill, _this.currentEnemy);
                }
                for (var i = 0; i < _this.referenceMoveGrids.length; i++) {
                    var moveToGrid = _this.referenceMoveGrids[i];
                    if (moveToGrid.x == _this.currentBattler.posGrid.x && moveToGrid.y == _this.currentBattler.posGrid.y) {
                        _this.referenceMoveGrids.splice(i, 1);
                        continue;
                    }
                }
                if (_this.referenceMoveGrids.length > 0) {
                    var moveToGrid = _this.referenceMoveGrids[0];
                    GameBattleAction.openMoveIndicator(_this.currentBattler);
                    _this.isInAction = true;
                    setTimeout(function () {
                        var gridArr = GameBattleAction.battlerEffectIndicatorGridArr;
                        if (ArrayUtils.matchAttributes(gridArr, { x: moveToGrid.x, y: moveToGrid.y }, true)[0]) {
                            var moveToPoint = GameUtils.getGridCenterByGrid(moveToGrid);
                            GameBattleHelper.cursor.setTo(moveToPoint.x, moveToPoint.y);
                            setTimeout(function () {
                                GameBattleAction.startMove(_this.currentBattler, moveToGrid.x, moveToGrid.y, Callback.New(function () {
                                    SyncTask.taskOver(_this.doActionSyncTask);
                                    _this.doAction();
                                }, _this));
                            }, WorldData.actionReflectionTime);
                        }
                        else {
                            SyncTask.taskOver(_this.doActionSyncTask);
                        }
                    }, WorldData.actionReflectionTime);
                    return;
                }
                else if (_this.currentEnemy) {
                    var moveMapGrids = GameBattleHelper.getEffectRange(_this.currentBattler.posGrid, _this.currentBattler.battlerSetting.battleActor.MoveGrid);
                    if (_this.currentBattlerActor.moveType == 0) {
                        var minDis = 0;
                    }
                    else {
                        var minDis = _this.currentBattlerActor.atkMode == 0 ? 0 : GameBattleAI.getSkillMaxEffectDistance(_this.currentBattlerActor.atkSkill);
                    }
                    var nearestGrid = GameBattleHelper.getNearestToTheTarget(moveMapGrids, _this.currentEnemy.posGrid, minDis);
                    if (nearestGrid && GameBattleHelper.getGridDistance(nearestGrid, _this.currentEnemy.posGrid) < GameBattleHelper.getBattlerDistance(_this.currentBattler, _this.currentEnemy)) {
                        GameBattleAction.openMoveIndicator(_this.currentBattler);
                        _this.isInAction = true;
                        var moveToPoint = GameUtils.getGridCenterByGrid(nearestGrid);
                        GameBattleHelper.cursor.setTo(moveToPoint.x, moveToPoint.y);
                        setTimeout(function () {
                            GameBattleAction.startMove(_this.currentBattler, nearestGrid.x, nearestGrid.y, Callback.New(function () {
                                SyncTask.taskOver(_this.doActionSyncTask);
                                _this.doAction();
                            }, _this));
                        }, WorldData.actionReflectionTime);
                        return;
                    }
                }
            }
            SyncTask.taskOver(_this.doActionSyncTask);
        });
    };
    GameBattleAI.tryActionComplete = function () {
        var _this = this;
        new SyncTask(this.doActionSyncTask, function () {
            SyncTask.taskOver(_this.doActionSyncTask);
            if (!_this.isInAction) {
                GameBattleAction.closeCurrentBattlerWindow();
                GameBattlerHandler.setBattlerStandby(_this.currentBattler);
                _this.onActionComplete.run();
            }
        });
    };
    GameBattleAI.doUseSkill = function (skill, skillTarget) {
        var _this = this;
        if (!skill || !skillTarget)
            return false;
        var skillCastPlace = this.getSkillCastPlace(skill, skillTarget);
        if (skillCastPlace) {
            this.isInAction = true;
            EventUtils.addEventListenerFunction(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, function () {
                SyncTask.taskOver(_this.doActionSyncTask);
                _this.isInAction = false;
                _this.doAction();
            }, this, null, true);
            if (skill.targetType == 3 || skill.targetType == 4) {
                GameBattleAction.useSkill(this.currentBattler, skill, skillCastPlace.castPoint, skillCastPlace.targets);
                return true;
            }
            GameBattleAction.openSkillIndicator(this.currentBattler, skill);
            GameBattleAction.cursorMoveToGridPoint(skillCastPlace.castPoint, function () {
                setTimeout(function () {
                    GameBattleAction.useSkill(_this.currentBattler, skill, skillCastPlace.castPoint, skillCastPlace.targets);
                }, WorldData.actionReflectionTime);
            });
            return true;
        }
        return false;
    };
    GameBattleAI.doUseItem = function (item) {
        var _this = this;
        this.isInAction = true;
        GameBattleAction.openItemIndicator(this.currentBattler);
        setTimeout(function () {
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(function () {
                SyncTask.taskOver(_this.doActionSyncTask);
                _this.isInAction = false;
                _this.doAction();
            }, _this), true);
            GameBattleAction.useItem(_this.currentBattler, _this.currentBattler, item);
        }, WorldData.actionReflectionTime);
    };
    GameBattleAI.doAtk = function () {
        var _this = this;
        this.isInAction = true;
        GameBattleAction.openAtkIndicator(this.currentBattler);
        setTimeout(function () {
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(function () {
                SyncTask.taskOver(_this.doActionSyncTask);
                _this.isInAction = false;
                _this.doAction();
            }, _this), true);
            GameBattleAction.attack(_this.currentBattler, _this.currentEnemy);
        }, WorldData.actionReflectionTime);
    };
    GameBattleAI.doUseBarmfulItem = function (item) {
        var _this = this;
        this.isInAction = true;
        GameBattleAction.openItemIndicator(this.currentBattler);
        setTimeout(function () {
            EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, Callback.New(function () {
                SyncTask.taskOver(_this.doActionSyncTask);
                _this.isInAction = false;
                _this.doAction();
            }, _this), true);
            GameBattleAction.useItem(_this.currentBattler, _this.currentEnemy, item);
        }, WorldData.actionReflectionTime);
    };
    GameBattleAI.getOneEnemy = function (ignoreEnemys) {
        if (ignoreEnemys === void 0) { ignoreEnemys = []; }
        var actor = this.currentBattler.battlerSetting.battleActor;
        var hateList = this.currentBattler.battlerSetting.hateList;
        if (actor.aiType == 2)
            return;
        var isGetNearEmeny = false;
        if (actor.aiType == 0) {
            if (actor.aiGetTargetMode == 1 || hateList.length == 0) {
                isGetNearEmeny = true;
            }
        }
        else if (actor.aiType == 1) {
            if (hateList.length == 0)
                return;
        }
        else if (actor.aiType == 2) {
            return;
        }
        if (isGetNearEmeny) {
            var myGrid = this.currentBattler.posGrid;
            var enemyList = this.currentBattler.battlerSetting.battleCamp == 1 ? GameBattle.playerBattlers : GameBattle.enemyBattlers;
            var minDistance = Number.MAX_VALUE;
            var minDistanceEnemy = null;
            for (var i = 0; i < enemyList.length; i++) {
                var enemy = enemyList[i];
                if (enemy.battlerSetting.isDead)
                    continue;
                if (ignoreEnemys.indexOf(enemy) != -1)
                    continue;
                var enemyGrid = enemy.posGrid;
                var distance = Math.abs(enemyGrid.x - myGrid.x) + Math.abs(enemyGrid.y - myGrid.y);
                if (actor.aiVigilance && distance > actor.aiVigilanceRange)
                    continue;
                if (distance < minDistance) {
                    if (actor.aiVigilance && actor.aiVigilanceRange < distance)
                        continue;
                    minDistance = distance;
                    minDistanceEnemy = enemy;
                }
            }
            return minDistanceEnemy;
        }
        else if (actor.aiGetTargetMode == 0 || actor.aiType == 1) {
            for (var i = 0; i < hateList.length; i++) {
                var targetIndex = hateList[i].targetIndex;
                var targetSo = Game.currentScene.sceneObjects[targetIndex];
                if (ignoreEnemys.indexOf(targetSo) != -1)
                    continue;
                return targetSo;
            }
        }
        return null;
    };
    GameBattleAI.getSkillTarget = function (skill, isHostileSkill) {
        var realTarget;
        var currentBattlerActor = this.currentBattlerActor;
        var targetArr = [];
        if (isHostileSkill) {
            targetArr = this.currentBattler.battlerSetting.battleCamp == 0 ? GameBattle.enemyBattlers.concat() : GameBattle.playerBattlers.concat();
            ArrayUtils.remove(targetArr, this.currentEnemy);
            targetArr.unshift(this.currentEnemy);
        }
        else if (skill.targetType == 0) {
            targetArr = [this.currentBattler];
        }
        else {
            targetArr = this.currentBattler.battlerSetting.battleCamp == 1 ? GameBattle.enemyBattlers.concat() : GameBattle.playerBattlers.concat();
        }
        for (var i = 0; i < targetArr.length; i++) {
            var target = targetArr[i];
            if (target.battlerSetting.isDead) {
                targetArr.splice(i, 1);
                i--;
                continue;
            }
        }
        if (targetArr.length == 0)
            return;
        for (var s = 0; s < skill.addStatus.length; s++) {
            var st = skill.addStatus[s];
            for (var i = 0; i < targetArr.length; i++) {
                realTarget = targetArr[i];
                if (GameBattleHelper.canSuperpositionLayer(realTarget, st)) {
                    return realTarget;
                }
            }
        }
        if (skill.addStatus.length > 0) {
            return null;
        }
        for (var s = 0; s < skill.removeStatus.length; s++) {
            var st = skill.removeStatus[s];
            for (var i = 0; i < targetArr.length; i++) {
                realTarget = targetArr[i];
                if (GameBattleHelper.isIncludeStatus(realTarget, st)) {
                    return realTarget;
                }
            }
        }
        if (skill.removeStatus.length > 0) {
            return null;
        }
        if (!isHostileSkill && skill.useDamage) {
            var skillDamage = skill.damageValue;
            if (skill.useAddition) {
                var actorAttributeValue = skill.additionMultipleType == 0 ? currentBattlerActor.ATK : currentBattlerActor.MAG;
                var addDamageValue = skill.additionMultiple / 100 * actorAttributeValue;
                skillDamage += addDamageValue;
            }
            if (skill.damageType == 3) {
                for (var i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    var targetActor = realTarget.battlerSetting.battleActor;
                    if (targetActor.MaxHP - targetActor.hp >= skillDamage || targetActor.hp / targetActor.MaxHP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
            else if (skill.damageType == 4) {
                for (var i = 0; i < targetArr.length; i++) {
                    realTarget = targetArr[i];
                    var targetActor = realTarget.battlerSetting.battleActor;
                    if (targetActor.MaxSP - targetActor.sp >= skillDamage || targetActor.sp / targetActor.MaxSP < 0.5) {
                        return realTarget;
                    }
                }
                return null;
            }
            else {
                return targetArr[0];
            }
        }
        if (isHostileSkill) {
            return this.currentEnemy;
        }
        else {
            return this.currentBattler;
        }
    };
    GameBattleAI.getAtkTarget = function () {
        if (this.currentEnemy && GameBattleHelper.getBattlerDistance(this.currentBattler, this.currentEnemy) == 1) {
            return this.currentEnemy;
        }
        var ignoreEnemys = [];
        var firstCurrentEnemy = this.currentEnemy;
        while (this.currentEnemy) {
            var grids = GameBattleHelper.getEffectRange(this.currentEnemy.posGrid, 1);
            if (grids.length == 0) {
                ignoreEnemys.push(this.currentEnemy);
                this.currentEnemy = this.getOneEnemy(ignoreEnemys);
            }
            else {
                break;
            }
        }
        if (!this.currentEnemy) {
            this.currentEnemy = firstCurrentEnemy;
        }
        return this.currentEnemy;
    };
    GameBattleAI.getSkillCastPlace = function (skill, target, skillFirstGrid) {
        if (skillFirstGrid === void 0) { skillFirstGrid = null; }
        if (skill.targetType == 3 || skill.targetType == 4) {
            return { castPoint: this.currentBattler.posGrid, targets: null };
        }
        var releaseBattler = this.currentBattler;
        var effectRangeGridArr = GameBattleHelper.getSkillEffectRangeGrid(skillFirstGrid ? skillFirstGrid : releaseBattler.posGrid, skill);
        var relaseIndicatorGridArr = GameBattleHelper.getSkillReleaseRangeGrid(skill);
        var targetPosGrid = target.posGrid;
        var currentPositionCastArr = [];
        if ((skill.targetType == 5 || skill.targetType == 6) && skill.mustOpenSpace) {
            if (effectRangeGridArr.length > 0) {
                var toGrid = null;
                if (GameBattleHelper.isFriendlyRelationship(this.currentBattler, target)) {
                    toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid);
                }
                else {
                    if (this.currentBattlerActor.moveType == 0) {
                        toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid);
                    }
                    else {
                        var minDis = this.currentBattlerActor.atkMode == 0 ? 0 : GameBattleAI.getSkillMaxEffectDistance(this.currentBattlerActor.atkSkill);
                        toGrid = GameBattleHelper.getNearestToTheTarget(effectRangeGridArr, target.posGrid, minDis);
                    }
                }
                if (toGrid)
                    return { castPoint: toGrid, targets: null };
                else
                    return null;
            }
            else {
                return;
            }
        }
        for (var i = 0; i < relaseIndicatorGridArr.length; i++) {
            var localGrid = relaseIndicatorGridArr[i];
            var needReleaseMapGrid = new Point(targetPosGrid.x - localGrid.x, targetPosGrid.y - localGrid.y);
            var inEffectRangeGrid = ArrayUtils.matchAttributes(effectRangeGridArr, { x: needReleaseMapGrid.x, y: needReleaseMapGrid.y }, true)[0];
            if (inEffectRangeGrid) {
                var targets = [];
                for (var s = 0; s < relaseIndicatorGridArr.length; s++) {
                    var localGrid2 = relaseIndicatorGridArr[s];
                    var releaseRangeGrid = new Point(needReleaseMapGrid.x + localGrid2.x, needReleaseMapGrid.y + localGrid2.y);
                    var releaseRangeGridBattler = GameBattleHelper.getNoDeadBattlerByGrid(releaseRangeGrid);
                    if (releaseRangeGridBattler == target || GameBattleHelper.isFriendlyRelationship(releaseRangeGridBattler, target)) {
                        targets.push(releaseRangeGridBattler);
                    }
                }
                currentPositionCastArr.push({ castPoint: inEffectRangeGrid, targets: targets });
            }
        }
        var currentPositionBestCastPoint = getBestCastPoint(currentPositionCastArr);
        if (!skillFirstGrid && GameBattleHelper.canMove(this.currentBattler)) {
            var moveMapGrids = GameBattleHelper.getEffectRange(this.currentBattler.posGrid, this.currentBattler.battlerSetting.battleActor.MoveGrid);
            var preResArr = [];
            for (var s = 0; s < moveMapGrids.length; s++) {
                var moveMapGrid = moveMapGrids[s];
                var preRes = this.getSkillCastPlace(skill, target, moveMapGrid);
                if (preRes && preRes.moveMapGrid && preRes.moveMapGrid.x == releaseBattler.posGrid.x && preRes.moveMapGrid.y == releaseBattler.posGrid.y) {
                    preRes.moveMapGrid = moveMapGrid;
                    preResArr.push(preRes);
                }
            }
            if (preResArr.length > 0) {
                var needMoveBestCastPoint = getBestCastPoint(preResArr);
                this.referenceMoveGrids.push(needMoveBestCastPoint.moveMapGrid);
                if (GameBattleHelper.isHostileRelationship(this.currentBattler, target)) {
                    this.lockOnceEnemy = target;
                }
                if (currentPositionBestCastPoint && currentPositionBestCastPoint.targets.length < needMoveBestCastPoint.targets.length) {
                    currentPositionBestCastPoint = null;
                }
            }
        }
        function getBestCastPoint(castPointArr) {
            var len = castPointArr.length;
            var maxTargetLength = 0;
            var castPointInfo = null;
            for (var i = 0; i < len; i++) {
                var targetLength = castPointArr[i].targets.length;
                if (maxTargetLength < targetLength) {
                    maxTargetLength = targetLength;
                    castPointInfo = castPointArr[i];
                }
            }
            return castPointInfo;
        }
        return currentPositionBestCastPoint;
    };
    GameBattleAI.getSkillMaxEffectDistance = function (skill) {
        if (skill.targetType == 0)
            return 0;
        if (skill.targetType == 3 || skill.targetType == 4)
            return 5;
        if (skill.effectRangeType == 0)
            return skill.effectRange1;
        if (skill.effectRangeType == 1)
            return skill.effectRange2B;
        return 0;
    };
    GameBattleAI.applyEnemySkillDistanceArr = [];
    GameBattleAI.applyFriendSkillDistanceArr = [];
    GameBattleAI.referenceMoveGrids = [];
    GameBattleAI.doActionSyncTask = "GameBattleAI_doActionSyncTask";
    return GameBattleAI;
}());
//# sourceMappingURL=GameBattleAI.js.map