import getPathObject from 'utils/routing';

const ROOT = getPathObject('', '');

export const ROOT_ROUTES = {
  proposals: getPathObject(ROOT, 'proposals'),
  settings: getPathObject(ROOT, 'settings'),
  stats: getPathObject(ROOT, 'stats'),
};
