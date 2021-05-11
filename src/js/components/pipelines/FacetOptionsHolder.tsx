import * as React from 'react';
import { connect } from 'react-redux';
import {State} from '../../store';
import FacetDropzone from './FacetDropzone';

const layoutOrientaions = ['Row', 'Column'];
interface StateProps {
  layouts: number[];
}

function mapStateToProps(state: State): StateProps {
  const layoutList = state.getIn(['vis', 'present', 'layouts']);
  return {
    layouts: Array.from(layoutList.keys())
  };
}

class FacetOptionsHolder extends React.Component<StateProps> {
  public render() {

    return (
      <div className='facet-container'>
        {layoutOrientaions.map(function(dir,i) {
          return (
            <FacetDropzone key={i} layoutOrientation={dir}/>
          );
        }, this)}
      </div>
    )}

}

export default connect(mapStateToProps, null)(FacetOptionsHolder);