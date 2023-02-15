import cx from 'classnames';
import React, { FC } from 'react';

import styles from './ProgressStepperSlim.module.scss';
import ProgressStepperSlimProps from './types';

const ProgressStepperSlim: FC<ProgressStepperSlimProps> = ({
  className,
  currentStepIndex,
  numberOfSteps,
}) => (
  <div className={cx(styles.root, className)}>
    {Array.from(Array(numberOfSteps).keys()).map((_, index) => (
      <div
        // eslint-disable-next-line react/no-array-index-key
        key={index}
        className={cx(styles.step, index === currentStepIndex && styles.isCurrent)}
      />
    ))}
  </div>
);

export default ProgressStepperSlim;
