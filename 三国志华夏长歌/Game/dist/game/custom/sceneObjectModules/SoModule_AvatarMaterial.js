














var SoModule_AvatarMaterial = (function (_super) {
    __extends(SoModule_AvatarMaterial, _super);
    function SoModule_AvatarMaterial(installCB) {
        var _this = _super.call(this, installCB) || this;
        for (var i = 0; i < _this.materialData.length; i++) {
            var materials = _this.materialData[i].materials;
            for (var s = 0; s < materials.length; s++) {
                _this.so.avatar.addMaterial(materials[s]);
            }
        }
        return _this;
    }
    SoModule_AvatarMaterial.prototype.onRemoved = function () {
        for (var i = 0; i < this.materialData.length; i++) {
            var materials = this.materialData[i].materials;
            for (var s = 0; s < materials.length; s++) {
                this.so.avatar.removeMaterial(materials[s]);
            }
        }
    };
    SoModule_AvatarMaterial.prototype.refresh = function () {
    };
    return SoModule_AvatarMaterial;
}(SceneObjectModule_2));
//# sourceMappingURL=SoModule_AvatarMaterial.js.map