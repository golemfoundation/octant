import { TFunction } from 'i18next';
import { ObjectSchema, number, object, string } from 'yup';

import { GLM_TOTAL_SUPPLY } from 'constants/currencies';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { FormFields } from './types';

const DEFAULT_AMOUNT = '5000';
const DEFAULT_EPOCH = 1;

export const formInitialValues: FormFields = {
  numberOfEpochs: DEFAULT_EPOCH,
  valueCrypto: DEFAULT_AMOUNT,
};

export const validationSchema = (t: TFunction): ObjectSchema<FormFields> =>
  object().shape({
    numberOfEpochs: number().required(),
    valueCrypto: string().test({
      name: 'value-in-range',
      skipAbsent: true,
      test(value, ctx) {
        const newValueBigInt = parseUnitsBigInt(value || '0');
        if (newValueBigInt > GLM_TOTAL_SUPPLY) {
          return ctx.createError({
            message: t('errors.valueCryptoTooBig'),
          });
        }
        return true;
      },
    }),
  });
