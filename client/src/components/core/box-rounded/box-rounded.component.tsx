import React, { FC } from 'react';
import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';

import Button from 'components/core/button/button.component';

import BoxRoundedProps from './types';
import styles from './style.module.scss';

const BoxRounded: FC<BoxRoundedProps> = ({
  alignment = 'left',
  buttonProps,
  isGrey,
  isVertical,
  className,
  children,
  onClick,
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
