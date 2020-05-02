import React from 'react';
import { classNames } from '../../classNames';

type LabelProps = Readonly<{
  label: string;
  className?: string;
  inline?: boolean;
}>

export const Label: React.FC<LabelProps> = ({ label, className, children, inline }) => (
  <label className={ classNames('label', ['label--inline', inline], className) }>
    <span className="label__text">{ label }</span>
    { children }
  </label>
);
