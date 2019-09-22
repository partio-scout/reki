import React from 'react';
import { classNames } from '../../classNames';

export const Label = ({ label, className, children, inline }) => (
  <label className={ classNames('label', ['label--inline', inline], className) }>
    <span className="label__text">{ label }</span>
    { children }
  </label>
);
