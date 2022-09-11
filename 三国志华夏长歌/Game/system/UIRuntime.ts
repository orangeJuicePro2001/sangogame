/**
 * 该文件为GameCreator编辑器自动生成的代码，请勿修改
 */

/**
 * 1-标题界面 [BASE]
 */
class GUI_1 extends GUI_BASE {
   主题背景:UIBitmap;
   上装饰容器:UIRoot;
   装饰背景:UIBitmap;
   下装饰容器:UIRoot;
   游戏标题:UIString;
   开始游戏按钮阴影:UIBitmap;
   读取存档按钮阴影:UIBitmap;
   退出游戏按钮阴影:UIBitmap;
   StartBtn:UIButton;
   LoadBtn:UIButton;
   QuitBtn:UIButton;
   settingBtn:UIButton;
   constructor(){
      super(1);
   }
}
class ListItem_1 extends UIListItemData {
   主题背景:string;
   装饰背景:string;
   游戏标题:string;
   开始游戏按钮阴影:string;
   读取存档按钮阴影:string;
   退出游戏按钮阴影:string;

}

/**
 * 2-读档界面 [BASE]
 */
class GUI_2 extends GUI_BASE {
   界面背景:UIBitmap;
   读档界面阴影:UIBitmap;
   读档界面背景:UIBitmap;
   花纹:UIBitmap;
   延长线:UIBitmap;
   读档标题:UIString;
   读档英文标题:UIString;
   list:UIList; // Item=1001
   关闭读档界面按钮:UIButton;
   constructor(){
      super(2);
   }
}
class ListItem_2 extends UIListItemData {
   界面背景:string;
   读档界面阴影:string;
   读档界面背景:string;
   花纹:string;
   延长线:string;
   读档标题:string;
   读档英文标题:string;
   list:UIListItemData[];

}

/**
 * 3-菜单界面 [BASE]
 */
class GUI_3 extends GUI_BASE {
   黑色半透明背景:UIBitmap;
   界面背景:UIBitmap;
   按钮阴影容器:UIRoot;
   背包按钮阴影:UIBitmap;
   队伍编成按钮阴影:UIBitmap;
   存档按钮阴影:UIBitmap;
   读档按钮阴影:UIBitmap;
   设置按钮阴影:UIBitmap;
   返回标题按钮阴影:UIBitmap;
   返回游戏按钮阴影:UIBitmap;
   背包按钮:UIButton;
   队伍编成按钮:UIButton;
   存档按钮:UIButton;
   读档按钮:UIButton;
   设置按钮:UIButton;
   返回标题按钮:UIButton;
   返回游戏按钮:UIButton;
   constructor(){
      super(3);
   }
}
class ListItem_3 extends UIListItemData {
   黑色半透明背景:string;
   界面背景:string;
   背包按钮阴影:string;
   队伍编成按钮阴影:string;
   存档按钮阴影:string;
   读档按钮阴影:string;
   设置按钮阴影:string;
   返回标题按钮阴影:string;
   返回游戏按钮阴影:string;

}

/**
 * 4-背包界面 [BASE]
 */
class GUI_4 extends GUI_BASE {
   界面背景:UIBitmap;
   说明框阴影:UIBitmap;
   背包界面阴影:UIBitmap;
   货币框阴影:UIBitmap;
   背包界面背景:UIBitmap;
   list:UIList; // Item=1002
   花纹:UIBitmap;
   延长线:UIBitmap;
   背包标题:UIString;
   背包英文标题:UIString;
   说明栏背景:UIBitmap;
   itemIntroRoot:UIRoot;
   itemName:UIString;
   itemIntro:UIString;
   说明栏装饰:UIBitmap;
   货币框背景:UIBitmap;
   货币英文:UIString;
   玩家金币数:UIString;
   关闭背包界面按钮:UIButton;
   targetPanel:UIBitmap;
   队伍框背景:UIBitmap;
   actorList:UIList; // Item=1010
   closeTargetBtn:UIButton;
   constructor(){
      super(4);
   }
}
class ListItem_4 extends UIListItemData {
   界面背景:string;
   说明框阴影:string;
   背包界面阴影:string;
   货币框阴影:string;
   背包界面背景:string;
   list:UIListItemData[];
   花纹:string;
   延长线:string;
   背包标题:string;
   背包英文标题:string;
   说明栏背景:string;
   itemName:string;
   itemIntro:string;
   说明栏装饰:string;
   货币框背景:string;
   货币英文:string;
   targetPanel:string;
   队伍框背景:string;
   actorList:UIListItemData[];

}

/**
 * 5-存档界面 [BASE]
 */
class GUI_5 extends GUI_BASE {
   界面背景:UIBitmap;
   存档界面阴影:UIBitmap;
   存档界面背景:UIBitmap;
   花纹:UIBitmap;
   延长线:UIBitmap;
   存档标题:UIString;
   存档英文标题:UIString;
   list:UIList; // Item=1001
   关闭存档界面按钮:UIButton;
   constructor(){
      super(5);
   }
}
class ListItem_5 extends UIListItemData {
   界面背景:string;
   存档界面阴影:string;
   存档界面背景:string;
   花纹:string;
   延长线:string;
   存档标题:string;
   存档英文标题:string;
   list:UIListItemData[];

}

/**
 * 6-系统设置 [BASE]
 */
class GUI_6 extends GUI_BASE {
   界面背景:UIBitmap;
   设置界面阴影:UIBitmap;
   设置界面背景:UIBitmap;
   typeTab:UITabBox;
   常规:UIRoot;
   bgmFocusBtn:UIButton;
   bgsFocusBtn:UIButton;
   seFocusBtn:UIButton;
   tsFocusBtn:UIButton;
   花纹:UIBitmap;
   延长线:UIBitmap;
   设置标题:UIString;
   设置英文标题:UIString;
   bgmSlider:UISlider;
   bgsSlider:UISlider;
   seSlider:UISlider;
   tsSlider:UISlider;
   背景音乐文字:UIString;
   环境音效文字:UIString;
   音效文字:UIString;
   语音文字:UIString;
   分割线:UIBitmap;
   键盘控制:UIRoot;
   keyboardList:UIList; // Item=1018
   keyboardReset:UIButton;
   手柄控制:UIRoot;
   gamepadList:UIList; // Item=1019
   gamepadReset:UIButton;
   关闭设置界面按钮:UIButton;
   needInputKeyPanel:UIBitmap;
   needInputKeyLabel:UIString;
   constructor(){
      super(6);
   }
}
class ListItem_6 extends UIListItemData {
   界面背景:string;
   设置界面阴影:string;
   设置界面背景:string;
   typeTab:string;
   花纹:string;
   延长线:string;
   设置标题:string;
   设置英文标题:string;
   bgmSlider:number;
   bgsSlider:number;
   seSlider:number;
   tsSlider:number;
   背景音乐文字:string;
   环境音效文字:string;
   音效文字:string;
   语音文字:string;
   分割线:string;
   keyboardList:UIListItemData[];
   gamepadList:UIListItemData[];
   needInputKeyPanel:string;
   needInputKeyLabel:string;
}

