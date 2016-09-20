'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
// <<<<<<< HEAD
    keys = require('datalib').keys,
    isArray = require('datalib').isArray,
// =======
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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
// <<<<<<< HEAD
      steps = getIn(reduxState, 'walkthrough.data.' + active + '.steps'),
      paused = getIn(reduxState, 'walkthrough.pausedWalkthrough');
// =======
//       steps = getIn(reduxState, 'walkthrough.data.' + active + '.steps');
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5

  return {
    currentStepId: currentStepId,
    steps: steps,
// <<<<<<< HEAD
    marks: getInVis(reduxState, 'marks'),
    data: getIn(reduxState, 'walkthrough').get('data'),
    pausedWalkthrough: paused,
    activeWalkthrough: active,
    vegaSpec: vegaSpec()
// =======
//     marks: getInVis(reduxState, 'marks')
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    deselectWalkthrough: function() {
      dispatch(WActions.setActiveWalkthrough(null));
      dispatch(WActions.setActiveStep(1));
    },
// <<<<<<< HEAD
    nextWalkThrough: function(nextKey) {
      dispatch(WActions.setActiveWalkthrough(nextKey));
    },
// =======
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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
// <<<<<<< HEAD
    deselectWalkthrough: React.PropTypes.func,
    nextWalkThrough: React.PropTypes.func,
    vegaSpec: React.PropTypes.object
// =======
//     deselectWalkthrough: React.PropTypes.func
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
  },

  getInitialState: function() {
    return {
      error: false,
      errorMap: null,
      errorMessage: null
    };
  },

// <<<<<<< HEAD
  componentWillReceiveProps: function(newProps) {
    var currentStep = this.getCurrentStep(),
        oldVs = this.props.vegaSpec,
        newVs = newProps.vegaSpec;

    if (currentStep.opts.autoValidate && JSON.stringify(oldVs) !== JSON.stringify(newVs)) {
      this.next();
    }
  },

  componentDidUpdate: function() {
    this.unbindProgressors();
    this.bindProgressors();

  },

  bindProgressors: function() {
    var step = this.getCurrentStep(),
        opts = step.opts,
        autoProwess = opts.validate && opts.autoValidate,
        domState = opts.domState,
        parent;

    if (autoProwess && (domState && domState.queryParent)) {
      parent = this.getTargetEl(domState.queryParent);
      parent.addEventListener('DOMNodeInserted', this.next, false);
    }
  },

  unbindProgressors: function() {
    var previous = this.getPreviousStep(),
        popts = previous.opts,
        pautoProwess = popts.validate && popts.autoValidate,
        pdomState = popts.domState,
        pparent;

    if (pautoProwess && (pdomState && pdomState.queryParent)) {
      pparent = this.getTargetEl(pdomState.queryParent);
      pparent.removeEventListener('DOMNodeInserted', this.next, false);
    }
  },

  getPreviousStep: function() {
    var steps = this.props.steps.toJS();
    var currentId = this.props.currentStepId;
    return steps.find(function(step) {
      if (currentId > 0) {
        return step.id === currentId - 1;
      }
      return null;
    });
  },

// =======
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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
// <<<<<<< HEAD
    this.setState({errorMessage: '', errorMap: null, error: false});
    this.unbindProgressors();
