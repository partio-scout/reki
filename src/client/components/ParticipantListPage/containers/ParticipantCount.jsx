import React from 'react';

function Count(props) {
  return (
    <div className="participant-count well">
      Hakutulokset
      <div className="h2">{ props.count }</div>
    </div>
  );
}
Count.propTypes = {
  count: React.PropTypes.number,
};

export function getParticipantCount(participantStore) {
  class ParticipantCount extends React.Component {
    constructor(props) {
      super(props);

      this.onStoreChanged = this.onStoreChanged.bind(this);
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChanged);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChanged);
    }

    onStoreChanged() {
      this.setState(this.extractState());
    }

    extractState() {
      return { count: participantStore.getState().participantCount };
    }

    render() {
      return (
        <Count count={ this.state.count }/>
      );
    }
  }

  return ParticipantCount;
}
