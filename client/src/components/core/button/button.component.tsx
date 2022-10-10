import React, { FC } from 'react';
import cx from 'classnames';

import ButtonProps from './types';
import styles from './style.module.scss';

const Button: FC<ButtonProps> = ({
  children,
  href,
  isDisabled,
  label,
  onClick,
  rel,
  target,
  type = 'button',
}) => {
  const filteredProps = {};

  let Component;
  if (href) {
    Component = 'a';
    Object.assign(filteredProps, { href, rel, target });
  } else {
    Component = 'button';
    Object.assign(filteredProps, {
      type,
    });
  }

  return (
    <Component
      className={cx(styles.root, isDisabled && styles.isDisabled)}
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
