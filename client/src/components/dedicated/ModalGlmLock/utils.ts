import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { string, object, ObjectSchema } from 'yup';

import { CurrentMode, CurrentStepIndex, FormValues } from './types';

export const formInitialValues: FormValues = {
  valueToDeposeOrWithdraw: '',
};

export const getButtonCtaLabel = (
  currentMode: CurrentMode,
  currentStepIndex: CurrentStepIndex,
  isLoading: boolean,
): string => {
  if (currentStepIndex === 3) {
    return 'Done';
  }
  if (isLoading) {
    return 'Waiting for approval...';
  }
  return currentMode === 'lock' ? 'Lock' : 'Unlock';
};

export const validationSchema = (
  currentMode: CurrentMode,
  dataAvailableFunds: BigNumber | undefined,
  depositsValue: BigNumber | undefined,
): ObjectSchema<FormValues> =>
  object().shape({
    valueToDeposeOrWithdraw: string()
      .required("Value can't be empty")
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigNumber = parseUnits(value || '0');
          if (currentMode === 'unlock' && newValueBigNumber.gt(depositsValue!)) {
            return ctx.createError({ message: "You can't unlock more than you have locked" });
          }
          if (currentMode === 'lock' && newValueBigNumber.gt(dataAvailableFunds!)) {
            return ctx.createError({ message: "You don't have enough to lock that amount" });
          }

          return true;
        },
      }),
  });
