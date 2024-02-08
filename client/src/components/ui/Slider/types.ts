import { ReactSliderProps } from 'react-slider';

export default interface SliderProps extends ReactSliderProps {
  className?: string;
  hideThumb?: boolean;
  isDisabled?: boolean;
  isError: boolean;
  onUnlock?: () => void;
}
