import React, { FC } from 'react';

import DescriptionProps from './types';
import styles from './style.module.scss';

const Description: FC<DescriptionProps> = ({ text }) => <div className={styles.root}>{text}</div>;

export default Description;
