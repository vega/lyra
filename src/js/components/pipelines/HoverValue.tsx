import * as React from 'react';

const d3 = require('d3');

interface OwnProps {
  event: React.MouseEvent<HTMLElement>;
  scrollLeft: number;
}

class HoverValue extends React.Component<OwnProps> {

  public render() {
    const props = this.props;
    const evt = props.event;

    if (!evt) {
      return null;
    }

    const target = d3.select(evt.target);
    const node   = target.node();
    const field  = node.parentNode.firstChild;
    const rect = field.getBoundingClientRect();
    const left = field.offsetLeft + rect.width;
    const altClass = target.classed('odd') ? 'odd' : 'even';

    const style = {
      display: 'block',
      left: node.offsetLeft - props.scrollLeft + left,
      top: field.offsetTop
    };

    return (
      <div className={'full value ' + altClass} style={style}>
        {target.text()}
      </div>
    );
  }
}

export default HoverValue;
