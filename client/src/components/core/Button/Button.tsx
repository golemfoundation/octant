import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Svg from 'components/core/Svg/Svg';
import { arrow } from 'svg/misc';

import styles from './style.module.scss';
import ButtonProps from './types';

import Loader from '../Loader/Loader';

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
  const IconToRender = isLoading ? <Loader className={styles.loader} /> : Icon;

  return (
    <Component
      className={cx(
        styles.root,
        styles[`variant--${variant}`],
        isSmallFont && styles.isSmallFont,
        isActive && styles.isActive,
        isActionDisabled && styles.isDisabled,
        isLoading && styles.isLoading,
        isHigh && styles.isHigh,
        onClick && styles.isClickable,
        className,
      )}
      onClick={
        isActionDisabled
          ? () => {}
          : event => {
              event.stopPropagation();
              if (onClick) {
                onClick();
              }
            }
      }
      // eslint-disable-next-line react/button-has-type
      type={type}
      {...filteredProps}
    >
      <Fragment>
        {IconToRender && (
          <span className={cx(styles.icon, styles.isOnLeft, isIconVariant && styles.isIconVariant)}>
            {IconToRender}
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
