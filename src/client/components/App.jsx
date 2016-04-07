import React from 'react';
import { Navbar, Grid, Nav } from 'react-bootstrap';
import { Link } from 'react-router';
import { NavLinkItem } from '../components';

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
              <NavLinkItem to="/admin" isIndexLink>Käyttäjät</NavLinkItem>
            </Nav>
            <Nav pullRight>
              <NavLinkItem to="/participants" isIndexLink>Leiriläiset</NavLinkItem>
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
