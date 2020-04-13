import React from 'react';
import _ from 'lodash';
import { NavigationItem } from '..';

const currentUserElement = document.querySelector('#user-info');
const currentUser = JSON.parse(currentUserElement.textContent);

export function MainNavigation() {

  const navItems = getLoggedInNavItems(currentUser);

  return (
    <nav className="main-navigation">
      <a className="content-box main-navigation__brand" href="/">REKI</a>
      <div className="content-box" />
      { navItems.map((navItem, i) => navItem.spacer ? <div key={ i } className="main-navigation__stretch-spacer" /> : <NavigationItem className="content-box main-navigation__navigation-item" key={ navItem.label } values={ navItem } />) }
    </nav>
  );
}

function getLoggedInNavItems(currentUser) {
  const navItems = [ ];
  const roles = currentUser.roles;

  if (_.includes(roles, 'registryUser')) {
    navItems.push(
      {
        to: '/participants',
        label: 'Leiriläiset',
        isActive: location.pathname.startsWith('/participants'),
      },
    );
  }

  if (_.includes(roles, 'registryAdmin')) {
    navItems.push(
      {
        to: '/admin',
        label: 'Käyttäjät',
        isActive: location.pathname.startsWith('/admin'),
      },
    );
  }

  navItems.push({
    spacer: true,
  });

  navItems.push(
    {
      icon: 'user',
      label: `${currentUser.firstName} ${currentUser.lastName}`,
    },
  );

  navItems.push(
    {
      to: '/logout',
      label: 'Kirjaudu ulos',
    },
  );

  return navItems;
}
