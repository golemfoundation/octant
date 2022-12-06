import { Link } from 'react-router-dom';
import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import ButtonProps from './types';
import styles from './style.module.scss';

const Button: FC<ButtonProps> = ({
  Icon,
  children,
  className,
  href,
  contentPosition = 'leftToRight',
  isActive,
  isDisabled,
  isHigh,
  label,
  onClick,
  rel,
  target = '_blank',
  to,
  type = 'button',
  variant = 'secondary',
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
      className={cx(
        styles.root,
        styles[`variant--${variant}`],
        styles[`contentPosition--${contentPosition}`],
        isActive && styles.isActive,
        isDisabled && styles.isDisabled,
        isHigh && styles.isHigh,
        className,
      )}
      onClick={onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...filteredProps}
    >
      <Fragment>
        {Icon && <span className={styles.icon}>{Icon}</span>}
        {children}
        {label}
      </Fragment>
    </Component>
  );
};

export default Button;
