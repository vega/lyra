describe('Pipelines List Controller', function() {
  var scope, rootScope, timeline, vg, Vis, scale, pipeline, transform, ctrl;

  beforeEach(function() {
    module('vde');
  });
  beforeEach(inject(function($rootScope, $controller, $q) {
    rootScope = $rootScope.$new();
    scope = rootScope.$new();

    scale = {mockScale: true};
    pipeline = {mockPipeline:true, name: 'pipeline', source:'source', addTransform: jasmine.createSpy(), transforms: []};
    transform = {mockTransform: true, destroy: jasmine.createSpy()};

    rootScope.activePipeline = pipeline;

    timeline = jasmine.createSpyObj('timeline', ['save']);
    spyOn(window.vg, 'keys').and.callThrough();
    vg = window.vg;
    Vis = jasmine.createSpyObj('Vis', ['Pipeline', 'Scale', 'parse']);
    Vis.Scale.and.returnValue(scale);
    Vis.Pipeline.and.returnValue(pipeline);
    Vis.transforms = {test: jasmine.createSpy()};
    Vis.transforms.test.and.returnValue(transform);
    Vis.parse.and.returnValue($q.when({}));
    Vis.pipelines = {pipeline: pipeline};

    ctrl = $controller('PipelinesListCtrl', {
      $rootScope: rootScope,
      $scope: scope,
      timeline: timeline,
      vg: vg,
      Vis: Vis
    });
  }));

  describe('toggle pipeline', function() {
    it('should hide the current pipeline', function() {
      rootScope.togglePipeline(pipeline);

      expect(rootScope.activePipeline).toBeFalsy();
      expect(scope.pMdl.activePipelineSource).toBeFalsy();
    });

    it('should always show if show is true', function() {
      rootScope.togglePipeline(pipeline, true);

      expect(rootScope.activePipeline).toBe(pipeline);
      expect(scope.pMdl.activePipelineSource).toBe(pipeline.source);
    });

    it('should show a new pipeline', function() {
      var pipeline2 = {source: 'new'};
      rootScope.togglePipeline(pipeline2);

      expect(rootScope.activePipeline).toBe(pipeline2);
      expect(scope.pMdl.activePipelineSource).toBe(pipeline2.source);
    });
  });

  describe('add pipeline', function() {
    it('should add a new pipeline', function() {
      rootScope.activePipeline = null;
      scope.pMdl.activePipelineSource = null;

      rootScope.addPipeline();

      expect(rootScope.activePipeline).toBe(pipeline);
      expect(scope.pMdl.activePipelineSource).toBe(pipeline.source);
      expect(timeline.save).toHaveBeenCalled();
    });
  });

  describe('remove pipeline', function() {
    it('should remove a pipeline', function() {
      scope.removePipeline('pipeline');

      expect(Vis.pipelines.pipeline).toBeFalsy();
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

  describe('set source', function() {
    it('should remove source if empty', function() {
      expect(rootScope.activePipeline.source).toBe(pipeline.source);
      scope.pMdl.activePipelineSource = '';

      scope.setSource();

      expect(rootScope.activePipeline.source).toBe(null);
    });

    it('should add new sources', function() {
      scope.pMdl.activePipelineSource = 'vdeNewData';

      scope.setSource();

      expect(rootScope.newData).toBe(true);
    });

    it('should set the current pipeline source', function() {
      scope.pMdl.activePipelineSource = 'foo';

      scope.setSource();

      expect(rootScope.activePipeline.source).toBe('foo');
    });
  });
});