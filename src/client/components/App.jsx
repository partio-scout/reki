import React from 'react';
import { Navbar, Grid, Nav, NavItem } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

export function getApp() {
  class App extends React.Component {
    render() {
      return (
        <div>
          <Navbar>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">REKI</Link>
              </Navbar.Brand>
            </Navbar.Header>
            <Nav pullRight>
              <LinkContainer to="/participants">
                <NavItem>Leiriläiset</NavItem>
              </LinkContainer>
            </Nav>
          </Navbar>
          <Grid>
            { this.props.children }
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
