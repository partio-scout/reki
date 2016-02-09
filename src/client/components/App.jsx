import React from 'react';
import { Navbar, Grid } from 'react-bootstrap';
import { Link } from 'react-router';

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
