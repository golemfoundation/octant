import { gql, useQuery, QueryResult } from '@apollo/client';
import { useMetamask } from 'use-metamask';

export type Withdrawn = {
  amount: string;
  blockTimestamp: number;
  type: 'Withdrawn';
};

type Variables = {
  userAddress: string;
};

const GET_WITHDRAWNS = gql`
  query GetUndeposits($userAddress: String!) {
    withdrawns(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`;

export default function useWithdrawns(): QueryResult<Withdrawn[], Variables> {
  const {
    metaState: { account },
  } = useMetamask();
  const userAddress = account[0];

  const { data, ...rest } = useQuery(GET_WITHDRAWNS, {
    variables: {
      userAddress,
    },
  });

  return {
    data: data?.withdrawns.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Withdrawn',
    })),
    ...rest,
  };
}
