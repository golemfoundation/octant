import { getAllocationValuesInitialState, getAllocationsWithValues } from './utils';
import { mockedExtendedProposal1, mockedExtendedProposal2 } from './mockedData';

describe('getAllocationValuesInitialState', () => {
  it('properly creates allocationValuesInitialState object', () => {
    expect(
      getAllocationValuesInitialState([mockedExtendedProposal1, mockedExtendedProposal2]),
    ).toMatchObject({
      /* eslint-disable @typescript-eslint/naming-convention */
      1: 0,
      2: 0,
      /* eslint-enable @typescript-eslint/naming-convention */
    });
  });
});

describe('getAlreadyAddedAllocationId', () => {
  it('properly finds allocations with values', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(getAllocationsWithValues({ '1': 0, '2': 0, '3': 0 })).toEqual([]);
  });

  it('properly finds allocations with values', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(getAllocationsWithValues({ '1': 10, '2': 0, '3': 0 })).toEqual(['1']);
  });

  it('properly finds allocations with values', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(getAllocationsWithValues({ '1': 10, '2': 5, '3': 0 })).toEqual(['1', '2']);
  });

  it('properly finds allocations with values', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    expect(getAllocationsWithValues({ '1': 10, '2': 5, '3': 100 })).toEqual(['1', '2', '3']);
  });
});
