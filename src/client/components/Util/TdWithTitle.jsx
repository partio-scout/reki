import React from 'react';

export function TdWithTitle({ value }) {
  return (
    <td title={ value }>{ value }</td>
  );
}

TdWithTitle.propTypes = {
  value: React.PropTypes.node,
};
