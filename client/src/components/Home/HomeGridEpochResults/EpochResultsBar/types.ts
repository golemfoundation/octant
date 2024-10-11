export default interface EpochResultsBarProps {
  address: string;
  bottomBarHeightPercentage: number;
  epoch: number;
  imageSources: string[];
  isDragging: boolean;
  isHighlighted: boolean;
  isLowlighted: boolean;
  setHighlightedBarAddress: (address: string | null) => void;
  topBarHeightPercentage: number;
}
