describe('timeline', function() {
	var rootScope, db, Vis, iVis, timeline;
  beforeEach(function() {
    module('vde');
  });

  beforeEach(function() {
    rootScope = jasmine.createSpyObj('$rootScope', ['$apply']);
    db = jasmine.createSpyObj('$indexedDB', ['objectStore']);
    db.objectStore.and.returnValue(['list','of','files']);
    Vis = jasmine.createSpyObj('Vis', ['export','import']);
    iVis = jasmine.createSpyObj('iVis', ['show']);
    module(function($provide) {
      $provide.value('$rootScope', rootScope);
      $provide.value('Vis', Vis);
      $provide.value('iVis', iVis);
      $provide.value('$indexedDB', db);
    });
  });

  beforeEach(inject(function(_timeline_) {
    timeline = _timeline_;
  }));

  describe('files', function() {
    it('should give list of files', function() {
      expect(timeline.files()).toEqual(['list','of','files']);
    });
  });

  describe('open', function() {

  });

  describe('store', function() {

  });

  describe('delete', function() {

  });

  describe('save', function() {

  });

  describe('load', function() {

  });

  describe('undo', function() {

  });

  describe('redo', function() {

  });
});