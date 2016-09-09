'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    WAUtils = require('../../util/walkthrough-utils'),
    validate = WAUtils.validate,
    validateDom = WAUtils.validateDom,
    WActions = require('../../actions/walkthroughActions'),
    vegaSpec = require('../../ctrl').export,
    ToolTip = require('./ToolTip'),
    Dialogue = require('./Dialogue'),
    Errors = require('./Error'),
    TOOL_TIP_MAX_W = 276,
    TOOL_TIP_MAX_H = 400;

function mapStateToProps(reduxState, ownProps) {
  var active = getIn(reduxState, 'walkthrough.activeWalkthrough'),
      currentStepId = getIn(reduxState, 'walkthrough.activeStep'),
      steps = getIn(reduxState, 'walkthrough.data.' + active + '.steps');

  return {
    currentStepId: currentStepId,
    steps: steps,
    marks: getInVis(reduxState, 'marks')
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    deselectWalkthrough: function() {
      dispatch(WActions.setActiveWalkthrough(null));
      dispatch(WActions.setActiveStep(1));
    },
    goToNext: function() {
      if (this.steps.size > this.currentStepId) {
        dispatch(WActions.setActiveStep(this.currentStepId + 1));
      }
    },
    goToPrevious: function() {
      if (this.currentStepId > 1) {
        dispatch(WActions.setActiveStep(this.currentStepId - 1));
      }
    }
  };
}

var Step = React.createClass({
  propTypes: {
    currentStepId: React.PropTypes.number,
    steps: React.PropTypes.object,
    marks: React.PropTypes.object,
    goToNext: React.PropTypes.func,
    goToPrevious: React.PropTypes.func,
    deselectWalkthrough: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      error: false,
      errorMap: null,
      errorMessage: null
    };
  },

  getNextStep: function() {
    var steps = this.props.steps.toJS();
    var currentId = this.props.currentStepId;
    return steps.find(function(step) {
      if (steps.length > currentId) {
        return step.id === currentId + 1;
      }
      return null;
    });
  },

  getCurrentStep: function() {
    var steps = this.props.steps.toJS();
    var currentId = this.props.currentStepId;
    return steps.find(function(step) {
      return step.id === currentId;
    });
  },

  previous: function() {
    this.setState({
      errorMessage: '',
      errorMap: null,
      error: false
    });
    this.props.goToPrevious();
  },

  next: function() {
    var current = this.getCurrentStep(),
        opts = current.opts,
        requiresValidation = opts.validate,
        validation;

    if (requiresValidation) {
      validation = this.validateStep(opts);

      if (validation.success_status) {
        this.setState({error: false});
        this.props.goToNext();
      } else {
        this.setState({errorMessage: validation.message});
        this.setState({errorMap: validation.errors});
        this.setState({error: true});
      }
    } else {
      this.props.goToNext();
    }
  },

  forceContinue: function() {
    this.setState({error: false});
    this.props.goToNext();
  },

  quitWalkthrough: function() {
    this.props.deselectWalkthrough();
  },

  validateStep: function(stepOpts) {
    var domState = stepOpts.domState,
        validation;

    if (domState) {
      validation = validateDom(domState);
    } else {
      var thisState = vegaSpec();
      var nextState = this.getNextStep().lyra_state;
      validation = validate(thisState, nextState);
    }

    return validation;
  },

  controls: function() {
    var state = this.state,
        props = this.props,
        notLast = (props.steps.size > props.currentStepId),
        notFirst = props.currentStepId !== 1,
        error = state.error, next, previous, finish;

    error = error ? <span className="skip" onClick={this.forceContinue}>
        Skip this step
      </span> : null;
    next = notLast ? <span className="next" onClick={this.next}>
        NEXT
      </span> : null;
    previous = notFirst ? (<span className="previous" onClick={this.previous}>
        Previous
      </span>) : null;
    finish = !notLast ? (<span className="next" onClick={this.quitWalkthrough}>
        FINISH
      </span>) : null;

    return (
      <div className="controls">
        {previous}
        {error}
        {next}
        {finish}
      </div>
    );
  },

  getTargetEl: function(selector) {
    // TODO parameterize for more complex dom selection
    return document.getElementById(selector) || document.querySelector(selector);
  },

  computeToolTipPosition: function(targetDomElSelector) {
    var targetDomEl = this.getTargetEl(targetDomElSelector),
        targetBounds,
        windowIW = window.innerWidth,
        pos = {}, shorter, narrower;

    if (targetDomEl) {
      targetBounds = targetDomEl.getBoundingClientRect();
      pos.arrow = {};

      if (windowIW - targetBounds.right >= TOOL_TIP_MAX_W) {
        narrower = targetBounds.width && targetBounds.width < TOOL_TIP_MAX_W / 2;
        shorter = targetBounds.height && targetBounds.height < TOOL_TIP_MAX_H / 2;

        if (narrower || shorter) {
          pos.left = targetBounds.left - ((TOOL_TIP_MAX_W / 2) - (targetBounds.width / 2)) + 'px';
          pos.top = targetBounds.bottom + 'px';
          pos.orient = 'bottom';
        } else {
          pos.left = targetBounds.right + 'px';
          pos.top = targetBounds.top + 'px';
          pos.orient = 'right';
        }
      }
    }

    return pos;
  },

  highlightTarget: function(selector) {},

  render: function() {
    var props = this.props,
        current = this.getCurrentStep(),
        currentId = props.currentStepId,
        thumbnail = current.image ? (<img src={current.image} alt={current.alt_text}/>) : '',
        controls = this.controls(),
        steps = this.props.steps.valueSeq().toArray(),
        stepType = current.type,
        errors = this.state.errorMap,
        message = this.state.errorMessage,
        error = this.state.error ? (<Errors message={message} errors={errors}/>) : '',
        stepProps = {
          title: current.title,
          text: current.text,
          error: error,
          position: {}
        },
        targetDomElSelector, stepInner;

    if (stepType === 'tooltip') {
      var opts = current.opts;

      targetDomElSelector = opts ? opts.target : undefined;
      stepProps.position = this.computeToolTipPosition(targetDomElSelector);
      stepProps.options = opts;

      stepInner = (<ToolTip control={controls} quit={this.quitWalkthrough}
        {...stepProps} />);
    } else {
      stepProps.steps = steps;
      stepProps.currentId = currentId;
      stepProps.thumbnail = thumbnail;
      stepInner = (<Dialogue control={controls} quit={this.quitWalkthrough}
        {...stepProps} />);
    }

    return (
      <div className="step">
        {stepInner}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Step);
