import { gql, useQuery, QueryResult } from '@apollo/client';
import { useMetamask } from 'use-metamask';

export type Unlock = {
  amount: string;
  blockTimestamp: number;
  type: 'Unlock';
};

type Variables = {
  userAddress: string;
};

const GET_UNLCOKS = gql`
  query GetUnlocks($userAddress: String!) {
    unlockeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`;

export default function useUnlocks(): QueryResult<Unlock[], Variables> {
  const {
    metaState: { account },
  } = useMetamask();
  const userAddress = account[0];

  const { data, ...rest } = useQuery(GET_UNLCOKS, {
    skip: !userAddress,
    variables: {
      userAddress,
    },
  });

  return {
    data: data?.unlockeds.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Unlock',
    })),
    ...rest,
  };
}
