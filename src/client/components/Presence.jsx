import React from 'react';

export function getPresenceLabel(value) {
  if (value == 1) {
    return 'Poistunut leiristä';
  } else if (value == 2) {
    return 'Poistunut leiristä väliaikaisesti';
  } else if (value == 3) {
    return 'Saapunut leiriin';
  }
  return 'Tuntematon arvo';
}

export function getPresenceColor(value) {
  if (value == 1) {
    return 'red';
  } else if (value == 2) {
    return 'orange';
  } else if (value == 3) {
    return 'green';
  }
  return 'gray';
}

export class Presence extends React.Component {

  render() {

    const label = getPresenceLabel(this.props.value);
    const color = `${getPresenceColor(this.props.value)} presence`;

    return (
      <p className={ color } title={ label }>
        <span className="ball"></span>
        <span className="text">{ label }</span>
      </p>
    );
  }
}

Presence.propTypes = {
  value: React.PropTypes.number,
};
