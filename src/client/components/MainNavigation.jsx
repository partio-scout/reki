import React from 'react';
import { Nav } from 'react-bootstrap';
import { getNavigationItem } from '../components';

export function getMainNavigation() {
  const NavigationItem = getNavigationItem();

  class MainNavigation extends React.Component {
    render() {
      const navItems = this.props.currentUser ? this.getLoggedInNavItems() : this.getLoggedOutNavItems();

      return (
        <Nav pullRight>
          {
            navItems.map(navItem => <NavigationItem key={ navItem.label } values={ navItem } />)
          }
        </Nav>
      );
    }

    getLoggedInNavItems() {
      return [
        {
          to: '/admin',
          isIndexLink: true,
          label: 'Käyttäjät',
        },
        {
          to: '/participants',
          isIndexLink: true,
          label: 'Leiriläiset',
        },
        {
          onClick: this.props.onLogout,
          isExternalLink: true,
          label: 'Kirjaudu ulos',
        },
      ];
    }

    getLoggedOutNavItems() {
      return [
        {
          to: '/saml/login',
          isIndexLink: true,
          label: 'Kirjaudu sisään',
          isExternalLink: true,
        },
      ];
    }
  }

  MainNavigation.propTypes = {
    currentUser: React.PropTypes.object,
    onLogout: React.PropTypes.func,
  };

  return MainNavigation;
}
