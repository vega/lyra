import * as React from 'react';

interface IconProps {
  // TODO(jzong): change 'any' to more specific types
  className?: string;
  onClick?: any;
  width?: number;
  height?: number;
  'data-html'?: any;
  'data-tip'?: any;
  'data-place'?: any;
  glyph: any;
}
class Icon extends React.Component<IconProps> {
  public render() {
    const props = this.props;
    const className = (props.className ? props.className + ' ' : '') + 'icon';

    return (
      <svg
        className={className}
        onClick={props.onClick}
        width={props.width || 13}
        height={props.height || 13}
        data-html={props['data-html']}
        data-tip={props['data-tip']}
        data-place={props['data-place']}
      >
        <use xlinkHref={'#' + props.glyph.id} />
      </svg>
    );
  }
}

module.exports = Icon;
