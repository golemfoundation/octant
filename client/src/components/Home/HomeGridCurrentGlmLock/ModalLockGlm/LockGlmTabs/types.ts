import { FormikHelpers } from 'formik';
import { RefObject } from 'react';

import {
  FormFields,
  CurrentMode,
  OnReset,
} from 'components/Home/HomeGridCurrentGlmLock/ModalLockGlm/LockGlm/types';

export default interface LockGlmTabsProps {
  buttonUseMaxRef: RefObject<HTMLButtonElement>;
  className?: string;
  currentMode: CurrentMode;
  isLoading: boolean;
  onClose: () => void;
  onInputsFocusChange: (value: boolean) => void;
  onReset: OnReset;
  setFieldValue: FormikHelpers<FormFields>['setFieldValue'];
  setValueToDepose: (value: bigint) => void;
  showBalances: boolean;
  step: 1 | 2 | 3;
}
