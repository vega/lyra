describe('Vde Controller', function() {
  var scope, rootScope, window, timeout, location, http,
      timeline, Vis, iVis, vg, ctrl;

  beforeEach(module('vde'));

  beforeEach(inject(function($rootScope, $timeout, $controller, $httpBackend, $q, vg) {
    test_util.jasmineMatchers();
    rootScope = $rootScope.$new();
    scope = rootScope.$new();
    window = jasmine.createSpyObj('window', ['addEventListener']);
    timeout = $timeout;
    location = jasmine.createSpyObj('location', ['search']);
    location.search.and.returnValue({search:'search string'})
    http = $httpBackend;
    timeline = jasmine.createSpyObj('timeline', ['save']);
    Vis = jasmine.createSpyObj('Vis', ['data', 'parse', 'Pipeline']);
    Vis.parse.and.returnValue($q.when());
    Vis._rawData = {};
    Vis.marks = {Group: jasmine.createSpy()};

    ctrl = $controller('VdeCtrl', {
      $scope: scope,
      $rootScope: rootScope,
      $window: window,
      $timeout: timeout,
      $location: location,
      $http: http,
      timeline: timeline,
      Vis: Vis,
      iVis: iVis,
      vg: vg
    });
  }));

  describe('load', function() {
    beforeEach(function() {
      scope.load();
      timeout.flush();
      scope.$digest();
    });

    it('should load data', function() {
      expect(Vis.data).toHaveBeenCalled();
    });

    it('should save the timeline', function() {
      expect(timeline.save).toHaveBeenCalled();
    });

    it('should initialize the active* properties', function() {
      expect(rootScope.activeGroup).toBeTruthy();
      expect(rootScope.activeLayer).toBeTruthy();
      expect(rootScope.activePipeline).toBeTruthy();
    });
  });
});