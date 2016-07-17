import React from 'react';
import { ParticipantRow } from '../../../components';

function Tbody(props) {
  const elements = props.elements || [];

  return (
    <tbody>
      { elements.map(props.rowCreator) }
    </tbody>
  );
}
Tbody.propTypes = {
  elements: React.PropTypes.array,
  rowCreator: React.PropTypes.func,
};

export function getParticipantRowsContainer(participantStore) {
  class ParticipantRowsContainer extends React.Component {
    constructor(props) {
      super(props);

      this.onStoreChange = this.onStoreChange.bind(this);

      this.state = this.extractState();
    }

    componentDidMount() {
      participantStore.listen(this.onStoreChange);
    }

    componentWillUnmount() {
      participantStore.unlisten(this.onStoreChange);
    }

    onStoreChange() {
      this.setState(this.extractState());
    }

    extractState() {
      return { participants: participantStore.getState().participants };
    }

    render() {
      const {
        isChecked,
        checkboxCallback,
      } = this.props;

      const rowCreator = element => <ParticipantRow key={ element.participantId } isChecked={ isChecked } checkboxCallback={ checkboxCallback } participant={ element } />;

      return (
        <Tbody rowCreator={ rowCreator } elements={ this.state.participants } />
      );
    }
  }

  ParticipantRowsContainer.propTypes = {
    isChecked: React.PropTypes.func,
    checkboxCallback: React.PropTypes.func,
  };

  return ParticipantRowsContainer;
}
