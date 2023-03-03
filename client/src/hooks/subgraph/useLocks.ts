import { gql, useQuery, QueryResult } from '@apollo/client';
import { useMetamask } from 'use-metamask';

export type Deposit = {
  amount: string;
  blockTimestamp: number;
  type: 'Deposited';
};

type Variables = {
  userAddress: string;
};

const GET_DEPOSITS = gql`
  query GetDeposits($userAddress: String!) {
    depositeds(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`;

export default function useLocks(): QueryResult<Deposit[], Variables> {
  const {
    metaState: { account },
  } = useMetamask();
  const userAddress = account[0];

  const { data, ...rest } = useQuery(GET_DEPOSITS, {
    variables: {
      userAddress,
    },
  });

  return {
    data: data?.depositeds.map(({ blockTimestamp, ...elementRest }) => ({
      ...elementRest,
      blockTimestamp: parseInt(blockTimestamp, 10) * 1000,
      type: 'Deposited',
    })),
    ...rest,
  };
}
