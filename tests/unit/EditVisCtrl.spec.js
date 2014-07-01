describe("Edit Visualization Controller", function() {
	var Vis, scope, ctrl;
	beforeEach(function() {
		module('vde');
	});

	beforeEach(inject(function($rootScope, $controller) {
		Vis = {properties:{isProperties:true}};
		scope = $rootScope.$new();

		ctrl = $controller('EditVisCtrl', {
			Vis: Vis,
			$scope: scope
		});
	}));

	it('should have the Vis properties', function() {
		expect(scope.vis).toBe(Vis.properties);
	});

});