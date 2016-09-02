'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    isArray = require('datalib').isArray,
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    validate = require('../../util/walkthrough-utils').validate,
    WActions = require('../../actions/walkthroughActions'),
    vegaSpec = require('../../ctrl').export,
    ToolTip = require('./ToolTip'),
    Dialog = require('./Dialog'),
    Errors = require('./Error');

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
    }
  };
}

var Step = React.createClass({
  propTypes: {
    currentStepId: React.PropTypes.number,
    steps: React.PropTypes.object,
    marks: React.PropTypes.object,
    goToNext: React.PropTypes.func,
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

  next: function() {
    var requiresValidation = this.getCurrentStep().opts.validate,
        validation;

    if (requiresValidation) {
      validation = this.validateStep();

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

  validateStep: function() {
    // get current lyra object
    var thisState = vegaSpec();
    var nextState = this.getNextStep().lyra_state;
    return validate(thisState, nextState);
  },

  // classNames: 'hints',

  nextButton: function() {
    var props = this.props,
        notLast = (props.steps.size > props.currentStepId);

    if (this.state.error && notLast) {
      return (<div className="next">
                <span className="button" onClick={this.next}>NEXT</span>
                <br/>
                <span onClick={this.forceContinue}>Skip this step</span>
              </div>);
    } else if (notLast) {
      return (<span className="next">
                <span className="button" onClick={this.next}>NEXT</span>
              </span>);
    }
    return '';
  },

  render: function() {
    var props = this.props,
        current = this.getCurrentStep(),
        currentId = props.currentStepId,
        thumbnail = current.image ? (<img src={current.image} alt={current.alt_text}/>) : '',
        nextButton = this.nextButton(),
        steps = this.props.steps.valueSeq().toArray(),
        stepType = current.type;

    var errors = this.state.errorMap;
    var message = this.state.errorMessage;
    var error = this.state.error ? (<Errors message={message} errors={errors}/>) : '';

    var stepInner,
        stepProps = {
          title: current.title,
          text: current.text,
          target: current.opts ? current.opts.target : undefined,
          error: error
        };

    if (stepType === 'tooltip') {
      stepInner = (<ToolTip control={nextButton} quit={this.quitWalkthrough}
        {...stepProps} />);
    } else {
      // TODO modify to check stepType === 'dialog'
      stepProps.steps = steps;
      stepProps.currentId = currentId;
      stepProps.thumbnail = thumbnail;
      stepInner = (<Dialog control={nextButton} quit={this.quitWalkthrough}
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
