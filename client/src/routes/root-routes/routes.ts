import getPathObject from 'utils/routing';

const ROOT = getPathObject('', '');

export const ROOT_ROUTES = {
  deposits: getPathObject(ROOT, 'deposits'),
  proposals: getPathObject(ROOT, 'proposals'),
  settings: getPathObject(ROOT, 'settings'),
  stats: getPathObject(ROOT, 'stats'),
};
