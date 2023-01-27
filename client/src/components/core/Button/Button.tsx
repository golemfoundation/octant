import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Svg from 'components/core/Svg/Svg';
import { arrow } from 'svg/misc';

import styles from './style.module.scss';
import ButtonProps from './types';

const Button: FC<ButtonProps> = ({
  Icon,
  children,
  className,
  href,
  isActive,
  isLoading,
  isSmallFont,
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
        isSmallFont && styles.isSmallFont,
        isActive && styles.isActive,
        isDisabled && styles.isDisabled,
        isHigh && styles.isHigh,
        onClick && styles.isClickable,
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
        {(variant === 'link' || variant === 'link2') && (
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
