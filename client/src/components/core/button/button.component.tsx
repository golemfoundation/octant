import { Link } from 'react-router-dom';
import React, { FC } from 'react';
import cx from 'classnames';

import ButtonProps from './types';
import styles from './style.module.scss';

const Button: FC<ButtonProps> = ({
  children,
  href,
  isActive,
  isDisabled,
  label,
  onClick,
  rel,
  target,
  to,
  type = 'button',
}) => {
  const filteredProps = {};

  let Component;
  if (to) {
    Component = Link;
    Object.assign(filteredProps, { to });
  } else if (href) {
    Component = 'a';
    Object.assign(filteredProps, { href, rel, target });
  } else {
    Component = 'button';
    Object.assign(filteredProps, {
      disabled: isDisabled,
      type,
    });
  }

  return (
    <Component
      className={cx(styles.root, isActive && styles.isActive, isDisabled && styles.isDisabled)}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...filteredProps}
    >
      {children}
      {label}
    </Component>
  );
};

export default Button;