/**
 * 7-文本输入界面 [BASE]
 */
class GUI_7 extends GUI_BASE {
   输入框阴影:UIBitmap;
   输入框背景:UIBitmap;
   提交按钮阴影:UIBitmap;
   提交按钮:UIButton;
   input:UIInput;
   constructor(){
      super(7);
   }
}
class ListItem_7 extends UIListItemData {
   输入框阴影:string;
   输入框背景:string;
   提交按钮阴影:string;
   input:string;
}

/**
 * 8-数字输入界面 [BASE]
 */
class GUI_8 extends GUI_BASE {
   输入框阴影:UIBitmap;
   输入框背景:UIBitmap;
   提交按钮阴影:UIBitmap;
   提交按钮:UIButton;
   input:UIInput;
   constructor(){
      super(8);
   }
}
class ListItem_8 extends UIListItemData {
   输入框阴影:string;
   输入框背景:string;
   提交按钮阴影:string;
   input:string;
}

/**
 * 9-密码输入界面 [BASE]
 */
class GUI_9 extends GUI_BASE {
   输入框阴影:UIBitmap;
   输入框背景:UIBitmap;
   提交按钮阴影:UIBitmap;
   提交按钮:UIButton;
   input:UIInput;
   constructor(){
      super(9);
   }
}
class ListItem_9 extends UIListItemData {
   输入框阴影:string;
   输入框背景:string;
   提交按钮阴影:string;
   input:string;
}

/**
 * 10-游戏结束界面 [BASE]
 */
class GUI_10 extends GUI_BASE {
   界面背景:UIBitmap;
   constructor(){
      super(10);
   }
}
class ListItem_10 extends UIListItemData {
   界面背景:string;
}

/**
 * 11-队伍编成 [BASE]
 */
class GUI_11 extends GUI_BASE {
   界面背景:UIBitmap;
   队伍列表阴影:UIBitmap;
   人物属性阴影:UIBitmap;
   配置项阴影:UIBitmap;
   说明框阴影:UIBitmap;
   actorPanel:UIBitmap;
   actorList:UIList; // Item=1004
   人物属性背景:UIBitmap;
   角色头像底衬:UIBitmap;
   角色头像虚线底衬:UIBitmap;
   actorFace:UIBitmap;
   角色头像覆盖层:UIBitmap;
   分割线:UIBitmap;
   行走图底衬:UIBitmap;
   actorName:UIString;
   属性装饰容器:UIRoot;
   点:UIBitmap;
   对应点:UIBitmap;
   等级经验容器:UIRoot;
   EXP文本:UIString;
   actorExpSlider:UISlider;
   actorExpInfo:UIString;
   actorClass:UIString;
   actorLv:UIString;
   属性显示容器:UIRoot;
   文本Label:UIRoot;
   最大生命值Label:UIString;
   最大魔法值Label:UIString;
   攻击力Label:UIString;
   防御力Label:UIString;
   魔力Label:UIString;
   魔法防御力Label:UIString;
   命中Label:UIString;
   躲避Label:UIString;
   力量Label:UIString;
   耐力Label:UIString;
   敏捷Label:UIString;
   移动力Label:UIString;
   暴击率Label:UIString;
   魔法暴击率Label:UIString;
   属性Label:UIRoot;
   maxHP:UIString;
   maxSP:UIString;
   atk:UIString;
   def:UIString;
   mag:UIString;
   magDef:UIString;
   hit:UIString;
   dod:UIString;
   pow:UIString;
   end:UIString;
   agi:UIString;
   moveGrid:UIString;
   crit:UIString;
   magCrit:UIString;
   attributeChangeBox:UIRoot;
   maxHPChange:UIString;
   maxSPChange:UIString;
   atkChange:UIString;
   defChange:UIString;
   magChange:UIString;
   magDefChange:UIString;
   hitChange:UIString;
   dodChange:UIString;
   powChange:UIString;
   endChange:UIString;
   agiChange:UIString;
   moveGridChange:UIString;
   critChange:UIString;
   magCritChange:UIString;
   花纹:UIBitmap;
   延长线:UIBitmap;
   属性标题:UIString;
   属性英文标题:UIString;
   Name文本:UIString;
   smallAvatar:UIAvatar;
   说明栏背景:UIBitmap;
   说明栏装饰:UIBitmap;
   descRoot:UIRoot;
   descName:UIString;
   descText:UIString;
   配置项背景:UIBitmap;
   配置项底衬:UIBitmap;
   关闭队伍编成界面按钮:UIButton;
   actorPanelTab:UITabBox;
   skillPanel:UIBitmap;
   技能栏:UIBitmap;
   actorSkillList:UIList; // Item=1006
   设置标题:UIString;
   设置英文标题:UIString;
   装备栏:UIBitmap;
   当前装备阴影:UIBitmap;
   actorEquipPanel:UIBitmap;
   actorEquipList:UIList; // Item=1005
   equipPackagePanel:UIBitmap;
   equipPackageList:UIList; // Item=1007
   装备标题:UIString;
   装备英文标题:UIString;
   道具栏:UIBitmap;
   持有道具阴影:UIBitmap;
   actorItemPanel:UIBitmap;
   actorItemList:UIList; // Item=1008
   itemPackagePanel:UIBitmap;
   itemPackageList:UIList; // Item=1009
   物品标题:UIString;
   物品英文标题:UIString;
   设置栏:UIBitmap;
   aiBtn:UIButton;
   ai:UICheckBox;
   dissolutionBtn:UIButton;
   解散成员装饰:UIBitmap;

