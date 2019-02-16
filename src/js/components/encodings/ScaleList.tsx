import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import {selectScale} from '../../actions/inspectorActions';
import {State} from '../../store';
import {ScaleRecord} from '../../store/factory/Scale';

const ContentEditable = require('../ContentEditable');
const imutils = require('../../util/immutable-utils');
const getIn = imutils.getIn;
const getInVis = imutils.getInVis;

interface StateProps {
  selectedId: number;
  scales: Map<string, ScaleRecord>;
}

interface DispatchProps {
  selectScale: (id: number) => void;
}

function mapStateToProps(reduxState: State, ownProps): StateProps {
  return {
    selectedId: reduxState.getIn(['inspector', 'encodings', 'selectedId']),
    scales: getInVis(reduxState, 'scales')
  };
}

function mapDispatchToProps(dispatch: Dispatch): DispatchProps {
  return {
    selectScale: function(id) {
      dispatch(selectScale(id));
    }
  };
}

class ScaleList extends React.Component<StateProps & DispatchProps> {
  public render() {
    const props = this.props;
    const scales = [...props.scales.values()]

    return (
      <div id='scale-list'>
        <h2>Scales</h2>
        <ul>
          {scales.map(function(scale) {
            const id = scale.get('_id');
            const name = scale.get('name');

            return (
              <li key={id}
                onClick={props.selectScale.bind(null, id)}>
                <div className={props.selectedId === id ? 'selected scale name' : 'scale name'}>
                  <ContentEditable value={name} /* save={updateScaleName} */ />
                </div>
              </li>
            );
          }, this)}
        </ul>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScaleList);
