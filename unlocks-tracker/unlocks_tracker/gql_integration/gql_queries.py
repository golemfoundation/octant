class GQLQueries:
    GET_LOCKS = """
        query GetLocks($fromTimestamp: Int!, $toTimestamp: Int!,
        $userAddress: String!) {
          lockeds(
            orderBy: timestamp
            where: {
              timestamp_gte: $fromTimestamp,
              timestamp_lt: $toTimestamp,
              user: $userAddress
            }
          ) {
            __typename
            depositBefore
            amount
            timestamp
            user
            transactionHash
          }
        }
        """

    GET_UNLOCKS = """
        query GetUnlocks($fromTimestamp: Int!, $toTimestamp: Int!,
        $userAddress: String!) {
          unlockeds(
            orderBy: timestamp
            where: {
              timestamp_gte: $fromTimestamp,
              timestamp_lt: $toTimestamp,
              user: $userAddress
            }
          ) {
            __typename
            depositBefore
            amount
            timestamp
            user
            transactionHash
          }
        }
    """
