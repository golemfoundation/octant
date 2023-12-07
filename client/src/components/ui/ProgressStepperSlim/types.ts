export default interface ProgressStepperSlimProps {
  className?: string;
  currentStepIndex: number;
  dataTest?: string;
  isDisabled?: boolean;
  numberOfSteps: number;
  onStepClick: (stepIndex: number) => void;
}
