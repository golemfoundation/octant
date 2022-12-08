import { Link } from 'react-router-dom';
import React, { FC, Fragment } from 'react';
import cx from 'classnames';

import { arrow } from 'svg/misc';
import Svg from 'components/core/svg/svg.component';

import ButtonProps from './types';
import styles from './style.module.scss';

const Button: FC<ButtonProps> = ({
  Icon,
  children,
  className,
  href,
  isActive,
  isLoading,
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
  const isActionDisabled = isDisabled || isLoading;

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
      disabled: isActionDisabled,
      type,
    });
  }

  const isIconVariant =
    variant === 'iconOnly' || variant === 'iconOnlyTransparent' || variant === 'iconVertical';

  return (
    <Component
      className={cx(
        styles.root,
        styles[`variant--${variant}`],
        isActive && styles.isActive,
        isDisabled && styles.isDisabled,
        isHigh && styles.isHigh,
        className,
      )}
      onClick={isActionDisabled ? () => {} : onClick}
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...filteredProps}
    >
      <Fragment>
        {Icon && (
          <span className={cx(styles.icon, styles.isOnLeft, isIconVariant && styles.isIconVariant)}>
            {Icon}
          </span>
        )}
        {children}
        {label}
        {variant === 'link' && (
          <Svg
            classNameSvg={cx(styles.icon, styles.isOnRight, isIconVariant && styles.isIconVariant)}
            img={arrow}
            size={0.8}
          />
        )}
      </Fragment>
    </Component>
  );
};

export default Button;
