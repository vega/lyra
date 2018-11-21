'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    imutils = require('../../util/immutable-utils'),
    getIn = imutils.getIn,
    getInVis = imutils.getInVis,
    validate = require('../../util/walkthrough-utils').validate,
    WActions = require('../../actions/walkthroughActions'),
    vegaSpec = require('../../ctrl').export,
    Errors = require('./Error'),
    assets = require('../../util/assets'),
    Icon = require('../Icon'),
    propTypes = require('prop-types'),
    createReactClass = require('create-react-class');

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

var Step = createReactClass({
  propTypes: {
    currentStepId: propTypes.number,
    steps: propTypes.object,
    marks: propTypes.object,
    goToNext: propTypes.func,
    deselectWalkthrough: propTypes.func
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
    var validation = this.validateStep();
    if (validation.success_status) {
      this.setState({error: false});
      this.props.goToNext();
    } else {
      this.setState({errorMessage: validation.message});
      this.setState({errorMap: validation.errors});
      this.setState({error: true});
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

  classNames: 'hints',

  nextButton: function() {
    var props = this.props;
    var notLast = (props.steps.size > props.currentStepId);
    if (this.state.error && notLast) {
      return (<div className="next">
                <span className ="button" onClick={this.next}>NEXT</span>
                <br/>
                <span onClick={this.forceContinue}>Continue without validation</span>
              </div>);
    } else if (notLast) {
      return (<span className="next">
                <span className ="button" onClick={this.next}>NEXT</span>
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
        steps = this.props.steps.toJS();

    var errors = this.state.errorMap;
    var message = this.state.errorMessage;
    var error = this.state.error ? (<Errors message={message} errors={errors}/>) : '';
    return (
      <div className={this.classNames}>
        {thumbnail}
        <div className="details">
          <h3 className="hint-header">{current.title}</h3>
          <p>{current.text}</p>
          {nextButton}
          <span className="close-hint" onClick={this.quitWalkthrough}>
            <Icon glyph={assets.close} />
          </span>
        </div>
        <ul className="step-dots">
         {steps.map(function(step, i) {
           var selected = (step.id === currentId) ? 'selected' : '';
           return (<li key={i} className={selected}></li>);
         })}
        </ul>
        {error}
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Step);
