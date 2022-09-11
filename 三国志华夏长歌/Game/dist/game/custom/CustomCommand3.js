(function (CommandExecute) {
    var recordBeforeBattleState = {};
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("recordBeforeBattleState", Callback.New(function () {
            return recordBeforeBattleState;
        }, null));
        EventUtils.addEventListener(SinglePlayerGame, SinglePlayerGame.EVENT_ON_BEFORE_RECOVERY_DATA, Callback.New(function () {
            var saveRecordBeforeBattleState = SinglePlayerGame.getSaveCustomData("recordBeforeBattleState");
            if (saveRecordBeforeBattleState)
                recordBeforeBattleState = saveRecordBeforeBattleState;
        }, null));
    }
    function customCommand_5001(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        if (GameBattle.state != 0) {
            return;
        }
        var cursor = Game.player.sceneObject;
        recordBeforeBattleState.avatarID = cursor.avatarID;
        recordBeforeBattleState.moveAutoChangeAction = cursor.moveAutoChangeAction;
        recordBeforeBattleState.through = cursor.through;
        recordBeforeBattleState.layerLevel = cursor.layerLevel;
        recordBeforeBattleState.shadowVisible = cursor.shadow.visible;
        recordBeforeBattleState.moveToGridCenter = WorldData.moveToGridCenter;
        recordBeforeBattleState.selectEnabled = cursor.selectEnabled;
        recordBeforeBattleState.moveSpeed = cursor.moveSpeed;
        recordBeforeBattleState.lastBgmURL = GameAudio.lastBgmURL;
        recordBeforeBattleState.lastBGMPitch = GameAudio.lastBGMPitch;
        recordBeforeBattleState.lastBGMVolume = GameAudio.lastBGMVolume;
        recordBeforeBattleState.lastBgsURL = GameAudio.lastBgsURL;
        recordBeforeBattleState.lastBGSPitch = GameAudio.lastBGSPitch;
        recordBeforeBattleState.lastBGSVolume = GameAudio.lastBGSVolume;
        recordBeforeBattleState.battleTriggerID = trigger.id;
        recordBeforeBattleState.battleSceneID = Game.currentScene.id;
        if (trigger.mainType == CommandTrigger.COMMAND_MAIN_TYPE_SCENE) {
            Controller.start();
        }
        Game.player.sceneObject.stopMove();
        trigger.offset(1);
        trigger.pause = true;
        GameBattle.init(cp);
        GUI_BattleReady.ACTOR_DEFAULT_ORI = [8, 2, 4, 6][cp.defaultOri];
        GameCommand.startCommonCommand(14020, [], Callback.New(function () {
            Game.player.sceneObject.avatarID = 0;
            Game.player.sceneObject.moveAutoChangeAction = false;
            var ani = Game.player.sceneObject.playAnimation(WorldData.battleCursorAni, true, true);
            Game.player.sceneObject.shadow.visible = false;
            Game.player.sceneObject.through = true;
            Game.player.sceneObject.layerLevel = 0;
            Game.player.sceneObject.selectEnabled = false;
            Game.player.sceneObject.moveSpeed = WorldData.cursorSpeedByPlayerControl;
            WorldData.moveToGridCenter = true;
            for (var i = 0; i < Game.currentScene.sceneObjects.length; i++) {
                var so = Game.currentScene.sceneObjects[i];
                if (GameBattleHelper.isBattler(so)) {
                    var gridCenter = GameUtils.getGridCenter(new Point(so.x, so.y));
                    so.setTo(gridCenter.x, gridCenter.y);
                }
            }
        }, this), trigger.trigger, trigger.executor);
    }
    CommandExecute.customCommand_5001 = customCommand_5001;
    function customCommand_5002(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var _this = this;
        if (GameBattle.state == 0)
            return;
        var isWin;
        if (cp.battleOverMode == 0) {
            isWin = GameBattle.resultIsWin;
        }
        else {
            GameBattle.resultIsWin = isWin = (cp.battleOverMode == 1 ? true : false);
        }
        if (GameBattle.setting.battleResultSwitch)
            Game.player.variable.setSwitch(GameBattle.setting.battleResultSwitch, isWin ? 1 : 0);
        GameBattle.stop(function () {
            var playerSo = Game.player.sceneObject;
            playerSo.avatarID = recordBeforeBattleState.avatarID;
            playerSo.moveAutoChangeAction = recordBeforeBattleState.moveAutoChangeAction;
            playerSo.through = recordBeforeBattleState.through;
            playerSo.layerLevel = recordBeforeBattleState.layerLevel;
            playerSo.shadow.visible = recordBeforeBattleState.shadowVisible;
            playerSo.stopAnimation(WorldData.battleCursorAni);
            playerSo.selectEnabled = recordBeforeBattleState.selectEnabled;
            playerSo.moveSpeed = recordBeforeBattleState.moveSpeed;
            WorldData.moveToGridCenter = recordBeforeBattleState.moveToGridCenter;
            if (recordBeforeBattleState.lastBgmURL)
                GameAudio.playBGM(recordBeforeBattleState.lastBgmURL, recordBeforeBattleState.lastBGMVolume, 99999, true, 500, recordBeforeBattleState.lastBGMPitch);
            else
                GameAudio.stopBGM(true, 500);
            if (recordBeforeBattleState.lastBgsURL)
                GameAudio.playBGS(recordBeforeBattleState.lastBgsURL, recordBeforeBattleState.lastBGSVolume, 99999, true, 500, recordBeforeBattleState.lastBGSPitch);
            else
                GameAudio.stopBGS(true, 500);
            GameCommand.startCommonCommand(14023, [], Callback.New(function () {
                if (recordBeforeBattleState.battleSceneID == Game.currentScene.id) {
                    GameCommand.inputMessageAndContinueExecute([], true, 0, recordBeforeBattleState.battleTriggerID);
                }
            }, _this), Game.player.sceneObject, Game.player.sceneObject);
        });
    }
    CommandExecute.customCommand_5002 = customCommand_5002;
    function customCommand_5003(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var bool = cp.value == 0 ? true : false;
        switch (cp.paramType) {
            case 0:
                WorldData.deadPlayerActorLeaveParty = bool;
                return;
            case 1:
                WorldData.standbyStepChangeOriEnabled = bool;
                return;
            case 2:
                WorldData.readyStepChangeOriEnabled = bool;
                return;
        }
    }
    CommandExecute.customCommand_5003 = customCommand_5003;
    function customCommand_5004(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.battlerSetting.battleActor;
        actor.hp += cp.symbol == 0 ? value : -value;
        actor.hp = Math.max(Math.min(actor.hp, actor.MaxHP), 0);
    }
    CommandExecute.customCommand_5004 = customCommand_5004;
    function customCommand_5005(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var actor = soc.battlerSetting.battleActor;
        actor.sp += cp.symbol == 0 ? value : -value;
        actor.sp = Math.max(Math.min(actor.sp, actor.MaxSP), 0);
    }
    CommandExecute.customCommand_5005 = customCommand_5005;
    function customCommand_5006(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc || !GameBattleHelper.isBattler(soc) || !GameBattleHelper.isInBattle)
            return;
        var statusID = MathUtils.int(cp.statusUseVar ? Game.player.variable.getVariable(cp.statusIDVarID) : cp.statusID);
        var actor = soc.battlerSetting.battleActor;
        if (cp.symbol == 0) {
            GameBattlerHandler.addStatus(soc, statusID, soc, cp.force);
        }
        else if (cp.symbol == 1) {
            GameBattlerHandler.removeStatus(soc, statusID);
        }
        else if (cp.symbol == 2) {
            GameBattlerHandler.removeAllStatus(soc);
        }
        var level = GameBattleHelper.getLevelByActor(actor);
        Game.refreshActorAttribute(actor, level);
    }
    CommandExecute.customCommand_5006 = customCommand_5006;
    function customCommand_5007(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var soc = ProjectClientScene.getSceneObjectBySetting(cp.soType + 1, cp.no, cp.soUseVar, cp.noVarID, trigger);
        if (!soc)
            return;
        var actor = soc.battlerSetting.battleActor;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        if (cp.type <= 2)
            value = -value;
        GameBattleAction.showDamage(soc, cp.type, value, cp.isCrit);
    }
    CommandExecute.customCommand_5007 = customCommand_5007;
    function customCommand_5008(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        var actorData = GameData.getModuleData(1, actorID);
        if (!actorData)
            return;
        if (!GameBattleHelper.isInBattle)
            return;
        if (cp.camp == 2 && !GameBattleHelper.isBattler(trigger.trigger))
            return;
        if (cp.camp == 3 && !GameBattleHelper.isBattler(trigger.executor))
            return;
        if (cp.gridUseVar) {
            var gridX = MathUtils.int(Game.player.variable.getVariable(cp.xVarID));
            var gridY = MathUtils.int(Game.player.variable.getVariable(cp.yVarID));
        }
        else {
            gridX = MathUtils.int(cp.x);
            gridY = MathUtils.int(cp.y);
        }
        var posGridP = new Point(gridX, gridY);
        var posP = GameUtils.getGridCenterByGrid(posGridP);
        var persetSceneObject = {
            x: posP.x,
            y: posP.y,
            avatarID: actorData.avatar,
            avatarOri: GUI_BattleReady.ACTOR_DEFAULT_ORI
        };
        var soc = Game.currentScene.addNewSceneObject(1, persetSceneObject);
        soc.moveSpeed = actorData.moveSpeed;
        soc.battlerSetting.isBattler = true;
        soc.battlerSetting.battleActor = GameData.newModuleData(1, actorID);
        soc.battlerSetting.usePlayerActors = false;
        soc.battlerSetting.mustInBattle = false;
        soc.battlerSetting.playerCantCtrl = !cp.playerCtrlEnabled;
        switch (cp.camp) {
            case 0:
                soc.battlerSetting.battleCamp = 0;
                break;
            case 1:
                soc.battlerSetting.battleCamp = 1;
                break;
            case 2:
                soc.battlerSetting.battleCamp = trigger.trigger.battlerSetting.battleCamp;
                break;
            case 3:
                soc.battlerSetting.battleCamp = trigger.executor.battlerSetting.battleCamp;
                break;
        }
        var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
        lv = Math.max(1, Math.min(lv, soc.battlerSetting.battleActor.MaxLv));
        soc.battlerSetting.level = lv;
        GameBattlerHandler.refreshCampAndNewBattles();
        if (cp.saveNewSoIndex) {
            Game.player.variable.setVariable(cp.newSoIndexVarID, soc.index);
        }
    }
    CommandExecute.customCommand_5008 = customCommand_5008;
    function customCommand_6001(commandPage, cmd, trigger, triggerPlayer, playerInput, p) {
        var equipID = p.useVar1 ? Game.player.variable.getVariable(p.equipIDVarID) : p.equipID;
        var num = p.useVar2 ? Game.player.variable.getVariable(p.numVarID) : p.num;
        if (!GameData.getModuleData(4, equipID))
            return;
        if (p.attributeRand && p.equipRandSetting.length > 0 && p.symbol == 0) {
            var equipAttributeNames = ["maxHP", "maxSP", "atk", "def", "mag", "magDef", "agi", "moveGrid", "hit", "crit", "magCrit"];
            var probabilityCount = 0;
            for (var i = 0; i < p.equipRandSetting.length; i++) {
                probabilityCount += p.equipRandSetting[i].probability;
            }
            if (probabilityCount < 100)
                probabilityCount = 100;
            for (var n = 0; n < num; n++) {
                var newEquip = GameData.newModuleData(4, equipID, true);
                for (var i = 0; i < p.equipRandSetting.length; i++) {
                    var thisSetting = p.equipRandSetting[i];
                    var thisPer = thisSetting.probability / probabilityCount;
                    if (Math.random() < thisPer) {
                        for (var s = 0; s < equipAttributeNames.length; s++) {
                            var per = (MathUtils.rand(thisSetting.maxValue - thisSetting.minValue) + thisSetting.minValue) / 100;
                            var newValue = newEquip[equipAttributeNames[s]] * per;
                            newEquip[equipAttributeNames[s]] = Math.ceil(newValue);
                        }
                        break;
                    }
                }
                ProjectPlayer.addEquipByInstance(newEquip);
            }
        }
        else {
            ProjectPlayer.changeItemNumber(equipID, p.symbol == 0 ? num : -num, true);
        }
    }
    CommandExecute.customCommand_6001 = customCommand_6001;
    function customCommand_6002(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actorID = MathUtils.int(cp.useVar ? Game.player.variable.getVariable(cp.actorIDVarID) : cp.actorID);
        if (!GameData.getModuleData(1, actorID))
            return;
        if (cp.type == 0) {
            var lv = MathUtils.int(cp.lvUseVar ? Game.player.variable.getVariable(cp.lvVarID) : cp.lv);
            ProjectPlayer.addPlayerActorByActorID(actorID, lv);
        }
        else {
            ProjectPlayer.removePlayerActorByActorID(actorID);
        }
    }
    CommandExecute.customCommand_6002 = customCommand_6002;
    function customCommand_6003(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var skillID = MathUtils.int(cp.skillUseVar ? Game.player.variable.getVariable(cp.skillIDVarID) : cp.skillID);
        if (cp.symbol == 0) {
            Game.actorLearnSkill(actor, skillID);
        }
        else if (cp.symbol == 1) {
            Game.actorForgetSkill(actor, skillID);
        }
        else if (cp.symbol == 2) {
            Game.actorForgetAllSkills(actor);
        }
    }
    CommandExecute.customCommand_6003 = customCommand_6003;
    function customCommand_6004(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var equipID = MathUtils.int(cp.equipUseVar ? Game.player.variable.getVariable(cp.equipIDVarID) : cp.equipID);
        var inPartyActorDS = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        var takeOffEquip;
        if (cp.symbol == 0) {
            if (inPartyActorDS && cp.fromPlayerPackage) {
                var fromPackageEquip = ProjectPlayer.getItemDS(equipID, true);
                if (fromPackageEquip)
                    ProjectPlayer.wearPlayerActorEquip(inPartyActorIndex, fromPackageEquip.equip);
            }
            else {
                if (GameData.getModuleData(4, equipID)) {
                    var newEquip = GameData.newModuleData(4, equipID);
                    Game.wearActorEquip(actorDS.actor, newEquip);
                }
            }
        }
        else if (cp.symbol == 1 || cp.symbol == 3) {
            if (cp.usePartID) {
                if (inPartyActorDS && cp.symbol == 1)
                    takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, cp.partID);
                else
                    takeOffEquip = Game.takeOffActorEquipByPartID(actor, cp.partID);
            }
            else {
                var thisEquip = Game.getActorEquipByEquipID(actor, equipID);
                if (thisEquip) {
                    var thisEquipPartID = thisEquip.partID;
                    if (inPartyActorDS && cp.symbol == 1)
                        takeOffEquip = ProjectPlayer.takeOffPlayerActorEquipByPartID(inPartyActorIndex, thisEquipPartID);
                    else
                        takeOffEquip = Game.takeOffActorEquipByPartID(actor, thisEquipPartID);
                }
            }
        }
        else if (cp.symbol == 2 || cp.symbol == 4) {
            if (inPartyActorDS && cp.symbol == 2)
                ProjectPlayer.takeOffPlayerActorAllEquips(inPartyActorIndex);
            else
                Game.takeOffActorAllEquips(actor);
        }
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor));
        if (cp.isTakeOffEquipSaveToVar) {
            var takeOffEquipID = takeOffEquip ? takeOffEquip.id : -1;
            Game.player.variable.setVariable(cp.takeOffEquipSaveToVar, takeOffEquipID);
        }
    }
    CommandExecute.customCommand_6004 = customCommand_6004;
    function customCommand_6005(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        if (cp.actorCheckType <= 1) {
            var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
            if (!actorDS)
                return;
            actor = actorDS.actor;
        }
        else {
            actor = ProjectUtils.getActorBySceneObjectIndex(cp.soType, cp.soUseVar, cp.no, cp.noVarID, trigger);
        }
        if (!actor)
            return;
        var value = MathUtils.int(cp.valueUseVar ? Game.player.variable.getVariable(cp.valueVarID) : cp.value);
        var inPartyActorDS = ProjectPlayer.getPlayerActorDSByActor(actor);
        var inPartyActorIndex = ProjectPlayer.getPlayerActorIndexByActor(actor);
        switch (cp.attributeType) {
            case 0:
                actor.increaseMaxHP += value;
                break;
            case 1:
                actor.increaseMaxSP += value;
                break;
            case 2:
                actor.increasePow += value;
                break;
            case 3:
                actor.increaseMag += value;
                break;
            case 4:
                actor.increaseEnd += value;
                break;
            case 5:
                actor.increaseAgi += value;
                break;
            case 6:
                if (inPartyActorIndex != -1) {
                    ProjectPlayer.increaseExpByIndex(inPartyActorIndex, value);
                }
                break;
            case 7:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv += value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
            case 8:
                if (inPartyActorIndex != -1) {
                    inPartyActorDS.lv -= value;
                    ProjectPlayer.initPlayerActor(inPartyActorIndex);
                }
                break;
        }
        Game.refreshActorAttribute(actor, GameBattleHelper.getLevelByActor(actor));
    }
    CommandExecute.customCommand_6005 = customCommand_6005;
    var changeActorNameInfo = {};
    function customCommand_6006(commandPage, cmd, trigger, triggerPlayer, playerInput, cp) {
        var actor;
        var actorDS = ProjectUtils.getPlayerActorByCheckType(cp.actorCheckType, cp.useVar, cp.actorID, cp.actorIDVarID, cp.actorInPartyIndexVarIDUseVar, cp.actorInPartyIndex, cp.actorInPartyIndexVarID, null, null, null, null, trigger);
        if (!actorDS)
            return;
        actor = actorDS.actor;
        if (!actor)
            return;
        var newName = cp.valueUseVar ? Game.player.variable.getString(cp.valueVarID) : cp.value;
        for (var i = 0; i < Game.player.data.party.length; i++) {
            var inPartyActor = Game.player.data.party[i];
            var actorID = inPartyActor.actor.id;
            if (actorID == actor.id) {
                inPartyActor.actor.name = newName;
            }
        }
        changeActorNameInfo[actor.id] = newName;
    }
    CommandExecute.customCommand_6006 = customCommand_6006;
    if (!Config.BEHAVIOR_EDIT_MODE) {
        SinglePlayerGame.regSaveCustomData("___changeActorName", Callback.New(function () {
            return changeActorNameInfo;
        }, null));
        EventUtils.addEventListener(ClientWorld, ClientWorld.EVENT_INITED, Callback.New(function () {
            EventUtils.addEventListener(GameGate, GameGate.EVENT_IN_SCENE_STATE_CHANGE, Callback.New(function () {
                if (GameGate.gateState == GameGate.STATE_3_IN_SCENE_COMPLETE) {
                    var restoryChangeActorNameInfo = SinglePlayerGame.getSaveCustomData("___changeActorName");
                    if (restoryChangeActorNameInfo) {
                        changeActorNameInfo = restoryChangeActorNameInfo;
                        for (var i = 0; i < Game.player.data.party.length; i++) {
                            var actorID = Game.player.data.party[i].actor.id;
                            if (changeActorNameInfo[actorID]) {
                                Game.player.data.party[i].actor.name = changeActorNameInfo[actorID];
                            }
                        }
                    }
                }
            }, null));
        }, null), true);
    }
})(CommandExecute || (CommandExecute = {}));
//# sourceMappingURL=CustomCommand3.js.map