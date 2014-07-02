var Axis = vde.Vis.Axis;

describe("Axis", function() {
  var axis;

  beforeEach(function() {
    vde.Vis.groups = {mylayer: {
      _axisCount: 0,
      isLayer: function() { return true; },
      axes: {}
    }};
    axis = new Axis('myaxis', 'mylayer');

    jasmine.addMatchers({
      toHaveProperties: function(tab) {
        return {
          compare: function match(actual, tab) {
            var result = {pass: true};
            for(var k in tab) {
              if(tab.hasOwnProperty(k)) {
                var value = actual[k];
                if(typeof value === 'object' && typeof tab[k] === 'object') {
                  result = match.call(null, value, tab[k]);
                } else {
                  if(value !== tab[k]) {
                    result.pass = false;
                    break;
                  }
                }
              }
            }
            return result;
          }
        }
      }
    });
  });

  afterEach(function() {
    vde.Vis.groups = {};
  });

  describe("spec()", function() {
    beforeEach(function() {
      axis.properties.scale = {name: "a scale", field:function() { return true; }};
      axis.properties.title = "My Axis";
    });

    it('should be have the correct title and scale', function() {
      expect(axis.spec()).toHaveProperties({
        scale: 'a scale',
        title: 'My Axis',
      });
    });

    it('should pass through properties', function() {
      axis.properties.testProp = 'test prop';

      expect(axis.spec()).toHaveProperties({
        testProp: 'test prop'
      });
    });

    it('should ignore null or undefined properties', function() {
      axis.properties.testProp1 = null;
      axis.properties.testProp2 = undefined;

      var spec = axis.spec();

      expect('testProp1' in spec).toBe(false);
      expect('testProp2' in spec).toBe(false);
    });

    it('should relocate style properties', function() {
      axis.properties.tickStyle = 'tick test';
      axis.properties.labelStyle = 'label test';
      axis.properties.titleStyle = 'title test';
      axis.properties.axisStyle = 'axis test';
      axis.properties.gridStyle = 'grid test';

      expect(axis.spec()).toHaveProperties({
        properties: {
          ticks: 'tick test',
          labels: 'label test',
          title: 'title test',
          axis: 'axis test',
          grid: 'grid test'
        }
      });
    });

    it('should run the axis.pre_spec callback', function() {
      var cb = jasmine.createSpy();
      vde.Vis.callback.register('axis.pre_spec', null, cb);

      axis.spec();

      expect(cb).toHaveBeenCalled();
      vde.Vis.callback.deregister('axis.pre_spec');
    });

    it('should run the axis.post_spec callback', function() {
      var cb = jasmine.createSpy();
      vde.Vis.callback.register('axis.post_spec', null, cb);

      axis.spec();

      expect(cb).toHaveBeenCalled();
      vde.Vis.callback.deregister('axis.post_spec');
    });

  });
});