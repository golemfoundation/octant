import { ReactSliderProps } from 'react-slider';

export default interface SliderProps extends ReactSliderProps {
  className?: string;
  dataTest?: string;
  hideThumb?: boolean;
  isDisabled?: boolean;
  isError: boolean;
  onUnlock?: () => void;
}
