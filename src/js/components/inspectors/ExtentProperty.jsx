'use strict';
var dl = require('datalib'),
    React = require('react'),
    connect = require('react-redux').connect,
    Property = require('./Property'),
    SpatialPreset = require('./SpatialPreset'),
    setMarkExtent = require('../../actions/markActions').setMarkExtent,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    MARK_EXTENTS = require('../../constants/markExtents');

function mapStateToProps(state, ownProps) {
  var type = ownProps.exType,
      primId = ownProps.primId,
      mark = getInVis(state, 'marks.' + primId + '.properties.update'),
      EXTENTS = dl.vals(MARK_EXTENTS[type]),
      start, end;

  EXTENTS.forEach(function(ext) {
    var name = ext.name, prop = mark.get(name);
    if (prop.get('_disabled')) {
      return;
    } else if (!start) {
      start = name;
    } else if (start !== name) {
      end = name;
    }
  });

  return {
    start: start,
    end: end,
    startDisabled: getIn(mark, start + '.band') || getIn(mark, start + '.group'),
    endDisabled: getIn(mark, end + '.band') || getIn(mark, end + '.group'),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    setExtent: function(oldExtent, newExtent) {
      dispatch(setMarkExtent(ownProps.primId, oldExtent, newExtent));
    }
  };
}

var ExtentProperty = React.createClass({
  handleChange: function(evt) {
    var props = this.props,
        type = props.exType,
        target = evt.target,
        name = target.name,
        newExtent = target.value,
        oldExtent = props[name],
        EXTENTS = MARK_EXTENTS[type],
        center = EXTENTS.CENTER.name,
        span = EXTENTS.SPAN.name,
        oldEnd = props.end;

    props.setExtent(oldExtent, newExtent);

    if (newExtent === center && oldEnd !== span) {
      props.setExtent(oldEnd, span);
    }
  },

  render: function() {
    var props = this.props,
        type = props.exType,
        EXTENTS = MARK_EXTENTS[type],
        center = EXTENTS.CENTER.name,
        span = EXTENTS.SPAN.label,
        opts = dl.vals(EXTENTS),
        start = props.start, end = props.end;

    return (
      <div>
        <Property name={start} type="number" canDrop={true} firstChild={true}
          disabled={props.startDisabled} {...props}>

          <div className="label-long label">
            <select name="start" value={start} onChange={this.handleChange}>
              {opts
                .filter(function(x) {
                  return x.name !== end;
                })
                .map(function(x) {
                  return (<option key={x.name} value={x.name}>{x.label}</option>);
                })}
            </select>
          </div>

          <SpatialPreset className="extra" name={start} {...props} />
        </Property>

        <Property name={end} type="number" canDrop={true} firstChild={true}
          disabled={props.endDisabled} {...props}>

          <br />

          <div className="label-long label">
            {start === center ?
              (<label htmlFor="end">{span}</label>) :
              (
                <select name="end" value={end} onChange={this.handleChange}>
                  {opts
                    .filter(function(x) {
                      return x.name !== start && x.name !== center;
                    })
                    .map(function(x) {
                      return (<option key={x.name} value={x.name}>{x.label}</option>);
                    })}
                </select>
              )
            }
          </div>

          <SpatialPreset className="extra" name={end} {...props} />
        </Property>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(ExtentProperty);
