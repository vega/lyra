var vde = {
    version: '0.0.1',
    libs: ['spec'],
    primitives: ['rect', 'arc', 'axis']
};

vde.init = function() {
    // vde.loadLibs();
    this.loadTemplate('bin/vgd3.js.template');
    this.ui.init();
}

vde.loadLibs = function() {
    var head = d3.select('head');
    vde.libs.forEach(function(lib) {
        head.append('script').attr('src', 'lib/vde/'+lib+'.js');
    });
}

vde.loadTemplate = function(uri) {
    d3.xhr(uri, function(error, response) {
        this.template = response.responseText;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    vde.init.call(vde);
}); 