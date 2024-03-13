import getValidatedProjectsFromLocalStorage from './getValidatedProjectsFromLocalStorage';

describe('getValidatedProjectsFromLocalStorage', () => {
  it('properly validates projects in local storage against those provided from backend', () => {
    expect(
      getValidatedProjectsFromLocalStorage(['1', '2', '3', '4'], ['1', '2', '3', '4', '5']),
    ).toEqual(['1', '2', '3', '4']);

    expect(getValidatedProjectsFromLocalStorage(['1', '2', '3', '4'], ['1', '2', '3'])).toEqual([
      '1',
      '2',
      '3',
    ]);

    expect(
      getValidatedProjectsFromLocalStorage(['1', '2', '3', '4', '2', '3'], ['1', '2', '3']),
    ).toEqual(['1', '2', '3']);
  });
});
