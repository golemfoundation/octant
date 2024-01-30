import { Command, Option } from "commander";
import { isNull } from "util";

import { HttpFetcher } from "./data/fetcher";
import { register_verifications } from "./verifications";
import { Runner } from "./runner";
import { buildContext } from "./data/context";


interface Options {
  deployment?: string
  epoch: number
  url?: string
}

const DEPLOYMENTS: {[key: string]: string} = {
  mainnet: "https://backend-hello.mainnet.octant.app",
  master: "https://master-backend.octant.wildland.dev",
  rc: "https://backend.mainnet.octant.wildland.dev",
  uat: "https://uat-backend.octant.wildland.dev",
}

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
    fetcher.userBudgets(options.epoch),
    fetcher.allocations(options.epoch),
    fetcher.rewards(options.epoch),
    fetcher.epochInfo(options.epoch)
  ])

  if (results.some(isNull)) {
    process.exit(1)
  }

  const [userBudgets, allocations, rewards, epochInfo] = results;
  const context = buildContext(userBudgets!, allocations!, rewards!, epochInfo!)

  const runner = new Runner()
  register_verifications(runner)
  await runner.run(context)

}


const program = new Command();
program
  .description("Epoch verifier script.")
  .addOption(new Option("--deployment <deployment>", "specify deployment to connect to").choices(Object.keys(DEPLOYMENTS)))
  .option("--url <url>", "custom deployment url. Do not use with --deployment option")
  .argument("<epoch>", "Epoch number for which the verification should be done.")
  .action(run)
  .parse(process.argv);
