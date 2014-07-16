describe("TimelineCtrl", function() {
  var timeout, scope, rootScope, window, timeline, ctrl;
  beforeEach(module("vde"));

  beforeEach(inject(function($rootScope, $timeout, $controller, $q) {
    timeout = $timeout;
    rootScope = $rootScope.$new();
    scope = rootScope.$new();

    window = jasmine.createSpyObj('window', ['addEventListener']);
    timeline = jasmine.createSpyObj('timeline', ['undo', 'redo', 'files', 'open', 'save', 'store', 'delete']);
    timeline.files.and.returnValue({
      getAll:function() {
        return $q.when([{fileName:'file 1'},{fileName:'file 2'}]);
      }
    });
    timeline.timeline = [];

    timeline.open.and.returnValue($q.when());
    timeline.store.and.returnValue($q.when());
    timeline.delete.and.returnValue($q.when());

    ctrl = $controller('TimelineCtrl', {
      $scope: scope,
      $rootScope: rootScope,
      $window: window,
      timeline: timeline,
      $timeout: timeout
    });
  }));

  describe('Undo/Redo', function() {
    it('should undo', function() {
      scope.undo();
      expect(timeline.undo).toHaveBeenCalled();
    });

    it('should redo', function() {
      scope.redo();
      expect(timeline.redo).toHaveBeenCalled();
    });
  });

  describe('showOpen', function() {
    beforeEach(function() {
      rootScope.fileSavePopover = true;
      rootScope.exportPopover = true;
    });
    it('should close an open dialog', function() {
      rootScope.fileOpenPopover = true;

      scope.showOpen();

      expect(rootScope.fileOpenPopover).toBe(false);
      expect(rootScope.fileSavePopover).toBe(false);
      expect(rootScope.exportPopover).toBe(false);
    });

    it('should open a closed dialog', function() {
      rootScope.fileOpenPopover = false;

      scope.showOpen();

      expect(rootScope.fileOpenPopover).toBe(true);
      expect(rootScope.fileSavePopover).toBe(false);
      expect(rootScope.exportPopover).toBe(false);
    });
  });

  describe('open', function() {
    it('should close the file open popover on open', function() {
      rootScope.fileOpenPopover = true;

      scope.open('fileName');
      scope.$digest();

      expect(rootScope.fileOpenPopover).toBe(false);
    });
  });

  describe('save', function() {
    it('should show the save dialog', function() {
      scope.$digest();

      scope.timeline.fileName = false;
      scope.save();

      expect(rootScope.fileSavePopover).toBe(true);
    });

    it('should save the file', function() {
      scope.$digest();

      scope.timeline.fileName = 'a file name';
      scope.save();

      expect(timeline.fileName).toBe('a file name');
      expect(timeline.store).toHaveBeenCalled();
      rootScope.$digest();
      timeout.flush();
      rootScope.$digest();
      expect(rootScope.fileSavePopover).toBe(false);
      expect(scope.files).toEqual(['file 1', 'file 2']);
    });
  });

  describe('closeTimelinePopovers', function() {
    it('should close all of the open dialogs', function() {
      rootScope.fileSavePopover = true;
      rootScope.fileOpenPopover = true;
      rootScope.exportPopover = true;

      rootScope.closeTimelinePopovers();

      expect(rootScope.fileSavePopover).toBe(false);
      expect(rootScope.fileOpenPopover).toBe(false);
      expect(rootScope.exportPopover).toBe(false);
    });
  });

  describe('delete', function() {
    it('should delete the file', function() {
      scope.delete();

      expect(timeline.delete).toHaveBeenCalled();
      rootScope.$digest();
    
      expect(scope.files).toEqual(['file 1', 'file 2']);
    });
  });
});