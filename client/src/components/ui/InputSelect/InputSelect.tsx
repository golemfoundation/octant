import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, { FC, Fragment, useEffect, useRef, useState } from 'react';

import Button from 'components/ui/Button';
import Svg from 'components/ui/Svg';
import useMediaQuery from 'hooks/helpers/useMediaQuery';
import { chevronBottom, cross, tick } from 'svg/misc';
import setDocumentOverflowModal from 'utils/setDocumentOverflowModal';

import styles from './InputSelect.module.scss';
import InputSelectProps, { Option } from './types';

const durationOfTransitionDesktop = 0;
export const durationOfTransitionMobile = 0.3;

const InputSelect: FC<InputSelectProps> = ({
  className,
  dataTest = 'InputSelect',
  Icon,
  options,
  onChange,
  selectedOption,
  variant = 'overselect',
}) => {
  const { isDesktop } = useMediaQuery();
  const durationOfTransition = isDesktop ? durationOfTransitionDesktop : durationOfTransitionMobile;

  const ref = useRef<HTMLDivElement>(null);
  const refChevron = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [_selectedOption, _setSelectedOption] = useState<Option>(selectedOption || options[0]);

  const onOptionClick = (option: Option): void => {
    _setSelectedOption(option);
    setIsMenuOpen(false);

    if (onChange) {
      onChange(option);
    }
  };

  /**
   * Scrollbar offset is handled in onAnimationComplete.
   * However, in case Modal is unmounted forcibly, here is the cleanup adding scrollbar back.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => () => setDocumentOverflowModal(false, durationOfTransition * 1000), []);

  const isVariantFullWidthOnMobile = ['overselect', 'belowselect'].includes(variant);

  return (
    <div
      className={cx(styles.root, styles[`variant--${variant}`], className)}
      data-test={dataTest}
      // eslint-disable-next-line @typescript-eslint/naming-convention
      onClick={() => setIsMenuOpen(prev => !prev)}
    >
      <div ref={ref} className={cx(styles.selectedValue, styles[`variant--${variant}`])}>
        <div className={styles.labelWrapper}>
          {Icon && <div className={cx(styles.icon, styles[`variant--${variant}`])}>{Icon}</div>}
          <span
            className={cx(styles.label, !!Icon && styles.hasIcon)}
            data-test={`${dataTest}__SingleValue`}
          >
            {_selectedOption?.label}
          </span>
        </div>
        <Svg
          ref={refChevron}
          classNameSvg={cx(
            styles.chevron,
            styles[`variant--${variant}`],
            isMenuOpen && styles.isMenuOpen,
          )}
          img={chevronBottom}
          size={1.2}
        />
        <AnimatePresence>
          {isMenuOpen && (
            <Fragment>
              <motion.div
                key="menu-overlay"
                animate={{ opacity: 1 }}
                className={cx(
                  styles.overlay,
                  styles.isOpen,
                  isVariantFullWidthOnMobile && styles.isVariantFullWidthOnMobile,
                )}
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
                onClick={e => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                }}
              />
              <motion.div
                key="menu"
                animate={{ y: '0%' }}
                className={cx(styles.menu, styles[`variant--${variant}`])}
                exit={{ opacity: isDesktop ? 0 : 1, y: '100%' }}
                initial={{ y: '100%' }}
                onAnimationComplete={definition => {
                  // eslint-disable-next-line dot-notation
                  if (definition['y'] === '100%') {
                    setDocumentOverflowModal(false, durationOfTransition * 1000);
                  }
                }}
                onAnimationStart={definition => {
                  // eslint-disable-next-line dot-notation
                  if (definition['y'] === '0%') {
                    setDocumentOverflowModal(true, durationOfTransition * 1000);
                  }
                }}
                transition={{
                  damping: 1,
                  duration: durationOfTransition,
                }}
              >
                {isVariantFullWidthOnMobile && (
                  <Button
                    className={styles.buttonClose}
                    Icon={<Svg img={cross} size={1} />}
                    onClick={() => setIsMenuOpen(false)}
                    variant="iconOnly"
                  />
                )}
                {options.map(option => (
                  <div
                    key={option.value}
                    className={cx(styles.option, styles[`variant--${variant}`])}
                    data-test={`${dataTest}__Option--${option.value}`}
                    onClick={e => {
                      e.stopPropagation();
                      onOptionClick(option);
                    }}
                  >
                    {option.value === _selectedOption?.value && (
                      <Svg classNameSvg={styles.iconTick} img={tick} size={1} />
                    )}
                    {option.label}
                  </div>
                ))}
              </motion.div>
            </Fragment>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InputSelect;
