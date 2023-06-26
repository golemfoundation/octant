export type CurrentMode = 'lock' | 'unlock';

export type CurrentStepIndex = 0 | 1 | 2 | 3;

export type FormValues = {
  valueToDeposeOrWithdraw: string;
};

export default interface GlmLockProps {
  currentMode: CurrentMode;
  onChangeCryptoOrFiatInputFocus: (isCryptoOrFiatInputFocused: boolean) => void;
  onCloseModal: () => void;
  onCurrentModeChange: (currentMode: CurrentMode) => void;
  showBudgetBox: boolean;
}
