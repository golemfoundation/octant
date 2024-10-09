export default interface AllocationSliderBoxProps {
  className?: string;
  isDisabled?: boolean;
  isError: boolean;
  isLocked?: boolean;
  setRewardsForProjectsCallback: ({ rewardsForProjectsNew }) => void;
}
