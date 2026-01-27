import { useQuery, UseQueryResult } from '@tanstack/react-query';
/* eslint-disable import/no-unresolved */
// @ts-expect-error wrong linter information that package does not exist.
import { request } from 'graphql-request';
import { Hash } from 'viem';

import { QUERY_KEYS } from 'api/queryKeys';
import env from 'env';
import { graphql } from 'gql/regenStaker/gql';
import { DepositsQuery } from 'gql/regenStaker/graphql';

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

const useV2Deposits = (owner: Hash): UseQueryResult<DepositData[]> => {
  const { subgraphRegenStakerAddress, contractRegenStakerAddress } = env;
  return useQuery<DepositsQuery, any, any, any>({
    enabled: !!contractRegenStakerAddress && !!owner,
    queryFn: () =>
      request(subgraphRegenStakerAddress, depositsQueryDocument, {
        owner,
        regenStaker: contractRegenStakerAddress,
      }),
    queryKey: QUERY_KEYS.v2Deposits(contractRegenStakerAddress, owner),
    select: data => data?.deposits,
  });
};

export default useV2Deposits;
