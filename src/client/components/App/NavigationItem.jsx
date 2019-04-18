import React from 'react';
import { Navbar, NavItem, Glyphicon } from 'react-bootstrap';
import { NavLink } from 'redux-first-router-link';

export function getNavigationItem() {
  class NavigationItem extends React.Component {
    render() {
      const {
        values,
      } = this.props;

      const label = (values.icon ? <span><Glyphicon glyph={ values.icon }/> { values.label }</span> : values.label);

      if (values.isExternalLink || values.onClick) {
        return (<NavItem href={ values.to } onClick={ values.onClick }>{ label }</NavItem>);
      } else if (values.to) {
        return (<li><NavLink to={ values.to } isIndexLink={ values.isIndexLink }>{ label }</NavLink></li>);
      } else {
        return (<Navbar.Text>{ label }</Navbar.Text>);
      }
    }
  }

  NavigationItem.propTypes = {
    values: React.PropTypes.object,
  };

  return NavigationItem;
}
