import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { object, string, ObjectSchema } from 'yup';

import i18n from 'i18n';

import { FormFields } from './types';

export const formInitialValues: FormFields = {
  valueToWithdraw: '',
};

export const validationSchema = (
  withdrawableUserEth: BigNumber | undefined,
): ObjectSchema<FormFields> =>
  object().shape({
    valueToWithdraw: string()
      .required(i18n.t('common.valueCantBeEmpty'))
      .test({
        name: 'value-in-range',
        skipAbsent: true,
        test(value, ctx) {
          const newValueBigNumber = parseUnits(value || '0');
          if (newValueBigNumber.gt(withdrawableUserEth!)) {
            return ctx.createError({
              message: i18n.t('components.dedicated.withdrawEth.dontHaveThatMuchToWithdraw'),
            });
          }

          return true;
        },
      }),
  });
