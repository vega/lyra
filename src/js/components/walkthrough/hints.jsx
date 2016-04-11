'use strict';
var React = require('react'),
    connect = require('react-redux').connect,
    getIn = require('../../util/immutable-utils').getIn,
    WActions = require('../../actions/walkthrough');

function mapStateToProps(reduxState, ownProps) {
  return {
    walkthroughs: function(){
      var walkD = getIn(reduxState, 'walkthrough.data').toJS();
      var walkthroughs = [];
      for (var key in walkD){
        walkD[key].key = key;
        walkthroughs.push(walkD[key]);
      }
      return walkthroughs;
    }
  };
}
function mapDispatchToProps(dispatch, ownProps) {
  return {
    select: function(key) {
      dispatch(WActions.setActiveWalkthrough(key));
      dispatch(WActions.setWalkthroughOn(true));
      this.closeModal();
    }
  };
}

var Hints = React.createClass({
  classNames: 'hints',
  render: function() {
    return (
      <div className={this.classNames}>
        <h3 className="hint-header">HINT! Looks like you're... </h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas posuere ipsum urna, id ultricies arcu hendrerit ut.</p>
        <i className="close-hint fa fa-times"></i>
      </div>
    );
  }
});

module.exports = connect(mapStateToProps, mapDispatchToProps)(Hints);
