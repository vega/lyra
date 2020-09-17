'use strict';

import * as React from 'react';
interface MorePropsProps {
  label: string;
  header?: any;
}

interface MorePropsState {
  display: any;

}
class BaseMoreProperties extends React.Component<MorePropsProps, MorePropsState> {

  constructor(props) {
    super(props);
    this.state = {display: 'none'};
    this.handleClick = this.handleClick.bind(this);
  };

  public toggle(old) {
    return old === 'block' ? 'none' : 'block';
  };

  public handleClick(evt) {
    this.setState({display: this.toggle(this.state.display)});
  };

  public render() {
    const props = this.props;
    const state = this.state.display;
    const style0 = {display: state};
    const style1 = {display: this.toggle(state)};
    let moreLink;
    let fewerLink;

    if (props.header) {
      moreLink = (
        <div>
          <h3 className='show-more-props more-props-label'
            onClick={this.handleClick} style={style1}>
            + {props.label}</h3>

          <h3 className='hide-more-props more-props-label'
            onClick={this.handleClick} style={style0}>
            — {props.label}</h3>
        </div>
      );
    } else {
      moreLink = (
        <a className='show-more-props more-props-label' href='#'
          onClick={this.handleClick} style={style1}>
          + More {props.label} Properties
        </a>
      );

      fewerLink = (
        <a className='hide-more-props more-props-label' href='#'
          style={style0} onClick={this.handleClick}>
          – Fewer {props.label} Properties
        </a>
      );
    }

    return (
      <div>
        {moreLink}

        <div className='more-props' style={style0}>
          {props.children}
        </div>

        {fewerLink}
      </div>
    );
  }
};

export const MoreProperties = BaseMoreProperties;
