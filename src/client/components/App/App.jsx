import React from 'react';
import Link from 'redux-first-router-link';
import * as navigationActions from '../../navigation/actions';
import { Navbar, Grid, Row, Col } from 'react-bootstrap';
import { getMainNavigationContainer } from './containers/MainNavigationContainer';
import { getErrorNotification } from './ErrorNotification';

export function getApp() {
  class App extends React.Component {
    render() {
      const MainNavigationContainer = getMainNavigationContainer();
      const ErrorNotification = getErrorNotification();

      return (
        <div>
          <Navbar fluid>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to={ navigationActions.navigateToHome() }>REKI</Link>
              </Navbar.Brand>
            </Navbar.Header>
            <MainNavigationContainer />
          </Navbar>
          <Grid fluid className="page-content">
            <Row>
              <Col sm={ 12 } className="sidebar">
                { this.props.children }
              </Col>
            </Row>
          </Grid>
          <ErrorNotification />
        </div>
      );
    }
  }

  App.propTypes = {
    sidebar: React.PropTypes.node,
    main: React.PropTypes.node,
  };

  return App;
}
