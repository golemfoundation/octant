import { FormikHelpers } from 'formik';

export type CurrentMode = 'lock' | 'unlock';

export type Step = 1 | 2 | 3;

export type FormFields = {
  currentMode: CurrentMode;
  valueToDeposeOrWithdraw: string;
};

export type OnReset = ({
  setFieldValue,
  newMode,
}: {
  newMode: CurrentMode;
  setFieldValue?: FormikHelpers<FormFields>['setFieldValue'];
}) => void;

export default interface EarnGlmLockProps {
  currentMode: CurrentMode;
  onCloseModal: () => void;
  onCurrentModeChange: (currentMode: CurrentMode) => void;
}
