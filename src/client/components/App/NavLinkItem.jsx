import React from 'react';
import { NavItem } from 'react-bootstrap';

export class NavLinkItem extends React.Component {
  render() {
    const {
      to,
      children,
    } = this.props;

    return (
      <NavItem href={ to }>
        { children }
      </NavItem>
    );
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