   constructor(){
      super(11);
   }
}
class ListItem_11 extends UIListItemData {
   界面背景:string;
   队伍列表阴影:string;
   人物属性阴影:string;
   配置项阴影:string;
   说明框阴影:string;
   actorPanel:string;
   actorList:UIListItemData[];
   人物属性背景:string;
   角色头像底衬:string;
   角色头像虚线底衬:string;
   actorFace:string;
   角色头像覆盖层:string;
   分割线:string;
   行走图底衬:string;
   actorName:string;
   点:string;
   对应点:string;
   EXP文本:string;
   actorExpSlider:number;
   actorExpInfo:string;
   actorClass:string;
   actorLv:string;
   最大生命值Label:string;
   最大魔法值Label:string;
   攻击力Label:string;
   防御力Label:string;
   魔力Label:string;
   魔法防御力Label:string;
   命中Label:string;
   躲避Label:string;
   力量Label:string;
   耐力Label:string;
   敏捷Label:string;
   移动力Label:string;
   暴击率Label:string;
   魔法暴击率Label:string;
   maxHP:string;
   maxSP:string;
   atk:string;
   def:string;
   mag:string;
   magDef:string;
   hit:string;
   dod:string;
   pow:string;
   end:string;
   agi:string;
   moveGrid:string;
   crit:string;
   magCrit:string;
   maxHPChange:string;
   maxSPChange:string;
   atkChange:string;
   defChange:string;
   magChange:string;
   magDefChange:string;
   hitChange:string;
   dodChange:string;
   powChange:string;
   endChange:string;
   agiChange:string;
   moveGridChange:string;
   critChange:string;
   magCritChange:string;
   花纹:string;
   延长线:string;
   属性标题:string;
   属性英文标题:string;
   Name文本:string;
   smallAvatar:number;
   说明栏背景:string;
   说明栏装饰:string;
   descName:string;
   descText:string;
   配置项背景:string;
   配置项底衬:string;
   actorPanelTab:string;
   skillPanel:string;
   技能栏:string;
   actorSkillList:UIListItemData[];
   设置标题:string;
   设置英文标题:string;
   装备栏:string;
   当前装备阴影:string;
   actorEquipPanel:string;
   actorEquipList:UIListItemData[];
   equipPackagePanel:string;
   equipPackageList:UIListItemData[];
   装备标题:string;
   装备英文标题:string;
   道具栏:string;
   持有道具阴影:string;
   actorItemPanel:string;
   actorItemList:UIListItemData[];
   itemPackagePanel:string;
   itemPackageList:UIListItemData[];
   物品标题:string;
   物品英文标题:string;
   设置栏:string;
   ai:boolean;
   解散成员装饰:string;

}

/**
 * 12-商店界面 [BASE]
 */
class GUI_12 extends GUI_BASE {
   界面背景:UIBitmap;
   商店界面阴影:UIBitmap;
   说明栏阴影:UIBitmap;
   goodsListBox:UIBitmap;
   商品名称:UIString;
   商品价格:UIString;
   商品数量:UIString;
   goodsList:UIList; // Item=1003
   sellItemList:UIList; // Item=1003
   商店界面底衬:UIBitmap;
   花纹:UIBitmap;
   延长线:UIBitmap;
   分割线:UIBitmap;
   itemBox:UIBitmap;
   itemName:UIString;
   itemIntro:UIString;
   说明栏装饰:UIBitmap;
   货币栏阴影:UIBitmap;
   goldBox:UIBitmap;
   gold_sign:UIString;
   goldNum:UIString;
   buyBoxArea:UIRoot;
   交易栏阴影:UIBitmap;
   交易栏背景:UIBitmap;
   buyNum_text:UIString;
   sellNum_text:UIString;
   buyNum_text2:UIString;
   subNumBtn:UIButton;
   addNumBtn:UIButton;
   maxNumBtn:UIButton;
   购买数量背景:UIBitmap;
   buyNum:UIString;
   确定按钮阴影:UIBitmap;
   取消按钮阴影:UIBitmap;
   sureBtn:UIButton;
   cancelBtn:UIButton;
   交易栏装饰:UIBitmap;
   closeBtn:UIButton;
   typeTab:UITabBox;
   购买页容器:UIRoot;
   物品持有数量:UIString;
   商店标题:UIString;
   商店英文标题:UIString;
   出售页容器:UIRoot;
   背包标题:UIString;
   背包英文标题:UIString;
   constructor(){
      super(12);
   }
}
class ListItem_12 extends UIListItemData {
   界面背景:string;
   商店界面阴影:string;
   说明栏阴影:string;
   goodsListBox:string;
   商品名称:string;
   商品价格:string;
   商品数量:string;
   goodsList:UIListItemData[];
   sellItemList:UIListItemData[];
   商店界面底衬:string;
   花纹:string;
   延长线:string;
   分割线:string;
   itemBox:string;
   itemName:string;
   itemIntro:string;
   说明栏装饰:string;
   货币栏阴影:string;
   goldBox:string;
   gold_sign:string;
   交易栏阴影:string;
   交易栏背景:string;
   buyNum_text:string;
   sellNum_text:string;
   buyNum_text2:string;
   购买数量背景:string;
   buyNum:string;
   确定按钮阴影:string;
   取消按钮阴影:string;
   交易栏装饰:string;
   typeTab:string;
   物品持有数量:string;
   商店标题:string;
   商店英文标题:string;
   背包标题:string;
   背包英文标题:string;
}

/**
 * 13-战斗-出场准备 [BASE]
 */
class GUI_13 extends GUI_BASE {
   界面背景:UIBitmap;
   人物栏阴影:UIBitmap;
   人物栏背景:UIBitmap;
   actorList:UIList; // Item=1004
   actorInfo:GUI_BattlerBriefInfo;
   提示文本背景:UIBitmap;
   tipsLabel:UIString;
   readyBtn:UIButton;
   constructor(){
      super(13);
   }
}
class ListItem_13 extends UIListItemData {
   界面背景:string;
   人物栏阴影:string;
   人物栏背景:string;
   actorList:UIListItemData[];
   actorInfo:number;
   提示文本背景:string;
   tipsLabel:string;

}

/**
 * 14-战斗-战斗者菜单 [BASE]
 */
class GUI_14 extends GUI_BASE {
   菜单阴影:UIBitmap;
   菜单背景:UIBitmap;
   分割线:UIBitmap;
   移动按钮:UIButton;
   攻击按钮:UIButton;
   技能按钮:UIButton;
   道具按钮:UIButton;
   待机按钮:UIButton;
   状态按钮:UIButton;
   返回按钮:UIButton;

   constructor(){
      super(14);
   }
}
class ListItem_14 extends UIListItemData {
   菜单阴影:string;
   菜单背景:string;
   分割线:string;

}

/**
 * 15-战斗-通用菜单 [BASE]
 */
class GUI_15 extends GUI_BASE {
   界面背景:UIBitmap;
   索引行动者按钮:UIButton;
   胜利条件按钮:UIButton;
   结束回合按钮:UIButton;
   跳过AI结束按钮:UIButton;
   自动战斗:UIButton;
   返回按钮:UIButton;
   设置:UIButton;
   constructor(){
      super(15);
   }
}
class ListItem_15 extends UIListItemData {
   界面背景:string;

}

/**
 * 16-战斗-主界面 [BASE]
 */
