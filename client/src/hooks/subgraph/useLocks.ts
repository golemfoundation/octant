import { gql, useQuery, QueryResult } from '@apollo/client';
import { useAccount } from 'wagmi';

export type Lock = {
  amount: string;
  blockTimestamp: number;
  type: 'Lock';
};

type Variables = {
  userAddress: `0x${string}`;
};

const GET_LOCKS = gql`
  query GetLocks($userAddress: String!) {
    lockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`;

export default function useLocks(): QueryResult<Lock[], Variables> {
  const { address } = useAccount();

  const { data, ...rest } = useQuery(GET_LOCKS, {
    skip: !address,
    variables: {
      userAddress: address!,
    },
  });

  return {
    data: data?.lockeds.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Lock',
    })),
    ...rest,
  };
}
