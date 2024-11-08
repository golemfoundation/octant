export default interface TinyLabelProps {
  className?: string;
  dataTest?: string;
  isInTopRightCorner?: boolean;
  onClick: () => void;
  text: string;
  textClassName?: string;
  variant?: 'orange2' | 'orange3';
}
