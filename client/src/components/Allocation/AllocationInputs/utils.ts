import { BigNumber } from 'ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { object, ObjectSchema, string } from 'yup';

import i18n from 'i18n';

import { FormFields } from './types';

export const formInitialValues = (valueCryptoSelected: BigNumber): FormFields => ({
  valueCryptoSelected: formatUnits(valueCryptoSelected),
});

export const validationSchema = (
  valueCryptoTotal: BigNumber,
  restToDistribute: BigNumber,
): ObjectSchema<FormFields> =>
  object().shape({
    valueCryptoSelected: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigNumber = parseUnits(value || '0');
          if (newValueBigNumber.gt(valueCryptoTotal) || newValueBigNumber.gt(restToDistribute)) {
            return ctx.createError();
          }

          return true;
        },
      }),
  });
