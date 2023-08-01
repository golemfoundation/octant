export default interface ProgressStepperProps {
  currentStep: 1 | 2 | 3;
  isNextStepIsAvailable: boolean;
  steps: string[];
}
