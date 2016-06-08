import React from 'react';

export function getInCampLabel(value) {
  if (value == 1) {
    return 'Ei ole leirissä';
  } else if (value == 2) {
    return 'Poistunut leiristä väliaikaisesti';
  } else if (value == 3) {
    return 'Leirissä';
  }
  return 'Tuntematon arvo';
}

export function getInCampColor(value) {
  if (value == 1) {
    return 'red';
  } else if (value == 2) {
    return 'orange';
  } else if (value == 3) {
    return 'green';
  }
  return 'gray';
}

export class InCampStatus extends React.Component {

  render() {

    const label = getInCampLabel(this.props.value);
    const color = `${getInCampColor(this.props.value)} incamp`;

    return (
      <span className={ color } title={ label }>
        <span className="ball"></span>
        <span className="text">{ label }</span>
      </span>
    );
  }
}

InCampStatus.propTypes = {
  value: React.PropTypes.number.isRequired,
};
