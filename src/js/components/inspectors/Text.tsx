'use strict';

const assets = require('../../util/assets');
const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {setMarkVisual} from '../../actions/markActions';
import {PrimType} from '../../constants/primTypes';
import {State} from '../../store';
import {TextAlignments, TextBaselines, TextFonts, TextFontStyles, TextFontWeights} from '../../store/factory/marks/Text';
import {Property} from './Property';

interface OwnProps {
  primId?: number;
  primType: PrimType;
  autoVal: string;

}

interface StateProps {
  dsId: number;
  text: string;
}

interface DispatchProps {
  updateTextAttributes: (property: string, def: any) => void;
  updateText: (value: any) => void
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  const primId = ownProps.primId;
  return {
    dsId: getInVis(reduxState, `marks.${primId}.from.data`),
    text: getInVis(reduxState, `marks.${primId}.encode.update.text.signal`)
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    updateTextAttributes: function(property, value) {
      dispatch(setMarkVisual({property, def: {signal: value}}, ownProps.primId));
    },
    updateText: function(value) {
      dispatch(setMarkVisual({property: 'text', def: {signal: value}}, ownProps.primId));
    }
  };
}

class BaseTextInspector extends React.Component<OwnProps & StateProps & DispatchProps> {
  constructor(props) {
    super(props);
  }

  public render() {
    const props = this.props;
    const dsId = props.dsId;

    return (
      <div>
        <div className='property-group'>
          <Property name='text.signal' value={props.text}
            type='autocomplete' autoType='tmpl' droppable={true}
            dsId={dsId} onChange={props.updateText} {...props}>
              <h3 className='label'>Text</h3>
          </Property>
        </div>

        <div className='property-group'>
          <h3>Font</h3>

          <Property name='font' label='Face' type='select'
            opts={TextFonts} droppable={true} {...props} />

          <Property name='fontSize' label='Size' type='number'
            droppable={true} {...props} />

          <Property name='fontWeight' label='Weight' type='toggle'
            glyph={assets.bold} opts={TextFontWeights.map(x => String(x))}
            droppable={true} {...props} />

          <Property name='fontStyle' label='Style' type='toggle'
            glyph={assets.italic} opts={TextFontStyles}
            droppable={true} {...props} />

          <Property name='fill' label='Color' type='color'
            droppable={true} {...props} />

          <Property name='fillOpacity' label='Opacity' type='range'
            min='0' max='1' step='0.05' droppable={true} {...props} />
        </div>

        {/* <div className='property-group'>
          <h3>Position</h3>

          <Property name='x' label='X' type='text' canDrop={true} {...props} />

          <Property name='y' label='Y' type='text' canDrop={true} {...props} />
        </div> */}

        <div className='property-group'>
          <h3>Offset</h3>

          <Property name='dx' label='X' type='number' droppable={true} {...props} />

          <Property name='dy' label='Y' type='number' droppable={true} {...props} />

        </div>

        <div className='property-group'>
          <h3>Align</h3>

          <Property name='align' label='Horizontal' type='selection'
            glyphs={[assets['align-left'],
                     assets['align-center'], assets['align-right']]}
            opts={TextAlignments} droppable={true} {...props} />

          <Property name='baseline' label='Vertical' type='selection'
            glyphs={[assets['vertical-align-top'],
                     assets['vertical-align-center'], assets['vertical-align-bottom']]}
            opts={TextBaselines} droppable={true} {...props} />

          <Property name='angle' label='Rotation' type='number'
            droppable={true} {...props} />
        </div>
      </div>
    );
  }
};

export const TextInspector = connect(mapStateToProps, mapDispatchToProps)(BaseTextInspector);
