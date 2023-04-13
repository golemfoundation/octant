export default interface ProgressStepperSlimProps {
  className?: string;
  currentStepIndex: number;
  numberOfSteps: number;
  onStepClick: (stepIndex: number) => void;
}
