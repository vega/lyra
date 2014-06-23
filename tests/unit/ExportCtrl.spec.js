describe('Export controller', function() {
  //TODO: ExportCtrl uses jQuery to get an element to render a png. This causes these tests to fail.
  var $scope, $originalRootScope, rootScopeMock, ctrl, timelineMock, vdeVis, originalVg;
  beforeEach(function () {
      module('vde');
  });
  beforeEach(inject(function($rootScope, $controller, $q) {
    // create some scope objects to use
    originalRootScope = $rootScope;
    rootScopeMock = $rootScope.$new();
    rootScopeMock.fileOpenPopover = true;
    rootScopeMock.fileSavePopover = true;

    $scope = rootScopeMock.$new();

    originalVg = vg;
    vg = {headless: {render: jasmine.createSpy('')}};
    vg.headless.render.and.callFake(function(opts, callback) {
      callback(null, {
        svg: "Fake svg data"
      });
    });

    //monkey patch vde.Vis with a mock.
    vdeVis = vde.Vis;
    vde.Vis = jasmine.createSpyObj('Vis',['parse'])
    vde.Vis.parse.and.returnValue($q.when({
      //fake vega scene data
    }));

    timelineMock = {fileName: "test file name"};

    ctrl = $controller('ExportCtrl', {
      $scope: $scope,
      $rootScope: rootScopeMock,
      timeline: timelineMock
    });
  }));

  afterEach(function() {
    //restore vde.Vis and vg
    vde.Vis = vdeVis;
    vg = originalVg;
  })

  it('should render to image formats', function(done) {
    rootScopeMock.export().then(function() {
      expect($scope.png).toContain("data:");
      done();
    }).catch(function(err){ throw err; });

    //necessary for the asynchronous code to run.
    $scope.$digest();

    expect(vde.Vis.parse).toHaveBeenCalled();

  });

  it('should hide the other dialogs', function(done) {
    rootScopeMock.export().then(function() {
      expect(rootScopeMock.fileOpenPopover).toBeFalsy();
      expect(rootScopeMock.fileSavePopover).toBeFalsy();
      expect(rootScopeMock.exportPopover).toBeTruthy();

      done();
    }).catch(function(err){ throw err; });

    //necessary for the asynchronous code to run.
    $scope.$digest();

    expect(vde.Vis.parse).toHaveBeenCalled();
  })
}); 