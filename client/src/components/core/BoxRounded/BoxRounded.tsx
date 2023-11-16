import cx from 'classnames';
import { motion } from 'framer-motion';
import isEmpty from 'lodash/isEmpty';
import React, { forwardRef, useState } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { chevronLeft } from 'svg/navigation';

import styles from './BoxRounded.module.scss';
import BoxRoundedProps from './types';

const BoxRounded = forwardRef<HTMLDivElement, BoxRoundedProps>(
  (
    {
      alignment = 'center',
      buttonProps,
      expandableChildren,
      hasSections = false,
      isExpanded = false,
      isGrey = false,
      isVertical = false,
      hasPadding = true,
      className,
      children,
      onClick,
      onToggle,
      justifyContent = 'center',
      subtitle,
      suffix,
      tabs,
      title,
      titleSuffix,
      dataTest = 'BoxRounded',
      textAlign = 'center',
      childrenWrapperClassName,
    },
    ref,
  ) => {
    const [isExpandableChildrenVisible, setIsExpandableChildrenVisible] =
      useState<boolean>(isExpanded);
    const isExpandable = !!expandableChildren;
    const isPaddingMovedToElements = isExpandable || !!suffix;
    const isVerticalCombined = isVertical || !!tabs;

    const _onToggle = (): void => {
      const isExpandedNew = !isExpandableChildrenVisible;
      setIsExpandableChildrenVisible(isExpandedNew);

      if (onToggle) {
        onToggle(isExpandedNew);
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          styles.root,
          onClick && styles.isClickable,
          tabs && styles.hasTabs,
          isVerticalCombined && styles.isVertical,
          isGrey && styles.isGrey,
          styles[`justifyContent--${justifyContent}`],
          styles[`alignment--${alignment}`],
          isPaddingMovedToElements && styles.isPaddingMovedToElements,
          hasSections && styles.hasSections,
          hasPadding && styles.hasPadding,
          className,
        )}
        data-test={dataTest}
        onClick={onClick}
      >
        {tabs && (
          <div className={cx(styles.tabs, isGrey && styles.isGrey)}>
            {tabs.map(({ title: tabTitle, onClick: tabOnClick, isActive, isDisabled }, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className={cx(
                  styles.tab,
                  isActive && styles.isActive,
                  isDisabled && styles.isDisabled,
                  tabOnClick && styles.isClickable,
                )}
                onClick={isDisabled ? undefined : tabOnClick}
              >
                {tabTitle}
                {isActive ? (
                  <div className={styles.underlineWrapper}>
                    <motion.div className={styles.underline} layoutId="underline" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
        {title && (
          <div
            className={cx(
              styles.titleWrapper,
              hasSections && styles.hasSections,
              subtitle && styles.hasSubtitle,
              isGrey && styles.isGrey,
              isPaddingMovedToElements && styles.isPaddingMovedToElements,
            )}
          >
            <div className={styles.title} data-test={`${dataTest}__title`}>
              {title}
              <div className={styles.subtitle}>{subtitle}</div>
            </div>
            {titleSuffix}
            {isExpandable && (
              <Button
                Icon={
                  <Svg
                    classNameSvg={cx(
                      styles.chevron,
                      isExpandableChildrenVisible && styles.isExpandableChildrenVisible,
                    )}
                    img={chevronLeft}
                    size={1.6}
                  />
                }
                onClick={_onToggle}
                variant="iconOnlyTransparent2"
              />
            )}
          </div>
        )}
        {isExpandableChildrenVisible && (
          <div className={styles.expandableChildren}>{expandableChildren}</div>
        )}
        <div
          className={cx(
            styles.children,
            isPaddingMovedToElements && styles.isPaddingMovedToElements,
            isVerticalCombined && styles.isVertical,
            styles[`justifyContent--${justifyContent}`],
            styles[`alignment--${alignment}`],
            styles[`textAlign--${textAlign}`],
            childrenWrapperClassName,
          )}
        >
          {children}
        </div>
        {suffix && <div className={styles.suffix}>{suffix}</div>}
        {!isEmpty(buttonProps) && <Button className={styles.button} {...buttonProps} />}
      </div>
    );
  },
);

export default BoxRounded;
