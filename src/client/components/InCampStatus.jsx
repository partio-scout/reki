import React from 'react';

export class InCampStatus extends React.Component {
  
  render() {
    
    let label = 'Tuntematon arvo';
    
    if (this.props.value == 1) {
      label = 'Ei ole leirissä';
    } else if (this.props.value == 2) {
      label = 'Poistunut leiristä väliaikaisesti';
    } else if (this.props.value == 3) {
      label = 'Leirissä';
    }
    
    let color = 'gray';
    
    if (this.props.value == 1) {
      color = 'red';
    } else if (this.props.value == 2) {
      color = 'orange';
    } else if (this.props.value == 3) {
      color = 'green';
    }
    
    color = `${color} incamp`;
    
    return (
      <span className={ color } title={ label }>
        <span className="ball"></span>
        <span className="text">{ label }</span>
      </span>
    );
  }
}
