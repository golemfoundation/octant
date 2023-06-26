import { getValidatedProposalsFromLocalStorage } from './utils';

describe('getValidatedProposalsFromLocalStorage', () => {
  it('properly validates proposals in local storage against those provided from backend', () => {
    expect(
      getValidatedProposalsFromLocalStorage(['1', '2', '3', '4'], ['1', '2', '3', '4', '5']),
    ).toEqual(['1', '2', '3', '4']);

    expect(getValidatedProposalsFromLocalStorage(['1', '2', '3', '4'], ['1', '2', '3'])).toEqual([
      '1',
      '2',
      '3',
    ]);

    expect(
      getValidatedProposalsFromLocalStorage(['1', '2', '3', '4', '2', '3'], ['1', '2', '3']),
    ).toEqual(['1', '2', '3']);
  });
});
