














var MaterialData = (function () {
    function MaterialData() {
        this.____timeInfo = {};
    }
    return MaterialData;
}());
var MaterialData1 = (function (_super) {
    __extends(MaterialData1, _super);
    function MaterialData1() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 1;
        _this.r = 0;
        _this.g = 0;
        _this.b = 0;
        _this.gray = 0;
        _this.mr = 1;
        _this.mg = 1;
        _this.mb = 1;
        _this.useTime = false;
        _this.time = "";
        return _this;
    }
    return MaterialData1;
}(MaterialData));
var MaterialData2 = (function (_super) {
    __extends(MaterialData2, _super);
    function MaterialData2() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 2;
        _this.hue = 0;
        return _this;
    }
    return MaterialData2;
}(MaterialData));
var MaterialData3 = (function (_super) {
    __extends(MaterialData3, _super);
    function MaterialData3() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 3;
        _this.strength = 0;
        _this.useTime = false;
        _this.time = "";
        return _this;
    }
    return MaterialData3;
}(MaterialData));
var MaterialData4 = (function (_super) {
    __extends(MaterialData4, _super);
    function MaterialData4() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 4;
        _this.color = "#00FF00";
        _this.blur = 2;
        _this.offsetX = 0;
        _this.offsetY = 0;
        return _this;
    }
    return MaterialData4;
}(MaterialData));
var MaterialData5 = (function (_super) {
    __extends(MaterialData5, _super);
    function MaterialData5() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 5;
        _this.useTrans = false;
        _this.sigma = 0.2;
        _this.trans = "";
        _this.aspect = 1.7;
        return _this;
    }
    return MaterialData5;
}(MaterialData));
var MaterialData6 = (function (_super) {
    __extends(MaterialData6, _super);
    function MaterialData6() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 6;
        _this.useTrans = false;
        _this.time = 0;
        _this.trans = "";
        _this.useTrans1 = false;
        _this.sigma = 0.2;
        _this.trans1 = "";
        _this.useTrans2 = false;
        _this.strength = 0.02;
        _this.trans2 = "";
        _this.aspect = 1.7;
        return _this;
    }
    return MaterialData6;
}(MaterialData));
var MaterialData7 = (function (_super) {
    __extends(MaterialData7, _super);
    function MaterialData7() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 7;
        _this.tex2 = "";
        _this.useTrans = false;
        _this.time = 1;
        _this.trans = "";
        return _this;
    }
    return MaterialData7;
}(MaterialData));
var MaterialData8 = (function (_super) {
    __extends(MaterialData8, _super);
    function MaterialData8() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 8;
        _this.useTrans = false;
        _this.time = 0;
        _this.trans = "";
        _this.zoom = 0.5;
        _this.multiplier = 0.5;
        _this.centerX = 0.5;
        _this.centerY = 0.5;
        return _this;
    }
    return MaterialData8;
}(MaterialData));
var MaterialData9 = (function (_super) {
    __extends(MaterialData9, _super);
    function MaterialData9() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 9;
        _this.tex2 = "";
        _this.useTrans = false;
        _this.time = 0;
        _this.trans = "";
        return _this;
    }
    return MaterialData9;
}(MaterialData));
var MaterialData10 = (function (_super) {
    __extends(MaterialData10, _super);
    function MaterialData10() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 10;
        _this.mask = "";
        _this.useTrans = false;
        _this.time = 0;
        _this.trans = "";
        _this.vagueness = 0.25;
        _this.invertMask = 0;
        return _this;
    }
    return MaterialData10;
}(MaterialData));
var MaterialData11 = (function (_super) {
    __extends(MaterialData11, _super);
    function MaterialData11() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 11;
        _this.tex2 = "";
        _this.useTrans = false;
        _this.time = 0;
        _this.trans = "";
        _this.colorMulR = 1;
        _this.colorMulG = 1;
        _this.colorMulB = 1;
        _this.colorMulA = 1;
        _this.colorAddR = 0;
        _this.colorAddG = 0;
        _this.colorAddB = 0;
        _this.colorAddA = 0;
        _this.invertMask = 0;
        _this.alphaFactor = 0;
        return _this;
    }
    return MaterialData11;
}(MaterialData));
var MaterialData12 = (function (_super) {
    __extends(MaterialData12, _super);
    function MaterialData12() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 12;
        _this.useTrans = false;
        _this.trans = "";
        _this.pixelSize = 64;
        return _this;
    }
    return MaterialData12;
}(MaterialData));
var MaterialData13 = (function (_super) {
    __extends(MaterialData13, _super);
    function MaterialData13() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 13;
        _this.t = "";
        _this.amplitude = 0.3;
        _this.angularVelocity = 10;
        _this.speed = 10;
        return _this;
    }
    return MaterialData13;
}(MaterialData));
var MaterialData14 = (function (_super) {
    __extends(MaterialData14, _super);
    function MaterialData14() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 14;
        _this.t = "";
        _this.timeScale = 1;
        return _this;
    }
    return MaterialData14;
}(MaterialData));
var MaterialData15 = (function (_super) {
    __extends(MaterialData15, _super);
    function MaterialData15() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 15;
        _this.tex2 = "";
        _this.uvScale = 1;
        _this.noiseTimeScale = 1;
        _this.t = "";
        return _this;
    }
    return MaterialData15;
}(MaterialData));
var MaterialData16 = (function (_super) {
    __extends(MaterialData16, _super);
    function MaterialData16() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 16;
        _this.tex2 = "";
        _this.t = "";
        _this.dissolveSpeed = 1;
        _this.edgeWidth = 1;
        _this.edgeColorR = 1;
        _this.edgeColorG = 1;
        _this.edgeColorB = 1;
        _this.edgeColorA = 1;
        _this.startTime = 0;
        return _this;
    }
    return MaterialData16;
}(MaterialData));
var MaterialData17 = (function (_super) {
    __extends(MaterialData17, _super);
    function MaterialData17() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = 17;
        _this.lineColorR = 0;
        _this.lineColorG = 0;
        _this.lineColorB = 0;
        _this.lineColorA = 0;
        _this.lineWidth = 0.1;
        _this.rangeX = "";
        return _this;
    }
    return MaterialData17;
}(MaterialData));
//# sourceMappingURL=MaterialRuntime.js.map