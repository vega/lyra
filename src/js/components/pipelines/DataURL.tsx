import * as React from 'react';

class Loader extends React.Component<{loadURL: (url: string) => void}> {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  public handleSubmit(evt) {
    this.props.loadURL(evt.target.url.value);
    evt.preventDefault();
  }

  public render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type='text' name='url' placeholder='Enter url'/>
        <button type='submit' value='Submit' className='button'>Load</button>
      </form>
    );
  }
}

export default Loader;
