import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import React, { FC } from 'react';

import Button from 'components/core/Button/Button';

import styles from './style.module.scss';
import BoxRoundedProps from './types';

const BoxRounded: FC<BoxRoundedProps> = ({
  alignment = 'center',
  buttonProps,
  isGrey,
  isVertical,
  className,
  children,
  onClick,
  justifyContent = 'center',
  tabs,
  title,
}) => (
  <div
    className={cx(
      styles.root,
      onClick && styles.isClickable,
      tabs && styles.hasTabs,
      isVertical && styles.isVertical,
      isGrey && styles.isGrey,
      styles[`justifyContent--${justifyContent}`],
      styles[`alignment--${alignment}`],
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
    {title && <div className={styles.title}>{title}</div>}
    {children}
    {!isEmpty(buttonProps) && <Button className={styles.button} {...buttonProps} />}
  </div>
);

export default BoxRounded;
