import cx from 'classnames';
import React, { FC, Fragment } from 'react';
import { Link } from 'react-router-dom';

import Loader from 'components/core/Loader/Loader';
import Svg from 'components/core/Svg/Svg';
import { arrowTopRight } from 'svg/misc';

import styles from './Button.module.scss';
import ButtonProps from './types';

const Button: FC<ButtonProps> = ({
  Icon,
  children,
  className,
  href,
  isActive,
  isDisabled,
  isEventStopPropagation = true,
  isHigh,
  isLoading,
  isSmallFont,
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

  const isIconVariant = [
    'iconOnly',
    'iconOnlyTransparent',
    'iconOnlyTransparent2',
    'iconVertical',
  ].includes(variant);
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
              if (isEventStopPropagation) {
                event.stopPropagation();
              }
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
            img={arrowTopRight}
            size={0.8}
          />
        )}
      </Fragment>
    </Component>
  );
};

export default Button;
