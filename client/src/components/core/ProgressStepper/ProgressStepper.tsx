import cx from 'classnames';
import React, { FC } from 'react';

import Svg from 'components/core/Svg/Svg';
import { tick } from 'svg/misc';

import styles from './ProgressStepper.module.scss';
import ProgressStepperProps from './types';

const ProgressStepper: FC<ProgressStepperProps> = ({
  currentStep,
  steps,
  isNextStepIsAvailable,
}) => (
  <div className={styles.root}>
    {steps.map((step, index) => {
      const isDone = index < currentStep - 1 || currentStep === 3;
      const isCurrent = index === currentStep - 1;
      const isAvailable = isNextStepIsAvailable && index === 1;
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={index} className={cx(styles.element, isCurrent && styles.isCurrent)}>
          <div
            className={cx(
              styles.dot,
              isDone && styles.isDone,
              isCurrent && styles.isCurrent,
              isAvailable && styles.isAvailable,
            )}
          >
            {isDone && <Svg classNameSvg={styles.tick} img={tick} size={0.8} />}
          </div>
          {step}
        </div>
      );
    })}
  </div>
);

export default ProgressStepper;
