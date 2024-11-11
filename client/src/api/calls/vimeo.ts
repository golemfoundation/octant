import apiService from 'services/apiService';

export type GetAlbumVideosResponse = {
  name: string;
  player_embed_url: string;
}[];

const vimeoApiEndpoint = 'https://api.vimeo.com';
const vimeoUserId = 124198022;
const vimeoAlbumId = 11407049;
const publicAccessToken = '959f7b9a5a73689d684e0b60e979b6b4';
const fields = [['name', 'player_embed_url']];

export async function vimeoApiGetAlbumVideos(): Promise<GetAlbumVideosResponse> {
  return apiService
    .get(
      `${vimeoApiEndpoint}/users/${vimeoUserId}/albums/${vimeoAlbumId}/videos?fields=${fields.join(',')}&sort=manual&per_page=100`,
      {
        headers: {
          Authorization: `bearer ${publicAccessToken}`,
        },
      },
    )
    .then(({ data }) => data.data);
}
