import { ReactSliderProps } from 'react-slider';

export default interface SliderProps extends ReactSliderProps {
  className?: string;
  isDisabled?: boolean;
  onUnlock?: () => void;
}
