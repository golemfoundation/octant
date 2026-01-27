import cx from 'classnames';
import React, { Fragment, forwardRef } from 'react';
import { Link } from 'react-router-dom';

import Loader from 'components/ui/Loader';
import Svg from 'components/ui/Svg';
import { arrowTopRight } from 'svg/misc';

import styles from './Button.module.scss';
import ButtonProps from './types';

const Button = <T extends ButtonProps>(
  {
    Icon,
    id,
    children,
    className,
    dataParameters,
    dataTest = 'Button',
    hasLinkArrow,
    href,
    isActive,
    isButtonScalingUpOnHover = true,
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
    onMouseOver,
  }: T,
  ref,
) => {
  const filteredProps = {};
  const isActionDisabled = isDisabled || isLoading;
  const hasHoverState = isButtonScalingUpOnHover && !to && !href && !isDisabled;

  let Component;
  if (to) {
    Component = Link;
    Object.assign(filteredProps, {
      to: isActionDisabled ? undefined : to,
    });
  } else if (href) {
    Component = 'a';
    Object.assign(filteredProps, { href, rel, target });
  } else {
    Component = 'button';
    Object.assign(filteredProps, {
      disabled: isActionDisabled,
      onMouseOver,
      type,
    });
  }

  const isIconVariant = [
    'iconOnly',
    'iconOnly2',
    'iconOnlyTransparent',
    'iconOnlyTransparent2',
    'iconVertical',
  ].includes(variant);
  const IconToRender = isLoading ? (
    <Loader
      color={variant === 'cta' ? 'white' : 'grey'}
      dataTest={`${dataTest}__Loader`}
      variant="small"
    />
  ) : (
    Icon
  );

  return (
    <Component
      ref={ref}
      className={cx(
        styles.root,
        styles[`variant--${variant}`],
        isSmallFont && styles.isSmallFont,
        isActive && styles.isActive,
        isActionDisabled && styles.isDisabled,
        isLoading && styles.isLoading,
        isHigh && styles.isHigh,
        hasHoverState && styles.hasHoverState,
        (onClick || type === 'submit') && styles.isClickable,
        className,
      )}
      id={id}
      {...dataParameters}
      data-test={dataTest}
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
      target={target}
      // eslint-disable-next-line react/button-has-type
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
        {(['link', 'link5', 'link6'].includes(variant) || hasLinkArrow) && (
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

export default forwardRef(Button);
