import React from 'react';
import AltContainer from 'alt-container';
import { pureShouldComponentUpdate } from '../../../utils';
import { getMainNavigation } from '../../../components';

export function getMainNavigationContainer(registryUserStore, registryUserActions) {
  const MainNavigation = getMainNavigation();

  function MainNavigationContainer(props) {
    return (
      <AltContainer
        stores={ {
          currentUser: () => ({ store: registryUserStore, value: registryUserStore.getState().currentUser }),
        } }
        actions={
          function() {
            return {
              onLogout: () => registryUserActions.logoutCurrentUser(),
            };
          }
        }
        shouldComponentUpdate={ pureShouldComponentUpdate }
        component={ MainNavigation }
      />
    );
  }

  return MainNavigationContainer;
}
