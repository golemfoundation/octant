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
  dataTest = 'NavigationArrows',
}) => {
  return (
    <div className={cx(styles.root, className)} data-test={dataTest}>
      <div
        className={cx(
          styles.arrow,
          styles.leftArrow,
          isPrevButtonDisabled && styles.isDisabled,
          classNamePrevButton,
        )}
        data-test={`${dataTest}__leftArrow`}
        onClick={() => {
          if (isPrevButtonDisabled) {
            return;
          }
          onClickPrevButton();
        }}
      >
        <Svg dataTest={`${dataTest}__leftArrowSvg`} img={arrowRight} size={1.4} />
      </div>
      <div
        className={cx(styles.arrow, isNextButtonDisabled && styles.isDisabled, classNameNextButton)}
        data-test={`${dataTest}__rightArrow`}
        onClick={() => {
          if (isNextButtonDisabled) {
            return;
          }
          onClickNextButton();
        }}
      >
        <Svg dataTest={`${dataTest}__rightArrowSvg`} img={arrowRight} size={1.4} />
      </div>
    </div>
  );
};

export default NavigationArrows;
