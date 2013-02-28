vde.primitives.marks.Group = (function() {
    var group = function(name) {
        vde.primitives.Mark.call(this, name);

        this.spec.type = 'group';

        this.scales = [];
        this.axes   = [];
        this.marks  = [];

        return this;
    };

    group.prototype = new vde.primitives.Mark();
    var prototype = group.prototype;



  return group;
})();