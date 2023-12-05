import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProgressStepperSlim.module.scss';
import ProgressStepperSlimProps from './types';

const ProgressStepperSlim: FC<ProgressStepperSlimProps> = ({
  className,
  currentStepIndex,
  dataTest = 'ProgressStepperSlim',
  numberOfSteps,
  onStepClick,
  isDisabled,
}) => (
  <div className={cx(styles.root, className, isDisabled && styles.isDisabled)} data-test={dataTest}>
    {Array.from(Array(numberOfSteps).keys()).map((_, index) => {
      const isCurrent = index === currentStepIndex;
      return (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className={cx(styles.stepWrapper, !!onStepClick && styles.isClickable)}
          data-iscurrent={isCurrent}
          data-test={`${dataTest}__element`}
          onClick={() => !isDisabled && onStepClick(index)}
        >
          <div className={cx(styles.step, isCurrent && styles.isCurrent)} />
        </div>
      );
    })}
  </div>
);

export default ProgressStepperSlim;
