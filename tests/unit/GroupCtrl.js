describe("Group Controller", function() {
	var scope, Vis, rootScope, ctrl;
	beforeEach(module("vde"));

	beforeEach(inject(function($rootScope, $controller) {
		rootScope = $rootScope.$new();
		scope = rootScope.$new();

		scope.layerName = 'layer';

		rootScope.activeVisual = {name: "activeVisual"};
		rootScope.activeGroup = {name: "activeGroup"};
		rootScope.activeLayer = {name: "activeLayer"};
		Vis = {groups:{}};

		ctrl = $controller("GroupCtrl", {
			$rootScope: rootScope,
			$scope: scope,
			Vis: Vis
		});
	}));

	it('should update boundExtents on activeVisual change', function() {
		scope.boundExtents = {old:true};
		rootScope.activeVisual = {name:"differentVisual"};
		rootScope.$digest();
		expect(scope.boundExtents).toEqual({});
	});

	it('should update boundExtents on activeGroup change', function() {
		scope.boundExtents = {old:true};
		rootScope.activeGroup = {name:"differentGroup"};
		rootScope.$digest();
		expect(scope.boundExtents).toEqual({});
	});

	it('should update boundExtents on activeLayer change', function() {
		scope.boundExtents = {old:true};
		rootScope.activeLayer = {name:"differentLayer"};
		rootScope.$digest();
		expect(scope.boundExtents).toEqual({});
	});
});