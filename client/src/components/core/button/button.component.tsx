import React, { FC } from 'react';

import ButtonProps from './types';
import styles from './styles.module.scss';

const Button: FC<ButtonProps> = ({
  children,
  label,
  onClick,
  type = 'button',
  href,
  rel,
  target,
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
      className={styles.root}
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
