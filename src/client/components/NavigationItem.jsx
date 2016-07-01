import React from 'react';
import { NavItem } from 'react-bootstrap';
import { NavLinkItem } from '../components';

export function getNavigationItem() {
  class NavigationItem extends React.Component {
    render() {
      const {
        values,
      } = this.props;

      if (values.isExternalLink) {
        return (<NavItem href={ values.to } onClick={ values.onClick }>{ values.label }</NavItem>);
      } else {
        return (
          <NavLinkItem to={ values.to } isIndexLink={ values.isIndexLink }>
            { values.label }
          </NavLinkItem>
        );
      }
    }
  }

  NavigationItem.propTypes = {
    values: React.PropTypes.object,
  };

  return NavigationItem;
}
