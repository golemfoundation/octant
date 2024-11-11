import cx from 'classnames';
import React, { FC } from 'react';

import Svg from 'components/ui/Svg';
import { arrowRight } from 'svg/misc';

import styles from './NavigationArrows.module.scss';
import NavigationArrowsProps from './types';

const NavigationArrows: FC<NavigationArrowsProps> = ({
  isPrevButtonDisabled,
  isNextButtonDisabled,
  onClickPrevButton,
  onClickNextButton,
  className,
  classNameNextButton,
  classNamePrevButton,
}) => {
  return (
    <div className={cx(styles.root, className)}>
      <div
        className={cx(
          styles.arrow,
          styles.leftArrow,
          isPrevButtonDisabled && styles.isDisabled,
          classNamePrevButton,
        )}
        onClick={() => {
          if (isPrevButtonDisabled) {
            return;
          }
          onClickPrevButton();
        }}
      >
        <Svg img={arrowRight} size={1.4} />
      </div>
      <div
        className={cx(styles.arrow, isNextButtonDisabled && styles.isDisabled, classNameNextButton)}
        onClick={() => {
          if (isNextButtonDisabled) {
            return;
          }
          onClickNextButton();
        }}
      >
        <Svg img={arrowRight} size={1.4} />
      </div>
    </div>
  );
};

export default NavigationArrows;
