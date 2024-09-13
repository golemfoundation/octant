export default interface EpochResultsBarProps {
  address: string;
  bottomBarHeightPercentage: number;
  isHighlighted: boolean;
  isLowlighted: boolean;
  onClick: (address: string) => void;
  topBarHeightPercentage: number;
}
