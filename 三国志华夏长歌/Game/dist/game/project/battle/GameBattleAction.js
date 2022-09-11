var GameBattleAction = (function () {
    function GameBattleAction() {
    }
    GameBattleAction.init = function () {
    };
    GameBattleAction.start = function () {
    };
    GameBattleAction.stop = function () {
        EventUtils.clear(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE);
    };
    GameBattleAction.cameraMoveToBattler = function (battler) {
        var cursor = GameBattleHelper.cursor;
        var cameraPos = Game.currentScene.camera.sceneObject ? new Point(Game.currentScene.camera.sceneObject.x, Game.currentScene.camera.sceneObject.y) : new Point(Game.currentScene.camera.viewPort.x, Game.currentScene.camera.viewPort.y);
        var useTweenTime = cameraPos.x != battler.x || cameraPos.y != battler.y;
        var cameraLockChange = Game.currentScene.camera.sceneObject != cursor;
        if (useTweenTime) {
            Game.currentScene.camera.sceneObject = null;
            cursor.setTo(battler.x, battler.y);
        }
        if (useTweenTime || cameraLockChange)
            GameFunction.cameraMove(1, 0, 0, cursor.index, true, useTweenTime ? WorldData.cameraTweenFrame : 1);
        return { useTweenTime: useTweenTime, cameraLockChange: cameraLockChange };
    };
    GameBattleAction.cursorMoveTo = function (x, y, onFin) {
        var pos = GameBattleHelper.cursor.pos;
        if (x == pos.x && y == pos.y) {
            onFin.apply(this);
        }
        else {
            var realLineArr = AstarUtils.moveTo(pos.x, pos.y, x, y, Game.currentScene.gridWidth, Game.currentScene.gridHeight, Game.currentScene, true, true, true);
            GameBattleHelper.cursor.once(ProjectClientSceneObject.MOVE_OVER, this, onFin);
            GameBattleHelper.cursor.startMove(realLineArr, 0);
        }
    };
    GameBattleAction.cursorMoveToGridPoint = function (grid, onFin) {
        var castPoint = GameUtils.getGridCenterByGrid(grid);
        this.cursorMoveTo(castPoint.x, castPoint.y, onFin);
    };
    GameBattleAction.cursorJumpToGridPoint = function (grid) {
        var realPoint = GameUtils.getGridCenterByGrid(grid);
        Game.currentScene.sceneUtils.limitInside(realPoint, true);
        var cursor = GameBattleHelper.cursor;
        cursor.setTo(realPoint.x, realPoint.y);
    };
    GameBattleAction.showCurrentBattlerWindow = function (battler) {
        GameCommand.startCommonCommand(15027, [], null, battler, battler);
    };
    GameBattleAction.showTargetBattlerWindow = function (battler) {
        GameCommand.startCommonCommand(15030, [], null, battler, battler);
    };
    GameBattleAction.closeCurrentBattlerWindow = function () {
        GameCommand.startCommonCommand(15028, [], null, GameBattleHelper.cursor, GameBattleHelper.cursor);
    };
    GameBattleAction.closeTargetBattlerWindow = function () {
        GameCommand.startCommonCommand(15031, [], null, GameBattleHelper.cursor, GameBattleHelper.cursor);
    };
    GameBattleAction.startMove = function (battler, toGridX, toGridY, onComplete, cameraLockBattler) {
        var _this = this;
        if (onComplete === void 0) { onComplete = null; }
        if (cameraLockBattler === void 0) { cameraLockBattler = true; }
        if (GameBattle.fastPlayMode && battler.battlerSetting.battleCamp == 1) {
            battler["__recordMoveSpeed"] = battler.moveSpeed;
            battler.moveSpeed = 800;
        }
        this.fromBattler = battler;
        GameBattleAction.closeMoveIndicator();
        if (cameraLockBattler)
            GameFunction.cameraMove(1, 0, 0, battler.index, true, WorldData.cameraTweenFrame);
        else
            Game.currentScene.camera.sceneObject = null;
        setFrameout(function () {
            var range = battler.battlerSetting.battleActor.MoveGrid;
            var battlerThroughGridMap = GameBattleHelper.getDestinationThroughGridMap(battler.posGrid, range);
            var firstGrid = battler.posGrid;
            toGridX = toGridX - firstGrid.x + range;
            toGridY = toGridY - firstGrid.y + range;
            var realLineArr = AstarUtils.routeGrid(range, range, toGridX, toGridY, range, battlerThroughGridMap.throughGridMap, new Point(firstGrid.x - range, firstGrid.y - range), true, true, true);
            battler.startMove(realLineArr, 0, true, Callback.New(function () {
                if (battler["__recordMoveSpeed"]) {
                    battler.moveSpeed = battler["__recordMoveSpeed"];
                    battler["__recordMoveSpeed"] = null;
                }
                onComplete.run();
            }, _this));
            battler.battlerSetting.moved = true;
        }, Math.floor(WorldData.cameraTweenFrame * 0.5));
    };
    GameBattleAction.attack = function (fromBattler, targetBattler) {
        var _this = this;
        this.currentActionType = 0;
        this.fromBattler = fromBattler;
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        GameBattleAction.closeBattleIndicator();
        fromBattler.battlerSetting.actioned = true;
        this.showTargetBattleBriefWindow = true;
        this.showCurrentBattlerWindow(fromBattler);
        this.showTargetBattlerWindow(targetBattler);
        targetBattler.battlerSetting.hitBy = false;
        var doAttack = function () {
            GameBattle.battlerfieldDetermineHandle(function () {
                if (targetBattler.battlerSetting.hitBy || targetBattler.battlerSetting.isDead) {
                    _this.actionComplete(true, true);
                    return;
                }
                GameBattlerHandler.releaseAction(fromBattler, 3, fromBattler.battlerSetting.battleActor.hitFrame, 1, function () {
                    _this.hitTarget(fromBattler, targetBattler, 0);
                });
            });
        };
        GameCommand.startCommonCommand(14035, [], Callback.New(doAttack, this), fromBattler, targetBattler);
    };
    GameBattleAction.useSkill = function (fromBattler, skill, gridPos, targets, firstUse) {
        var _this = this;
        if (targets === void 0) { targets = null; }
        if (firstUse === void 0) { firstUse = true; }
        this.currentActionType = 1;
        this.fromBattler = fromBattler;
        this.fromBattlerSkill = skill;
        this.fromBattlerSkillGridPos = gridPos;
        if (!targets) {
            var targetRes = GameBattleHelper.getSkillTargetOnGrid(fromBattler, skill, gridPos);
            if (!targetRes || !targetRes.allow) {
                this.actionComplete(true, true);
                return;
            }
            targets = targetRes.targets;
        }
        this.showCurrentBattlerWindow(fromBattler);
        var onlyOneTarget = null;
        if (targets.length == 1) {
            onlyOneTarget = targets[0];
            this.showTargetBattleBriefWindow = true;
            this.showTargetBattlerWindow(onlyOneTarget);
            onlyOneTarget.battlerSetting.hitBy = false;
        }
        else {
            this.showTargetBattleBriefWindow = false;
        }
        if (firstUse) {
            GameBattleAction.closeBattleIndicator();
            fromBattler.battlerSetting.battleActor.sp -= skill.costSP;
            skill.currentCD = skill.totalCD;
            if (skill.costActionPower)
                fromBattler.battlerSetting.actioned = true;
        }
        var doUseSkill = function () {
            GameBattle.battlerfieldDetermineHandle(function () {
                if (onlyOneTarget && (onlyOneTarget.battlerSetting.hitBy || onlyOneTarget.battlerSetting.isDead)) {
                    _this.actionComplete(true, true);
                    return;
                }
                GameBattlerHandler.releaseAction(fromBattler, skill.releaseActionID, skill.releaseFrame, 1, function () {
                    _this.releaseSkill(fromBattler, skill, gridPos, targets, firstUse);
                });
                if (skill.releaseAnimation) {
                    fromBattler.playAnimation(skill.releaseAnimation, false, true);
                }
            });
        };
        if (firstUse) {
            var doCallSkillEvent = function () {
                GameBattle.battlerfieldDetermineHandle(function () {
                    if (onlyOneTarget && (onlyOneTarget.battlerSetting.hitBy || onlyOneTarget.battlerSetting.isDead)) {
                        _this.actionComplete(true, true);
                        return;
                    }
                    if (skill.releaseEvent)
                        CommandPage.startTriggerFragmentEvent(skill.releaseEvent, fromBattler, onlyOneTarget ? onlyOneTarget : fromBattler, Callback.New(doUseSkill, _this));
                    else
                        doUseSkill.apply(_this);
                });
            };
            GameCommand.startCommonCommand(14036, [], Callback.New(doCallSkillEvent, this), fromBattler, onlyOneTarget ? onlyOneTarget : fromBattler);
        }
        else {
            doUseSkill.apply(this);
        }
    };
    GameBattleAction.useItem = function (fromBattler, toBattler, item) {
        var _this = this;
        this.currentActionType = 3;
        this.fromBattler = fromBattler;
        this.fromBattlerItem = item;
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        fromBattler.battlerSetting.hitBy = false;
        this.showTargetBattleBriefWindow = true;
        this.showCurrentBattlerWindow(fromBattler);
        this.showTargetBattlerWindow(toBattler);
        GameBattleAction.closeBattleIndicator();
        if (item.isConsumables) {
            var itemIndex = fromBattler.battlerSetting.battleActor.items.indexOf(item);
            Game.unActorItemByItemIndex(fromBattler.battlerSetting.battleActor, itemIndex);
        }
        if (item.costActionPower)
            fromBattler.battlerSetting.actioned = true;
        var doUseItem = function () {
            GameBattle.battlerfieldDetermineHandle(function () {
                if ((fromBattler.battlerSetting.hitBy || fromBattler.battlerSetting.isDead)) {
                    _this.actionComplete(true, true);
                    return;
                }
                var hasUseItemAction = fromBattler.avatar.hasActionID(WorldData.useItemActID);
                if (hasUseItemAction) {
                    fromBattler.avatar.once(Avatar.ACTION_PLAY_COMPLETED, _this, function () {
                        if (!fromBattler.battlerSetting.isDead && fromBattler.battlerSetting.battleActor.hp != 0)
                            fromBattler.avatar.actionID = 1;
                    });
                    fromBattler.avatar.currentFrame = 1;
                    fromBattler.avatar.actionID = WorldData.useItemActID;
                }
                _this.hitTarget(fromBattler, toBattler, 2, null, item);
            });
        };
        GameCommand.startCommonCommand(14037, [], Callback.New(doUseItem, this), fromBattler, toBattler);
    };
    GameBattleAction.isNeedCalcBattlersStatus = function () {
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            if (battler.battlerSetting.isDead)
                continue;
            var battlerActor = battler.battlerSetting.battleActor;
            for (var s = 0; s < battlerActor.status.length; s++) {
                var status = battlerActor.status[s];
                if (!status.overtime)
                    continue;
                return true;
            }
        }
        return false;
    };
    GameBattleAction.calcBattlersStatus = function (onFin) {
        var _this = this;
        var taskName = "playStatusAnimation";
        SyncTask.clear(taskName);
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            if (battler.battlerSetting.isDead)
                continue;
            var battlerActor = battler.battlerSetting.battleActor;
            for (var s = 0; s < battlerActor.status.length; s++) {
                var status = battlerActor.status[s];
                if (!status.overtime)
                    continue;
                new SyncTask(taskName, function (battler, status) {
                    _this.hitByStatus(battler, status, Callback.New(function () {
                        SyncTask.taskOver(taskName);
                    }, _this));
                }, [battler, status]);
            }
        }
        new SyncTask(taskName, function () {
            GameBattlerHandler.calcHitReward(_this.fromBattler, Callback.New(function () {
                onFin.run();
                SyncTask.taskOver(taskName);
            }, _this));
        });
    };
    GameBattleAction.releaseSkill = function (fromBattler, skill, gridPos, targets, firstUse) {
        this.currentHitTarget = 0;
        this.totalHitTarget = targets.length;
        if (firstUse) {
            this.currentHitTimes = 0;
            this.totalHitTimes = skill.releaseTimes;
        }
        var isHitGround = skill.targetType >= 5 && skill.targetType <= 6;
        if (skill.skillType == 0) {
            if (isHitGround) {
                this.hitGround(fromBattler, skill, gridPos, targets);
            }
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.hitTarget(fromBattler, targets[i], 1, skill);
                }
            }
        }
        else if (skill.skillType == 1) {
            if (isHitGround) {
                this.releaseBullet(fromBattler, skill, gridPos, null, targets);
            }
            else {
                for (var i = 0; i < targets.length; i++) {
                    this.releaseBullet(fromBattler, skill, gridPos, targets[i], targets);
                }
            }
        }
    };
    GameBattleAction.releaseBullet = function (fromBattler, skill, gridPos, targetBattler, targets) {
        var _this = this;
        if (targetBattler === void 0) { targetBattler = null; }
        var isHitGround = skill.targetType >= 5 && skill.targetType <= 6;
        var bullet = new GCAnimation();
        bullet.id = skill.bulletAnimation;
        bullet.loop = true;
        bullet.play();
        Game.currentScene.animationHighLayer.addChild(bullet);
        var startPoint = new Point(fromBattler.pos.x, fromBattler.pos.y);
        var destinationPoint = targetBattler ? targetBattler.pos : new Point(gridPos.x * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5, gridPos.y * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5);
        var angle = MathUtils.direction360(destinationPoint.x, destinationPoint.y, startPoint.x, startPoint.y);
        var dx = Math.sin(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2;
        var dy = Math.cos(angle / 180 * Math.PI) * Config.SCENE_GRID_SIZE / 2 - Config.SCENE_GRID_SIZE / 2;
        startPoint.x += -dx;
        startPoint.y += dy;
        var dis = Point.distance(startPoint, destinationPoint);
        var totalFrame = Math.max(Math.ceil(dis / skill.bulletSpeed * 60), 1);
        var currentFrame = 1;
        bullet.x = startPoint.x;
        bullet.y = startPoint.y;
        var rotation = MathUtils.direction360(startPoint.x, startPoint.y, destinationPoint.x, destinationPoint.y);
        bullet.rotation = rotation;
        os.add_ENTERFRAME(function () {
            var per = currentFrame / totalFrame;
            bullet.x = (destinationPoint.x - startPoint.x) * per + startPoint.x;
            bullet.y = (destinationPoint.y - startPoint.y) * per + startPoint.y;
            currentFrame++;
            if (currentFrame > totalFrame) {
                os.remove_ENTERFRAME(arguments.callee, _this);
                bullet.dispose();
                if (isHitGround || !targetBattler)
                    _this.hitGround(fromBattler, skill, gridPos, targets);
                else
                    _this.hitTarget(fromBattler, targetBattler, 1, skill);
            }
        }, this);
    };
    GameBattleAction.hitGround = function (fromBattler, skill, gridPos, targets) {
        var _this = this;
        var afterHitOpenSpace = function () {
            if (targets.length > 0) {
                for (var i = 0; i < targets.length; i++) {
                    _this.hitTarget(fromBattler, targets[i], 1, skill);
                }
            }
            else {
                _this.actionComplete(true);
            }
        };
        var doHitOpenSpace = function () {
            GameBattle.battlerfieldDetermineHandle(function () {
                var hitAniID = skill.targetGridAnimation;
                if (hitAniID) {
                    var alreadyActionComplete = false;
                    var hitAni = new GCAnimation();
                    hitAni.id = hitAniID;
                    if (skill.targetGridAniLayer == 0)
                        Game.currentScene.animationLowLayer.addChild(hitAni);
                    else
                        Game.currentScene.animationHighLayer.addChild(hitAni);
                    var posCenter = GameUtils.getGridCenterByGrid(gridPos);
                    hitAni.x = posCenter.x;
                    hitAni.y = posCenter.y;
                    hitAni.play();
                    hitAni.once(GCAnimation.PLAY_COMPLETED, _this, function () {
                        if (!alreadyActionComplete)
                            afterHitOpenSpace.apply(_this);
                        hitAni.dispose();
                    });
                    hitAni.once(GCAnimation.SIGNAL, _this, function (signalID) {
                        if (signalID == 1) {
                            alreadyActionComplete = true;
                            afterHitOpenSpace.apply(_this);
                        }
                    });
                }
                else {
                    afterHitOpenSpace.apply(_this);
                }
            });
        };
        if (skill.mustOpenSpace && skill.hitOpenSpaceEvent)
            CommandPage.startTriggerFragmentEvent(skill.hitOpenSpaceEvent, fromBattler, GameBattleHelper.cursor, Callback.New(doHitOpenSpace, this));
        else
            doHitOpenSpace.apply(this);
    };
    GameBattleAction.hitTarget = function (fromBattler, targetBattler, actionType, skill, item, status) {
        var _this = this;
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        var fromActor = fromBattler.battlerSetting.battleActor;
        var battleActor = targetBattler.battlerSetting.battleActor;
        var isHitSuccess = true;
        var hitAniID = 0;
        var showTargetHurtAnimation = false;
        if (actionType == 0) {
            isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            hitAniID = fromBattler.battlerSetting.battleActor.hitAnimation;
            showTargetHurtAnimation = true;
        }
        else if (actionType == 1) {
            if (skill == fromBattler.battlerSetting.battleActor.atkSkill) {
                isHitSuccess = MathUtils.rand(100) < (fromActor.HIT - battleActor.DOD);
            }
            else {
                isHitSuccess = MathUtils.rand(100) < skill.hit;
            }
            hitAniID = skill.hitAnimation;
            showTargetHurtAnimation = GameBattleHelper.isHostileRelationship(fromBattler, targetBattler);
        }
        else if (actionType == 2) {
            isHitSuccess = true;
            hitAniID = item.releaseAnimation;
        }
        else if (actionType == 3) {
            showTargetHurtAnimation = false;
        }
        var callNextStep = function () {
            if (GameBattle.state == 0 || GameBattle.state == 3 || targetBattler.battlerSetting.isDead) {
                _this.actionComplete();
            }
            else {
                _this.hitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
            }
        };
        var callHitEvent = function () {
            if (actionType == 1 && isHitSuccess && skill.hitEvent)
                CommandPage.startTriggerFragmentEvent(skill.hitEvent, fromBattler, targetBattler, Callback.New(callNextStep, _this));
            else if (actionType == 2 && item.callEvent)
                CommandPage.startTriggerFragmentEvent(item.callEvent, fromBattler, targetBattler, Callback.New(callNextStep, _this));
            else
                callNextStep.apply(_this);
        };
        if (hitAniID) {
            var alreadyInShowDamageStage = false;
            if (isHitSuccess && showTargetHurtAnimation) {
                if (targetBattler.avatar.hasActionID(9)) {
                    targetBattler.avatar.actionID = 9;
                    targetBattler.avatar.currentFrame = 1;
                }
                if (WorldData.hurtAni)
                    targetBattler.playAnimation(WorldData.hurtAni, true, true);
            }
            var hitAni = targetBattler.playAnimation(hitAniID, false, isHitSuccess);
            hitAni.once(GCAnimation.PLAY_COMPLETED, this, function () {
                if (!alreadyInShowDamageStage)
                    callHitEvent.apply(_this);
            });
            hitAni.once(GCAnimation.SIGNAL, this, function (signalID) {
                if (signalID == 1) {
                    alreadyInShowDamageStage = true;
                    callHitEvent.apply(_this);
                }
            });
        }
        else {
            callHitEvent.apply(this);
        }
    };
    GameBattleAction.hitResult = function (fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status) {
        var _this = this;
        if (skill === void 0) { skill = null; }
        if (item === void 0) { item = null; }
        if (status === void 0) { status = null; }
        var animationCount = 2;
        var onAnimationCompleteCallback = Callback.New(function () {
            animationCount--;
            if (animationCount == 0) {
                _this.actionComplete();
            }
        }, this);
        var res = GameBattleHelper.calculationHitResult(fromBattler, targetBattler, isHitSuccess, actionType, skill, item, status);
        if (res) {
            animationCount++;
            this.showDamage(targetBattler, res.damageType, res.damage, res.isCrit, onAnimationCompleteCallback);
        }
        if (WorldData.hurtAni)
            targetBattler.stopAnimation(WorldData.hurtAni);
        if (!targetBattler.battlerSetting.isDead)
            targetBattler.avatar.actionID = 1;
        GameBattle.checkBattlerIsDead(fromBattler, function () {
            if (fromBattler.battlerSetting.isDead)
                _this.showCurrentBattlerWindow(fromBattler);
            onAnimationCompleteCallback.run();
        });
        GameBattle.checkBattlerIsDead(targetBattler, function () {
            if (_this.showTargetBattleBriefWindow && targetBattler.battlerSetting.isDead)
                _this.showTargetBattlerWindow(targetBattler);
            onAnimationCompleteCallback.run();
        });
        this.showCurrentBattlerWindow(fromBattler);
        if (this.showTargetBattleBriefWindow) {
            this.showTargetBattlerWindow(targetBattler);
        }
    };
    GameBattleAction.actionComplete = function (skipHitMultipleTarget, skipHitTimes) {
        var _this = this;
        if (skipHitMultipleTarget === void 0) { skipHitMultipleTarget = false; }
        if (skipHitTimes === void 0) { skipHitTimes = false; }
        if (!skipHitMultipleTarget)
            this.currentHitTarget++;
        if (skipHitMultipleTarget || this.currentHitTarget == this.totalHitTarget) {
            GameBattle.battlerfieldDetermineHandle(function () {
                _this.currentHitTimes++;
                if (GameBattleHelper.isBattler(_this.fromBattler) && !_this.fromBattler.battlerSetting.isDead &&
                    !skipHitTimes && _this.currentHitTimes != _this.totalHitTimes) {
                    _this.useSkill(_this.fromBattler, _this.fromBattlerSkill, _this.fromBattlerSkillGridPos, null, false);
                    return;
                }
                GameBattlerHandler.calcHitReward(_this.fromBattler, Callback.New(function () {
                    EventUtils.happen(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE);
                }, _this));
            });
        }
    };
    GameBattleAction.hitByStatus = function (battler, status, onFin) {
        this.cameraMoveToBattler(battler);
        EventUtils.addEventListener(GameBattleAction, GameBattleAction.EVENT_ONCE_ACTION_COMPLETE, onFin, true);
        this.currentHitTarget = 0;
        this.totalHitTarget = 1;
        this.currentHitTimes = 0;
        this.totalHitTimes = 1;
        var fromBattler = Game.currentScene.sceneObjects[status.fromBattlerID];
        this.fromBattler = fromBattler;
        if (!GameBattleHelper.isBattler(fromBattler))
            fromBattler = battler;
        this.hitTarget(fromBattler, battler, 3, null, null, status);
    };
    GameBattleAction.showDamage = function (targetBattler, damageType, damage, isCrit, onFin) {
        if (damage === void 0) { damage = 0; }
        if (isCrit === void 0) { isCrit = false; }
        if (onFin === void 0) { onFin = null; }
        var lastRelease = this.currentHitTimes == this.totalHitTimes - 1;
        damage = Math.floor(damage);
        var uiID;
        switch (damageType) {
            case -2:
                uiID = 0;
                break;
            case -1:
                uiID = 1041;
                break;
            default:
                uiID = 1042 + damageType;
                break;
        }
        if (uiID != 0) {
            var damageUI = GameUI.load(uiID, true);
            damageUI.x = targetBattler.x;
            damageUI.y = targetBattler.y;
            Game.currentScene.animationHighLayer.addChild(damageUI);
            var targetUI = damageUI["target"];
            if (!targetUI)
                targetUI = damageUI.getChildAt(0);
            if (targetUI) {
                if (damageType >= 0) {
                    var damageLabel = damageUI["damage"];
                    if (damageLabel && damageLabel instanceof UIString) {
                        damageLabel.text = (damage > 0 ? "+" : "") + damage.toString();
                    }
                }
                var damageAni = new GCAnimation();
                damageAni.target = targetUI;
                damageAni.once(GCAnimation.PLAY_COMPLETED, this, function () {
                    damageAni.dispose();
                    damageUI.dispose();
                    if (lastRelease) {
                        onFin && onFin.run();
                    }
                });
                damageAni.id = isCrit ? 1047 : 1046;
                damageAni.play();
                if (!lastRelease) {
                    onFin && onFin.run();
                }
                return;
            }
        }
        onFin && onFin.run();
    };
    GameBattleAction.openMoveIndicator = function (battler) {
        var atkRangeRef = WorldData.showAtkRangeRef ? GameBattlerHandler.getBattlerAtkRangeReference(battler) : 0;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, battler.battlerSetting.battleActor.MoveGrid, 0, 0, 0, null, atkRangeRef, true);
    };
    GameBattleAction.openAtkIndicator = function (battler) {
        var atkRange = 1;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, atkRange, 1);
    };
    GameBattleAction.openSkillIndicator = function (battler, skill) {
        if (skill.skillType == 2)
            return;
        this.battlerEffectIndicatorGridArr = this.openBattlerSkillEffectRangeGird(battler, skill);
        if (skill.targetType == 5 || skill.targetType == 6) {
            this.battlerRelaseIndicatorGridArr = this.openBattlerReleaseRangeGrid(skill, battler);
        }
    };
    GameBattleAction.openItemIndicator = function (battler) {
        var itemRange = WorldData.actorItemAllowToOthers ? 1 : 0;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, itemRange, 2);
    };
    GameBattleAction.openExchangeIndicator = function (battler) {
        var exchangeItemRange = 1;
        this.battlerEffectIndicatorGridArr = this.openBattlerEffectRangeGrid(battler, exchangeItemRange, 1);
    };
    GameBattleAction.closeMoveIndicator = function () {
        this.closeBattlerEffectRangeGrid();
    };
    GameBattleAction.closeBattleIndicator = function () {
        this.closeBattlerEffectRangeGrid();
        this.closeBattlerReleaseRangeGrid();
    };
    GameBattleAction.openBattlerSkillEffectRangeGird = function (battler, skill) {
        this.closeBattlerEffectRangeGrid();
        var grids = GameBattleHelper.getSkillEffectRangeGrid(battler.posGrid, skill);
        for (var i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var effectGridAni = GameBattleHelper.createEffectGrid(grid.x, grid.y, 1, battler);
            this.battlerEffectGridAniArr.push(effectGridAni);
        }
        return grids;
    };
    GameBattleAction.openBattlerEffectRangeGrid = function (battler, range, obstacleMode, rangeMode, minRange, customRangeData, extraGridRange, includeSelfBattler) {
        if (obstacleMode === void 0) { obstacleMode = 0; }
        if (rangeMode === void 0) { rangeMode = 0; }
        if (minRange === void 0) { minRange = 0; }
        if (customRangeData === void 0) { customRangeData = null; }
        if (extraGridRange === void 0) { extraGridRange = 0; }
        if (includeSelfBattler === void 0) { includeSelfBattler = false; }
        this.closeBattlerEffectRangeGrid();
        var addGridsList = null;
        if (includeSelfBattler) {
            addGridsList = [battler.posGrid];
        }
        var grids = GameBattleHelper.getEffectRange(battler.posGrid, range, obstacleMode, rangeMode, minRange, customRangeData, false, addGridsList);
        for (var i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var effectGridAni = GameBattleHelper.createEffectGrid(grid.x, grid.y, 1, battler);
            this.battlerEffectGridAniArr.push(effectGridAni);
        }
        if (extraGridRange != 0) {
            var normalGrids = grids;
            var extraGrids = GameBattleHelper.getEffectRange(battler.posGrid, range + extraGridRange, 3, rangeMode, Math.max(0, minRange - extraGridRange), customRangeData, false, null, battler);
            for (var i = 0; i < extraGrids.length; i++) {
                var extraGrid = extraGrids[i];
                if (ArrayUtils.matchAttributes(normalGrids, { x: extraGrid.x, y: extraGrid.y }, true).length == 0) {
                    if (aroundHasNormalGrid(extraGrid, normalGrids)) {
                        var effectGridAni = GameBattleHelper.createEffectGrid(extraGrid.x, extraGrid.y, 2, battler);
                        this.battlerEffectExtGridAniArr.push(effectGridAni);
                    }
                }
            }
        }
        function aroundHasNormalGrid(extraGrid, normalGrids) {
            var around = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            for (var i = 0; i < 4; i++) {
                var dp = around[i];
                var tpX = extraGrid.x + dp[0];
                var tpY = extraGrid.y + dp[1];
                if (ArrayUtils.matchAttributes(normalGrids, { x: tpX, y: tpY }, true).length == 1) {
                    return true;
                }
            }
            return false;
        }
        return grids;
    };
    GameBattleAction.openBattlerReleaseRangeGrid = function (skill, battler) {
        this.closeBattlerReleaseRangeGrid();
        var grids = GameBattleHelper.getSkillReleaseRangeGrid(skill);
        for (var i = 0; i < grids.length; i++) {
            var grid = grids[i];
            var effectGridAni = GameBattleHelper.createEffectGrid(0, 0, 2, battler);
            if (effectGridAni) {
                effectGridAni.data = grid;
                this.battlerEffectReleaseGridAniArr.push(effectGridAni);
            }
        }
        this.openReleaseGridCursor = true;
        return grids;
    };
    Object.defineProperty(GameBattleAction, "openReleaseGridCursor", {
        get: function () {
            return this._openReleaseGridCursor;
        },
        set: function (v) {
            this._openReleaseGridCursor = v;
            if (v) {
                os.remove_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
                os.add_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
                this.onUpdateReleaseGridCursor();
            }
            else {
                os.remove_ENTERFRAME(this.onUpdateReleaseGridCursor, this);
            }
        },
        enumerable: false,
        configurable: true
    });
    GameBattleAction.onUpdateReleaseGridCursor = function () {
        var cursorGridPos = GameBattleHelper.cursorGridPoint;
        var cursor = GameBattleHelper.cursor;
        for (var i = 0; i < this.battlerEffectReleaseGridAniArr.length; i++) {
            var releaseAni = this.battlerEffectReleaseGridAniArr[i];
            var localGrid = releaseAni.data;
            var inSceneGridX = cursorGridPos.x + localGrid.x;
            var inSceneGridY = cursorGridPos.y + localGrid.y;
            if (Game.currentScene.sceneUtils.isOutsideByGrid(new Point(inSceneGridX, inSceneGridY))) {
                releaseAni.visible = false;
                continue;
            }
            releaseAni.visible = true;
            var aniX = inSceneGridX * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
            var aniY = inSceneGridY * Config.SCENE_GRID_SIZE + Config.SCENE_GRID_SIZE * 0.5;
            releaseAni.x = aniX;
            releaseAni.y = aniY;
        }
    };
    GameBattleAction.closeBattlerEffectRangeGrid = function () {
        for (var i = 0; i < this.battlerEffectGridAniArr.length; i++) {
            var ani = this.battlerEffectGridAniArr[i];
            ani && ani.dispose();
        }
        this.battlerEffectGridAniArr.length = 0;
        for (var i = 0; i < this.battlerEffectExtGridAniArr.length; i++) {
            var ani = this.battlerEffectExtGridAniArr[i];
            ani && ani.dispose();
        }
        this.battlerEffectExtGridAniArr.length = 0;
    };
    GameBattleAction.closeBattlerReleaseRangeGrid = function () {
        for (var i = 0; i < this.battlerEffectReleaseGridAniArr.length; i++) {
            this.battlerEffectReleaseGridAniArr[i].dispose();
        }
        this.battlerEffectReleaseGridAniArr.length = 0;
        this.openReleaseGridCursor = false;
    };
    GameBattleAction.EVENT_ONCE_ACTION_COMPLETE = "GameBattleActionEVENT_AFTER_ONCE_ACTION";
    GameBattleAction.battlerEffectGridAniArr = [];
    GameBattleAction.battlerEffectExtGridAniArr = [];
    GameBattleAction.battlerEffectReleaseGridAniArr = [];
    GameBattleAction.showTargetBattleBriefWindow = false;
    return GameBattleAction;
}());
//# sourceMappingURL=GameBattleAction.js.map