import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { string, object, ObjectSchema } from 'yup';

import i18n from 'i18n';

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
    return i18n.t('components.dedicated.glmLock.done');
  }
  if (isLoading) {
    return i18n.t('components.dedicated.glmLock.waitingForApproval'); // 'Waiting for approval...';
  }
  return currentMode === 'lock'
    ? i18n.t('components.dedicated.glmLock.lock')
    : i18n.t('components.dedicated.glmLock.unlock');
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
            return ctx.createError({
              message: i18n.t('components.dedicated.glmLock.cantUnlock'),
            });
          }
          if (currentMode === 'lock' && newValueBigNumber.gt(dataAvailableFunds!)) {
            return ctx.createError({
              message: i18n.t('components.dedicated.glmLock.dontHaveEnough'),
            });
          }

          return true;
        },
      }),
  });
