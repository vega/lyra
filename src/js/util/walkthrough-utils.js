'use strict';
var isMatch = require('lodash.ismatch'),
    isArray = require('datalib').isArray;

/**
 * Walkthrough Utility has functions used in the walkthrough react components
 * that need to be well tested and can exist outside of the ui
 */

/**
 * The container for the property values in the store. These differ by primitive type.
 * @TODO update these when guide and scales are added into redux
 * @type {Object}
 */
var PROPERTY_CONTAINER = {
  marks: 'properties.update',
  guides: 'property',
  scales: '',
  legends: 'properties.update'
};

var observer;

/**
 * Get the properties off the primitive
 * @param  {Object} object - a primitive object
 * @param  {String} type - either marks, guides or scales
 * @returns {Object} - object of the primitives properties
 */
function getProperties(object, type) {
  var props = PROPERTY_CONTAINER[type].split('.');
  var propertyObj = object;
  for (var i = 0; i < props.length; i++) {
    propertyObj = propertyObj ? propertyObj[props[i]] : propertyObj;
  }
  return propertyObj;
}

/**
 * Get an array of all elements with a certain type
 * @param  {string} elemType - a string that will match the key in each state element
 * @param  {Array} stateArray - an array of objects to test against
 * @param  {string} key - key to filter by
 * @returns {Array} All matching elements
 */
function filterBy(elemType, stateArray, key) {
  return stateArray.filter(function(o) {
    return o[key] === elemType;
  });
}

/**
 * Test that the type exists in the state
 * @param  {string} elemType - a string that will match the 'type' key in each state element
 * @param  {Array} stateArray - an array of objects to test against
 * @param  {number} min - minimum required to be found to pass test
 * @returns {Boolean} Success or failure of the type existence test
 */
function testTypeExistence(elemType, stateArray, min) {
  var minimum = min || 1;
  var found = filterBy(elemType, stateArray, 'type');
  return (found.length >= minimum);
}

/**
 * Test that an element exists with all properties needed
 * @param  {Object} match - the matching element
 * @param  {Object} elem - an object to match against
 * @param  {String} type - the type in the store eg - Marks, Scales, Guide
 * @returns {Boolean} Success or failure of the test
 */
function matchPropertyExistence(match, elem, type) {
  // get the container of the properties by type
  var matchProps = getProperties(match, type),
      elemProps = getProperties(elem, type);
  return isMatch(elemProps, matchProps);
}

/**
 * Test state array for match on an element with all properties
 * @param  {Object} match - the matching element
 * @param  {Array} stateArray - array of all state elements
 * @param  {String} type  - the type in the store eg - Marks, Scales, Guide
 * @returns {Boolean} Success or failure of the test
 */
function testPropertyExistence(match, stateArray, type) {
  var status = false;
  if (getProperties(match, type)) {
    for (var i = 0; i < stateArray.length; i++) {
      if (matchPropertyExistence(match, stateArray[i], type)) {
        status = true;
        break;
      }
    }
  } else {
    status = true;
  }
  return status;
}

/**
 * Validate one store object against another.
 * @param  {Object} currentState  - the current state that is being tested against
 * @param  {Object} expectedState - the expected state required to go on to the next walkthrough
 * @param  {String} type - marks, guides, or scales
 * @returns {Object} An object containing success or error messaging
 */
 // @TODO appropriately pair necessary hints/suggestion to every error
 // @TODO refactor iterative blocks into their own function
