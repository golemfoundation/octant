export default interface AllocationSliderBoxProps {
  className?: string;
  isDisabled?: boolean;
  isError: boolean;
  isLocked?: boolean;
  isManuallyEdited?: boolean;
  setRewardsForProjectsCallback: ({ rewardsForProjectsNew }) => void;
}
