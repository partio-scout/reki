import React from 'react';
import { connect } from 'react-redux';
import { createStateMapper } from '../redux-helpers';
import * as components from '../components';
import { restrictComponent } from '../utils';

const Login = components.getLogin();
const Homepage = components.getHomepage();
const LoginPromptPage = components.getLoginPromptPage();
const ParticipantDetailsPage = restrictComponent(
  components.getParticipantDetailsPage(),
  LoginPromptPage
);
const ParticipantListPage = restrictComponent(
  components.getParticipantListPage(),
  LoginPromptPage
);
const UserManagementPage = restrictComponent(
  components.getUserManagementPage(),
  LoginPromptPage
);

const mapStateToProps = createStateMapper({
  page: state => state.page.currentPage,
});

export const Router = connect(mapStateToProps)(({ page }) => {
  switch (page) {
    case 'home':
      return <Homepage />;
    case 'participantsList':
      return <ParticipantListPage />;
    case 'participantDetails':
      return <ParticipantDetailsPage />;
    case 'login':
      return <Login />;
    case 'admin':
      return <UserManagementPage />;
    default:
      return (
        <div>
          <h1>Sivua ei löytynyt</h1>
        </div>
      );
  }
});
