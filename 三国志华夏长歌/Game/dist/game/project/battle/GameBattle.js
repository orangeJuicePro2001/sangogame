var GameBattle = (function () {
    function GameBattle() {
    }
    Object.defineProperty(GameBattle, "fastPlayMode", {
        get: function () {
            return this._fastPlayMode;
        },
        set: function (v) {
            if (v) {
                var isPlayerTurn = (GameBattle.firstCamp == 0 && GameBattle.inTurnStage == 2) || (GameBattle.firstCamp == 1 && GameBattle.inTurnStage == 3);
                if (!GameBattleHelper.isInBattle || this.fastPlayRecordInfo || isPlayerTurn)
                    return;
                this.fastPlayRecordInfo = [WorldData.cameraTweenFrame, WorldData.cursorSpeedByComputerControl, WorldData.actionReflectionTime, WorldData.noActionWaitTime, WorldData.aiOpenIndicator ? 1 : 0];
                WorldData.cameraTweenFrame = 0;
                WorldData.cursorSpeedByComputerControl = 2400;
                WorldData.actionReflectionTime = 0;
                WorldData.noActionWaitTime = 0;
                WorldData.aiOpenIndicator = false;
            }
            else if (this.fastPlayRecordInfo) {
                WorldData.cameraTweenFrame = this.fastPlayRecordInfo[0];
                WorldData.cursorSpeedByComputerControl = this.fastPlayRecordInfo[1];
                WorldData.actionReflectionTime = this.fastPlayRecordInfo[2];
                WorldData.noActionWaitTime = this.fastPlayRecordInfo[3];
                WorldData.aiOpenIndicator = this.fastPlayRecordInfo[4] ? true : false;
                this.fastPlayRecordInfo = null;
            }
            this._fastPlayMode = v;
        },
        enumerable: false,
        configurable: true
    });
    GameBattle.init = function (cp) {
        GameBattle.setting = cp;
        GameBattle.state = 1;
        GameBattleController.init();
        GameBattleAI.init();
        GameBattleAction.init();
        GameBattlerHandler.init();
        this.resultIsWin = false;
        this.resultIsGameOver = false;
        this.usedPlayerActorRecord.clear();
        this.inTurnStage = 0;
        this.battleRound = 0;
        if (this.setting.firstActionCamp == 2)
            this.firstCamp = Math.random() < 0.5 ? 0 : 1;
        else
            this.firstCamp = this.setting.firstActionCamp;
    };
    GameBattle.start = function () {
        var _this = this;
        if (!this.nextStepCB)
            this.nextStepCB = Callback.New(this.nextStep, this);
        GameBattle.state = 2;
        if (!GameBattle.setting.isPlayerDecisionBattler)
            GameBattlerHandler.initScenePresetBattler();
        GameCommand.startCommonCommand(14021, [], Callback.New(function () {
            UIList.KEY_BOARD_ENABLED = WorldData.hotKeyListEnabled;
            GameBattleController.start();
            GameBattleAI.start();
            GameBattleAction.start();
            GameBattlerHandler.start();
            Game.currentScene.camera.sceneObject = GameBattleHelper.cursor;
            _this.nextStep();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    };
    GameBattle.stop = function (onFin) {
        GameBattle.state = 0;
        GameBattleController.stop();
        GameBattleAI.stop();
        GameBattleAction.stop();
        GameBattlerHandler.stop();
        if (!GameBattle.resultIsGameOver) {
            if (GameBattle.setting.isAddEvents) {
                if (GameBattle.resultIsWin && GameBattle.setting.battleStage2_beforeWin) {
                    CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage2_beforeWin, Game.player.sceneObject, Game.player.sceneObject, Callback.New(doStop, this));
                    return;
                }
                else if (!GameBattle.resultIsWin && GameBattle.setting.battleStage3_beforeLose) {
                    CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage3_beforeLose, Game.player.sceneObject, Game.player.sceneObject, Callback.New(doStop, this));
                    return;
                }
            }
            doStop();
        }
        function doStop() {
            GameBattle.deadActorLeaveParty();
            GameBattle.clearBattlersSceneObject();
            GameBattle.resetActorParty();
            onFin();
        }
    };
    GameBattle.nextStep = function () {
        var _this = this;
        this.battlerfieldDetermineHandle(function () {
            GameBattlerHandler.closeAllBattlersStandbyEffect();
            _this.playerControlEnabled = false;
            WorldData.playCtrlEnabled = false;
            var currentInTurnStage = _this.inTurnStage++;
            if (_this.inTurnStage > 3)
                _this.inTurnStage = 0;
            if (currentInTurnStage == 0) {
                _this.newTurnStep();
            }
            else if (currentInTurnStage == 1) {
                _this.firstCampStartActionStep();
            }
            else if (currentInTurnStage == 2) {
                _this.secondCampStartActionStep();
            }
            else {
                _this.settlementStep();
            }
        });
    };
    GameBattle.newTurnStep = function () {
        var _this = this;
        this.battleRound++;
        var allBattlers = this.playerBattlers.concat(this.enemyBattlers);
        for (var i in allBattlers) {
            var battler = allBattlers[i];
            battler.battlerSetting.operationComplete = false;
            battler.battlerSetting.moved = false;
            battler.battlerSetting.actioned = false;
            var actor = battler.battlerSetting.battleActor;
            if (actor.atkMode == 1 && actor.atkSkill) {
                if (actor.atkSkill.currentCD > 0)
                    actor.atkSkill.currentCD--;
            }
            for (var s = 0; s < actor.skills.length; s++) {
                var skill = actor.skills[s];
                if (skill.currentCD > 0)
                    skill.currentCD--;
            }
            if (this.battleRound != 1) {
                for (var s = 0; s < actor.status.length; s++) {
                    var status = actor.status[s];
                    status.currentDuration--;
                    if (status.currentDuration <= 0) {
                        var isRemove = GameBattlerHandler.removeStatus(battler, status.id);
                        if (isRemove)
                            s--;
                    }
                }
            }
        }
        if (GameBattle.setting.isAddEvents && GameBattle.setting.battleStage1_newTurn) {
            CommandPage.startTriggerFragmentEvent(GameBattle.setting.battleStage1_newTurn, Game.player.sceneObject, Game.player.sceneObject, Callback.New(function () {
                _this.battlerfieldDetermineHandle(function () {
                    GameCommand.startCommonCommand(14031, [], Callback.New(_this.nextStep, _this), Game.player.sceneObject, Game.player.sceneObject);
                });
            }, this));
        }
        else {
            GameCommand.startCommonCommand(14031, [], Callback.New(this.nextStep, this), Game.player.sceneObject, Game.player.sceneObject);
        }
    };
    GameBattle.firstCampStartActionStep = function () {
        var _this = this;
        GameCommand.startCommonCommand(14032, [], Callback.New(function () {
            if (_this.firstCamp == 0)
                _this.nextPlayerControl();
            else
                _this.nextEnemyControl();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    };
    GameBattle.secondCampStartActionStep = function () {
        var _this = this;
        GameCommand.startCommonCommand(14033, [], Callback.New(function () {
            if (_this.firstCamp == 1)
                _this.nextPlayerControl();
            else
                _this.nextEnemyControl();
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    };
    GameBattle.settlementStep = function () {
        var _this = this;
        if (!GameBattleAction.isNeedCalcBattlersStatus()) {
            this.nextStep();
            return;
        }
        GameCommand.startCommonCommand(14034, [], Callback.New(function () {
            _this.battlerfieldDetermineHandle(function () {
                GameBattleAction.calcBattlersStatus(_this.nextStepCB);
            });
        }, this), Game.player.sceneObject, Game.player.sceneObject);
    };
    GameBattle.nextPlayerControl = function () {
        var _this = this;
        this.fastPlayMode = false;
        this.battlerfieldDetermineHandle(function () {
            var nextPlayerControlBattler = GameBattleHelper.nextPlayerControlBattler;
            if (nextPlayerControlBattler) {
                GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByPlayerControl;
                _this.playerControlEnabled = WorldData.playCtrlEnabled = true;
                GameBattleAction.cameraMoveToBattler(nextPlayerControlBattler);
                GameBattleController.openBattlerMenu(nextPlayerControlBattler);
            }
            else {
                GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByComputerControl;
                _this.playerControlEnabled = WorldData.playCtrlEnabled = false;
                var nextPlayerCampComputerControlBattler = GameBattleHelper.nextPlayerCampComputerControlBattler;
                if (nextPlayerCampComputerControlBattler) {
                    GameBattleAI.action(nextPlayerCampComputerControlBattler, Callback.New(_this.nextPlayerControl, _this));
                }
                else {
                    _this.nextStep();
                }
            }
        });
    };
    GameBattle.nextEnemyControl = function () {
        var _this = this;
        GameBattleHelper.cursor.moveSpeed = WorldData.cursorSpeedByComputerControl;
        this.battlerfieldDetermineHandle(function () {
            var nextEnemyControlBattler = GameBattleHelper.nextEnemyControlBattler;
            if (nextEnemyControlBattler) {
                GameBattleAI.action(nextEnemyControlBattler, Callback.New(_this.nextEnemyControl, _this));
            }
            else {
                _this.nextStep();
            }
        });
    };
    GameBattle.battlerfieldDetermineHandle = function (onFin) {
        var _this = this;
        if (GameBattle.state == 0 || GameBattle.state == 3)
            return;
        GameBattlerHandler.refreshCampAndNewBattles();
        var allBattlers = GameBattleHelper.allBattlers;
        var allBattlersCount = allBattlers.length;
        if (allBattlersCount > 0) {
            for (var i = 0; i < allBattlers.length; i++) {
                var battler = allBattlers[i];
                this.checkBattlerIsDead(battler, function () {
                    allBattlersCount--;
                    if (allBattlersCount == 0) {
                        var isComplete = GameBattle.checkBattleIsComplete();
                        if (!isComplete)
                            onFin.apply(_this);
                    }
                });
            }
        }
        else {
            var isComplete = GameBattle.checkBattleIsComplete();
            if (!isComplete)
                onFin.apply(this);
        }
    };
    GameBattle.checkBattlerIsDead = function (battler, onFin) {
        var _this = this;
        if (!battler.battlerSetting.isDead && battler.battlerSetting.battleActor.hp == 0) {
            GameCommand.startCommonCommand(14042, [], Callback.New(function () {
                GameBattlerHandler.refreshCampAndNewBattles();
                if (!battler.isDisposed && GameBattleHelper.isBattler(battler) && battler.battlerSetting.battleActor.hp == 0) {
                    GameBattlerHandler.dead(battler);
                }
                onFin.apply(_this);
            }, this), battler, battler);
        }
        else {
            onFin.apply(this);
        }
    };
    GameBattle.getBattleCompleteState = function () {
        for (var i = 0; i < GameBattle.setting.addFailConditions.length; i++) {
            var actorID = GameBattle.setting.addFailConditions[i];
            var thisActorBattlers = ArrayUtils.matchAttributesD3(this.playerBattlers, "battlerSetting", "battleActor", { id: actorID }, false);
            var thisActorDeadBattlers = ArrayUtils.matchAttributesD2(thisActorBattlers, "battlerSetting", { isDead: true }, false);
            for (var s = 0; s < thisActorDeadBattlers.length; s++) {
                var thisActorBattler = thisActorDeadBattlers[s];
                if (GameBattleHelper.isInPlayerParty(thisActorBattler)) {
                    return 2;
                }
            }
        }
        if (ArrayUtils.matchAttributesD2(this.playerBattlers, "battlerSetting", { isDead: true }, false).length == this.playerBattlers.length) {
            return 2;
        }
        if (ArrayUtils.matchAttributesD2(this.enemyBattlers, "battlerSetting", { isDead: true }, false).length == this.enemyBattlers.length) {
            return 1;
        }
        return 0;
    };
    GameBattle.clearBattlersSceneObject = function () {
        for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
            var so = Game.currentScene.sceneObjects[i];
            if (GameBattleHelper.isBattler(so)) {
                so.battlerSetting.isInited = false;
                so.battlerSetting.isExecuteAppearEvent = false;
                so.battlerSetting.hateList.length = 0;
                GameBattlerHandler.removeAllStatus(so);
            }
        }
        if (GameBattle.setting.winClearBattlefieldType != 2) {
            for (var i = 0; i < this.playerBattlers.length; i++) {
                var playerBattler = this.playerBattlers[i];
                if (GameBattle.setting.keepDeadBattler && playerBattler.battlerSetting.isDead)
                    continue;
                playerBattler.dispose();
                i--;
            }
            if (GameBattle.setting.winClearBattlefieldType == 0) {
                for (var i = 0; i < this.enemyBattlers.length; i++) {
                    var enemyBattler = this.enemyBattlers[i];
                    if (GameBattle.setting.keepDeadBattler && enemyBattler.battlerSetting.isDead)
                        continue;
                    enemyBattler.dispose();
                    i--;
                }
            }
        }
        for (var i = 0; i < this.playerBattlers.length; i++) {
            var playerBattler = this.playerBattlers[i];
            GameCommand.startCommonCommand(14043, [], null, playerBattler, playerBattler);
        }
        for (var i = 0; i < this.enemyBattlers.length; i++) {
            var enemyBattler = this.enemyBattlers[i];
            GameCommand.startCommonCommand(14043, [], null, enemyBattler, enemyBattler);
        }
    };
    GameBattle.deadActorLeaveParty = function () {
        if (WorldData.deadPlayerActorLeaveParty) {
            for (var i = 0; i < this.playerBattlers.length; i++) {
                var playerBattler = this.playerBattlers[i];
                if (playerBattler.battlerSetting.isDead && GameBattleHelper.isInPlayerParty(playerBattler)) {
                    var inPlayerActorIndex = ProjectPlayer.getPlayerActorIndexByActor(playerBattler.battlerSetting.battleActor);
                    if (inPlayerActorIndex >= 0) {
                        ProjectPlayer.removePlayerActorByInPartyIndex(inPlayerActorIndex);
                        this.playerBattlers.splice(i, 1);
                        i--;
                    }
                }
            }
        }
    };
    GameBattle.resetActorParty = function () {
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var actorDS = Game.player.data.party[i];
            var actor = actorDS.actor;
            Game.refreshActorAttribute(actor, actorDS.lv);
            actor.hp = actor.MaxHP;
            actor.sp = actor.MaxSP;
        }
    };
    GameBattle.checkBattleIsComplete = function () {
        if (GameBattle.state == 0 || GameBattle.state == 3)
            return true;
        var battleOverState = this.getBattleCompleteState();
        var isBattleOver = battleOverState != 0;
        if (isBattleOver) {
            GameBattle.state = 3;
            var isWin = battleOverState == 1;
            GameBattle.resultIsWin = isWin;
            GameBattle.resultIsGameOver = !isWin;
            if (GameBattle.setting.battleFailHandleType == 1) {
                GameBattle.resultIsGameOver = false;
            }
            GameBattlerHandler.calcHitReward(GameBattleAction.fromBattler, Callback.New(function () {
                GameCommand.startCommonCommand(14022, [], null, Game.player.sceneObject, Game.player.sceneObject);
            }, this));
            return true;
        }
        return false;
    };
    GameBattle.state = 0;
    GameBattle.battleRound = 0;
    GameBattle.playerBattlers = [];
    GameBattle.enemyBattlers = [];
    GameBattle.usedPlayerActorRecord = new Dictionary();
    return GameBattle;
}());
//# sourceMappingURL=GameBattle.js.map