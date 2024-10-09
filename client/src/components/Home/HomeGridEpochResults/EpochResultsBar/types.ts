export default interface EpochResultsBarProps {
  address: string;
  bottomBarHeightPercentage: number;
  imageSources: string[];
  isHighlighted: boolean;
  isLowlighted: boolean;
  onClick: (address: string) => void;
  topBarHeightPercentage: number;
}