function validate(currentState, expectedState) {
  var validation = {success: false, errors: []},
      expectedMarkSpecs = expectedState.marks,
      expectedDsSpecs = expectedState.data,
      expectedAxisSpecs = expectedState.axes,
      expectedScalesSpecs = expectedState.scales,
      currentStateMarks = currentState.marks[0],
      markSpecs = currentStateMarks.marks,
      dsSpecs = currentState.data,
      axesSpecs = currentStateMarks.axes,
      scalesSpecs = currentStateMarks.scales;

  // Marks
  if (expectedMarkSpecs) {
    // we ought to determine how to store all necessary errors here
    var noMarksPresent = 'No marks not found!',
        missingMarkType, missingMarkProperties;

    if (!markSpecs.length) {
      addError(noMarksPresent, validation.errors);
    } else {
      expectedMarkSpecs.forEach(function(eMarkSpec) {
        var markType = eMarkSpec.type,
            minMarkCount = filterBy(markType, expectedMarkSpecs, 'type').length,
            expectedMarkProps = getProperties(eMarkSpec, 'marks');

        missingMarkType = 'No ' + markType.toUpperCase() + ' mark found!';
        missingMarkProperties = 'Missing ' + markType.toUpperCase() + ' with properties: ' +
        JSON.stringify(expectedMarkProps);

        if (!testTypeExistence(markType, markSpecs, minMarkCount)) {
          addError(missingMarkType, validation.errors);
        } else if (expectedMarkProps && !testPropertyExistence(eMarkSpec, markSpecs, 'marks')) {
          addError(missingMarkProperties, validation.errors);
        } else {
          removeError(missingMarkType, validation.errors);
          removeError(missingMarkProperties, validation.errors);
        }
      });
    }
  }

  // Datasets
  if (expectedDsSpecs) {
    // @TODO switch to error helpers
    var noDsPresent = 'No data sets found!',
        dsInvalid;

    // ensure currentState contains all contents of expectedDsSpecs
    if (!dsSpecs.length) {
      addError(noDsPresent, validation.errors);
    } else {
      expectedDsSpecs.forEach(function(eDsSpec) {
        dsSpecs.forEach(function(cDsSpec) {
          dsInvalid = eDsSpec.name + ' data set not found!';
          if (eDsSpec.url === cDsSpec.url) {
            removeError(noDsPresent, validation.errors);
            removeError(dsInvalid, validation.errors);
          } else {
            addError(dsInvalid, validation.errors);
          }
        });
      });
    }
  }

  // Axes
  if (expectedAxisSpecs) {
    var noAxesFound = 'No axes found!',
        missingAxisType, missingAxisProperties;

    if (!axesSpecs.length) {
      addError(noAxesFound, validation.errors);
    } else {
      expectedAxisSpecs.forEach(function(eAxisSpec) {
        var axisType = eAxisSpec.type,
            minAxisCount = filterBy(axisType, expectedAxisSpecs, 'type').length,
            expectedAxisProps = getProperties(eAxisSpec, 'guides');

        missingAxisType = 'No ' + axisType.toUpperCase() + ' axis found!';
        missingAxisProperties = 'Missing ' + axisType.toUpperCase() + ' with properties: ' +
        JSON.stringify(expectedAxisProps);

        if (!testTypeExistence(axisType, axesSpecs, minAxisCount)) {
          addError(missingAxisType, validation.errors);
        } else if (expectedAxisProps && !testPropertyExistence(eAxisSpec, axesSpecs, 'guides')) {
          addError(missingAxisType, validation.errors);
        } else {
          removeError(missingAxisType, validation.errors);
          removeError(missingAxisProperties, validation.errors);
        }
      });
    }
  }

  // Scales
  if (expectedScalesSpecs) {
    var noScales = 'No scales found!',
        noAxes = 'No axes found!',
        missingScaleType, missingScaleProperties;

    if (!axesSpecs.length) {
      addError(noAxes, validation.errors);
    } else if (!scalesSpecs.length) {
      addError(noScales, validation.errors);
    } else {
      expectedScalesSpecs.forEach(function(eScaleSpec) {
        var scaleType = eScaleSpec.type,
            scaleName = eScaleSpec.name,
            minScaleCount = filterBy(scaleType, expectedScalesSpecs, 'type').length,
            expectedScaleProps = getProperties(eScaleSpec, 'scales');

        missingScaleType = 'No ' + scaleType.toUpperCase() + ' scale found on ' + scaleName + ' axis or legend!';
        missingScaleProperties = 'Missing ' + scaleType.toUpperCase() + ' with properties: ' +
        JSON.stringify(expectedScaleProps);

        if (!testTypeExistence(scaleType, scalesSpecs, minScaleCount)) {
          addError(missingScaleType, validation.errors);
        } else if (expectedScaleProps && !testPropertyExistence(eScaleSpec, scalesSpecs, 'scales')) {
          addError(missingScaleProperties, validation.errors);
        } else {
          removeError(missingScaleType, validation.errors);
          removeError(missingScaleProperties, validation.errors);
          removeError(noAxes, validation.errors);
          removeError(noScales, validation.errors);
        }
      });
    }
  }

  if (!validation.errors.length) {
    validation.success = true;
  }

  return validation;
}

function getErrorIndex(e, errs) {
  if (!isArray(errs)) {
    throw new Error('errors must be an array');
  }
  return errs.indexOf(e);
}

function errorExists(e, errs) {
  if (!isArray(errs)) {
    throw new Error('errors must be an array');
  }
  return errs.indexOf(e) !== -1;
}

function addError(e, errs) {
  if (!isArray(errs)) {
    throw new Error('errors must be an array');
  }
  if (!errorExists(e, errs)) {
    errs.push(e);
  }
}

function removeError(e, errs) {
  if (!isArray(errs)) {
    throw new Error('errors must be an array');
  }
  if (errorExists(e, errs)) {
    errs.splice(getErrorIndex(e, errs), 1);
  }
}

function validateDom(domState) {
  var status = false,
      errors = [],
      errorMessage, query;

  if (domState && domState.query) {
    query = domState.query;
    errorMessage = 'A ' + query.replace('.', '').toUpperCase() + ' was not found';

    if (!document.querySelector(query)) {
      addError(errorMessage, errors);
    } else {
      removeError(errorMessage, errors);
    }
  }

  if (!errors.length) {
    status = true;
  }

  return {
    success: status,
    errors: errors
  };
}

module.exports = {
  validate: validate,
  validateDom: validateDom
};
