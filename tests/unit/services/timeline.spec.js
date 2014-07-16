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

  describe('undo/redo', function() {
    beforeEach(function() {
      timeline.load = jasmine.createSpy();
    });

    it('should undo several times', function() {
      timeline.undo();
      expect(timeline.load).toHaveBeenCalledWith(23);
      timeline.undo();
      expect(timeline.load).toHaveBeenCalledWith(22);
    });

    it('should undo then redo', function() {
      timeline.undo();
      expect(timeline.load).toHaveBeenCalledWith(23);

      timeline.redo();
      expect(timeline.load).toHaveBeenCalledWith(24);
    });

    it('should do not redo past the end', function() {
      timeline.redo();
      expect(timeline.load).toHaveBeenCalledWith(24);
    });

    it('should not undo past the end', function() {
      for(var i = 0; i < 27; i++) {
        timeline.undo();
        expect(timeline.load).toHaveBeenCalledWith(Math.max(23 - i, 0))
      }
      expect(timeline.load).not.toHaveBeenCalledWith(-1);
    });

    it('should erase future on save', function() {
      timeline.undo();
      timeline.undo();
      timeline.save(); //now the two state we un-did should be gone

      expect(timeline.load).toHaveBeenCalledWith(23);
      expect(timeline.load).toHaveBeenCalledWith(22);

      timeline.redo();
      timeline.redo();
      expect(timeline.load).toHaveBeenCalledWith(23);
      expect(timeline.load).not.toHaveBeenCalledWith(24);
    });
  });
});