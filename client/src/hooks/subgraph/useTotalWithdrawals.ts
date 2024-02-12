import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { BigNumber } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import request from 'graphql-request';
import { useAccount } from 'wagmi';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/gql';

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

export default function useTotalWithdrawals(): UseQueryResult<BigNumber> {
  const { subgraphAddress } = env;
  const { address } = useAccount();

  return useQuery<Withdrawals, any, BigNumber, any>({
    queryFn: async () => request(subgraphAddress, GET_USER_WITHDRAWALS, { address }),
    queryKey: QUERY_KEYS.totalWithdrawals,
    select: data =>
      data.withdrawals.reduce(
        (acc, { amount }) => acc.add(parseUnits(amount, 'wei')),
        BigNumber.from(0),
      ),
  });
}
