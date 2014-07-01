describe('timeline', function() {
	var rootScope, db, Vis, iVis, timeline, objectStore;
  beforeEach(function() {
    module('vde');
  });

  beforeEach(function() {
    rootScope = jasmine.createSpyObj('$rootScope', ['$apply']);
    rootScope.$root = {$$phase: true};
    db = jasmine.createSpyObj('$indexedDB', ['objectStore']);
    objectStore = jasmine.createSpyObj('objectStore', ['find']);
    db.objectStore.and.returnValue(objectStore);

    Vis = jasmine.createSpyObj('Vis', ['export','import']);
    iVis = jasmine.createSpyObj('iVis', ['show']);
    module(function($provide) {
      $provide.value('$rootScope', rootScope);
      $provide.value('Vis', Vis);
      $provide.value('iVis', iVis);
      $provide.value('$indexedDB', db);
    });
  });

  beforeEach(inject(function(_timeline_, $q) {
    timeline = _timeline_;
    Vis.import.and.returnValue({then:function(f) {
      return f({imported: true});
    }});
    objectStore.find.and.returnValue({});
  }));

  beforeEach(function() {
    var i;
    Vis.export.and.callFake(function(){ return {VisVersion: i}; });
    Vis.Mark = function() {};
    Vis.marks = {Group:function() {}};
    for(i = 0; i < 25; i++) {
      rootScope.activeVisual = {name: "Visual " + i};
      rootScope.activeLayer = {name: "Layer " + i};
      rootScope.activeGroup = {name: "Group " + i};
      rootScope.activePipeline = {name: "Pipeline " + i};

      timeline.save();
    }
  });

  describe('undo', function() {
    it('should ', function() {
      var time = timeline.timeline;
      expect(time[time.length-1].vis.VisVersion).toBe(24);

      timeline.undo();

      expect(rootScope.activeVisual.name).toBe("Visual 23");
    });
  });

  describe('redo', function() {
    it('should', function() {

    });
  });
});