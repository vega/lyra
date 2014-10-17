test_util = {
  jasmineMatchers: function() {
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
                  if(!result.pass) break;
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
  }
}