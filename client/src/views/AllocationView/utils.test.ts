/* eslint-disable @typescript-eslint/naming-convention */
import { getAllocationValuesInitialState, getAllocationsWithPositiveValues } from './utils';

describe('getAllocationValuesInitialState', () => {
  it('properly creates allocationValuesInitialState object', () => {
    expect(getAllocationValuesInitialState([1, 2])).toMatchObject({
      '1': undefined,
      '2': undefined,
    });
  });
});

describe('getAllocationsWithPositiveValues', () => {
  it('properly finds allocations with values', () => {
    expect(
      getAllocationsWithPositiveValues({
        '1': undefined,
        '2': undefined,
        '3': undefined,
      }),
    ).toEqual({});
  });

  it('properly finds allocations with values', () => {
    expect(getAllocationsWithPositiveValues({ '1': '10', '2': '0', '3': undefined })).toEqual({
      '1': '10',
    });
  });

  it('properly finds allocations with values', () => {
    expect(getAllocationsWithPositiveValues({ '1': '10', '2': '5', '3': undefined })).toEqual({
      '1': '10',
      '2': '5',
    });
  });

  it('properly finds allocations with values', () => {
    expect(getAllocationsWithPositiveValues({ '1': '10', '2': '5', '3': '0' })).toEqual({
      '1': '10',
      '2': '5',
    });
  });
});
