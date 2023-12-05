import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { string, object, ObjectSchema } from 'yup';

import i18n from 'i18n';

import { CurrentMode, FormFields } from './types';

export const formInitialValues: FormFields = {
  valueToDeposeOrWithdraw: '',
};

export const validationSchema = (
  currentMode: CurrentMode,
  dataAvailableFunds: BigNumber | undefined,
  depositsValue: BigNumber | undefined,
): ObjectSchema<FormFields> =>
  object().shape({
    valueToDeposeOrWithdraw: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigNumber = parseUnits(value || '0');
          if (currentMode === 'unlock' && newValueBigNumber.gt(depositsValue!)) {
            return ctx.createError({
              message: 'cantUnlock',
            });
          }
          if (currentMode === 'lock' && newValueBigNumber.gt(dataAvailableFunds!)) {
            return ctx.createError({
              message: 'dontHaveEnough',
            });
          }

          return true;
        },
      }),
  });
