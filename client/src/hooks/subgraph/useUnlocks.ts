import { gql, useQuery, QueryResult } from '@apollo/client';

import useWallet from 'store/models/wallet/store';

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
    wallet: { address },
  } = useWallet();

  const { data, ...rest } = useQuery(GET_UNLCOKS, {
    skip: !address,
    variables: {
      userAddress: address!,
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
