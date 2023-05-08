export default interface ProgressStepperSlimProps {
  className?: string;
  currentStepIndex: number;
  dataTest?: string;
  numberOfSteps: number;
  onStepClick: (stepIndex: number) => void;
}
