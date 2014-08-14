describe('Vde Controller', function() {
  var scope, rootScope, window, timeout, location, http,
      timeline, Vis, iVis, vg, searchQuery, ctrl;

  beforeEach(module('vde'));

  beforeEach(inject(function($rootScope, $timeout, $controller, $httpBackend, $q, vg) {
    searchQuery = {};
    test_util.jasmineMatchers();
    rootScope = $rootScope.$new();
    scope = rootScope.$new();
    window = jasmine.createSpyObj('window', ['addEventListener']);
    timeout = $timeout;
    location = jasmine.createSpyObj('location', ['search']);
    location.search.and.returnValue(searchQuery);
    http = $httpBackend;
    timeline = jasmine.createSpyObj('timeline', ['save', 'redo']);
    Vis = jasmine.createSpyObj('Vis', ['data', 'parse', 'Pipeline']);
    Vis.render.and.returnValue($q.when());
    Vis._rawData = {};
    Vis.marks = {Group: jasmine.createSpy()};

    ctrl = $controller('VdeCtrl', {
      $scope: scope,
      $rootScope: rootScope,
      $window: window,
      $timeout: timeout,
      $location: location,
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

    it('should watch the search', function() {
      http.expectGET('examples/test.json')
      .respond('test data');
      searchQuery.example = 'test';
      scope.$digest();
      http.flush();

      expect(timeline.timeline).toBe('test data');

      delete searchQuery.example;
    });
  });
});