class GUI_16 extends GUI_BASE {
   该文字透明度设置为1可参见说明:UIString;
   当前游戏回合测试显示:UIString;
   constructor(){
      super(16);
   }
}
class ListItem_16 extends UIListItemData {
   该文字透明度设置为1可参见说明:string;

}

/**
 * 17-战斗-技能栏 [BASE]
 */
class GUI_17 extends GUI_BASE {
   透明背景:UIBitmap;
   技能栏阴影:UIBitmap;
   说明栏阴影:UIBitmap;
   技能栏背景:UIBitmap;
   skillList:UIList; // Item=1006
   tipsUI:GUI_1027;
   关闭技能栏按钮:UIButton;
   constructor(){
      super(17);
   }
}
class ListItem_17 extends UIListItemData {
   透明背景:string;
   技能栏阴影:string;
   说明栏阴影:string;
   技能栏背景:string;
   skillList:UIListItemData[];
   tipsUI:number;

}

/**
 * 18-战斗-道具栏 [BASE]
 */
class GUI_18 extends GUI_BASE {
   透明背景:UIBitmap;
   说明栏阴影:UIBitmap;
   道具栏阴影:UIBitmap;
   道具栏背景:UIBitmap;
   itemList:UIList; // Item=1008
   tipsUI:GUI_1027;
   关闭道具栏按钮:UIButton;
   constructor(){
      super(18);
   }
}
class ListItem_18 extends UIListItemData {
   透明背景:string;
   说明栏阴影:string;
   道具栏阴影:string;
   道具栏背景:string;
   itemList:UIListItemData[];
   tipsUI:number;

}

/**
 * 19-战斗-状态栏 [BASE]
 */
class GUI_19 extends GUI_BASE {
   透明背景:UIBitmap;
   人物属性阴影:UIBitmap;
   状态阴影:UIBitmap;
   状态背景:UIBitmap;
   人物属性背景:UIBitmap;
   分割线:UIBitmap;
   角色头像底衬:UIBitmap;
   角色头像虚线底衬:UIBitmap;
   actorFace:UIBitmap;
   角色头像覆盖层:UIBitmap;
   actorName:UIString;
   等级经验容器:UIRoot;
   EXP文本:UIString;
   actorExpSlider:UISlider;
   actorExpInfo:UIString;
   actorClass:UIString;
   actorLv:UIString;
   属性显示容器:UIRoot;
   文本Label:UIRoot;
   最大生命值Label:UIString;
   最大魔法值Label:UIString;
   攻击力Label:UIString;
   防御力Label:UIString;
   魔力Label:UIString;
   魔法防御力Label:UIString;
   命中Label:UIString;
   躲避Label:UIString;
   力量Label:UIString;
   耐力Label:UIString;
   敏捷Label:UIString;
   移动力Label:UIString;
   暴击率Label:UIString;
   魔法暴击率Label:UIString;
   属性Label:UIRoot;
   maxHP:UIString;
   maxSP:UIString;
   atk:UIString;
   def:UIString;
   mag:UIString;
   magDef:UIString;
   hit:UIString;
   dod:UIString;
   pow:UIString;
   end:UIString;
   agi:UIString;
   moveGrid:UIString;
   crit:UIString;
   magCrit:UIString;
   属性装饰容器:UIRoot;
   点:UIBitmap;
   对应点:UIBitmap;
   行走图底衬:UIBitmap;
   花纹:UIBitmap;
   延长线:UIBitmap;
   属性标题:UIString;
   属性英文标题:UIString;
   smallAvatar:UIAvatar;
   Name文本:UIString;
   statusList:UIList; // Item=1028
   关闭状态栏按钮:UIButton;
   constructor(){
      super(19);
   }
}
class ListItem_19 extends UIListItemData {
   透明背景:string;
   人物属性阴影:string;
   状态阴影:string;
   状态背景:string;
   人物属性背景:string;
   分割线:string;
   角色头像底衬:string;
   角色头像虚线底衬:string;
   actorFace:string;
   角色头像覆盖层:string;
   actorName:string;
   EXP文本:string;
   actorExpSlider:number;
   actorExpInfo:string;
   actorClass:string;
   actorLv:string;
   最大生命值Label:string;
   最大魔法值Label:string;
   攻击力Label:string;
   防御力Label:string;
   魔力Label:string;
   魔法防御力Label:string;
   命中Label:string;
   躲避Label:string;
   力量Label:string;
   耐力Label:string;
   敏捷Label:string;
   移动力Label:string;
   暴击率Label:string;
   魔法暴击率Label:string;
   maxHP:string;
   maxSP:string;
   atk:string;
   def:string;
   mag:string;
   magDef:string;
   hit:string;
   dod:string;
   pow:string;
   end:string;
   agi:string;
   moveGrid:string;
   crit:string;
   magCrit:string;
   点:string;
   对应点:string;
   行走图底衬:string;
   花纹:string;
   延长线:string;
   属性标题:string;
   属性英文标题:string;
   smallAvatar:number;
   Name文本:string;
   statusList:UIListItemData[];

}

/**
 * 20-战斗-当前战斗者 [BASE]
 */
class GUI_20 extends GUI_BASE {
   actorInfo:GUI_BattlerBriefInfo;
   constructor(){
      super(20);
   }
}
class ListItem_20 extends UIListItemData {
   actorInfo:number;
}

/**
 * 21-战斗-目标战斗者 [BASE]
 */
class GUI_21 extends GUI_BASE {
   actorInfo:GUI_BattlerBriefInfo;
   constructor(){
      super(21);
   }
}
class ListItem_21 extends UIListItemData {
   actorInfo:number;
}

/**
 * 22-战斗-击杀奖励 [BASE]
 */
class GUI_22 extends GUI_BASE {
   击杀奖励背景阴影:UIBitmap;
   baseBlock:UIBitmap;
   图片:UIBitmap;
   EXPSlider:UISlider;
   getExp:UIString;
   文本:UIString;
   getGold:UIString;
   角色头像底衬:UIBitmap;
   角色头像虚线底衬:UIBitmap;
   actorFace:UIBitmap;
   角色头像覆盖层:UIBitmap;
   actorName:UIString;
   actorExp:UIString;
   lvBox:UIRoot;
   lv:UIString;
   itemBlock:UIBitmap;
   dropItemList:UIList; // Item=1029
   skillBlock:UIBitmap;
   技能背景阴影:UIBitmap;
   技能背景:UIBitmap;
   分割线:UIBitmap;
   习得技能文本:UIString;
   learnSkillList:UIList; // Item=1030
   constructor(){
      super(22);
   }
}
class ListItem_22 extends UIListItemData {
   击杀奖励背景阴影:string;
   baseBlock:string;
   图片:string;
   EXPSlider:number;
   getExp:string;
   文本:string;
   getGold:string;
   角色头像底衬:string;
   角色头像虚线底衬:string;
   actorFace:string;
   角色头像覆盖层:string;
   actorName:string;
   actorExp:string;
   lv:string;
   itemBlock:string;
   dropItemList:UIListItemData[];
   skillBlock:string;
   技能背景阴影:string;
   技能背景:string;
   分割线:string;
   习得技能文本:string;
   learnSkillList:UIListItemData[];
}

