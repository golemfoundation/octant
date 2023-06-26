import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Svg from 'components/core/Svg/Svg';
import { questionMark } from 'svg/misc';

import styles from './Sections.module.scss';
import SectionsProps, { SectionProps } from './types';

const Section: FC<SectionProps> = ({
  label,
  labelClassName,
  icon,
  onTooltipClick,
  doubleValueProps,
  dataTest = 'Section',
  className,
  additionalContent,
  onClick,
  labelSuffix,
}) => (
  <>
    <div className={cx(styles.root, className)} data-test={dataTest} onClick={onClick}>
      <div className={cx(styles.label, labelClassName)}>
        {icon ? <Svg img={icon} size={4} /> : label}
        {labelSuffix && labelSuffix}
        {onTooltipClick && (
          <Svg
            classNameSvg={styles.tooltip}
            dataTest={`${dataTest}__Svg`}
            img={questionMark}
            onClick={onTooltipClick}
            size={1.6}
          />
        )}
      </div>
      <DoubleValue textAlignment="right" variant="small" {...doubleValueProps} />
    </div>
    {!!additionalContent && additionalContent}
  </>
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
