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
      var isoCode = element(by.css('.DTFC_LeftBodyWrapper tbody td:nth-child(1)'));
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

  });

  xdescribe("filter transform", function(){
    xit("should filter", function(){
      //TODO(kanitw): filter

      // d.data.x > 10

      // d.data.x > 10 with drag and drop

      //.length log(d.data.y)/LN10 > 2

      // try bad data
    });
  });


  xit("should transform using formula", function(){
    //TODO(kanitw): transform
  });

  xit("should group by", function(){
    //TODO(kanitw): filter
  });

  xit("should window", function(){
    //TODO(kanitw): filter
  });
});