/**
 * 23-战斗：胜利 [BASE]
 */
class GUI_23 extends GUI_BASE {
   战斗胜利背景阴影:UIBitmap;
   战斗胜利背景:UIBitmap;
   战斗胜利文字:UIString;
   确定按钮:UIButton;
   constructor(){
      super(23);
   }
}
class ListItem_23 extends UIListItemData {
   战斗胜利背景阴影:string;
   战斗胜利背景:string;
   战斗胜利文字:string;

}

/**
 * 24-战斗：失败 [BASE]
 */
class GUI_24 extends GUI_BASE {
   战斗失败背景阴影:UIBitmap;
   战斗失败背景:UIBitmap;
   战斗失败文字:UIString;
   确定按钮:UIButton;
   constructor(){
      super(24);
   }
}
class ListItem_24 extends UIListItemData {
   战斗失败背景阴影:string;
   战斗失败背景:string;
   战斗失败文字:string;

}

/**
 * 25-战斗-更换朝向 [BASE]
 */
class GUI_25 extends GUI_BASE {
   上朝向按钮:UIButton;
   下朝向按钮:UIButton;
   左朝向按钮:UIButton;
   右朝向按钮:UIButton;
   constructor(){
      super(25);
   }
}
class ListItem_25 extends UIListItemData {

}

/**
 * 26-战斗-交换道具 [BASE]
 */
class GUI_26 extends GUI_BASE {
   人物信息背景阴影:UIBitmap;
   图片:UIBitmap;
   物品交换:UIString;
   actorPanel1:UIBitmap;
   角色头像底衬:UIBitmap;
   角色头像虚线底衬:UIBitmap;
   actorFace1:UIBitmap;
   角色头像覆盖层:UIBitmap;
   actorName1:UIString;
   itemPackageList1:UIList; // Item=1031
   actorPanel2:UIBitmap;
   actorFace2:UIBitmap;
   actorName2:UIString;
   itemPackageList2:UIList; // Item=1031
   closeBtn:UIButton;
   constructor(){
      super(26);
   }
}
class ListItem_26 extends UIListItemData {
   人物信息背景阴影:string;
   图片:string;
   物品交换:string;
   actorPanel1:string;
   角色头像底衬:string;
   角色头像虚线底衬:string;
   actorFace1:string;
   角色头像覆盖层:string;
   actorName1:string;
   itemPackageList1:UIListItemData[];
   actorPanel2:string;
   actorFace2:string;
   actorName2:string;
   itemPackageList2:UIListItemData[];

}

/**
 * 27- [BASE]
 */
class GUI_27 extends GUI_BASE {

   constructor(){
      super(27);
   }
}
class ListItem_27 extends UIListItemData {

}

/**
 * 28- [BASE]
 */
class GUI_28 extends GUI_BASE {

   constructor(){
      super(28);
   }
}
class ListItem_28 extends UIListItemData {

}

/**
 * 29- [BASE]
 */
class GUI_29 extends GUI_BASE {

   constructor(){
      super(29);
   }
}
class ListItem_29 extends UIListItemData {

}

/**
 * 30-虚拟按键 [BASE]
 */
class GUI_30 extends GUI_BASE {
   容器:UIRoot;
   A:UIButton;
   B:UIButton;
   START:UIButton;
   BACK:UIButton;
   rockerBg:UIBitmap;
   rocker:UIBitmap;
   dirBtnRoot:UIRoot;
   上按钮:UIButton;
   下按钮:UIButton;
   左按钮:UIButton;
   右按钮:UIButton;
   L:UIButton;
   R:UIButton;

   constructor(){
      super(30);
   }
}
class ListItem_30 extends UIListItemData {
   rockerBg:string;
   rocker:string;

}

/**
 * 1001-档案_Item [BASE]
 */
class GUI_1001 extends GUI_BASE {
   档案背景:UIBitmap;
   截图背景:UIBitmap;
   分割线:UIBitmap;
   档案排序数字:UIString;
   screenshotImg:UIBitmap;
   mapName:UIString;
   dateStr:UIString;
   no:UIString;
   delBtn:UIButton;
   gameTimeStr:UIString;
   constructor(){
      super(1001);
   }
}
class ListItem_1001 extends UIListItemData {
   档案背景:string;
   截图背景:string;
   分割线:string;
   档案排序数字:string;
   screenshotImg:string;
   mapName:string;
   dateStr:string;
   no:string;
   gameTimeStr:string;
}

/**
 * 1002-道具_Item [BASE]
 */
class GUI_1002 extends GUI_BASE {
   图片:UIBitmap;
   icon:UIBitmap;
   itemName:UIString;
   itemNum:UIString;

   constructor(){
      super(1002);
   }
}
class ListItem_1002 extends UIListItemData {
   图片:string;
   icon:string;
   itemName:string;
   itemNum:string;

}

/**
 * 1003-商品_Item [BASE]
 */
class GUI_1003 extends GUI_BASE {
   商品信息容器:UIBitmap;
   icon:UIBitmap;
   itemName:UIString;
   itemPrice:UIString;
   itemNum:UIString;
   ownNum:UIString;
   分割线:UIBitmap;
   constructor(){
      super(1003);
   }
}
class ListItem_1003 extends UIListItemData {
   商品信息容器:string;
   icon:string;
   itemName:string;
   itemPrice:string;
   itemNum:string;
   ownNum:string;
   分割线:string;
}

/**
 * 1004-角色_Item [BASE]
 */
class GUI_1004 extends GUI_BASE {
   avatarbg:UIBitmap;
   avatar:UIAvatar;
   ai:UIBitmap;
   inScene:UIBitmap;
   constructor(){
      super(1004);
   }
}
class ListItem_1004 extends UIListItemData {
   avatarbg:string;
   avatar:number;
   ai:string;
   inScene:string;
}

/**
 * 1005-角色装备_Item [BASE]
 */
class GUI_1005 extends GUI_BASE {
   装备图标背景:UIBitmap;
   icon:UIBitmap;
   constructor(){
      super(1005);
   }
}
class ListItem_1005 extends UIListItemData {
   装备图标背景:string;
   icon:string;
}

