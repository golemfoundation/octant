import { createAction as typedCreateAction } from '@reduxjs/toolkit';

import { REQUEST_ACTIONS_SPACER } from 'constants/store';

import actionCreator from './actionCreator';

const testCases = [
  {
    suffix: 'FAILED',
  },
  {
    suffix: 'REQUESTED',
  },
  {
    suffix: 'SUCCEEDED',
  },
];

describe('actionCreator', () => {
  const mockedActionPrefix = 'MOCKED_ACTION';
  testCases.forEach(({ suffix }) => {
    it(`creates action object for prefix ${mockedActionPrefix} and suffix ${suffix}`, () => {
      /** JSON.stringify allows us to dirty-check if objects with functions are the same */
      expect(JSON.stringify(actionCreator(mockedActionPrefix, suffix))).toEqual(
        JSON.stringify(
          typedCreateAction<undefined>(`${mockedActionPrefix}${REQUEST_ACTIONS_SPACER}${suffix}`),
        ),
      );
    });
  });
});
