import React from 'react';
import { Navbar, Grid, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { getMainNavigationContainer } from './containers/MainNavigationContainer';

export function getApp(registryUserStore, registryUserActions) {
  class App extends React.Component {
    render() {
      const MainNavigationContainer = getMainNavigationContainer(registryUserStore, registryUserActions);

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
              <Col sm={ 2 } className="sidebar">
                <p>&nbsp;</p>
              </Col>
              <Col sm={ 10 } smOffset={ 2 } className="main">
                { this.props.children }
              </Col>
            </Row>
          </Grid>
        </div>
      );
    }
  }

  App.propTypes = {
    children: React.PropTypes.node,
  };

  return App;
}