/**
 * 1006-角色技能_item [BASE]
 */
class GUI_1006 extends GUI_BASE {
   技能图标背景:UIBitmap;
   技能图标容器:UIRoot;
   icon:UIBitmap;
   constructor(){
      super(1006);
   }
}
class ListItem_1006 extends UIListItemData {
   技能图标背景:string;
   icon:string;
}

/**
 * 1007-角色待装备_Item [BASE]
 */
class GUI_1007 extends GUI_BASE {
   unequipBtn:UIBitmap;
   卸下装备文本:UIString;
   equipBox:UIBitmap;
   icon:UIBitmap;
   itemNum:UIString;
   itemName:UIString;
   分割线:UIBitmap;
   constructor(){
      super(1007);
   }
}
class ListItem_1007 extends UIListItemData {
   unequipBtn:string;
   卸下装备文本:string;
   equipBox:string;
   icon:string;
   itemNum:string;
   itemName:string;
   分割线:string;
}

/**
 * 1008-角色携带道具_Item [BASE]
 */
class GUI_1008 extends GUI_BASE {
   携带道具图标背景:UIBitmap;
   携带道具图标容器:UIRoot;
   icon:UIBitmap;
   constructor(){
      super(1008);
   }
}
class ListItem_1008 extends UIListItemData {
   携带道具图标背景:string;
   icon:string;
}

/**
 * 1009-角色待携带道具_Item [BASE]
 */
class GUI_1009 extends GUI_BASE {
   unitemBtn:UIBitmap;
   卸下道具:UIString;
   itemBox:UIBitmap;
   icon:UIBitmap;
   itemNum:UIString;
   itemName:UIString;
   图片:UIBitmap;
   constructor(){
      super(1009);
   }
}
class ListItem_1009 extends UIListItemData {
   unitemBtn:string;
   卸下道具:string;
   itemBox:string;
   icon:string;
   itemNum:string;
   itemName:string;
   图片:string;
}

/**
 * 1010-背包道具角色选择_Item [BASE]
 */
class GUI_1010 extends GUI_BASE {
   actorInfoBox:UIBitmap;
   actorFace:UIBitmap;
   hpSlider:UISlider;
   spSlider:UISlider;
   hpText:UIString;
   spText:UIString;
   actorName:UIString;
   actorLvLabel:UIString;
   actorLv:UIString;
   actorClassIcon:UIBitmap;
   constructor(){
      super(1010);
   }
}
class ListItem_1010 extends UIListItemData {
   actorInfoBox:string;
   actorFace:string;
   hpSlider:number;
   spSlider:number;
   hpText:string;
   spText:string;
   actorName:string;
   actorLvLabel:string;
   actorLv:string;
   actorClassIcon:string;
}

/**
 * 1011- [BASE]
 */
class GUI_1011 extends GUI_BASE {

   constructor(){
      super(1011);
   }
}
class ListItem_1011 extends UIListItemData {

}

/**
 * 1012- [BASE]
 */
class GUI_1012 extends GUI_BASE {

   constructor(){
      super(1012);
   }
}
class ListItem_1012 extends UIListItemData {

}

/**
 * 1013- [BASE]
 */
class GUI_1013 extends GUI_BASE {

   constructor(){
      super(1013);
   }
}
class ListItem_1013 extends UIListItemData {

}

/**
 * 1014-按钮焦点样式1 [BASE]
 */
class GUI_1014 extends GUI_BASE {
   按钮容器:UIRoot;
   target:UIBitmap;
   constructor(){
      super(1014);
   }
}
class ListItem_1014 extends UIListItemData {
   target:string;
}

/**
 * 1015-按钮焦点样式2 [BASE]
 */
class GUI_1015 extends GUI_BASE {
   按钮容器:UIRoot;
   target:UIBitmap;
   constructor(){
      super(1015);
   }
}
class ListItem_1015 extends UIListItemData {
   target:string;
}

/**
 * 1016- [BASE]
 */
class GUI_1016 extends GUI_BASE {

   constructor(){
      super(1016);
   }
}
class ListItem_1016 extends UIListItemData {

}

/**
 * 1017- [BASE]
 */
class GUI_1017 extends GUI_BASE {

   constructor(){
      super(1017);
   }
}
class ListItem_1017 extends UIListItemData {

}

/**
 * 1018-设置_Item1 [BASE]
 */
class GUI_1018 extends GUI_BASE {
   keyName:UIString;
   key1:UIButton;
   key2:UIButton;
   key3:UIButton;
   key4:UIButton;
   constructor(){
      super(1018);
   }
}
class ListItem_1018 extends UIListItemData {
   keyName:string;

}

/**
 * 1019-设置_Item2 [BASE]
 */
class GUI_1019 extends GUI_BASE {
   keyName:UIString;
   key1:UIButton;
   constructor(){
      super(1019);
   }
}
class ListItem_1019 extends UIListItemData {
   keyName:string;

}

/**
 * 1020- [BASE]
 */
class GUI_1020 extends GUI_BASE {

   constructor(){
      super(1020);
   }
}
class ListItem_1020 extends UIListItemData {

}

/**
 * 1021- [BASE]
 */
class GUI_1021 extends GUI_BASE {

   constructor(){
      super(1021);
   }
}
class ListItem_1021 extends UIListItemData {

}

/**
 * 1022-===== 战斗相关 ==== [BASE]
 */
class GUI_1022 extends GUI_BASE {

   constructor(){
      super(1022);
   }
}
class ListItem_1022 extends UIListItemData {

}

/**
 * 1023-我方战斗阶段显示 [BASE]
 */
class GUI_1023 extends GUI_BASE {
   界面背景:UIBitmap;
   battleStageLabel:UIString;
   装饰背景:UIBitmap;
   battleStageLabel2:UIString;
   battleStageLabel3:UIString;
   当前回合数:UIString;
   constructor(){
      super(1023);
   }
}
class ListItem_1023 extends UIListItemData {
   界面背景:string;
   battleStageLabel:string;
   装饰背景:string;
   battleStageLabel2:string;
   battleStageLabel3:string;

}

/**
 * 1024-敌方战斗阶段显示 [BASE]
 */
class GUI_1024 extends GUI_BASE {
   界面背景:UIBitmap;
   battleStageLabel:UIString;
   装饰背景:UIBitmap;
   battleStageLabel2:UIString;
   battleStageLabel3:UIString;
   当前回合数:UIString;
   constructor(){
      super(1024);
   }
}
class ListItem_1024 extends UIListItemData {
   界面背景:string;
   battleStageLabel:string;
   装饰背景:string;
   battleStageLabel2:string;
   battleStageLabel3:string;

}

/**
 * 1025-战斗人物头像 [BASE]
 */
