import React from 'react';
import _ from 'lodash';
import { NavigationItem, NavigationItemValue } from './NavigationItem';

const currentUserElement = document.querySelector('#user-info');
const currentUser: CurrentUser = JSON.parse(currentUserElement!.textContent!);

interface CurrentUser {
  readonly firstName: string;
  readonly lastName: string;
  readonly roles: readonly string[];
}

export const MainNavigation: React.FC = () => {
  const navItems = getLoggedInNavItems(currentUser);

  return (
    <nav className="main-navigation">
      <a className="content-box main-navigation__brand" href="/">REKI</a>
      <div className="content-box" />
      { navItems.map((navItem, i) => navItem.spacer ? <div key={ i } className="main-navigation__stretch-spacer" /> : <NavigationItem className="content-box main-navigation__navigation-item" key={ navItem.label } values={ navItem } />) }
    </nav>
  );
};

type MaybeSpacer<T> = ({ spacer: false } & T) | { spacer: true }

function getLoggedInNavItems(currentUser: CurrentUser): MaybeSpacer<NavigationItemValue>[] {
  const navItems: MaybeSpacer<NavigationItemValue>[] = [ ];
  const roles = currentUser.roles;

  if (_.includes(roles, 'registryUser')) {
    navItems.push(
      {
        spacer: false,
        label: 'Leiriläiset',
        link: {
          to: '/participants',
          isActive: location.pathname.startsWith('/participants'),
        },
      },
    );
  }

  if (_.includes(roles, 'registryAdmin')) {
    navItems.push(
      {
        spacer: false,
        label: 'Käyttäjät',
        link: {
          to: '/admin',
          isActive: location.pathname.startsWith('/admin'),
        },
      },
    );
  }

  navItems.push({
    spacer: true,
  });

  navItems.push(
    {
      spacer: false,
      icon: 'user',
      label: `${currentUser.firstName} ${currentUser.lastName}`,
    },
  );

  navItems.push(
    {
      spacer: false,
      label: 'Kirjaudu ulos',
      link: {
        to: '/logout',
        isActive: false,
      },
    },
  );

  return navItems;
}
