import React from 'react';
import { Navbar, Grid, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { getMainNavigationContainer } from './containers/MainNavigationContainer';
import { getErrorNotification } from './ErrorNotification';

export function getApp(registryUserStore, registryUserActions, errorStore, errorActions) {
  const MainNavigationContainer = getMainNavigationContainer(registryUserStore, registryUserActions);
  const ErrorNotification = getErrorNotification(errorStore, errorActions);

  class App extends React.Component {
    render() {
      return (
        <div>
          <Navbar fluid>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">REKI</Link>
              </Navbar.Brand>
            </Navbar.Header>
            <MainNavigationContainer />
          </Navbar>
          <Grid fluid className="page-content">
            <Row>
              <Col sm={ 12 } className="main">
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
