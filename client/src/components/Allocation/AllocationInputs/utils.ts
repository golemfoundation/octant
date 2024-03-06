import { object, ObjectSchema, string } from 'yup';

import i18n from 'i18n';
import { formatUnitsBigInt } from 'utils/formatUnitsBigInt';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { FormFields } from './types';

export const formInitialValues = (valueCryptoSelected: bigint): FormFields => ({
  valueCryptoSelected: formatUnitsBigInt(valueCryptoSelected),
});

export const validationSchema = (
  valueCryptoTotal: bigint,
  restToDistribute: bigint,
): ObjectSchema<FormFields> =>
  object().shape({
    valueCryptoSelected: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigInt = parseUnitsBigInt(value || '0');
          if (newValueBigInt > valueCryptoTotal || newValueBigInt > restToDistribute) {
            return ctx.createError();
          }

          return true;
        },
      }),
  });
