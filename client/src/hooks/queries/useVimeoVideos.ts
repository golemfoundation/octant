import { UseQueryOptions, UseQueryResult, useQuery } from '@tanstack/react-query';

import { GetAlbumVideosResponse, vimeoApiGetAlbumVideos } from 'api/calls/vimeo';
import { QUERY_KEYS } from 'api/queryKeys';

export default function useVimeoVideos(
  options?: Omit<
    UseQueryOptions<GetAlbumVideosResponse, unknown, GetAlbumVideosResponse, any>,
    'queryKey'
  >,
): UseQueryResult<GetAlbumVideosResponse, unknown> {
  return useQuery({
    queryFn: () => vimeoApiGetAlbumVideos(),
    queryKey: QUERY_KEYS.vimeoVideos,
    staleTime: 24 * 60 * 60 * 1000, // 1 day
    ...options,
  });
}
