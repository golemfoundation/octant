import cx from 'classnames';
import React, { FC, useState, useEffect, useRef } from 'react';
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
  const reactSliderRef = useRef(null);
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

  useEffect(() => {
    if (isDisabled || hideThumb || !reactSliderRef?.current) {
      return;
    }
    // Calling handleResize() method solves the problem with rendering thumb outside the box.
    // @ts-expect-error method isn't typed
    reactSliderRef.current.handleResize();
  }, [isDisabled, hideThumb]);

  return (
    <div className={cx(styles.root, className)}>
      <ReactSlider
        ref={reactSliderRef}
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
