/* eslint-disable no-console */
import { Command, Option } from "commander";

import { buildContext } from "./data/context";
import { HttpFetcher } from "./data/fetcher";
import { Runner } from "./runner";
import { registerVerifications } from "./verifications";


interface Options {
  deployment?: string;
  epoch: number;
  url?: string;
  simulated?: boolean;
}

const DEPLOYMENTS: { [key: string]: string } = {
  mainnet: "https://backend.mainnet.octant.app",
  master: "https://master-backend.octant.wildland.dev",
  rc: "https://backend.mainnet.octant.wildland.dev",
  testnet: "https://backend.testnet.octant.app",
  uat: "https://uat-backend.octant.wildland.dev",
}

const isNull = (obj: any) => obj === null

function getDeploymentUrl(options: Options): string {

  if ((options.url !== undefined && options.deployment !== undefined) || (options.url === undefined && options.deployment === undefined)) {
    console.error("Specify either custom url or deployment.")
    process.exit(1)
  }

  if (options.url !== undefined) {
    return options.url!
  }

  return DEPLOYMENTS[options.deployment!]

}

async function run(epoch: string, opts: any) {
  const options: Options = { epoch: parseInt(epoch, 10), simulated: opts.simulated, ...opts }
  const baseUrl = getDeploymentUrl(options)

  console.log(`Using url: ${baseUrl}`)

  if (options.simulated) {
    console.log(`Running verification scripts for epoch: ${options.epoch} in simulated mode.`)
  }
  else {
    console.log(`Running verification scripts for epoch: ${options.epoch}.`)
  }

  const fetcher = new HttpFetcher(baseUrl)
  const fetchPromises = [
    fetcher.apiGetUserBudgets(options.epoch),
    fetcher.apiGetAllocations(options.epoch),
    fetcher.apiGetEpochInfo(options.epoch),
    fetcher.apiGetEpochUqs(options.epoch)
  ];

  if (options.simulated) {
    fetchPromises.push(fetcher.apiGetFinalizedSimulated());
  } else {
    fetchPromises.push(fetcher.apiGetRewards(options.epoch));
  }

  const results = await Promise.all(fetchPromises);

  if (results.some(isNull)) {
    process.exit(1)
  }

  const [
    userBudgets,
    allocations,
    epochInfo,
    epochUqs,
    rewards
  ] = results;
  const context = buildContext(userBudgets!, allocations!, rewards!, epochInfo!, epochUqs!, options.simulated);

  const runner = new Runner()
  registerVerifications(runner)
  const failures = await runner.run(context)

  process.exit(failures)

}


const program = new Command();
program
  .description("Epoch verifier script.")
  .addOption(new Option("--deployment <deployment>", "specify deployment to connect to").choices(Object.keys(DEPLOYMENTS)))
  .option("--url <url>", "custom deployment url. Do not use with --deployment option")
  .option("--simulated", "run the script in simulated mode")
  .argument("<epoch>", "Epoch number for which the verification should be done.")
  .action(run)
  .parse(process.argv);
