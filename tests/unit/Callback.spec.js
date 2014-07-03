describe('Callback', function() {
  var callback = vde.Vis.callback;

  beforeEach(function() {
    callback.clearAll();
  });
  afterEach(function() {
    callback.clearAll();
  });

  it('should call a callback', function() {
    var cb = jasmine.createSpy();
    callback.register('test', null, cb);
    callback.run('test', null, {});
    expect(cb).toHaveBeenCalled();
  });

  it('should allow multiple callbacks', function() {
    var cb1 = jasmine.createSpy(),
      cb2 = jasmine.createSpy();

    callback.register('test', null, cb1);
    callback.register('test', null, cb2);
    callback.run('test', null, {});
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
  });

  it('should only call the correct callback type', function() {
    var cb1 = jasmine.createSpy(),
      cb2 = jasmine.createSpy();

    callback.register('test1', null, cb1);
    callback.register('test2', null, cb2);
    callback.run('test1', null, {});
    expect(cb1).toHaveBeenCalled();
    expect(cb2).not.toHaveBeenCalled();
  });

  it('should clear all callbacks', function() {
    var cb = jasmine.createSpy();

    callback.register('test', null, cb);
    callback.clearAll();
    callback.run('test', null, {});

    expect(cb).not.toHaveBeenCalled();
  });

  it('should deregister callbacks with the same caller', function() {
    var cbA = jasmine.createSpy(),
      cbB = jasmine.createSpy();
    callback.register('test', 'caller a', cbA);
    callback.register('test', 'caller b', cbB);
    callback.deregister('test', 'caller a');
    callback.run('test', null, {});
    expect(cbA).not.toHaveBeenCalled();
    expect(cbB).toHaveBeenCalled();
  });

  it('should pass the correct values to the callback', function() {
    var cb = jasmine.createSpy();
    cb.and.callFake(function(options) {
      expect(this.correct).toBe(true);
    });

    var opts = {options: true};

    callback.register('test', {correct: true}, cb);
    callback.run('test', 'item', opts);
  
    expect(cb).toHaveBeenCalledWith({
      options: true,
      item: 'item'
    });
    expect(opts.item).toBe('item');
  });
});