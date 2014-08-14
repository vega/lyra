describe('Layers Controller', function() {
  var rootScope, scope, timeout, timeline, Vis, iVis, ctrl;

  var layerGroup1, layerGroup2, group1, visual1;
  beforeEach(function () {
      module('vde');
  });
  beforeEach(inject(function($rootScope, _$timeout_, $controller, $q) {
    rootScope = $rootScope.$new();
    scope = rootScope.$new();
    timeout = _$timeout_;

    timeline = jasmine.createSpyObj('timeline', ['save']);
    Vis = jasmine.createSpyObj('Vis', ['render', 'Pipeline', 'Axis']);
    Vis.render.and.returnValue($q.when({
      //fake spec
    }));
    Vis.Pipeline.and.returnValue({
      name: "fakePipeline"
    });
    Vis.Axis.and.returnValue({
      mockAxis: true
    });
    iVis = jasmine.createSpyObj('iVis', ['show']);

    layerGroup1 = jasmine.createSpyObj('group', ['group', 'isLayer', 'pipeline']);
    layerGroup1.isLayer.and.returnValue(true);
    layerGroup1.group.and.returnValue(layerGroup1);
    layerGroup1.name = 'myLayer1';
    layerGroup2 = jasmine.createSpyObj('group', ['group', 'isLayer', 'pipeline']);
    layerGroup2.isLayer.and.returnValue(true);
    group1 = jasmine.createSpyObj('group', ['group', 'isLayer', 'pipeline']);
    group1.name = 'group1';
    group1.isLayer.and.returnValue(false);
    group1.group.and.returnValue(layerGroup1);
    group1.pipeline.and.returnValue({
      name: 'fakePipeline',
      transforms: []
    });

    Vis.marks = {Group: jasmine.createSpy()};
    Vis.marks.Group.and.returnValue(layerGroup1);

    ctrl = $controller('LayersCtrl', {
      $rootScope: rootScope,
      $scope: scope,
      $timeout: timeout,
      timeline: timeline,
      Vis: Vis,
      iVis: iVis
    });
  }));

  it('should reparse the vega spec', function() {
    rootScope.reparse();

    expect(Vis.render).toHaveBeenCalled();
  });

  describe('toggling groups', function() {

    it("shouldn't toggle the active layer", function() {
      rootScope.activeLayer = layerGroup1;
      rootScope.toggleGroup(layerGroup1);
      //don't toggle the active layer
      expect(rootScope.activeLayer).toBe(layerGroup1);
    });

    it('should toggle to a different layer', function() {
      rootScope.toggleGroup(layerGroup2);
      //do toggle to another layer
      expect(rootScope.activeLayer).toBe(layerGroup2);
      expect(rootScope.activeGroup).toBe(layerGroup2);
    });

    it('should toggle to a different group', function() {
      rootScope.toggleGroup(group1);
      //toggle open a group
      expect(rootScope.activeGroup).toBe(group1);
      expect(rootScope.activeLayer).toBe(layerGroup1);
    });

    it('should close an open group', function() {
      //open
      rootScope.toggleGroup(group1);
      //close
      rootScope.toggleGroup(group1);
      //toggle closed a group
      expect(rootScope.activeGroup).toBeFalsy();
      expect(rootScope.activeLayer).toBe(layerGroup1);
    });
  });

  describe('toggle visual', function() {
    it('should hide the active visual', function() {
      iVis.activeMark = group1;
      rootScope.activeVisual = group1;
      rootScope.toggleVisual(group1);

      expect(rootScope.activeVisual).toBeFalsy();
      expect(iVis.activeMark).toBeFalsy();
    });

    it('should always show when passed show', function() {
      rootScope.activeVisual = group1;
      rootScope.toggleVisual(group1, null, true);

      expect(rootScope.activeVisual).toBe(group1);
    });

    it('should show a new visual', function() {
      rootScope.toggleVisual(group1);

      expect(rootScope.activeVisual).toBe(group1);
      expect(iVis.activeMark).toBe(group1);
      expect(rootScope.activeGroup).toBe(group1.group());
      expect(rootScope.activeLayer).toBe(group1.group());
    });
  });

  describe('set pipeline', function() {
    beforeEach(function() {
      scope.activeVisual = group1;
    });
    it('should do nothing on a blank pipeline', function() {
      scope.gMdl.activeVisualPipeline = '';
      scope.setPipeline();

      expect(group1.pipelineName).toBeFalsy();
    });

    it('should make a new pipeline', function(done) {
      scope.gMdl.activeVisualPipeline = 'vdeNewPipeline';
      scope.setPipeline().then(function() {
        expect(timeline.save).toHaveBeenCalled();
        done();
      });

      expect(group1.pipelineName).toEqual('fakePipeline');
      expect(rootScope.activePipeline.name).toEqual('fakePipeline');
      expect(scope.gMdl.activeVisualPipeline).toEqual('fakePipeline');
    
      //run the pending promises
      rootScope.$digest();
    });

    it('should set to a current pipeline', function(done) {
      scope.gMdl.pipelines = Vis.pipelines = {
        fakePipeline2: {name: 'fakePipeline2'}
      };
      scope.gMdl.activeVisualPipeline = 'fakePipeline2';
      scope.setPipeline().then(function() {
        expect(timeline.save).toHaveBeenCalled();
        done();
      });

      expect(rootScope.activePipeline.name).toEqual('fakePipeline2');
      expect(group1.pipelineName).toEqual('fakePipeline2');
      rootScope.$digest();
    });
  });

  describe('add group', function() {
    it('should add a new group', function(done) {
      scope.addGroup().then(function() {
        expect(timeline.save).toHaveBeenCalled();
        expect(rootScope.activeGroup).toBe(layerGroup1);

        done();
      });
      rootScope.$digest();
    });
  });

  describe('add axis', function() {
    it('should add to a group', function() {
      scope.addAxis(group1);

      expect(Vis.Axis).toHaveBeenCalledWith('', 'myLayer1', 'group1');
      expect(rootScope.activeVisual.mockAxis).toBe(true);
      expect(timeline.save).toHaveBeenCalled();
    });

    it('should add to a layer', function() {
      scope.addAxis(layerGroup1);

      expect(Vis.Axis).toHaveBeenCalledWith('', 'myLayer1', null);
      expect(rootScope.activeVisual.mockAxis).toBe(true);
      expect(timeline.save).toHaveBeenCalled();
    });
  });

  describe('remove visual', function() {
    it('should do nothing on cancel', function() {
      var _confirm = confirm;
      confirm = function() {return false;};

      Vis.groupOrder = ['group1', 'layerGroup1', 'layerGroup2'];
      scope.removeVisual();
      expect(Vis.groupOrder.length).toBe(3);

      confirm = _confirm;
    });

    xit('should remove the visual element', function() {
      var _confirm = confirm; confirm = function(){return true;};

      //TODO

      confirm = _confirm;
    })
  });

  describe('new transform', function() {
    it('should add a new tranform to the current visual', function() {
      var t = {}
      Vis.transforms = {test: function() {
        return t; 
      }};
      rootScope.activeVisual = group1;
      scope.newTransform('test');

      expect(group1.pipeline().transforms[0]).toBe(t);
      expect(scope.gMdl.showTransforms).toBe(false);
      expect(timeline.save).toHaveBeenCalled();
    });
  });

  describe('remove transform', function(done) {
    var transform;
    beforeEach(function() {
      rootScope.activeVisual = group1;
      transform = jasmine.createSpyObj('transform', ['destroy']);
      group1.pipeline().transforms.push(transform);
    });
    it('should remove the current transform', function(done) {
      var _confirm = confirm; confirm = function() {return true;};

      scope.removeTransform(0).then(function() {
        expect(timeline.save).toHaveBeenCalled();
        done();
      });

      expect(transform.destroy).toHaveBeenCalled();
      expect(group1.pipeline().transforms.length).toBe(0);

      rootScope.$digest();
      confirm = _confirm;
    });

    it('should do nothing on cancel', function() {
      var _confirm = confirm; confirm = function() {return false;};

      scope.removeTransform(0);

      expect(transform.destroy).not.toHaveBeenCalled();
      expect(group1.pipeline().transforms.length).toBe(1);

      confirm = _confirm;
    });
  });

  describe('toggle property', function() {
    it('should create new properties', function() {
      var props = {};
      rootScope.activeVisual = {properties: props};
      scope.toggleProp('foo.bar.baz', 'test');

      expect(props.foo.bar.baz.value).toEqual('test');
      expect(Vis.render).toHaveBeenCalled();
    });

    it('should remove existing properties', function() {
      var props = {foo: {value: 'test'}};
      rootScope.activeVisual = {properties: props};
      scope.toggleProp('foo', 'test');

      expect(props.foo.value).toBeUndefined();
      expect(Vis.render).toHaveBeenCalled();
    });

    it('should call update instead of parse if present', function() {
      var props = {};
      var update = jasmine.createSpy();
      rootScope.activeVisual = {properties: props, update: update};

      scope.toggleProp('foo.bar', 'test');

      expect(props.foo.bar.value).toEqual('test');
      expect(Vis.render).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith('foo.bar');
    });
  });
});