//These services exist so that Angular code does not need to access
//globals. Now, they ask for these to be injected. That way, these 
//can be replaced with mocks if necessary.

vde.App.factory('Vis', function() {
	return vde.Vis;
});

vde.App.factory('vg', function() {
	return vg;
});

vde.App.factory('iVis', function() {
	return vde.iVis;
});