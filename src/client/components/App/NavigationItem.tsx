import React from 'react'
import { Icon, IconType } from '../../components'
import { classNames } from '../../classNames'

export type NavigationItemValue = Readonly<{
  label: string
  icon?: IconType
  link?: Readonly<{
    isActive: boolean
    to: string
  }>
}>

export type NavigationItemProps = Readonly<{
  values: NavigationItemValue
  className?: string
}>

export const NavigationItem = ({ values, className }: NavigationItemProps) => {
  const labelText = values.icon ? (
    <span>
      <Icon type={values.icon} /> {values.label}
    </span>
  ) : (
    values.label
  )
  const label = <h4 className="navigation-item">{labelText}</h4>

  return values.link ? (
    <a
      className={classNames('navigation-item__link', [
        'navigation-item__link--active',
        values.link.isActive,
      ])}
      href={values.link.to}
    >
      {label}
    </a>
  ) : (
    label
  )
}
