import { TFunction } from 'i18next';
import { ObjectSchema, number, object, string, boolean } from 'yup';

import { GLM_TOTAL_SUPPLY } from 'constants/currencies';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

import { FormFields } from './types';

const DEFAULT_AMOUNT = '5000';
const DEFAULT_EPOCH = 1;
// eslint-disable-next-line @typescript-eslint/naming-convention
const DEFAULT_IS_UQ_SCORE_OVER_THRESHOLD_GIVING_MULTIPLIER_1 = true;

export const formInitialValues: FormFields = {
  isUqScoreOverThresholdGivingMultiplier1: DEFAULT_IS_UQ_SCORE_OVER_THRESHOLD_GIVING_MULTIPLIER_1,
  numberOfEpochs: DEFAULT_EPOCH,
  valueCrypto: DEFAULT_AMOUNT,
};

export const validationSchema = (t: TFunction): ObjectSchema<FormFields> =>
  object().shape({
    isUqScoreOverThresholdGivingMultiplier1: boolean().required(),
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
