import getPathObject from 'utils/routing';

const ROOT = getPathObject('', '');

export const ROOT_ROUTES = {
  allocation: getPathObject(ROOT, 'allocation'),
  earn: getPathObject(ROOT, 'earn'),
  metrics: getPathObject(ROOT, 'metrics'),
  proposals: getPathObject(ROOT, 'projects'),
  settings: getPathObject(ROOT, 'settings'),
};
