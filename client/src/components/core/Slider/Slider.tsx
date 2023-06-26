import cx from 'classnames';
import { motion } from 'framer-motion';
import React, { FC, useState, useEffect, useMemo } from 'react';
import ReactSlider from 'react-slider';

import Svg from 'components/core/Svg/Svg';
import { lock, unlock } from 'svg/misc';

import styles from './Slider.module.scss';
import SliderProps from './types';

const animationDuration = 1.6;

const Slider: FC<SliderProps> = ({ className, isDisabled, onChange, value, onUnlock, ...rest }) => {
  const [localValue, setLocalValue] = useState(value);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isDisabledInitialState = useMemo(() => isDisabled, []);
  const showAnimation = !isDisabled && isDisabled !== isDisabledInitialState;

  useEffect(() => {
    if (value !== undefined && value !== localValue) {
      setLocalValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const localOnChange = (index: number): void => {
    if (isDisabled) {
      return;
    }
    if (onChange) {
      onChange(index, index);
    }
    setLocalValue(index);
  };

  const handleClick = () => {
    if (isDisabled && onUnlock) {
      onUnlock();
    }
  };

  return (
    <div className={cx(styles.root, className)}>
      <ReactSlider
        className={styles.slider}
        disabled={isDisabled}
        onChange={localOnChange}
        renderThumb={props => (
          <motion.div
            key="thumb"
            onClick={handleClick}
            {...props}
            animate={
              showAnimation
                ? {
                    scale: [0.95, 1.2, 1.2, 1.2, 1.2, 1.2, 1.2, 1, 1, 1],
                  }
                : {}
            }
            onAnimationStart={() => {}}
            onDrag={() => {}}
            onDragEnd={() => {}}
            onDragStart={() => {}}
            transition={{ duration: animationDuration }}
          >
            <motion.div
              key="iconWrapper"
              animate={
                showAnimation
                  ? {
                      scale: [1, 1, 1.333, 1.333, 1.333, 1.333, 1.333, 1, 1, 1],
                    }
                  : {}
              }
              className={styles.iconWrapper}
              transition={{ duration: animationDuration }}
            >
              <motion.div
                key="lock"
                animate={
                  showAnimation
                    ? {
                        opacity: [1, 0.5, 0, 0, 0, 0, 0, 0, 0, 0],
                      }
                    : {}
                }
                className={styles.pinlock}
                style={{ opacity: isDisabled ? 1 : 0 }}
                transition={{ duration: animationDuration }}
              >
                <Svg classNameSvg={styles.iconLock} img={lock} size="auto" />
              </motion.div>
              <motion.div
                key="unlock"
                animate={
                  showAnimation
                    ? {
                        opacity: [0, 0.5, 1, 1, 1, 1, 1, 0, 0, 0],
                      }
                    : {}
                }
                className={styles.pinlock}
                style={{ opacity: 0 }}
                transition={{ duration: animationDuration }}
              >
                <Svg classNameSvg={styles.iconLock} img={unlock} size="auto" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        thumbClassName={styles.thumb}
        trackClassName={cx(styles.track, isDisabled && styles.isDisabled)}
        value={localValue}
        {...rest}
      />
    </div>
  );
};

export default Slider;
