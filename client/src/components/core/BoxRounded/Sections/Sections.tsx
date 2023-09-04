import cx from 'classnames';
import React, { FC, Fragment } from 'react';

import DoubleValue from 'components/core/DoubleValue/DoubleValue';
import Svg from 'components/core/Svg/Svg';
import Tooltip from 'components/core/Tooltip/Tooltip';
import { questionMark } from 'svg/misc';

import styles from './Sections.module.scss';
import SectionsProps, { SectionProps } from './types';

const Section: FC<SectionProps> = ({
  additionalContent,
  className,
  dataTest = 'Section',
  doubleValueProps,
  icon,
  isDisabled,
  label,
  labelClassName,
  labelSuffix,
  onClick,
  tooltipProps,
}) => (
  <>
    <div
      className={cx(styles.root, className, isDisabled && styles.isDisabled)}
      data-test={dataTest}
      onClick={onClick}
    >
      <div className={cx(styles.label, labelClassName)}>
        {icon ? <Svg img={icon} size={4} /> : label}
        {labelSuffix && labelSuffix}
        {tooltipProps && (
          <Tooltip {...tooltipProps} childrenClassName={styles.tooltip}>
            <Svg dataTest={`${dataTest}__Svg`} img={questionMark} size={1.6} />
          </Tooltip>
        )}
      </div>
      <DoubleValue
        textAlignment="right"
        variant="small"
        {...doubleValueProps}
        isDisabled={isDisabled}
      />
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
