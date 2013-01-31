vde.ui = {
    panels: []
};

vde.ui.init = function() {
    // Load a default panel if we've not imported others
    if(this.panels.length == 0)  
        this.panels.push(new this.panel(this.panels.length));
};