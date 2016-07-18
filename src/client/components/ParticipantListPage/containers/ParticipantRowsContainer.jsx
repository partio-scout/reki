import React from 'react';
import Spinner from 'react-spinner';
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
        columnCount,
        availableDates,
      } = this.props;

      const rowCreator = element => <ParticipantRow key={ element.participantId } isChecked={ isChecked } checkboxCallback={ checkboxCallback } availableDates={ availableDates } participant={ element } />;

      return this.state.participants === undefined
        ? (
          <tbody>
            <tr>
              <td colSpan={ columnCount }>
                <Spinner />
              </td>
            </tr>
          </tbody>
        ) : (
          <Tbody rowCreator={ rowCreator } elements={ this.state.participants } />
        );
    }
  }

  ParticipantRowsContainer.propTypes = {
    isChecked: React.PropTypes.func,
    checkboxCallback: React.PropTypes.func,
    availableDates: React.PropTypes.array.isRequired,
    columnCount: React.PropTypes.number,
  };

  return ParticipantRowsContainer;
}
