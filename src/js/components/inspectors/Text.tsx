'use strict';

const Text = require('../../store/factory/marks/Text');
const assets = require('../../util/assets');
const getInVis = require('../../util/immutable-utils').getInVis;

import * as React from 'react';
import {connect} from 'react-redux';
import { Dispatch } from 'redux';
import {setMarkVisual, updateMarkProperty} from '../../actions/markActions';
import {PrimType} from '../../constants/primTypes';
import {State} from '../../store';
import {TextAlignments, TextBaselines, TextFonts, TextFontStyles, TextFontWeights} from '../../store/factory/marks/Text';
import {Property} from './Property';

interface OwnProps {
  primId?: number;
  primType: PrimType;
  autoVal: string;

}

interface OwnState {
  interactions: string[];
  type: string;
}

interface StateProps {
  dsId: number;
}

interface DispatchProps {
  updateTextAttributes: (property: string, def: any) => void;
  updateText: (value: any) => void
}

function mapStateToProps(reduxState: State, ownProps: OwnProps): StateProps {
  return {
    dsId: getInVis(reduxState, 'marks.' + ownProps.primId + '.from.data')
  };
}

function mapDispatchToProps(dispatch: Dispatch, ownProps: OwnProps): DispatchProps {
  return {
    updateTextAttributes: function(property, value) {
      dispatch(setMarkVisual({property, def: {signal: value}}, ownProps.primId));
    },
    updateText: function(value) {
      const val = value.target ? value.target.value : value;
      dispatch(setMarkVisual({property: 'text', def: {signal: value}}, ownProps.primId));
    }
  };
}

class BaseTextInspector extends React.Component<OwnProps & StateProps & DispatchProps, OwnState> {
  constructor(props) {
    super(props);

    this.state = {
      interactions: [],
      type: 'min'
    }
  }

  public bindSignalToText(interactions: string[], type='min') {
    let condition = interactions[0];
    if (interactions.length > 1) condition = condition + ' && ' + interactions[1];
    const displayText = interactions.map(e => {
      return `format(${type}(${e}[0], ${e}[1]),'d')`
    })
    let displayTextString = displayText.join(`+ ', ' +`);
    displayTextString = `'(' + ` + displayTextString + `+ ')'`;
    const value = `${condition} ? ${displayTextString} : ''`;
    this.props.updateTextAttributes('text', value);
    interactions.forEach(e => {
      const scale = e[e.length - 1];
      if (scale == 'x') this.props.updateTextAttributes('x', `${type}(lyra_brush_x[0], lyra_brush_x[1]) - 20`);
      else if (scale == 'y') this.props.updateTextAttributes('y', `${type}(lyra_brush_y[0], lyra_brush_y[1]) - 5`);
    })
  }
  public handleDrop = (evt) => {
    const dt = evt.dataTransfer;
    const signalName = dt.getData('signalName');
    const signalObj = this.state.interactions.filter(e => e === signalName );
    if (!signalObj.length) {
      const newInteractions = [...this.state.interactions, signalName];
      this.bindSignalToText(newInteractions, this.state.type);
      this.setState({interactions: newInteractions});
    }
  };

  public handleTypeChange = (value) => {
    if(value != this.state.type) {
      this.bindSignalToText(this.state.interactions, value);
      this.setState({type: value});
    }
  }

  public handleDragOver = (evt) => {
    if (evt.preventDefault) {
      evt.preventDefault(); // Necessary. Allows us to drop.
    }
  };
  public render() {
    const props = this.props;
    const dsId = props.dsId;

    const signals = this.state.interactions.map((e, i) =>
      <span className='widget-tag' key={e+i}>{e}</span>
    )

    return (
      <div>
        <div className='property-group'>
          <Property name='text.signal' type='autocomplete' autoType='tmpl'
          dsId={dsId} onChange={props.updateText} {...props}>
            <h3 className='label'>Text</h3>
          </Property>

          <div onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
            {this.state.interactions.length ? signals : null}
            <div><i>Drop interaction here</i></div>
            <br />
            Map to:
            <select value={this.state.type} onChange={e => this.handleTypeChange(e.target.value)}>
              <option value='min'>min</option>
              <option value='max'>max</option>
            </select>
          </div>
        </div>

        <div className='property-group'>
          <h3>Font</h3>

          <Property name='font' label='Face' type='select'
            opts={TextFonts} canDrop={true} {...props} />

          <Property name='fontSize' label='Size' type='number'
            canDrop={true} {...props} />

          <Property name='fontWeight' label='Weight' type='toggle'
            glyph={assets.bold} opts={TextFontWeights.map(x => String(x))}
            canDrop={true} {...props} />

          <Property name='fontStyle' label='Style' type='toggle'
            glyph={assets.italic} opts={TextFontStyles}
            canDrop={true} {...props} />

          <Property name='fill' label='Color' type='color'
            canDrop={true} {...props} />

          <Property name='fillOpacity' label='Opacity' type='range'
            min='0' max='1' step='0.05' canDrop={true} {...props} />
        </div>

        {/* <div className='property-group'>
          <h3>Position</h3>

          <Property name='x' label='X' type='text' canDrop={true} {...props} />

          <Property name='y' label='Y' type='text' canDrop={true} {...props} />
        </div> */}

        <div className='property-group'>
          <h3>Offset</h3>

          <Property name='dx' label='X' type='number' canDrop={true} {...props} />

          <Property name='dy' label='Y' type='number' canDrop={true} {...props} />

        </div>

        <div className='property-group'>
          <h3>Align</h3>

          <Property name='align' label='Horizontal' type='selection'
            glyphs={[assets['align-left'],
                     assets['align-center'], assets['align-right']]}
            opts={TextAlignments} canDrop={true} {...props} />

          <Property name='baseline' label='Vertical' type='selection'
            glyphs={[assets['vertical-align-top'],
                     assets['vertical-align-center'], assets['vertical-align-bottom']]}
            opts={TextBaselines} canDrop={true} {...props} />

          <Property name='angle' label='Rotation' type='number'
            canDrop={true} {...props} />
        </div>
      </div>
    );
  }
};

export const TextInspector = connect(mapStateToProps, mapDispatchToProps)(BaseTextInspector);