class GUI_1025 extends GUI_BASE {
   人物信息背景阴影:UIBitmap;
   人物信息背景:UIBitmap;
   角色头像底衬:UIBitmap;
   角色头像虚线底衬:UIBitmap;
   actorFace:UIBitmap;
   角色头像覆盖层:UIBitmap;
   分割线:UIBitmap;
   actorInfoBox:UIBitmap;
   hpSlider:UISlider;
   spSlider:UISlider;
   hpText:UIString;
   spText:UIString;
   actorName:UIString;
   statusList:UIList; // Item=1026
   actorLvLabel:UIString;
   actorLv:UIString;
   actorClassIcon:UIBitmap;
   actorClassName:UIString;
   deadSign:UIString;
   actorCamp:UICheckBox;
   Name文本:UIString;
   constructor(){
      super(1025);
   }
}
class ListItem_1025 extends UIListItemData {
   人物信息背景阴影:string;
   人物信息背景:string;
   角色头像底衬:string;
   角色头像虚线底衬:string;
   actorFace:string;
   角色头像覆盖层:string;
   分割线:string;
   actorInfoBox:string;
   hpSlider:number;
   spSlider:number;
   hpText:string;
   spText:string;
   actorName:string;
   statusList:UIListItemData[];
   actorLvLabel:string;
   actorLv:string;
   actorClassIcon:string;
   actorClassName:string;
   deadSign:string;
   actorCamp:boolean;
   Name文本:string;
}

/**
 * 1026-战斗人物头像状态_Item [BASE]
 */
class GUI_1026 extends GUI_BASE {
   icon:UIBitmap;
   layer:UIString;
   constructor(){
      super(1026);
   }
}
class ListItem_1026 extends UIListItemData {
   icon:string;
   layer:string;
}

/**
 * 1027-战斗：说明栏 [BASE]
 */
class GUI_1027 extends GUI_BASE {
   说明栏背景:UIBitmap;
   descName:UIString;
   descTextBox:UIRoot;
   descText:UIString;
   cdBox:UIRoot;
   cdTextLabel:UIString;
   cdSlider:UISlider;
   cdText:UIString;
   说明栏装饰:UIBitmap;
   constructor(){
      super(1027);
   }
}
class ListItem_1027 extends UIListItemData {
   说明栏背景:string;
   descName:string;
   descText:string;
   cdTextLabel:string;
   cdSlider:number;
   cdText:string;
   说明栏装饰:string;
}

/**
 * 1028-战斗状态栏的状态_Item [BASE]
 */
class GUI_1028 extends GUI_BASE {
   icon:UIBitmap;
   tipsLabel:UIString;
   constructor(){
      super(1028);
   }
}
class ListItem_1028 extends UIListItemData {
   icon:string;
   tipsLabel:string;
}

/**
 * 1029-战斗掉落物品_Item [BASE]
 */
class GUI_1029 extends GUI_BASE {
   icon:UIBitmap;
   itemNum:UIString;
   itemNumLabel:UIString;
   itemName:UIString;
   constructor(){
      super(1029);
   }
}
class ListItem_1029 extends UIListItemData {
   icon:string;
   itemNum:string;
   itemNumLabel:string;
   itemName:string;
}

/**
 * 1030-升级习得技能_Item [BASE]
 */
class GUI_1030 extends GUI_BASE {
   icon:UIBitmap;
   constructor(){
      super(1030);
   }
}
class ListItem_1030 extends UIListItemData {
   icon:string;
}

/**
 * 1031-战斗-交换道具_Item [BASE]
 */
class GUI_1031 extends GUI_BASE {
   itemBox:UIBitmap;
   icon:UIBitmap;
   itemName:UIString;
   图片:UIBitmap;
   constructor(){
      super(1031);
   }
}
class ListItem_1031 extends UIListItemData {
   itemBox:string;
   icon:string;
   itemName:string;
   图片:string;
}

/**
 * 1032- [BASE]
 */
class GUI_1032 extends GUI_BASE {

   constructor(){
      super(1032);
   }
}
class ListItem_1032 extends UIListItemData {

}

/**
 * 1033- [BASE]
 */
class GUI_1033 extends GUI_BASE {

   constructor(){
      super(1033);
   }
}
class ListItem_1033 extends UIListItemData {

}

/**
 * 1034- [BASE]
 */
class GUI_1034 extends GUI_BASE {

   constructor(){
      super(1034);
   }
}
class ListItem_1034 extends UIListItemData {

}

/**
 * 1035- [BASE]
 */
class GUI_1035 extends GUI_BASE {

   constructor(){
      super(1035);
   }
}
class ListItem_1035 extends UIListItemData {

}

/**
 * 1036- [BASE]
 */
class GUI_1036 extends GUI_BASE {

   constructor(){
      super(1036);
   }
}
class ListItem_1036 extends UIListItemData {

}

/**
 * 1037- [BASE]
 */
class GUI_1037 extends GUI_BASE {

   constructor(){
      super(1037);
   }
}
class ListItem_1037 extends UIListItemData {

}

/**
 * 1038- [BASE]
 */
class GUI_1038 extends GUI_BASE {

   constructor(){
      super(1038);
   }
}
class ListItem_1038 extends UIListItemData {

}

/**
 * 1039- [BASE]
 */
class GUI_1039 extends GUI_BASE {

   constructor(){
      super(1039);
   }
}
class ListItem_1039 extends UIListItemData {

}

/**
 * 1040-===== 伤害显示 ==== [BASE]
 */
class GUI_1040 extends GUI_BASE {

   constructor(){
      super(1040);
   }
}
class ListItem_1040 extends UIListItemData {

}

/**
 * 1041-miss显示 [BASE]
 */
class GUI_1041 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   targetLabel:UIString;
   constructor(){
      super(1041);
   }
}
class ListItem_1041 extends UIListItemData {
   targetLabel:string;
}

/**
 * 1042-物理伤害数字显示 [BASE]
 */
class GUI_1042 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1042);
   }
}
class ListItem_1042 extends UIListItemData {
   damage:string;
}

/**
 * 1043-魔法伤害数字显示 [BASE]
 */
class GUI_1043 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1043);
   }
}
class ListItem_1043 extends UIListItemData {
   damage:string;
}

/**
 * 1044-真实伤害数字显示 [BASE]
 */
class GUI_1044 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1044);
   }
}
class ListItem_1044 extends UIListItemData {
   damage:string;
}

/**
 * 1045-恢复生命值数字显示 [BASE]
 */
class GUI_1045 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1045);
   }
}
class ListItem_1045 extends UIListItemData {
   damage:string;
}

/**
 * 1046-恢复魔法值数值显示 [BASE]
 */
