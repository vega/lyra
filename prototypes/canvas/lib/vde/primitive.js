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

vde.primitive.prototype.update = function() {
    return false;
};

vde.primitive.prototype.spec = function() { console.log('spec'); return null; }

vde.primitive.prototype.prop = function(k, v) {
    var spec = this.spec();
    if(v) {
        var propRecurse = function(keys, value) {
            if(value instanceof Object) {
                for(var k1 in value) {
                    keys.push(k1);
                    propRecurse(keys, value[k1]);
                    keys.pop();
                }
            } else {
                var s = spec;
                keys.some(function(k, i){
                    if(i == keys.length-1)
                        return;
                    s = s[k] || (s[k] = {});
                });
                s[keys[keys.length-1]] = value;
            }
        };

        propRecurse([k], v);

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

vde.primitive.prototype.visMouseOver = function(e) {
    return false;
};

vde.primitive.prototype.visMouseOut = function(e) {
    return false;
};

vde.primitive.prototype.visMouseDown = function(e) {
    return false;
};

vde.primitive.prototype.visMouseUp = function(e) {
    return false;
};

vde.primitive.prototype.visMouseMove = function(e) {
    return false;
};

vde.primitive.prototype.visClick = function(e) {
    return false;
};

vde.primitive.prototype.visDragStart = function(e) {
    return false;
};

vde.primitive.prototype.visDragEnd = function(e) {
    return false;
};

vde.primitive.prototype.visDrop = function(e) {
    return false;
};