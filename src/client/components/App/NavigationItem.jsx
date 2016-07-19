import React from 'react';
import { NavItem, Glyphicon } from 'react-bootstrap';
import { NavLinkItem } from '../../components';

export function getNavigationItem() {
  class NavigationItem extends React.Component {
    render() {
      const {
        values,
      } = this.props;

      const label = (values.icon ? <span><Glyphicon glyph={ values.icon }/> { values.label }</span> : values.label);

      if (values.isExternalLink) {
        return (<NavItem href={ values.to } onClick={ values.onClick }>{ label }</NavItem>);
      } else if (values.onClick || values.to) {
        return (<NavLinkItem to={ values.to } isIndexLink={ values.isIndexLink }>{ label }</NavLinkItem>);
      } else {
        return (<NavItem disabled={ true }>{ label }</NavItem>);
      }
    }
  }

  NavigationItem.propTypes = {
    values: React.PropTypes.object,
  };

  return NavigationItem;
}
