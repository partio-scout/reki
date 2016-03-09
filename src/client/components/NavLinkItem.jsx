import React from 'react';
import { NavItem } from 'react-bootstrap';
import { LinkContainer, IndexLinkContainer } from 'react-router-bootstrap';

export class NavLinkItem extends React.Component {
  render() {
    const {
      to,
      children,
      isIndexLink,
    } = this.props;

    const navItem = (
      <NavItem>
        { children }
      </NavItem>
    );

    if (isIndexLink) {
      return (
        <IndexLinkContainer to={ to }>
          { navItem }
        </IndexLinkContainer>
      );
    } else {
      return (
        <LinkContainer to={ to }>
          { navItem }
        </LinkContainer>
      );
    }
  }
}

const { oneOfType, string, object, node, bool } = React.PropTypes;

NavLinkItem.propTypes = {
  to: oneOfType([
    string,
    object,
  ]),
  children: node,
  isIndexLink: bool,
};

NavLinkItem.defaultProps = {
  isIndexLink: false,
};
