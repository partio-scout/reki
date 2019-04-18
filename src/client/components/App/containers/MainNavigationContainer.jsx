import { connect } from 'react-redux';
import { createStateMapper } from '../../../redux-helpers';
import * as actions from '../../../actions';
import { getMainNavigation } from '../../../components';

export function getMainNavigationContainer(registryUserStore, registryUserActions) {
  const MainNavigation = getMainNavigation();

  const mapStateToProps = createStateMapper({
    currentUser: state => state.registryUsers.currentUser,
  });
  const mapDispatchToProps = {
    onLogout: actions.logoutCurrentUser,
  };

  return connect(mapStateToProps, mapDispatchToProps)(MainNavigation);
}
