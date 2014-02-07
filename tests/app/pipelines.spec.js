var util = require('util'),
    vde = require('../vde.js');

describe('pipelines panel', function() {
  var pipelineLst = '(pipelineName, pipeline) in pMdl.pipelines';
  var scaleLst = '(scaleName, scale) in pipeline.scales';
  var transformsLst = 'transform in pipeline.transforms';
  var newTransformsLst = 'transform in newTransforms';
  var visible = '#pipelines .inspector:nth-child(1) ';

  it('should load default pipeline', function() {
    browser.get('http://localhost/lyra/');

    var pipelineName = element(by.repeater(pipelineLst)
                .row(0).column('displayName'));

    expect(pipelineName.getText()).toEqual('Pipeline 1');
    element.all(by.repeater(scaleLst)).then(function(arr) {
      expect(arr.length).toEqual(0);
    });
  });

  it('should rename pipeline', function() {
    var nameIn = element(by.model('pipeline.displayName'));
    nameIn.clear();
    nameIn.sendKeys('protractor_pipeline');

    var nameH3 = element(by.binding("{{pipeline.displayName|inflector:'humanize'}}"));
    expect(nameH3.getText()).toEqual('Protractor Pipeline');
  });

  it('should add new pipelines', function() {
    // Click the add button a couple of times
    element(by.css('#pipelines .add')).click();
    element(by.css('#pipelines .add')).click();

    // Then check we've got three pipelines in the listing
    element.all(by.repeater(pipelineLst)).then(function(arr) {
      expect(arr.length).toEqual(3);
      expect(arr[1].findElement(by.css('h3')).getText()).toEqual('Pipeline 2');
      expect(arr[2].findElement(by.css('h3')).getText()).toEqual('Pipeline 3');

      // And that only the last one was selected
      expect(arr[0].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[1].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[2].findElement(by.css('.inspector')).isDisplayed()).toBe(true);
    });
  });

  it('should toggle pipelines', function() {
    element(by.repeater(pipelineLst).row(0)).findElement(by.css('h3')).click();
    element.all(by.repeater(pipelineLst)).then(function(arr) {
      expect(arr[0].findElement(by.css('.inspector')).isDisplayed()).toBe(true);
      expect(arr[1].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[2].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
    });

    element(by.repeater(pipelineLst).row(1)).findElement(by.css('h3')).click();
    element.all(by.repeater(pipelineLst)).then(function(arr) {
      expect(arr[0].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[1].findElement(by.css('.inspector')).isDisplayed()).toBe(true);
      expect(arr[2].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
    });

    element(by.repeater(pipelineLst).row(2)).findElement(by.css('h3')).click();
    element.all(by.repeater(pipelineLst)).then(function(arr) {
      expect(arr[0].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[1].findElement(by.css('.inspector')).isDisplayed()).toBe(false);
      expect(arr[2].findElement(by.css('.inspector')).isDisplayed()).toBe(true);
    });
  });

  it('should delete pipelines', function() {
    var remove = element(by.repeater(pipelineLst).row(1)).findElement(by.css('a.remove'));
    browser.actions().mouseMove(remove).perform();
    remove.click();
    expect(element.all(by.repeater(pipelineLst)).count()).toEqual(2);

    remove = element(by.repeater(pipelineLst).row(1)).findElement(by.css('a.remove'));
    browser.actions().mouseMove(remove).perform();
    remove.click();
    expect(element.all(by.repeater(pipelineLst)).count()).toEqual(1);
  })

  it('should select source', function() {
    element(by.css('#pipelines h3:nth-child(1)')).click();

    element(by.css(visible + '.import-data select')).click();
    element(by.css(visible + 'option[value="1"]')).click();

    expect(element(by.css(visible + '#datasheet')).isDisplayed()).toBe(true);
    expect(element(by.css(visible + 'h6:nth-child(1)')).isDisplayed()).toBe(true);
  });

  it('should sort', function() {
    expect(element.all(by.repeater(transformsLst)).count()).toEqual(0);

    element(by.css(visible + '.transform-sort')).click();
    expect(element.all(by.repeater(newTransformsLst)).count()).toEqual(1);

    // Assuming olympics dataset is selected (from the previous test). Drag and drop is
    var isoCode = element(by.css(visible + '.DTFC_LeftBodyWrapper tbody td:nth-child(1)'));
    var sortBy = element(by.css(visible + '#by'));
    vde.dragAndDrop(isoCode, sortBy);

    expect(element(by.css(visible + '#by')).isElementPresent(by.css('.binding'))).toBe(true);

    var sortOrder = element(by.model('transform.properties.order'));
    sortOrder.findElement(by.css('select')).click();
    sortOrder.findElement(by.css('option[value="1"]')).click();

    element(by.repeater(newTransformsLst).row(0))
        .findElement(by.css('input[value="Add to Pipeline"]')).click();

    expect(element.all(by.repeater(transformsLst)).count()).toEqual(1);
    expect(element.all(by.repeater(newTransformsLst)).count()).toEqual(0);

    // Use JSONPath to check the value of keys in the spec
    // http://goessner.net/articles/JsonPath/
    vde.checkSpec([{
      path: "$['data'][?(@.name == 'pipeline_1')].transform[0].type",
      equal: "sort"
    }, {
      path: "$['data'][?(@.name == 'pipeline_1')].transform[0].by",
      equal: "-data.ISO_country_code"
    }])
  });

  // TODO: other transformations.
});