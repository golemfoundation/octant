export default interface NavigationArrowsProps {
  className?: string;
  classNameNextButton?: string;
  classNamePrevButton?: string;
  dataTest?: string;
  idArrowPrevious?: string;
  isNextButtonDisabled: boolean;
  isPrevButtonDisabled: boolean;
  onClickNextButton: () => void;
  onClickPrevButton: () => void;
}
