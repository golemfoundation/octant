import { string, object, ObjectSchema } from 'yup';

import i18n from 'i18n';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { CurrentMode, FormFields } from './types';

export const formInitialValues: FormFields = {
  valueToDeposeOrWithdraw: '',
};

export const validationSchema = (
  currentMode: CurrentMode,
  dataAvailableFunds: bigint | undefined,
  depositsValue: bigint | undefined,
): ObjectSchema<FormFields> =>
  object().shape({
    valueToDeposeOrWithdraw: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigInt = parseUnitsBigInt(value || '0');
          if (currentMode === 'unlock' && newValueBigInt > depositsValue!) {
            return ctx.createError({
              message: 'cantUnlock',
            });
          }
          if (currentMode === 'lock' && newValueBigInt > dataAvailableFunds!) {
            return ctx.createError({
              message: 'dontHaveEnough',
            });
          }

          return true;
        },
      }),
  });
