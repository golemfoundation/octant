import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
/* eslint-enable import/no-unresolved */
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';
import { parseUnitsBigInt } from 'utils/parseUnitsBigInt';

type Withdrawals = {
  withdrawals: {
    amount: string;
  }[];
};

const GET_USER_WITHDRAWALS = graphql(`
  query GetUserWithdrawals($address: Bytes) {
    withdrawals(where: { user: $address }) {
      amount
    }
  }
`);

export default function useTotalWithdrawals(): UseQueryResult<bigint> {
  const { subgraphAddress } = env;
  const { address } = useAccount();

  return useQuery<Withdrawals, any, bigint, any>({
    queryFn: async () => request(subgraphAddress, GET_USER_WITHDRAWALS, { address }),
    queryKey: QUERY_KEYS.totalWithdrawals,
    select: data =>
      data.withdrawals.reduce(
        (acc, { amount }) => acc + parseUnitsBigInt(amount, 'wei'),
        BigInt(0),
      ),
  });
}
