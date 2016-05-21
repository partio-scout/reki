import React from 'react';
import { Navbar, Grid, Nav, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router';
import { NavLinkItem } from '../components';

export function getApp() {
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
            <Nav pullRight>
              <NavLinkItem to="/admin" isIndexLink>Käyttäjät</NavLinkItem>
            </Nav>
            <Nav pullRight>
              <NavLinkItem to="/participants" isIndexLink>Leiriläiset</NavLinkItem>
            </Nav>
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
