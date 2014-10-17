describe('Data Controller', function() {
  var $scope, rootScopeMock, ctrl, timelineMock;
  beforeEach(function () {
      module('vde');
      timelineMock = jasmine.createSpyObj('timeline', ['save']);
  });
  beforeEach(inject(function($rootScope, $controller, $httpBackend) {
    // create some scope objects to use
    rootScopeMock = $rootScope.$new();
    rootScopeMock.activePipeline = {};
    $scope = rootScopeMock.$new();

    ctrl = $controller('DataCtrl', {
      $scope: $scope,
      $rootScope: rootScopeMock,
      $http: $httpBackend,
      timeline: timelineMock
    });
  }));

  it('should add new data sources', function() {
    //simple test data
    $scope.dMdl.src = {
      format: {
        parse: []
      },
      name: 'testSource'
    };

    $scope.add();

    expect(timelineMock.save).toHaveBeenCalled();
    expect(rootScopeMock.activePipeline.source).toEqual('testSource');
    //we want the pop-up to hide
    expect(rootScopeMock.newData).toBeFalsy();
  });

  it('should allow cancelling', function() {
    rootScopeMock.activePipeline.source = "test"
    rootScopeMock.newData = true;

    $scope.cancel();

    expect(rootScopeMock.newData).toBeFalsy();
    expect(rootScopeMock.activePipeline.source).toEqual("test");
  });
});