import { BigNumber } from 'ethers';

import { Allocation, AllocationSquashed } from './types';

// TODO OCT-312: remove this util and simplify logic following OCT-312.
export function parseAllocations(allocateds?: Allocation[]): AllocationSquashed[] | undefined {
  return allocateds?.reduce<any>((acc, curr) => {
    const currBlockTimestamp = curr.blockTimestamp;
    const arrayWithBlockTimestamp = acc.find(element =>
      element.array.find(element2 => element2?.blockTimestamp === currBlockTimestamp),
    );
    let modifiedElement = arrayWithBlockTimestamp !== undefined ? arrayWithBlockTimestamp : [];

    if (arrayWithBlockTimestamp !== undefined) {
      modifiedElement.amount = modifiedElement.amount.add(curr.allocation);
      modifiedElement.array.push(curr);
      acc.splice(acc.indexOf(arrayWithBlockTimestamp), 1);
    } else {
      modifiedElement = {
        amount: BigNumber.from(curr.allocation),
        array: [curr],
        blockTimestamp: parseInt(currBlockTimestamp, 10) * 1000,
        type: 'Allocated',
        user: curr.user,
      };
    }

    return [...acc, { ...modifiedElement }];
  }, []);
}
