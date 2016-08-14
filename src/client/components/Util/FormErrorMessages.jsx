import _ from 'lodash';
import React from 'react';
import { Alert } from 'react-bootstrap';

export function FormErrorMessages(props) {
  const {
    messages,
  } = props;

  if (messages.length === 0) {
    return <div></div>;
  }

  return (
    <Alert bsStyle="danger">
      <ul>
        {
          _.map(messages, (message, index) => <li key={ index }>{ message }</li>)
        }
      </ul>
    </Alert>
  );
}

FormErrorMessages.propTypes = {
  messages: React.PropTypes.arrayOf(React.PropTypes.string),
};
