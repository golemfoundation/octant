import type { CodegenConfig } from '@graphql-codegen/cli';
// eslint-disable-next-line no-restricted-syntax
import * as dotenv from 'dotenv';

dotenv.config();

const config: CodegenConfig = {
  generates: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    './src/gql/regenStaker/': {
      documents: 'src/hooks/subgraphRegenStaker/*.ts',
      plugins: [],
      preset: 'client',
      schema: process.env.VITE_SUBGRAPH_REGEN_STAKER_ADDRESS,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    './src/gql/v1/': {
      documents: 'src/hooks/subgraph/*.ts',
      plugins: [],
      preset: 'client',
      schema: process.env.VITE_SUBGRAPH_ADDRESS,
    },
  },
  ignoreNoDocuments: true, // for better experience with the watcher
  overwrite: true,
  // schema:
  //   process.env.VITE_SUBGRAPH_ADDRESS ||
  //   'https://uat-graph.octant.wildland.dev/subgraphs/name/octant',
};

export default config;
