'use strict';
module.exports = {
  marksList: [
    {
      mark: 'Rect',
      description: 'The Rect mark in Lyra represents each data point as a rectangle, where the length and width of the rectangle can be mapped to quantitative or nominal fields.'
    }, {
      mark: 'Symbol',
      description: 'Symbols offer additional interactivity compared to Rects, such as mapping data to its size or fill. Symbols come in many froms (e.g., square, cross, diamond, triangle).'
    }, {
      mark: 'Text',
      description: 'Text marks represents each data point with text.'
    }, {
      mark: 'Line',
      description: 'The line mark represents the data points stored in a field with a line connecting all of these points. Unlike other marks except area that represents one data element per mark, one line mark represent multiple data element as a single line.'
    }, {
      mark: 'Area',
      description: 'Area represent multiple data element as a single area shape.'
    }
  ]
};
