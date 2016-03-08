import React from 'react';
import { NavItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export class NavLinkItem extends React.Component {
  render() {
    const {
      to,
      children,
    } = this.props;

    return (
      <LinkContainer to={ to }>
        <NavItem>
          { children }
        </NavItem>
      </LinkContainer>
    );
  }
}

const { oneOfType, string, object, node } = React.PropTypes;

NavLinkItem.propTypes = {
  to: oneOfType([
    string,
    object,
  ]),
  children: node,
};
