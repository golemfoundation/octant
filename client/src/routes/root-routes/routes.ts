import getPathObject from 'utils/routing';

const ROOT = getPathObject('', '');

export const ROOT_ROUTES = {
  deposits: getPathObject(ROOT, 'deposits'),
  earn: getPathObject(ROOT, 'earn'),
  metrics: getPathObject(ROOT, 'metrics'),
  projects: getPathObject(ROOT, 'projects'),
  settings: getPathObject(ROOT, 'settings'),
};
