var Mark = vde.Vis.Mark;

describe('Mark', function() {
  var mark;

  beforeEach(function() {
    test_util.jasmineMatchers();
    vde.Vis.groups = {mylayer: {
      _axisCount: 0,
      isLayer: function() { return true; },
      axes: {}
    }};

    mark = new Mark('name', 'layer', 'group');
  });

  afterEach(function() {
    vde.Vis.groups = {};
  });

  describe('', function() {

  });


});