import type { CodegenConfig } from '@graphql-codegen/cli';
// eslint-disable-next-line no-restricted-syntax
import * as dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
  documents: 'src/**/*.ts',
  generates: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    './src/gql/': {
      plugins: [],
      preset: 'client',
    },
  },
  ignoreNoDocuments: true, // for better experience with the watcher
  overwrite: true,
  schema:
    process.env.VITE_SUBGRAPH_ADDRESS ||
    'https://uat-graph.octant.wildland.dev/subgraphs/name/octant',
};

export default config;
