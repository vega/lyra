'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    FormInputProperty = require('./FormInputProperty'),
    AutoComplete = require('./AutoComplete'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    dsUtils  = require('../../util/dataset-utils'),
    TYPES = require('../../constants/primTypes'),
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual;

function mapStateToProps(reduxState, ownProps) {
  if (!ownProps.primId) {
    return {};
  }

  var state = getInVis(reduxState, ownProps.primType + '.' + ownProps.primId),
      path, dsId;

  if (ownProps.name) {
    if (ownProps.primType === TYPES.MARKS) {
      path = 'properties.update.' + ownProps.name;
      dsId = getIn(state, 'from.data');
    } else if (ownProps.primType === TYPES.GUIDES) {
      path = ownProps.name;
    }
  }

  var scale = getIn(state, path + '.scale'),
      field = getIn(state, path + '.field'),
      scaleName = scale && getInVis(reduxState, 'scales.' + scale + '.name');

  return {
    group:  getIn(state, path + '.group'),
    signal: getIn(state, path + '.signal'),
    value:  getIn(state, path),
    field:  field,
    scale:  scale,
    srcField:  dsId && field ? dsUtils.schema(dsId)[field].source : false,
    scaleName: scaleName
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    unbind: function() {
      dispatch(resetMarkVisual(ownProps.primId, ownProps.name));
    }
  };
}

var Property = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    label: React.PropTypes.string,
    field: React.PropTypes.string,
    group: React.PropTypes.string,
    scale: React.PropTypes.number,
    dsId: React.PropTypes.number,
    scaleName: React.PropTypes.string,
    signal: React.PropTypes.string,
    autoType: React.PropTypes.string,
    onChange: React.PropTypes.func,
    value: React.PropTypes.oneOfType([
      React.PropTypes.string, React.PropTypes.number,
      React.PropTypes.bool, React.PropTypes.instanceOf(Immutable.Map)
    ]),
    unbind: React.PropTypes.func
  },

  render: function() {
    var props = this.props,
        name  = props.name,
        label = props.label,
        type  = props.type,
        scale = props.scale,
        field = props.field,
        unbind = props.unbind,
        labelEl, scaleEl, controlEl, extraEl;

    React.Children.forEach(props.children, function(child) {
      var className = child && child.props.className;
      if (className === 'extra') {
        extraEl = child;
      } else if (className === 'control') {
        controlEl = child;
      } else if (type === 'label' || (className && className.indexOf('label') !== -1)) {
        labelEl = child;
      }
    });

    labelEl = labelEl || (<label htmlFor={name}>{label}</label>);
    scaleEl = scale ?
      (<div className="scale" onClick={unbind}>{props.scaleName}</div>) : null;

    controlEl = field ?
      (<div className={'field ' + (props.srcField ? 'source' : 'derived')}
        onClick={unbind}>{field}</div>) : controlEl;

    if (!controlEl) {
      switch (type) {
        case 'autocomplete':
          controlEl = (
            <AutoComplete type={props.autoType} updateFn={props.onChange}
              value={props.value} dsId={props.dsId}/>
          );
          break;
        default:
          controlEl = (
            <FormInputProperty {...props} />
          );
      }
    }

    if (extraEl) {
      extraEl = (<div className="extra">{extraEl}</div>);
    }

    var className = 'property' + (props.canDrop ? ' can-drop' : '') +
      (props.firstChild ? ' first-child' : '');

    return (
      <div className={className}>
        {labelEl}
        <div className="control">
          {scaleEl}
          {controlEl}
        </div>
        {extraEl}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Property);
