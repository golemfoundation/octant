export type CurrentMode = 'lock' | 'unlock';

export type CurrentStepIndex = 0 | 1 | 2 | 3;

export type FormValues = {
  valueToDeposeOrWithdraw: string;
};

export default interface GlmLockProps {
  currentMode: CurrentMode;
  onCurrentModeChange: (currentMode: CurrentMode) => void;
}
