import cx from 'classnames';
import React, { FC, useState, useEffect } from 'react';
import ReactSlider from 'react-slider';

import styles from './Slider.module.scss';
import SliderProps from './types';

const Slider: FC<SliderProps> = ({
  className,
  isDisabled,
  isError,
  onChange,
  value,
  onUnlock,
  hideThumb,
  ...rest
}) => {
  const [localValue, setLocalValue] = useState(value);

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
        disabled={isDisabled || hideThumb}
        onChange={localOnChange}
        renderThumb={props => (
          // Hiding the thumb by returning null here prevent ReactSlider from setting value on initial render.
          <div onClick={handleClick} {...props}>
            <div className={styles.thumbInnerCircle} />
          </div>
        )}
        thumbClassName={cx(styles.thumb, (isDisabled || hideThumb) && styles.isHidden)}
        trackClassName={cx(
          styles.track,
          isDisabled && styles.isDisabled,
          localValue === 100 && styles.isFull,
        )}
        value={localValue}
        {...rest}
      />
    </div>
  );
};

export default Slider;
