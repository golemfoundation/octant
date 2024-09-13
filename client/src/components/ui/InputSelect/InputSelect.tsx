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
const durationOfTransitionMobile = 0.3;

const InputSelect: FC<InputSelectProps> = ({
  dataTest = 'InputSelect',
  options,
  onChange,
  selectedOption,
  variant = 'overselect',
}) => {
  const { isDesktop } = useMediaQuery();
  const durationOfTransition = isDesktop ? durationOfTransitionDesktop : durationOfTransitionMobile;

  const ref = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isMenuOpen || !isDesktop) {
      return;
    }

    const listener = e => {
      if (ref.current && ref.current.contains(e.target)) {
        return;
      }

      setIsMenuOpen(false);
    };

    document.addEventListener('click', listener);

    return () => document.removeEventListener('click', listener);
  }, [isMenuOpen, isDesktop]);

  return (
    <div className={cx(styles.root, styles[`variant--${variant}`])} data-test={dataTest}>
      <div
        ref={ref}
        className={cx(styles.selectedValue, styles[`variant--${variant}`])}
        onClick={() => setIsMenuOpen(true)}
      >
        <span className={styles.label} data-test={`${dataTest}__SingleValue`}>
          {_selectedOption?.label}
        </span>
        <Svg
          classNameSvg={cx(styles.chevron, isMenuOpen && styles.isMenuOpen)}
          img={chevronBottom}
          size={1.2}
        />
        <AnimatePresence>
          {isMenuOpen && (
            <Fragment>
              <motion.div
                key="menu-overlay"
                animate={{ opacity: 1 }}
                className={cx(styles.overlay, styles.isOpen)}
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
                <Button
                  className={styles.buttonClose}
                  Icon={<Svg img={cross} size={1} />}
                  onClick={() => setIsMenuOpen(false)}
                  variant="iconOnly"
                />
                {options.map(option => (
                  <div
                    key={option.value}
                    className={cx(styles.option, styles[`variant--${variant}`])}
                    data-test={`${dataTest}__Option--${option.label}`}
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
