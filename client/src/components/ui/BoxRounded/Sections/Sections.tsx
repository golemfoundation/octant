import cx from 'classnames';
import isEmpty from 'lodash/isEmpty';
import React, { FC, Fragment } from 'react';

import DoubleValue from 'components/ui/DoubleValue';
import Svg from 'components/ui/Svg';
import Tooltip from 'components/ui/Tooltip';
import { questionMark } from 'svg/misc';

import styles from './Sections.module.scss';
import SectionsProps, { SectionProps } from './types';

const Section: FC<SectionProps> = ({
  additionalContent,
  childrenLeft,
  childrenRight,
  className,
  dataTest = 'Section',
  doubleValueProps,
  hasBottomDivider = false,
  icon,
  isDisabled,
  label,
  labelClassName,
  labelSuffix,
  onClick,
  tooltipProps,
  variant = 'standard',
}) => (
  <>
    <div
      className={cx(
        styles.root,
        className,
        hasBottomDivider && styles.hasBottomDivider,
        isDisabled && styles.isDisabled,
      )}
      data-test={dataTest}
      onClick={onClick}
    >
      {(label || icon) && (
        <div className={cx(styles.label, styles[`variant--${variant}`], labelClassName)}>
          {icon ? (
            <Svg img={icon} size={4} />
          ) : (
            <span data-test={`${dataTest}__label`}>{label}</span>
          )}
          {labelSuffix && labelSuffix}
          {tooltipProps && (
            <Tooltip {...tooltipProps} childrenClassName={styles.tooltip}>
              <Svg dataTest={`${dataTest}__Svg`} img={questionMark} size={1.6} />
            </Tooltip>
          )}
        </div>
      )}
      {childrenLeft}
      <div className={styles.childrenRight}>{childrenRight}</div>
      {!isEmpty(doubleValueProps) && (
        <DoubleValue
          textAlignment="right"
          variant={variant === 'standard' ? 'standard' : 'small'}
          {...doubleValueProps}
          isDisabled={isDisabled}
        />
      )}
    </div>
    {!!additionalContent && additionalContent}
  </>
);

const Sections: FC<SectionsProps> = ({ sections, ...rest }) => (
  <Fragment>
    {sections.map((section, index) => (
      // eslint-disable-next-line react/no-array-index-key
      <Section key={index} {...section} {...rest} />
    ))}
  </Fragment>
);

export default Sections;
