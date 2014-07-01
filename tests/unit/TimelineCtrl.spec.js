describe("TimelineCtrl", function() {
  var timeout, scope, rootScope, window, timeline, ctrl;
  beforeEach(module("vde"));

  beforeEach(inject(function($rootScope, $timeout, $controller, $q) {
    timeout = $timeout;
    rootScope = $rootScope.$new();
    scope = rootScope.$new();

    window = jasmine.createSpyObj('window', ['addEventListener']);
    timeline = jasmine.createSpyObj('timeline', ['undo', 'redo', 'files']);
    timeline.files.and.returnValue({
      getAll:function() {
        return $q.when([{fileName:'file'}]);
      }
    });

    ctrl = $controller('TimelineCtrl', {
      $scope: scope,
      $rootScope: rootScope,
      $window: window,
      timeline: timeline,
      $timeout: timeout
    });
  }));

  describe('Undo/Redo', function() {
    it('should undo', function() {
      scope.undo();
      expect(timeline.undo).toHaveBeenCalled();
    });

    it('should redo', function() {
      scope.redo();
      expect(timeline.redo).toHaveBeenCalled();
    });
  });
});