class GUI_1046 extends GUI_BASE {
   容器:UIRoot;
   target:UIRoot;
   damage:UIString;
   constructor(){
      super(1046);
   }
}
class ListItem_1046 extends UIListItemData {
   damage:string;
}

/**
 * 1047- [BASE]
 */
class GUI_1047 extends GUI_BASE {

   constructor(){
      super(1047);
   }
}
class ListItem_1047 extends UIListItemData {

}

/**
 * 1048- [BASE]
 */
class GUI_1048 extends GUI_BASE {

   constructor(){
      super(1048);
   }
}
class ListItem_1048 extends UIListItemData {

}

/**
 * 1049- [BASE]
 */
class GUI_1049 extends GUI_BASE {

   constructor(){
      super(1049);
   }
}
class ListItem_1049 extends UIListItemData {

}

/**
 * 1050- [BASE]
 */
class GUI_1050 extends GUI_BASE {

   constructor(){
      super(1050);
   }
}
class ListItem_1050 extends UIListItemData {

}

/**
 * 2001-启动载入界面 [BASE]
 */
class GUI_2001 extends GUI_BASE {
   loadingComp:UISlider;
   加载动画:UIAnimation;
   constructor(){
      super(2001);
   }
}
class ListItem_2001 extends UIListItemData {
   loadingComp:number;
   加载动画:number;
}

/**
 * 2002-新游戏载入界面 [BASE]
 */
class GUI_2002 extends GUI_BASE {
   载入界面背景:UIBitmap;
   constructor(){
      super(2002);
   }
}
class ListItem_2002 extends UIListItemData {
   载入界面背景:string;
}

/**
 * 2003-读档载入界面 [BASE]
 */
class GUI_2003 extends GUI_BASE {
   载入界面背景:UIBitmap;
   constructor(){
      super(2003);
   }
}
class ListItem_2003 extends UIListItemData {
   载入界面背景:string;
}

/**
 * 2004-场景载入界面 [BASE]
 */
class GUI_2004 extends GUI_BASE {
   载入界面背景:UIBitmap;
   constructor(){
      super(2004);
   }
}
class ListItem_2004 extends UIListItemData {
   载入界面背景:string;
}

/**
 * 2005-进入战斗时界面 [BASE]
 */
class GUI_2005 extends GUI_BASE {
   进入战斗背景:UIBitmap;
   constructor(){
      super(2005);
   }
}
class ListItem_2005 extends UIListItemData {
   进入战斗背景:string;
}

/**
 * 3001-我的自定义界面 [BASE]
 */
class GUI_3001 extends GUI_BASE {
   图片:UIBitmap;
   文本:UIString;
   按钮:UIButton;
   constructor(){
      super(3001);
   }
}
class ListItem_3001 extends UIListItemData {
   图片:string;
   文本:string;

}

/**
 * 3002- [BASE]
 */
class GUI_3002 extends GUI_BASE {

   constructor(){
      super(3002);
   }
}
class ListItem_3002 extends UIListItemData {

}
GameUI["__compCustomAttributes"] = {"UIRoot":["enabledLimitView","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","slowmotionType","enabledWheel","hScrollValue","vScrollValue"],"UIButton":["label","image1","grid9img1","image2","grid9img2","image3","grid9img3","fontSize","color","overColor","clickColor","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textDy","textStroke","textStrokeColor"],"UIBitmap":["image","grid9","flip","pivotType"],"UIString":["text","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UIVariable":["varID","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor","onChangeFragEvent"],"UICustomGameNumber":["customData","previewNum","previewFixed","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UICustomGameString":["customData","inEditorText","fontSize","color","bold","italic","smooth","align","valign","leading","letterSpacing","font","wordWrap","overflow","shadowEnabled","shadowColor","shadowDx","shadowDy","stroke","strokeColor"],"UIAvatar":["avatarID","scaleNumberX","scaleNumberY","orientationIndex","avatarFPS","playOnce","isPlay","avatarFrame","actionID","avatarHue"],"UIStandAvatar":["avatarID","actionID","scaleNumberX","scaleNumberY","flip","playOnce","isPlay","avatarFrame","avatarFPS","avatarHue"],"UIAnimation":["animationID","scaleNumberX","scaleNumberY","aniFrame","playFps","playType","showHitEffect","silentMode"],"UIInput":["text","fontSize","color","prompt","promptColor","bold","italic","smooth","align","leading","font","wordWrap","restrict","inputMode","maxChars","shadowEnabled","shadowColor","shadowDx","shadowDy","onInputFragEvent","onEnterFragEvent"],"UICheckBox":["selected","image1","grid9img1","image2","grid9img2","onChangeFragEvent"],"UISwitch":["selected","image1","grid9img1","image2","grid9img2","previewselected","onChangeFragEvent"],"UITabBox":["selectedIndex","itemImage1","grid9img1","itemImage2","grid9img2","itemWidth","itemHeight","items","rowMode","spacing","labelSize","labelColor","labelFont","labelBold","labelItalic","smooth","labelAlign","labelValign","labelLetterSpacing","labelSelectedColor","labelDx","labelDy","labelStroke","labelStrokeColor","onChangeFragEvent"],"UISlider":["image1","bgGrid9","image2","blockGrid9","image3","blockFillGrid9","step","min","max","value","transverseMode","blockFillMode","blockPosMode","fillStrething","isBindingVarID","bindingVarID","onChangeFragEvent"],"UIGUI":["guiID","instanceClassName"],"UIList":["itemModelGUI","previewSize","selectEnable","repeatX","itemWidth","itemHeight","spaceX","spaceY","scrollShowType","hScrollBar","hScrollBg","vScrollBar","vScrollBg","scrollWidth","selectImageURL","selectImageGrid9","selectedImageAlpha","selectedImageOnTop","overImageURL","overImageGrid9","overImageAlpha","overImageOnTop","overSelectMode","slowmotionType"],"UIComboBox":["itemLabels","selectedIndex","bgSkin","bgGrid9","fontSize","color","bold","italic","smooth","align","valign","letterSpacing","font","textDx","textStroke","textStrokeColor","displayItemSize","listScrollBg","listScrollBar","listAlpha","listBgColor","itemHeight","itemFontSize","itemColor","itemBold","itemItalic","itemAlign","itemValign","itemLetterSpacing","itemFont","itemOverColor","itemOverBgColor","itemTextDx","itemTextDy","itemTextStroke","itemTextStrokeColor","onChangeFragEvent"],"UIVideo":["videoURL","playType","volume","playbackRate","currentTime","muted","loop","pivotType","flip","onLoadedFragEvent","onErrorFragEvent","onCompleteFragEvent"]};
