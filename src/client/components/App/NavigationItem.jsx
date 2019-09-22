import React from 'react';
import { Icon } from '../../components';
import { classNames } from '../../classNames';

export const NavigationItem = ({ values, className }) => {
  const labelText = (values.icon ? <span><Icon type={ values.icon }/> { values.label }</span> : values.label);
  const label = <h4 className="navigation-item">{labelText}</h4>;

  return (values.to
    ? <a className={ classNames('navigation-item__link', ['navigation-item__link--active', values.isActive]) } href={ values.to }>{ label }</a>
    : label
  );
};
