import * as React from 'react';
import {connect} from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import {Dispatch} from 'redux';
import {changeFieldMType} from '../../actions/datasetActions';
import {ColumnRecord} from '../../store/factory/Dataset';
import { Icon } from '../Icon';

const capitalize = require('capitalize');
const MTYPES = require('../../constants/measureTypes');
const assets = require('../../util/assets');

interface OwnProps {
  dsId: number;
  field: ColumnRecord;
}

interface DispatchProps {
  changeType: () => void;
}

function mapDispatch(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    changeType: function() {
      const field = ownProps.field;
      let idx = MTYPES.indexOf(field.mtype);

      idx = (idx + 1) % MTYPES.length;
      dispatch(changeFieldMType({field: field.name, mtype: MTYPES[idx]}, ownProps.dsId));
    }
  };
}

class BaseFieldType extends React.Component<OwnProps & DispatchProps> {
  public componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  public render() {
    const props = this.props;
    const type  = props.field.mtype;
    return (
      <Icon onClick={props.changeType} glyph={assets[type]} width='10' height='10'
        data-tip={capitalize(type) + ' field'} />
    );
  }
};

export default connect(null, mapDispatch)(BaseFieldType);
