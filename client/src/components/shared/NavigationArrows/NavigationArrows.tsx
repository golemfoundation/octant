import cx from 'classnames';
import React, { FC } from 'react';

import Svg from 'components/ui/Svg';
import { arrowRight } from 'svg/misc';

import styles from './NavigationArrows.module.scss';
import NavigationArrowsProps from './types';

const NavigationArrows: FC<NavigationArrowsProps> = ({
  idArrowPrevious,
  isPrevButtonDisabled,
  isNextButtonDisabled,
  onClickPrevButton,
  onClickNextButton,
  className,
  classNameNextButton,
  classNamePrevButton,
  dataTest = 'NavigationArrows',
}) => (
  <div className={cx(styles.root, className)} data-test={dataTest}>
    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
    <button
      className={cx(
        styles.arrow,
        styles.leftArrow,
        isPrevButtonDisabled && styles.isDisabled,
        classNamePrevButton,
      )}
      data-test={`${dataTest}__leftArrow`}
      disabled={isPrevButtonDisabled}
      id={idArrowPrevious}
      onClick={() => {
        if (isPrevButtonDisabled) {
          return;
        }
        onClickPrevButton();
      }}
      type="button"
    >
      <Svg dataTest={`${dataTest}__leftArrowSvg`} img={arrowRight} size={1.4} />
    </button>
    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
    <button
      className={cx(styles.arrow, isNextButtonDisabled && styles.isDisabled, classNameNextButton)}
      data-test={`${dataTest}__rightArrow`}
      disabled={isNextButtonDisabled}
      onClick={() => {
        if (isNextButtonDisabled) {
          return;
        }
        onClickNextButton();
      }}
      type="button"
    >
      <Svg dataTest={`${dataTest}__rightArrowSvg`} img={arrowRight} size={1.4} />
    </button>
  </div>
);

export default NavigationArrows;
