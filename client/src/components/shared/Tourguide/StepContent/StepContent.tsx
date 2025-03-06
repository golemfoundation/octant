import React, { FC } from 'react';

import Img from 'components/ui/Img';

import styles from './StepContent.module.scss';
import StepProps from './types';

const StepContent: FC<StepProps> = ({ text, imgSrc }) => (
  <div>
    {imgSrc && <Img className={styles.image} src={imgSrc} />}
    <div className={styles.text}>{text}</div>
  </div>
);

export default StepContent;
