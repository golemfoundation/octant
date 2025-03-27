import cx from 'classnames';
import React, { FC } from 'react';
import { TooltipRenderProps } from 'react-joyride';

import Svg from 'components/ui/Svg/Svg';
import { cross } from 'svg/misc';

import styles from './TooltipComponent.module.scss';

const TooltipComponent: FC<TooltipRenderProps> = ({
  backProps,
  closeProps,
  continuous: isContinuous,
  index,
  primaryProps,
  skipProps,
  step,
  tooltipProps,
}) => (
  <div className={styles.root} {...tooltipProps}>
    {step.title && (
      <h4 className={styles.title}>
        {step.title}
        <button className={styles.close} type="button" {...closeProps}>
          <Svg img={cross} size={1} />
        </button>
      </h4>
    )}
    <div className={styles.body}>{step.content}</div>
    <div className={styles.footer}>
      <button className={styles.button} type="button" {...skipProps}>
        {skipProps.title}
      </button>
      {index > 0 && (
        <button className={styles.button} type="button" {...backProps}>
          {backProps.title}
        </button>
      )}
      {isContinuous && (
        <button className={cx(styles.button, styles.isCta)} type="button" {...primaryProps}>
          {primaryProps.title}
        </button>
      )}
    </div>
  </div>
);

export default TooltipComponent;
