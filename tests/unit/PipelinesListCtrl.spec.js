describe('Pipelines List Controller', function() {
  var scope, rootScope, timeline, vg, Vis, scale, pipeline, transform, ctrl;

  beforeEach(function() {
    module('vde');
  });
  beforeEach(inject(function($rootScope, $controller, $q) {
    rootScope = $rootScope.$new();
    scope = rootScope.$new();

    scale = {mockScale: true};
    pipeline = {mockPipeline:true, name: 'pipeline', addTransform: jasmine.createSpy(), transforms: []};
    transform = {mockTransform: true, destroy: jasmine.createSpy()};

    rootScope.activePipeline = pipeline;

    timeline = jasmine.createSpyObj('timeline', ['save']);
    spyOn(window.vg, 'keys').and.callThrough();
    vg = window.vg;
    Vis = jasmine.createSpyObj('Vis', ['Pipeline', 'Scale', 'parse']);
    Vis.Scale.and.returnValue(scale);
    Vis.transforms = {test: jasmine.createSpy()};
    Vis.transforms.test.and.returnValue(transform);
    Vis.parse.and.returnValue($q.when({}));

    ctrl = $controller('PipelinesListCtrl', {
      $rootScope: rootScope,
      $scope: scope,
      timeline: timeline,
      vg: vg,
      Vis: Vis
    });
  }));

  describe('add pipeline', function() {
    xit('should add a new pipeline', function() {
      //TODO
      rootScope.addPipeline();
    });
  });

  describe('add scale', function() {
    it('should add a new scale', function() {
      var newScale = scope.addScale();

      expect(Vis.Scale).toHaveBeenCalledWith('', pipeline, {type: 'ordinal'}, 'new_scale');
      expect(newScale).toBe(scale);
      expect(newScale.manual).toBe(true);
    });
  })

  describe('new transform', function() {
    it('should add a new transform', function() {
      expect(scope.pMdl.newTransforms.length).toBe(0);

      scope.newTransform('test');

      expect(scope.pMdl.newTransforms[0]).toBe(transform);
      expect(scope.pMdl.showTransforms).toBe(false);
    });
  });

  describe('add transform', function() {
    it('should turn a new transform into an applied transform', function() {
      scope.newTransform('test');
      scope.addTransform(0);

      expect(transform.pipelineName).toBe('pipeline');
      expect(pipeline.addTransform).toHaveBeenCalledWith(transform);
      expect(scope.pMdl.newTransforms.length).toBe(0);

      rootScope.$digest();

      expect(timeline.save).toHaveBeenCalled();
    });
  });

  describe('remove transform', function() {
    it('should remove new transforms', function() {
      scope.newTransform('test');

      rootScope.activePipeline.transforms.push(transform);
      scope.removeTransform(0, true);

      expect(scope.pMdl.newTransforms.length).toBe(0);
      expect(transform.destroy).toHaveBeenCalled();
    });

    it('should remove applied transforms', function() {
      var _confirm = confirm; confirm = function() {return true;};

      scope.newTransform('test');
      scope.addTransform(0);
      rootScope.activePipeline.transforms.push(transform);
      scope.removeTransform(0);

      expect(scope.pMdl.newTransforms.length).toBe(0);
      expect(scope.activePipeline.transforms.length).toBe(0);
      expect(transform.destroy).toHaveBeenCalled();

      rootScope.$digest();

      expect(timeline.save).toHaveBeenCalled();

      confirm = _confirm;
    });

    it('should be cancellable', function() {
      var _confirm = confirm; confirm = function() {return false;};

      scope.newTransform('test');
      scope.addTransform(0);
      rootScope.activePipeline.transforms.push(transform);
      scope.removeTransform(0);

      expect(scope.pMdl.newTransforms.length).toBe(0);
      expect(scope.activePipeline.transforms[0]).toBe(transform);
      expect(transform.destroy).not.toHaveBeenCalled();
      confirm = _confirm;
    });
  });
});