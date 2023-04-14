import React, { FC, Fragment } from 'react';

import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Svg from 'components/core/Svg/Svg';
import { questionMark } from 'svg/misc';

import styles from './Sections.module.scss';
import SectionsProps, { SectionProps } from './types';

const Section: FC<SectionProps> = ({ label, icon, onTooltipClick, doubleValueProps }) => (
  <div className={styles.root}>
    <div className={styles.label}>
      {icon ? <Svg img={icon} size={4} /> : label}
      {onTooltipClick && (
        <Svg classNameSvg={styles.tooltip} img={questionMark} onClick={onTooltipClick} size={1.6} />
      )}
    </div>
    <DoubleValue textAlignment="right" variant="small" {...doubleValueProps} />
  </div>
);

const Sections: FC<SectionsProps> = ({ sections }) => (
  <Fragment>
    {sections.map((section, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <Section key={index} {...section} />
    ))}
  </Fragment>
);

export default Sections;
