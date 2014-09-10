var util = require('util');
var vde = require('../vde.js');

describe('pipelines panel', function() {
  beforeEach(function() {
    //make a simple matcher also work on promises
    function promiseAware(fn) {
      return function() {
        var args = arguments;
        if(this.actual.then instanceof Function) {
          return this.actual.then(function(resolved) {
            this.actual = resolved;
            return fn.apply(this, args);
          }.bind(this));
        } else {
          return fn.apply(this, args);
        }
      }
    }
    this.addMatchers({
      toHave: promiseAware(function(prop, value) {
        if(this.actual[prop] === value) {
          return true;
        } else {
          throw "Expected " + util.inspect(this.actual) + " to have " + prop + " " + value;
        }
      }),
      toBeExpanded: promiseAware(function() {
        return this.actual.isElementPresent(by.css(".inspector"))
      })
    });
  });



  var pipelineListId = 'pipelines-list';
  var pipelineLst = '(pipelineName, pipeline) in pMdl.pipelines';
  var scaleLst = '(scaleName, scale) in pipeline.scales';
  var transformsLst = 'transform in pipeline.transforms';
  var newTransformsLst = 'transform in pMdl.newTransforms';
  var visible = '#pipelines .inspector:nth-child(1) ';


  it('should load default pipeline', function() {
    browser.get('index.html');

    var pipelineName = $('.pipeline .title');

    expect(pipelineName.getText()).toEqual('Pipeline 1');
    expect(element.all(by.repeater(scaleLst))).toHave('length', 0);

  });

  it('should allow renaming the pipeline', function() {
    var nameIn = element(by.model('pipeline.displayName'));

    var renameButton = $('.pipeline .selected .rename');

    browser.actions().mouseMove(renameButton).perform();
    renameButton.click();

    nameIn.clear();
    nameIn.sendKeys('Protractor Pipeline');

    expect(nameIn.getText()).toEqual('Protractor Pipeline');
  });

  it('should add new pipelines', function() {
    // Click the add button a couple of times
    var addButton = $('#addPipeline');
    addButton.click();
    addButton.click();

    element.all(by.css('.pipeline')).then(function(pipelines) {
      expect(pipelines).toHave('length', 3);
      expect(pipelines[1].element(by.css('.title')).getText()).toEqual('Pipeline 2');
      expect(pipelines[2].element(by.css('.title')).getText()).toEqual('Pipeline 3');

      expect(pipelines[0]).not.toBeExpanded();
      expect(pipelines[1]).not.toBeExpanded();
      expect(pipelines[2]).toBeExpanded();
    });
  });

  it('should toggle pipelines', function() {
    element.all(by.css('.pipeline')).then(function(pipelines) {
      pipelines[0].element(by.css('.title')).click();
      expect(pipelines[0]).toBeExpanded();
      expect(pipelines[1]).not.toBeExpanded();
      expect(pipelines[2]).not.toBeExpanded();

      pipelines[1].element(by.css('.title')).click();
      expect(pipelines[0]).not.toBeExpanded();
      expect(pipelines[1]).toBeExpanded();
      expect(pipelines[2]).not.toBeExpanded();

      pipelines[2].element(by.css('.title')).click();
      expect(pipelines[0]).not.toBeExpanded();
      expect(pipelines[1]).not.toBeExpanded();
      expect(pipelines[2]).toBeExpanded();
    });
  });

  it('should delete pipelines', function() {
    var removeButton = element(by.css('.deletePipeline'));
    browser.actions().mouseMove(removeButton).perform();
    removeButton.click();
    expect(element.all(by.css('.pipeline')).count()).toEqual(2);

    removeButton = element(by.css('.deletePipeline'));
    browser.actions().mouseMove(removeButton).perform();
    removeButton.click();
    expect(element.all(by.css('.pipeline')).count()).toEqual(1);

  });

  describe("pipelines transformation", function(){
    it('should select source', function() {
      var selectElement = element(by.css('.sourceSelect'));
      selectElement.click();

      selectElement.element(by.css('[value="1"]')).click();

      expect(element(by.css('#datasheet')).isDisplayed()).toBe(true);

    });

    it('should sort', function() {
      expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

      element(by.css('.addTransform')).click();
      element(by.css('.transform-sort')).click();

      // Assuming olympics dataset is selected (from the previous test). Drag and drop is
      var isoCode = element(by.css('.dataTable tbody td:nth-child(1)'));
      var sortBy = element(by.css('#by'));
      vde.dragAndDrop(isoCode, sortBy);

      expect(element(by.css('#by')).isElementPresent(by.css('.binding'))).toBe(true);

      var sortOrder = element(by.model('transform.properties.order'));
      sortOrder.element(by.css('select')).click();
      sortOrder.element(by.css('option[value="1"]')).click();

      element(by.repeater(newTransformsLst).row(0))
        .element(by.css('input[value="Add to Pipeline"]')).click();

      expect(element.all(by.repeater(transformsLst)).count()).toEqual(1);
      expect(element.all(by.repeater(newTransformsLst)).count()).toEqual(0);

      // Use JSONPath to check the value of keys in the spec
      // http://goessner.net/articles/JsonPath/

      vde.checkSpec([{
        path: "$.data[?(@.name == 'pipeline_2')].transform[0].type",
        equal: "sort"
      }, {
        path: "$['data'][?(@.name == 'pipeline_2')].transform[0].by",
        equal: "-data.ISO_country_code"
      }])
    });

    it("should delete transform", function(){
        element(by.css('div.existing-transforms a.delete.close')).click();

        //dismisses confirmation alert
        protractor.getInstance().driver.switchTo().alert().then(
          function(alert) {
            alert.accept();
          }, function(error) {
          }
        );

        //check count of transforms list
        expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

        //check original order is restored
        //NOTE: Might want to use more precise css selector
        expect(element(by.css('.dataTable tbody td:nth-child(2)')).getText()).toBe("USA");
    });
  });

  describe("filter transform", function(){
    it("should filter", function(){
      expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

      element(by.css('.addTransform')).click();
      element(by.css('.transform-filter')).click();

      //assume Olympic data set is still open from previous tests
      var isoCode = element(by.css('.dataTable tbody td:nth-child(1)'));
      var dropArea = element(by.css('.canDropField'));
      vde.dragAndDrop(isoCode, dropArea);

      //expect(inputArea.isElementPresent(by.css('.binding'))).toBe(true);

      var expressionArea = element(by.css('.expr'));
      expressionArea.click();
      expressionArea.sendKeys(protractor.Key.RIGHT, '==\"USA\"');

      element(by.css('.inner input[value="Add to Pipeline"]')).click();

      expect(element.all(by.repeater(transformsLst)).count()).toEqual(1);
      expect(element.all(by.repeater(newTransformsLst)).count()).toEqual(0);

      vde.checkSpec([{
        path: "$.data[?(@.name == 'pipeline_2')].transform[0].type",
        equal: "filter"
      }]);
    });

    it("should delete transform", function(){
        element(by.css('div.existing-transforms a.delete.close')).click();

        //dismisses confirmation alert
        protractor.getInstance().driver.switchTo().alert().then(
          function(alert) {
            alert.accept();
          }, function(error) {
          }
        );

        //check count of transforms list
        expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

        //ADD check for data in table
    });
  });
  
  //NOT WORKING - Cannot find right drop area
  xdescribe("stats transform", function(){
    xit("should display stats", function(){
        element(by.css('div.addTransform')).click();
        element(by.css('a.transform-stats')).click();

        //Index the rows of the data table
        var rows = element.all(by.css('tr'));
        var gdp = rows.get(2).element(by.css('td:nth-child(1)'));
        console.log(rows.count());
        //console.log(gdp.getText());
        //drop area must be on label??
        var dropArea = element(by.css('div#field'));

        vde.dragAndDrop(gdp, dropArea);
        //select Median option
        element(by.css('input[type="checkbox"]')).click();
        element(by.css('input[value="Add to Pipeline"]')).click();

        //check that the stats table is visible
        expect(element(by.css('div[ng-repeat="(name, stats) in statsTransforms"]')).isDisplayed()).toBe(true);
    });

    it("should delete transform", function(){
        element(by.css('div.existing-transforms a.delete.close')).click();

        //dismisses confirmation alert
        protractor.getInstance().driver.switchTo().alert().then(
          function(alert) {
            alert.accept();
          }, function(error) {
          }
        );

        //check count of transforms list
        expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

        //ADD check for data in table
    });
  });

  describe("formula transform", function(){
      it("should transform using formula", function(){
          element(by.css('div.addTransform')).click();
          element(by.css('a.transform-formula')).click();

          //Index the rows of the data table
          var rows = element.all(by.css('tr'));
          var gdp = rows.get(2).element(by.css('td:nth-child(1)'));
          var population = rows.get(3).element(by.css('td:nth-child(1)'));
          var expressionArea = element(by.css('div.expr'));

          vde.dragAndDrop(gdp, expressionArea);
          expressionArea.click();
          expressionArea.sendKeys(protractor.Key.RIGHT, '/');
          vde.dragAndDrop(population, expressionArea);
          var as = element(by.css('input[type="text"]'));
          as.click();
          as.sendKeys('GDP per capita');

          element(by.css('input[value="Add to Pipeline"]')).click();

          //check data
          rows = element.all(by.css('tr'));
          expect(rows.count()).toEqual(11);

          //
          vde.checkSpec([{
          path: "$.data[?(@.name == 'pipeline_2')].transform[0].type",
          equal: "formula"
          }]);

      });

      it("should delete transform", function(){
        element(by.css('div.existing-transforms a.delete.close')).click();

        //dismisses confirmation alert
        protractor.getInstance().driver.switchTo().alert().then(
          function(alert) {
            alert.accept();
          }, function(error) {
          }
        );

        //check count of transforms list
        expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

        //ADD check for data in table
        //var rows = element(by.css('tr'));
        //expect(rows.count()).toEqual(10);
     });
  });
  
  describe("group by transform", function(){
    it("should group by", function(){
      element(by.css('div.addTransform')).click();
      element(by.css('a.transform-stats')).click();

      var rows = element.all(by.css('tr'));
      var iso = rows.get(0).element(by.css('td:nth-child(1)'));
      var dropArea = element(by.css('div.canDropField'));

      vde.dragAndDrop(iso, dropArea);
      element(by.css('input[value="Add to Pipeline"]')).click();
    });

    it("should delete transform", function(){
      element(by.css('div.existing-transforms a.delete.close')).click();

      //dismisses confirmation alert
      protractor.getInstance().driver.switchTo().alert().then(
        function(alert) {
          alert.accept();
        }, function(error) {
        }
      );

      //check count of transforms list
      expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);
     });
  });
  
  describe("window transform", function(){
    it("should window", function(){
      element(by.css('div.addTransform')).click();
      element(by.css('a.transform-stats')).click();

      var size = element(by.css('input:nth-child(1)'));
      var step = element(by.css('input:nth-child(2)'));

      size.sendKeys('7');
      step.sendKeys('3');
      element(by.css('input[value="Add to Pipeline"]')).click();
      
      /*
      vde.checkSpec([{
          path: "$.data[?(@.name == 'pipeline_2')].transform[0].type",
          equal: "window"
      }]);
      */
    });

    it("should delete transform", function(){
        element(by.css('div.existing-transforms a.delete.close')).click();

        //dismisses confirmation alert
        protractor.getInstance().driver.switchTo().alert().then(
          function(alert) {
            alert.accept();
          }, function(error) {
          }
        );

        //check count of transforms list
        expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);
    });
  });
});