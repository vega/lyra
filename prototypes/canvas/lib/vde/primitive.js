vde.primitive = function(panel, toolbar) {
    this.panel = panel;   // The UI panel this primitive is a part of
    this.toolbar = (toolbar || toolbar == null) ? true : false;

    return this;
};

// Called when a primitive is dropped onto a panel. So, here, we want
// to instantiate our primitive, and then add it (and any dependencies)
// to the panel's spec
vde.primitive.prototype.init = function() {
    this.spec();
    return this;
};

vde.primitive.prototype.spec = function() { console.log('spec'); return null; }

vde.primitive.prototype.prop = function(k, v) {
    var spec = this.spec();
    if(v) {
        if(v instanceof Object) {
            spec[k] || (spec[k] = {});
            for(var k1 in v) spec[k][k1] = v[k1];
        } else {
            spec[k] = v;
        }

        return this;
    } else {
        return spec[k];
    }
};

vde.primitive.prototype.toolbarDragStart = function(e) {
    return false;
};

vde.primitive.prototype.toolbarDragEnd = function(e) {
    return false;
};

vde.primitive.prototype.toolbarDrop = function(e) {
    return false;
};