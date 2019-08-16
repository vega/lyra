import * as React from 'react';

interface IconProps {
  className?: string;
  onClick?: (evt) => void;
  width?: number | string;
  height?: number | string;
  'data-html'?: boolean;
  'data-tip'?: string;
  'data-place'?: string;
  glyph: any;
}
class BaseIcon extends React.Component<IconProps> {
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
export const Icon = BaseIcon;
