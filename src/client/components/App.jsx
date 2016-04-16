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
              <NavLinkItem to="/participants" isIndexLink>Leiriläiset</NavLinkItem>
            </Nav>
          </Navbar>
          <Grid fluid>
            <Row>
              <Col md={2} className="sidebar">
              </Col>
              <Col md={10} mdOffset={2} className="main">
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
