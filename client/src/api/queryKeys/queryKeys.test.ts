import { QUERY_KEYS, ROOTS } from './index';

describe('queryKeys', () => {
  /**
   * Uniqueness of keys need to be ensured
   * to avoid collision inside react-query in API calls.
   */
  it('checks if all elements of ROOTS are unique', () => {
    const queryKeysRootsValues = Object.values(ROOTS);
    const queryKeysRootsValuesUnique = [...new Set(queryKeysRootsValues)];
    expect(queryKeysRootsValuesUnique).toEqual(queryKeysRootsValues);
  });
  it('checks if all elements of QUERY_KEYS are unique', () => {
    const queryKeysValues = Object.values(QUERY_KEYS).map(value =>
      typeof value === 'function' ? JSON.stringify(value.toString()) : value,
    );
    const queryKeysValuesUnique = [...new Set(queryKeysValues)];
    expect(queryKeysValuesUnique).toEqual(queryKeysValues);
  });
});
