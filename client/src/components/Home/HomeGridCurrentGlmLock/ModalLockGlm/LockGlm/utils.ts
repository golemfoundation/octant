import { string, object, ObjectSchema } from 'yup';

import i18n from 'i18n';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { CurrentMode, FormFields } from './types';

export const formInitialValues = (currentMode: CurrentMode): FormFields => ({
  currentMode,
  valueToDeposeOrWithdraw: '',
});

export const validationSchema = (
  dataAvailableFunds: bigint | undefined,
  depositsValue: bigint | undefined,
): ObjectSchema<FormFields> =>
  object().shape({
    currentMode: string().oneOf(['lock', 'unlock']).required(),
    valueToDeposeOrWithdraw: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const { currentMode } = ctx.parent;
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
