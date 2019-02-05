import * as React from 'react';
import { connect } from 'react-redux';
import * as ReactTooltip from 'react-tooltip';
import { Dispatch } from 'redux';
import { Icon } from '../Icon';

const capitalize = require('capitalize');
const changeFieldMType = require('../../actions/datasetActions').changeFieldMType;
const MTYPES = require('../../constants/measureTypes');
const assets = require('../../util/assets');

interface OwnProps {
  dsId: number;
  field: FieldObject;
}

interface DispatchProps {
  changeType: () => void;
}

export interface FieldObject {
  name: string;
  mtype: string;
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    changeType: function() {
      const field = ownProps.field;
      let idx = MTYPES.indexOf(field.mtype);

      idx = (idx + 1) % MTYPES.length;
      dispatch(changeFieldMType(ownProps.dsId, field.name, MTYPES[idx]));
    }
  };
}

class FieldType extends React.Component<OwnProps & DispatchProps> {

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
}

export default connect(mapStateToProps, mapDispatchToProps)(FieldType);
