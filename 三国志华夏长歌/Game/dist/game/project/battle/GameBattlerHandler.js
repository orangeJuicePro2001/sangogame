var GameBattlerHandler = (function () {
    function GameBattlerHandler() {
    }
    GameBattlerHandler.init = function () {
    };
    GameBattlerHandler.start = function () {
        EventUtils.addEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
        this.refreshCampAndNewBattles();
    };
    GameBattlerHandler.stop = function () {
        this.closeAllBattlersStandbyEffect();
        EventUtils.removeEventListenerFunction(SceneObjectEntity, SceneObjectEntity.EVENT_BEFORE_CHANGE_STATUS_PAGE, this.onChangeSceneObjectStatus, this);
    };
    GameBattlerHandler.initScenePresetBattler = function () {
        for (var i in Game.currentScene.sceneObjects) {
            var so = Game.currentScene.sceneObjects[i];
            this.onBattlerAppear(so);
        }
    };
    GameBattlerHandler.onBattlerAppear = function (battler) {
        if (!GameBattleHelper.isBattler(battler))
            return;
        if (battler.battlerSetting.isInited)
            return;
        battler.battlerSetting.isInited = true;
        var battlerActorID = battler.battlerSetting.battleActor.id;
        if (!GameData.getModuleData(1, battlerActorID)) {
            battler.dispose();
            return;
        }
        this.ifPlayerActorBindingPlayerActorData(battler);
        if (battler.isDisposed)
            return;
        var battlerSetting = battler.battlerSetting;
        var actor = battler.battlerSetting.battleActor;
        var level = GameBattleHelper.getLevelByActor(actor);
        battlerSetting.isDead = false;
        battlerSetting.operationComplete = false;
        battlerSetting.moved = false;
        battlerSetting.actioned = false;
        battler.moveSpeed = actor.moveSpeed;
        this.clearHateList(battler);
        GameBattlerHandler.removeAllStatus(battler);
        Game.refreshActorAttribute(actor, level);
        if (actor.selfStatus.length != 0) {
            for (var i = 0; i < actor.selfStatus.length; i++) {
                GameBattlerHandler.addStatus(battler, actor.selfStatus[i], battler);
            }
            Game.refreshActorAttribute(actor, level);
        }
        actor.hp = actor.MaxHP;
        actor.sp = actor.MaxSP;
        for (var i = 0; i < actor.skills.length; i++) {
            var skill = actor.skills[i];
            skill.currentCD = 0;
        }
        this.callBattlerInitFragmentEvent(battler);
        battler.off(GameSprite.ON_DISPOSE, this, this.onBattlerRemoved);
        battler.once(GameSprite.ON_DISPOSE, this, this.onBattlerRemoved, [battler]);
    };
    GameBattlerHandler.onBattlerRemoved = function (battler) {
        GameBattle.usedPlayerActorRecord.remove(battler.battlerSetting.battleActor);
        GameBattlerHandler.removeAllBattlerStatusByFromBattler(battler);
        this.clearHateList(battler, true);
        ArrayUtils.remove(GameBattle.playerBattlers, battler);
        ArrayUtils.remove(GameBattle.enemyBattlers, battler);
        GameCommand.startCommonCommand(14043, [], null, battler, battler);
    };
    GameBattlerHandler.callBattlerInitFragmentEvent = function (battler) {
        if (!battler.battlerSetting.isExecuteAppearEvent) {
            battler.battlerSetting.isExecuteAppearEvent = true;
            GameCommand.startCommonCommand(14039, [], null, battler, battler);
        }
    };
    GameBattlerHandler.closeAllBattlersStandbyEffect = function () {
        var allBattlers = GameBattleHelper.allBattlers;
        for (var i = 0; i < allBattlers.length; i++) {
            var battler = allBattlers[i];
            GameBattlerHandler.clearBattlerStandbyEffect(battler);
        }
    };
    GameBattlerHandler.setBattlerStandby = function (battler) {
        battler.battlerSetting.operationComplete = true;
        GameCommand.startCommonCommand(14040, [], null, battler, battler);
    };
    GameBattlerHandler.clearBattlerStandbyEffect = function (battler) {
        if (battler.battlerSetting.operationComplete) {
            GameCommand.startCommonCommand(14041, [], null, battler, battler);
        }
    };
    GameBattlerHandler.dead = function (battler) {
        if (battler.battlerSetting.isDead)
            return;
        battler.battlerSetting.isDead = true;
        battler.battlerSetting.battleActor.hp = 0;
        battler.battlerSetting.battleActor.sp = 0;
        GameBattlerHandler.removeAllStatus(battler);
        this.clearHateList(battler, true);
        EventUtils.happen(GameBattlerHandler, GameBattlerHandler.EVENT_BATTLER_DEAD, [battler]);
        var battleActor = battler.battlerSetting.battleActor;
        if (battler.battlerSetting.battleCamp == 1 && battleActor.dropEnabled) {
            this.hitReward.gold += battleActor.dropGold;
            this.hitReward.exp += battleActor.dropExp;
            for (var i = 0; i < battleActor.dropItems.length; i++) {
                var dropItemDS = battleActor.dropItems[i];
                if (MathUtils.rand(100) < dropItemDS.dropProbability) {
                    this.hitReward.items.push({ itemID: dropItemDS.item, num: dropItemDS.num });
                }
            }
            for (var i = 0; i < battleActor.dropEquips.length; i++) {
                var dropEquipDS = battleActor.dropEquips[i];
                if (MathUtils.rand(100) < dropEquipDS.dropProbability) {
                    var newEquip = ObjectUtils.depthClone(dropEquipDS.equip);
                    this.hitReward.equips.push(newEquip);
                }
            }
        }
    };
    GameBattlerHandler.releaseAction = function (battler, actionID, releaseFrame, whenCompleteActionID, onRelease) {
        var avatar = battler.avatar;
        var hasAtkAction = avatar.hasActionID(actionID);
        if (hasAtkAction) {
            var isReleaseAction = false;
            var onRender = function () {
                if (avatar.currentFrame >= releaseFrame) {
                    avatar.off(Avatar.RENDER, avatar, arguments.callee);
                    onRelease();
                    isReleaseAction = true;
                }
            };
            avatar.once(Avatar.ACTION_PLAY_COMPLETED, this, function () {
                if (battler.isDisposed)
                    return;
                avatar.off(Avatar.RENDER, avatar, onRender);
                if (avatar.actionID != actionID)
                    return;
                if (!GameBattleHelper.isBattler(battler) || battler.battlerSetting.isDead)
                    return;
                avatar.actionID = whenCompleteActionID;
                if (!isReleaseAction)
                    onRelease();
            });
            avatar.on(Avatar.RENDER, avatar, onRender);
            avatar.currentFrame = 1;
            avatar.actionID = actionID;
        }
        else {
            onRelease();
        }
    };
    GameBattlerHandler.refreshCampAndNewBattles = function () {
        var oldPlayerBattlers = GameBattle.playerBattlers.concat();
        var oldEnemyBattlers = GameBattle.enemyBattlers.concat();
        GameBattle.playerBattlers.length = 0;
        GameBattle.enemyBattlers.length = 0;
        for (var i in Game.currentScene.sceneObjects) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isPlayerCamp(so)) {
                this.onBattlerAppear(so);
                GameBattle.playerBattlers.push(so);
            }
            else if (GameBattleHelper.isEnemyCamp(so)) {
                this.onBattlerAppear(so);
                GameBattle.enemyBattlers.push(so);
            }
        }
        for (var s = 0; s < oldPlayerBattlers.length; s++) {
            var oldPlayerBattler = oldPlayerBattlers[s];
            if (oldPlayerBattler.isDisposed || !GameBattleHelper.isBattler(oldPlayerBattler))
                continue;
            if (oldPlayerBattler.battlerSetting.battleCamp == 1) {
                this.onChangeSceneObjectCamp(oldPlayerBattler);
            }
        }
        for (var s = 0; s < oldEnemyBattlers.length; s++) {
            var oldEnemyBattler = oldEnemyBattlers[s];
            if (oldEnemyBattler.isDisposed || !GameBattleHelper.isBattler(oldPlayerBattler))
                continue;
            if (oldEnemyBattler.battlerSetting.battleCamp == 0) {
                this.onChangeSceneObjectCamp(oldEnemyBattler);
            }
        }
    };
    GameBattlerHandler.calcHitReward = function (winner, onFin) {
        var _this = this;
        if (!winner || !GameBattleHelper.isBattler(winner) || winner.battlerSetting.isDead) {
            onFin.run();
            return;
        }
        var winnerActor = winner.battlerSetting.battleActor;
        var winnerInPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(winnerActor);
        if (winnerInPlayerActorIndex < 0) {
            this.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
            onFin.run();
            return;
        }
        var isGetReward = this.hitReward.exp || this.hitReward.gold || this.hitReward.items.length != 0 || this.hitReward.equips.length != 0;
        if (!isGetReward) {
            onFin.run();
            return;
        }
        if (this.hitReward.gold) {
            ProjectPlayer.increaseGold(this.hitReward.gold);
        }
        var increaseExpRes = ProjectPlayer.increaseExpByIndex(winnerInPlayerActorIndex, this.hitReward.exp);
        GUI_HitReward.rewardBattler = winner;
        GUI_HitReward.rewardActor = winnerActor;
        GUI_HitReward.increaseExpRes = increaseExpRes;
        if (increaseExpRes && increaseExpRes.isLevelUp) {
            Game.refreshActorAttribute(winnerActor, GameBattleHelper.getLevelByActor(winnerActor));
        }
        for (var i = 0; i < this.hitReward.items.length; i++) {
            var itemInfo = this.hitReward.items[i];
            ProjectPlayer.changeItemNumber(itemInfo.itemID, itemInfo.num, false);
        }
        for (var i = 0; i < this.hitReward.equips.length; i++) {
            var newEquip = this.hitReward.equips[i];
            ProjectPlayer.addEquipByInstance(newEquip);
        }
        GameCommand.startCommonCommand(14038, [], Callback.New(function () {
            _this.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
            onFin.run();
        }, this), winner, winner);
    };
    GameBattlerHandler.clearHateList = function (battler, clearAll) {
        if (clearAll === void 0) { clearAll = false; }
        battler.battlerSetting.hateList.length = 0;
        if (clearAll)
            this.removeHateTargetFromAllList(battler);
    };
    GameBattlerHandler.removeHateTarget = function (battler, hateTarget) {
        var hateIndex = ArrayUtils.matchAttributes(battler.battlerSetting.hateList, { targetIndex: hateTarget.index }, true, "==", true)[0];
        if (hateIndex == null)
            return;
        battler.battlerSetting.hateList.splice(hateIndex, 1);
    };
    GameBattlerHandler.removeHateTargetFromAllList = function (hateTarget) {
        var sceneObjects = Game.currentScene.sceneObjects;
        for (var i = 0; i < sceneObjects.length; i++) {
            var so = sceneObjects[i];
            if (!GameBattleHelper.isBattler(so))
                continue;
            this.removeHateTarget(so, hateTarget);
        }
    };
    GameBattlerHandler.increaseHate = function (battler, hateTarget, hateValue, ignoreNotInHateList) {
        if (ignoreNotInHateList === void 0) { ignoreNotInHateList = false; }
        if (!GameBattleHelper.isHostileRelationship(battler, hateTarget))
            return;
        if (battler.battlerSetting.isDead || hateTarget.battlerSetting.isDead)
            return;
        var hateDS = ArrayUtils.matchAttributes(battler.battlerSetting.hateList, { targetIndex: hateTarget.index }, true)[0];
        if (hateDS) {
            hateDS.hateValue += hateValue;
        }
        else {
            if (ignoreNotInHateList)
                return;
            hateDS = new DataStructure_battlerHate;
            hateDS.targetIndex = hateTarget.index;
            hateDS.hateValue = hateValue;
            battler.battlerSetting.hateList.push(hateDS);
        }
        this.hateListOrderByDESC(battler);
    };
    GameBattlerHandler.increaseHateByHit = function (fromBattler, targetBattler, hitFrom, hitValue) {
        if (hitValue === void 0) { hitValue = 0; }
        hitValue = hitFrom.damageType <= 2 ? -hitValue : hitValue;
        var hateValue = hitFrom.fixedHeteValue + Math.abs(hitValue) * hitFrom.damageHatePer / 100;
        if (hitValue < 0) {
            this.increaseHate(targetBattler, fromBattler, hateValue);
        }
        else {
            if (GameBattleHelper.isFriendlyRelationship(fromBattler, targetBattler)) {
                var enemyCampBattlers = fromBattler.battlerSetting.battleCamp == 0 ? GameBattle.enemyBattlers : GameBattle.playerBattlers;
                for (var i = 0; i < enemyCampBattlers.length; i++) {
                    this.increaseHate(enemyCampBattlers[i], fromBattler, hateValue, true);
                }
            }
        }
    };
    GameBattlerHandler.addStatus = function (targetBattler, statusID, fromBattler, force) {
        if (fromBattler === void 0) { fromBattler = null; }
        if (force === void 0) { force = false; }
        var systemStatus = GameData.getModuleData(6, statusID);
        if (!systemStatus)
            return false;
        if (!force && MathUtils.rand(100) >= systemStatus.statusHit) {
            return false;
        }
        if (fromBattler == null)
            fromBattler = targetBattler;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        var targetIsImmuneThisStatus = targetBattlerActor.selfImmuneStatus.indexOf(statusID) != -1;
        if (!force && targetIsImmuneThisStatus)
            return false;
        ;
        var thisStatus = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true)[0];
        if (thisStatus) {
            thisStatus.currentLayer += 1;
            if (thisStatus.currentLayer > thisStatus.maxlayer)
                thisStatus.currentLayer = thisStatus.maxlayer;
        }
        else {
            thisStatus = GameData.newModuleData(6, statusID);
            thisStatus.fromBattlerID = fromBattler.index;
            targetBattlerActor.status.push(thisStatus);
        }
        if (thisStatus.animation)
            targetBattler.playAnimation(thisStatus.animation, true, true);
        thisStatus.currentDuration = thisStatus.totalDuration;
        if (systemStatus.whenAddEvent)
            CommandPage.startTriggerFragmentEvent(systemStatus.whenAddEvent, targetBattler, fromBattler);
        return true;
    };
    GameBattlerHandler.removeStatus = function (targetBattler, statusID) {
        var systemStatus = GameData.getModuleData(6, statusID);
        if (!systemStatus)
            return false;
        var targetBattlerActor = targetBattler.battlerSetting.battleActor;
        var thisStatusIdx = ArrayUtils.matchAttributes(targetBattlerActor.status, { id: statusID }, true, "==", true)[0];
        if (thisStatusIdx != null) {
            targetBattlerActor.status.splice(thisStatusIdx, 1);
            if (systemStatus.whenRemoveEvent)
                CommandPage.startTriggerFragmentEvent(systemStatus.whenRemoveEvent, targetBattler, targetBattler);
            if (systemStatus.animation) {
                if (ArrayUtils.matchAttributes(targetBattlerActor.status, { animation: systemStatus.animation }, true, "==", true).length == 0) {
                    targetBattler.stopAnimation(systemStatus.animation);
                }
            }
            return true;
        }
        return false;
    };
    GameBattlerHandler.removeAllStatus = function (battler) {
        var statusArr = battler.battlerSetting.battleActor.status.concat();
        for (var i = 0; i < statusArr.length; i++) {
            var status = statusArr[i];
            this.removeStatus(battler, status.id);
        }
        battler.battlerSetting.battleActor.status.length = 0;
    };
    GameBattlerHandler.removeAllBattlerStatusByFromBattler = function (fromBattler) {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                var statusArr = so.battlerSetting.battleActor.status;
                for (var s = 0; s < statusArr.length; s++) {
                    var status = statusArr[s];
                    if (status.fromBattlerID == fromBattler.index) {
                        if (this.removeStatus(so, status.id)) {
                            s--;
                        }
                    }
                }
            }
        }
    };
    GameBattlerHandler.getBattlerAtkRangeReference = function (battler) {
        var actor = battler.battlerSetting.battleActor;
        if (actor.atkMode == 1 && actor.atkSkill) {
            if (actor.atkSkill.effectRangeType == 0) {
                return actor.atkSkill.effectRange1;
            }
            else if (actor.atkSkill.effectRangeType == 1) {
                return actor.atkSkill.effectRange2B;
            }
            else {
                return 1;
            }
        }
        else {
            return 1;
        }
    };
    GameBattlerHandler.ifPlayerActorBindingPlayerActorData = function (battler) {
        if (battler.battlerSetting.battleCamp == 0 && battler.battlerSetting.usePlayerActors) {
            var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(battler.battlerSetting.battleActor);
            if (inPlayerActorIndex != -1 && GameBattle.usedPlayerActorRecord.get(battler.battlerSetting.battleActor) == battler)
                return true;
            var isBindingPlayerActor = false;
            for (var s = 0; s < Game.player.data.party.length; s++) {
                var playerActor = Game.player.data.party[s].actor;
                if (GameBattle.usedPlayerActorRecord.get(playerActor))
                    continue;
                if (playerActor.id == battler.battlerSetting.battleActor.id) {
                    GameBattle.usedPlayerActorRecord.set(playerActor, battler);
                    battler.battlerSetting.battleActor = playerActor;
                    isBindingPlayerActor = true;
                    return true;
                }
            }
            battler.dispose();
        }
        return false;
    };
    GameBattlerHandler.onChangeSceneObjectStatus = function (so) {
        if (GameBattleHelper.isBattler(so)) {
            this.onBattlerRemoved(so);
        }
    };
    GameBattlerHandler.onChangeSceneObjectCamp = function (soe) {
        this.clearHateList(soe, true);
        GameCommand.startCommonCommand(14039, [], null, soe, soe);
    };
    GameBattlerHandler.hateListOrderByDESC = function (battler) {
        battler.battlerSetting.hateList.sort(function (a, b) {
            return a.hateValue < b.hateValue ? 1 : -1;
        });
    };
    GameBattlerHandler.EVENT_BATTLER_DEAD = "GameBattlerHandlerEVENT_BATTLER_DEAD";
    GameBattlerHandler.hitReward = { gold: 0, exp: 0, items: [], equips: [] };
    return GameBattlerHandler;
}());
//# sourceMappingURL=GameBattlerHandler.js.map