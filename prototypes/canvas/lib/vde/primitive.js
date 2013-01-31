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

vde.primitive.prototype.prop = function(k, v) {
    var spec = this.spec();
    if(v) {
        spec[k] = v;
        return this;
    } else {
        return spec[k];
    }
};

vde.primitive.prototype.enter = function(props) {
    var enter = this.prop('enter');
    for(var k in props) enter[k] = props[k];

    return this;
};

vde.primitive.prototype.update = function(props) {
    var enter = this.prop('update');
    for(var k in props) enter[k] = props[k];

    return this;
};