describe('Export controller', function() {
  //TODO: ExportCtrl uses jQuery to get an element to render a png. This causes these tests to fail.
  var $scope, $originalRootScope, rootScopeMock, ctrl, timelineMock, VisMock, vgMock, pngMock;
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

    vgMock = {headless: {render: jasmine.createSpy()}};
    vgMock.headless.render.and.callFake(function(opts, callback) {
      callback(null, {
        svg: "Fake svg data"
      });
    });

    pngMock = jasmine.createSpyObj('PngExporter', ['get']);
    pngMock.get.and.returnValue('dummy png url');

    VisMock = jasmine.createSpyObj('Vis',['render'])
    VisMock.render.and.returnValue($q.when({
      //fake vega scene data
    }));

    timelineMock = {fileName: "test file name"};

    ctrl = $controller('ExportCtrl', {
      $scope: $scope,
      $rootScope: rootScopeMock,
      timeline: timelineMock,
      Vis: VisMock,
      vg: vgMock,
      PngExporter: pngMock
    });
  }));

  it('should render to image formats', function(done) {
    rootScopeMock.export().then(function() {
      expect($scope.png).toEqual("dummy png url");
      done();
    }).catch(function(err){ throw err; });

    expect(VisMock.render).toHaveBeenCalled();

    //necessary for the asynchronous code to run.
    $scope.$digest();
  });

  it('should hide the other dialogs', function(done) {
    rootScopeMock.export().then(function() {
      expect(rootScopeMock.fileOpenPopover).toBeFalsy();
      expect(rootScopeMock.fileSavePopover).toBeFalsy();
      expect(rootScopeMock.exportPopover).toBeTruthy();

      done();
    }).catch(function(err){ throw err; });

    expect(VisMock.render).toHaveBeenCalled();

    //necessary for the asynchronous code to run.
    $scope.$digest();
  })
}); 