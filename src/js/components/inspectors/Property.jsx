'use strict';

var React = require('react'),
    connect = require('react-redux').connect,
    Immutable = require('immutable'),
    FormInputProperty = require('./FormInputProperty'),
    AutoComplete = require('./AutoComplete'),
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    TYPES = require('../../constants/primTypes'),
    resetMarkVisual = require('../../actions/markActions').resetMarkVisual,
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

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
    } else {
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
    srcField:  dsId && field ?
      getInVis(reduxState, 'datasets.' + dsId + '._schema.' + field + '.source') : false,
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

var Property = createReactClass({
  propTypes: {
    name: propTypes.string.isRequired,
    label: propTypes.string,
    field: propTypes.string,
    group: propTypes.string,
    scale: propTypes.number,
    dsId: propTypes.number,
    scaleName: propTypes.string,
    signal: propTypes.string,
    autoType: propTypes.string,
    onChange: propTypes.func,
    value: propTypes.oneOfType([
      propTypes.string, propTypes.number,
      propTypes.bool, propTypes.instanceOf(Immutable.Map)
    ]),
    unbind: propTypes.func
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
