import * as React from 'react';

interface OwnProps {
  message: string;
  errors: string[];
}

export class Errors extends React.Component<OwnProps> {
  private classNames = 'error';

  public render() {
    const props = this.props;
    return (
      <div className='error'>
        <p>{props.message}</p>
        <ul>
          {props.errors.map(function(error, i) {
            return (<li key={i}>{error}</li>);
          })}
        </ul>
      </div>
    );
  }
}
