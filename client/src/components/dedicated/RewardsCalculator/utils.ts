import { parseUnits } from 'ethers/lib/utils';
import { TFunction } from 'i18next';
import { ObjectSchema, object, string } from 'yup';

import { GLM_TOTAL_SUPPLY } from 'constants/currencies';

import { FormFields } from './types';

const DEFAULT_AMOUNT = '5000';
const DEFAULT_DAYS = '90';

export const formInitialValues: FormFields = {
  days: DEFAULT_DAYS,
  valueCrypto: DEFAULT_AMOUNT,
};

export const validationSchema = (t: TFunction): ObjectSchema<FormFields> =>
  object().shape({
    days: string().required(),
    valueCrypto: string().test({
      name: 'value-in-range',
      skipAbsent: true,
      test(value, ctx) {
        const newValueBigNumber = parseUnits(value || '0');
        if (newValueBigNumber.gt(GLM_TOTAL_SUPPLY)) {
          return ctx.createError({
            message: t('errors.valueCryptoTooBig'),
          });
        }
        return true;
      },
    }),
  });
