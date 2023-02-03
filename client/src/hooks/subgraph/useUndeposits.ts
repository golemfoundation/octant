import { gql, useQuery, QueryResult } from '@apollo/client';

export type Undeposit = {
  amount: string;
  blockTimestamp: number;
  type: 'Withdrawn';
};

type Variables = {
  userAddress: string;
};

const GET_UNDEPOSITS = gql`
  query GetUndeposits($userAddress: String!) {
    withdrawns(orderBy: blockTimestamp, where: { user: $userAddress }) {
      amount
      blockTimestamp
    }
  }
`;

export default function useUndeposits(userAddress: string): QueryResult<Undeposit[], Variables> {
  const { data, ...rest } = useQuery(GET_UNDEPOSITS, {
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