// =======
//     this.setState({
//       errorMessage: '',
//       errorMap: null,
//       error: false
//     });
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
    this.props.goToPrevious();
  },

  next: function() {
    var current = this.getCurrentStep(),
        opts = current.opts,
// <<<<<<< HEAD
        validation;

    if (opts.validate) {
      validation = this.validateStep(opts);

      if (validation.success) {
        this.setState({error: false, errorMessage: null, errorMap: null});
        this.props.goToNext();
      } else {
        this.setState({error: true, errorMessage: validation.message, errorMap: validation.errors});
// =======
//         requiresValidation = opts.validate,
//         validation;
//
//     if (requiresValidation) {
//       validation = this.validateStep(opts);
//
//       if (validation.success_status) {
//         this.setState({error: false});
//         this.props.goToNext();
//       } else {
//         this.setState({errorMessage: validation.message});
//         this.setState({errorMap: validation.errors});
//         this.setState({error: true});
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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

// <<<<<<< HEAD
  goToWalkthrough: function(nextKey) {
    this.quitWalkthrough();
    this.props.nextWalkThrough(nextKey);
  },
//
// =======
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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
// <<<<<<< HEAD
        waKeys = keys(props.data.toJS()),
        currentKey = props.activeWalkthrough,
        currentKeyIndex = waKeys.indexOf(currentKey),
        notLast = (props.steps.size > props.currentStepId),
        last = !notLast,
        notFirst = props.currentStepId !== 1,
        error = state.error, nextKey, next, previous, finish, nextWa;

    nextKey = currentKeyIndex + 1 <= waKeys.length - 1 ? waKeys[currentKeyIndex + 1] : null;

    error = error ? (<span className="skip" onClick={this.forceContinue}>
        Skip this step
      </span>) : null;
    next = notLast ? (<span className="next" onClick={this.next}>
        NEXT
      </span>) : null;
    previous = notFirst ? (<span className="previous" onClick={this.previous}>
        Previous
      </span>) : null;
    finish = last ? (<span className="next" onClick={this.quitWalkthrough}>
        FINISH
      </span>) : null;
    nextWa = last && nextKey ? (<span className="nextWa" onClick={this.goToWalkthrough.bind(null, nextKey)}>
        Next walkthrough
      </span>) : null;
// =======
//         notLast = (props.steps.size > props.currentStepId),
//         notFirst = props.currentStepId !== 1,
//         error = state.error, next, previous, finish;
//
//     error = error ? <span className="skip" onClick={this.forceContinue}>
//         Skip this step
//       </span> : null;
//     next = notLast ? <span className="next" onClick={this.next}>
//         NEXT
//       </span> : null;
//     previous = notFirst ? (<span className="previous" onClick={this.previous}>
//         Previous
//       </span>) : null;
//     finish = !notLast ? (<span className="next" onClick={this.quitWalkthrough}>
//         FINISH
//       </span>) : null;
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5

    return (
      <div className="controls">
        {previous}
        {error}
        {next}
        {finish}
{/* <<<<<<< HEAD */}
        {nextWa}
{/* =======
>>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5 */}
      </div>
    );
  },

  getTargetEl: function(selector) {
// <<<<<<< HEAD
    // @TODO parameterize for more complex dom selection
// =======
//     // TODO parameterize for more complex dom selection
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
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

// <<<<<<< HEAD
  processMedia: function(source) {
    var media;

    if (isArray(source)) {
      media = (<span>
        {
          source.forEach(function(imgUrl) {
            return (<img src={imgUrl}></img>);
          })
        }
      </span>);
    } else {
      media = (<img src={source}></img>);
    }

    return media;
  },

  render: function() {
    var props = this.props,
        state = this.state,
        current = this.getCurrentStep(),
        currentId = props.currentStepId,
        media = current.image ? this.processMedia(current.image) : null,
        controls = this.controls(),
        steps = this.props.steps.valueSeq().toArray(),
        stepType = current.type,
        errors = state.errorMap,
        message = state.errorMessage,
// =======
//   highlightTarget: function(selector) {},
//
//   render: function() {
//     var props = this.props,
//         current = this.getCurrentStep(),
//         currentId = props.currentStepId,
//         thumbnail = current.image ? (<img src={current.image} alt={current.alt_text}/>) : '',
//         controls = this.controls(),
//         steps = this.props.steps.valueSeq().toArray(),
//         stepType = current.type,
//         errors = this.state.errorMap,
//         message = this.state.errorMessage,
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
        error = this.state.error ? (<Errors message={message} errors={errors}/>) : '',
        stepProps = {
          title: current.title,
          text: current.text,
          error: error,
// <<<<<<< HEAD
          media: media,
          instructions: current.instructions,
          position: {}
        },
        paused = props.pausedWalkthrough,
// =======
//           position: {}
//         },
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
        targetDomElSelector, stepInner;

    if (stepType === 'tooltip') {
      var opts = current.opts;

      targetDomElSelector = opts ? opts.target : undefined;
      stepProps.position = this.computeToolTipPosition(targetDomElSelector);
      stepProps.options = opts;

// <<<<<<< HEAD
      stepInner = !paused ? (<ToolTip control={controls} quit={this.quitWalkthrough}
        {...stepProps} />) : null;
    } else {
      stepProps.steps = steps;
      stepProps.currentId = currentId;
      stepInner = !paused ? (<Dialogue control={controls} quit={this.quitWalkthrough}
        {...stepProps} />) : null;
// =======
//       stepInner = (<ToolTip control={controls} quit={this.quitWalkthrough}
//         {...stepProps} />);
//     } else {
//       stepProps.steps = steps;
//       stepProps.currentId = currentId;
//       stepProps.thumbnail = thumbnail;
//       stepInner = (<Dialogue control={controls} quit={this.quitWalkthrough}
//         {...stepProps} />);
// >>>>>>> a95677eb24ab61fa0193abc475e2f814601a35d5
    }

    return (
      <div className="step">
        {stepInner}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Step);
