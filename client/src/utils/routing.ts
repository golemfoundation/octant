export interface Path {
  absolute: string;
  relative: string;
}

export const getPathObject = (root: string | Path, relativePath: string): Path => {
  const rootPath = root && typeof root === 'object' ? root.absolute : root;
  return {
    absolute: rootPath !== '/' ? `${rootPath}/${relativePath}` : `/${relativePath}`,
    relative: relativePath,
  };
};
