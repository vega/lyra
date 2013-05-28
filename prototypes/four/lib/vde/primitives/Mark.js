vde.primitives.Mark = (function() {
    var mark = function(name) {
        vde.Primitive.call(this, name);

        this.spec.from = null;

        this.spec.properties = {
            enter:  {},
            update: {},
            hover:  {}
        };

        this.fullClass = 'vde.primitives.Mark';

        return this;
    };

    mark.prototype = new vde.Primitive();
    var prototype = mark.prototype;

    prototype.getClass = function(full) { return full ? this.fullClass : this.spec.type.charAt(0).toUpperCase() + this.spec.type.slice(1);} 

    prototype.init = function() {
        if(!this.group) {
            this.group = new vde.primitives.marks.Group("group_" + Date.now());
            this.group.init();
        }

        this.group.marks[this.getName()] = this;

        return this;
    };

    prototype.enter = function(k, v) {
        return this.prop('enter', k, v);
    };

    prototype.update = function(k, v) {
        return this.prop('update', k, v);
    };

    prototype.hover = function(k, v) {
        return this.prop('hover', k, v);
    };

    prototype.prop = function(type, k, v) {
        if(!v) return this.spec.properties[type][k];

        this.spec.properties[type][k] = v;
        return this;
    };

    prototype.getDef = function() {
        var path = [], p = this,
            defs = vde.view.model().defs(),
            d = defs.marks;

        while(p) {
            path.push(p.getName());
            p = p.group;
        }

        var findMarkDef = function(def, name) {
            if(def.name == name)
                return def;

            for(var i = 0; i < def.marks.length; i++) {
                if(def.marks[i].name == name)
                    return def.marks[i];
            }

            return null;
        } 
        
        while(p = path.pop()) {
            if(d.name == p)
                continue;

            d = findMarkDef(d, p);
            if(!d)
                return null;
        }

        return d;
    };

    prototype.updateProps = function() {
        var def  = this.getDef(),
            spec = this.getSpec();

        def.properties.enter  = vg.parse.properties(spec.properties.enter);
        def.properties.update = vg.parse.properties(spec.properties.update);
    };

    return mark;
})();