describe("Mark Controller", function() {
  var rootScope, scope, ctrl;

  beforeEach(module("vde"));
  beforeEach(inject(function($rootScope, $controller) {
    rootScope = $rootScope.$new();
    rootScope.toggleVisual = jasmine.createSpy();
    scope = rootScope.$new();
    scope.gMdl = {};
    scope.mark = {pipelineName: 'pipeline name'}
    ctrl = $controller("MarkCtrl", {
      $rootScope: rootScope,
      $scope: scope
    });
  }));

  it('should set the current active pipeline anf toggle visual on click', function() {
    var mark = {isMark: true};
    scope.click(mark);

    expect(rootScope.toggleVisual).toHaveBeenCalledWith(mark);
    expect(scope.gMdl.activeVisualPipeline).toBe("pipeline name");
  });

  it('should watch for pipeline changes', function() {
    scope.markName = 'mark';
    scope.group = {marks: {mark: {
      pipelineName: 'pipeline 1',
      group: function() { return scope.group; },
      pipeline: function() { return 'pipeline'; }
    }}};
    scope.$digest();

    expect(scope.mark).toBe(scope.group.marks.mark);
    expect(scope.pipeline).toBe('pipeline');
  });
});