import React from 'react';
import { Nav } from 'react-bootstrap';
import { getNavigationItem } from '../../components';

export function getMainNavigation() {
  const NavigationItem = getNavigationItem();

  class MainNavigation extends React.Component {
    render() {
      const navItem = {
        to: '/participants',
        isIndexLink: true,
        label: 'Leiriläiset',
      };

      return (
        <Nav pullRight>
          <NavigationItem key={ navItem.label } values={ navItem } />
        </Nav>
      );
    }
  }

  MainNavigation.propTypes = {
  };

  return MainNavigation;
}
