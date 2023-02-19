import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import React, { FC, useState } from 'react';

import Button from 'components/core/Button/Button';
import Svg from 'components/core/Svg/Svg';
import { chevronLeft } from 'svg/navigation';

import styles from './BoxRounded.module.scss';
import BoxRoundedProps from './types';

const BoxRounded: FC<BoxRoundedProps> = ({
  alignment = 'center',
  buttonProps,
  expandableChildren,
  isExpanded = false,
  isGrey,
  isVertical,
  className,
  children,
  onClick,
  onToggle,
  justifyContent = 'center',
  suffix,
  tabs,
  title,
}) => {
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
      className={cx(
        styles.root,
        onClick && styles.isClickable,
        tabs && styles.hasTabs,
        isVerticalCombined && styles.isVertical,
        isGrey && styles.isGrey,
        styles[`justifyContent--${justifyContent}`],
        styles[`alignment--${alignment}`],
        isPaddingMovedToElements && styles.isPaddingMovedToElements,
        className,
      )}
      onClick={onClick}
    >
      {tabs && (
        <div className={cx(styles.tabs, isGrey && styles.isGrey)}>
          {tabs.map(({ title: tabTitle, onClick: tabOnClick, isActive }, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className={cx(
                styles.tab,
                isActive && styles.isActive,
                tabOnClick && styles.isClickable,
              )}
              onClick={tabOnClick}
            >
              {tabTitle}
            </div>
          ))}
        </div>
      )}
      {title && (
        <div
          className={cx(styles.title, isPaddingMovedToElements && styles.isPaddingMovedToElements)}
        >
          {title}
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
        )}
      >
        {children}
      </div>
      {suffix && <div className={styles.suffix}>{suffix}</div>}
      {!isEmpty(buttonProps) && <Button className={styles.button} {...buttonProps} />}
    </div>
  );
};

export default BoxRounded;
