import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {State} from '../../store';
import {Errors} from './Error';

const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;
const validate = require('../../util/walkthrough-utils').validate;
const WActions = require('../../actions/walkthroughActions');
const vegaSpec = require('../../ctrl').export;
const assets = require('../../util/assets');
const Icon = require('../Icon');

interface StateProps {
  currentStepId: number;
  steps: any;
  marks: any;
}

interface DispatchProps {
  deselectWalkthrough: () => void;
  goToNext: () => void;
}

interface OwnState {
  error: boolean;
  errorMap: any;
  errorMessage: string;
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  const active = getIn(reduxState, 'walkthrough.activeWalkthrough');
  const currentStepId = getIn(reduxState, 'walkthrough.activeStep');
  const steps = getIn(reduxState, 'walkthrough.data.' + active + '.steps');

  return {
    currentStepId: currentStepId,
    steps: steps,
    marks: getInVis(reduxState, 'marks')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps): DispatchProps {
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

class Step extends React.Component<StateProps & DispatchProps, OwnState> {

  public getInitialState(): OwnState {
    return {
      error: false,
      errorMap: null,
      errorMessage: null
    };
  }

  public getNextStep() {
    const steps = this.props.steps.toJS();
    const currentId = this.props.currentStepId;
    return steps.find(function(step) {
      if (steps.length > currentId) {
        return step.id === currentId + 1;
      }
      return null;
    });
  }

  public getCurrentStep() {
    const steps = this.props.steps.toJS();
    const currentId = this.props.currentStepId;
    return steps.find(function(step) {
      return step.id === currentId;
    });
  }

  public next() {
    const validation = this.validateStep();
    if (validation.success_status) {
      this.setState({error: false});
      this.props.goToNext();
    } else {
      this.setState({errorMessage: validation.message});
      this.setState({errorMap: validation.errors});
      this.setState({error: true});
    }
  }

  public forceContinue() {
    this.setState({error: false});
    this.props.goToNext();
  }

  public quitWalkthrough() {
    this.props.deselectWalkthrough();
  }

  public validateStep() {
    // get current lyra object
    const thisState = vegaSpec();
    const nextState = this.getNextStep().lyra_state;
    return validate(thisState, nextState);
  }

  private classNames: 'hints';

  public nextButton() {
    const props = this.props;
    const notLast = (props.steps.size > props.currentStepId);
    if (this.state.error && notLast) {
      return (<div className='next'>
                <span className ='button' onClick={this.next}>NEXT</span>
                <br/>
                <span onClick={this.forceContinue}>Continue without validation</span>
              </div>);
    } else if (notLast) {
      return (<span className='next'>
                <span className ='button' onClick={this.next}>NEXT</span>
              </span>);
    }
    return '';
  }

  public render() {
    const props = this.props;
    const current = this.getCurrentStep();
    const currentId = props.currentStepId;
    const thumbnail = current.image ? (<img src={current.image} alt={current.alt_text}/>) : '';
    const nextButton = this.nextButton();
    const steps = this.props.steps.toJS();

    const errors = this.state.errorMap;
    const message = this.state.errorMessage;
    const error = this.state.error ? (<Errors message={message} errors={errors}/>) : '';

    return (
      <div className={this.classNames}>
        {thumbnail}
        <div className='details'>
          <h3 className='hint-header'>{current.title}</h3>
          <p>{current.text}</p>
          {nextButton}
          <span className='close-hint' onClick={this.quitWalkthrough}>
            <Icon glyph={assets.close} />
          </span>
        </div>
        <ul className='step-dots'>
         {steps.map(function(step, i) {
           const selected = (step.id === currentId) ? 'selected' : '';
           return (<li key={i} className={selected} />);
         })}
        </ul>
        {error}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Step);
