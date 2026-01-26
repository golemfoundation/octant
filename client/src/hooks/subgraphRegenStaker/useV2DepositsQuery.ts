import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
import { Hash } from 'viem';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/regenStaker/gql';
import { DepositsQuery } from 'gql/regenStaker/graphql';
import { QueryKeys } from 'api/queryKeys/types';

type DepositData = {
  balanceWei: string;
  depositId: string;
  id: string;
};

const depositsQueryDocument = graphql(`
  query Deposits($owner: String!, $regenStaker: String!) {
    deposits(where: { owner: $owner, regenStaker: $regenStaker }) {
      id
      depositId
      balanceWei
    }
  }
`);

// export const initialDepositData: DepositData = {
//   balanceWei: '',
//   depositId: '',
//   id: '',
// };

const useV2DepositsQuery = (regenStakerAddress: Hash, owner: Hash): UseQueryResult<DepositData[]> => {
  return useQuery<DepositsQuery, any, any, any>({
    queryFn: () =>
      request(env.subgraphRegenStakerAddress, depositsQueryDocument, {
        owner,
        regenStaker: regenStakerAddress,
      }),
    queryKey: QUERY_KEYS.v2Deposits(regenStakerAddress, owner),
    select(data) {
      console.log({ data });
      return data?.deposits;
    },
    throwOnError: error => console.log({ error }),
  });
};

export default useV2DepositsQuery;
