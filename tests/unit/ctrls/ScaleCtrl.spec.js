describe('Scale Controller', function() {
  var rootScope, scope, Vis, ctrl;
  beforeEach(module('vde'));

  beforeEach(inject(function($rootScope, $q, $controller) {
    rootScope = $rootScope.$new();
    rootScope.editBinding = jasmine.createSpy();

    scope = rootScope.$new();
    Vis = jasmine.createSpyObj('Vis', ['parse']);
    Vis.parse.and.returnValue($q.when());

    ctrl = $controller('ScaleCtrl', {
      $rootScope: rootScope,
      $scope: scope,
      Vis: Vis
    });
  }));

  it('should not delete scales in use', function() {
    rootScope.activeScale = {used: true};

    scope.deleteScale();

    expect(Vis.parse).not.toHaveBeenCalled();

    rootScope.activeScale = {manual: false};

    scope.deleteScale();

    expect(Vis.parse).not.toHaveBeenCalled();
  });

  it('should delete scales', function() {
    rootScope.activeScale = {manual: true};

    scope.deleteScale();

    scope.$digest();
    expect(Vis.parse).toHaveBeenCalled();
    expect(rootScope.editBinding).toHaveBeenCalled();
  });
});