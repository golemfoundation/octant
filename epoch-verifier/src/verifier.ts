/* eslint-disable no-console */
import { Command, Option } from "commander";

import { buildContext } from "./data/context";
import { HttpFetcher } from "./data/fetcher";
import { Runner } from "./runner";
import { registerVerifications } from "./verifications";


interface Options {
  deployment?: string
  epoch: number
  url?: string
}

const DEPLOYMENTS: {[key: string]: string} = {
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
  const options: Options = {epoch: parseInt(epoch, 10), ...opts}
  const baseUrl = getDeploymentUrl(options)

  console.log(`Using url: ${baseUrl}`)
  console.log(`Running verification scripts for epoch: ${options.epoch}`)

  const fetcher = new HttpFetcher(baseUrl)
  const results = await Promise.all([
    fetcher.apiGetUserBudgets(options.epoch),
    fetcher.apiGetAllocations(options.epoch),
    fetcher.apiGetRewards(options.epoch),
    fetcher.apiGetEpochInfo(options.epoch)
  ])

  if (results.some(isNull)) {
    process.exit(1)
  }

  const [
    userBudgets,
    allocations,
    rewards,
    epochInfo,
  ] = results;
  const context = buildContext(userBudgets!, allocations!, rewards!, epochInfo!)

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
  .argument("<epoch>", "Epoch number for which the verification should be done.")
  .action(run)
  .parse(process.argv);
