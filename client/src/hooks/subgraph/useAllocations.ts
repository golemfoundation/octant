import { gql, useQuery, QueryResult } from '@apollo/client';
import { BigNumber } from 'ethers';
import { useMetamask } from 'use-metamask';

type Allocation = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __typename: 'Allocated';
  allocation: string;
  blockTimestamp: string;
  proposalId: string;
};

type Variables = {
  userAddress: string;
};

export type AllocationSquashed = {
  amount: BigNumber;
  array: Allocation[];
  blockTimestamp: number;
  type: 'Allocated';
};

const GET_ALLOCATIONS = gql`
  query GetAllocations($userAddress: String!) {
    allocateds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      allocation
      blockTimestamp
      proposalId
    }
  }
`;

export default function useAllocations(): QueryResult<AllocationSquashed[], Variables> {
  const {
    metaState: { account },
  } = useMetamask();
  const userAddress = account[0];

  const { data, ...rest } = useQuery(GET_ALLOCATIONS, {
    variables: {
      userAddress,
    },
  });

  return {
    data: data?.allocateds.reduce((acc, curr) => {
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
        };
      }

      return [...acc, modifiedElement];
    }, []),
    ...rest,
  };
}
