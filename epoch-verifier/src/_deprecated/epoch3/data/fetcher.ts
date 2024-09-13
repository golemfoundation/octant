/* eslint-disable no-console */
import { Axios } from "axios"

import {
  AllocationImpl,
  Deserializable,
  EpochInfo,
  EpochInfoImpl,
  RewardImpl,
  Reward,
  UserBudgetImpl,
  UserBudget,
  AllocationRecord,
  ApiRewardsBudgets, ApiAllocations, ApiRewards,
} from "./models";

const REQUEST_TIMEOUT = 150_000;

export class HttpFetcher {
  readonly axios: Axios

  constructor(baseUrl: string) {
    this.axios = new Axios({ baseURL: baseUrl, timeout: REQUEST_TIMEOUT })
  }

  async _get<T>(url: string, resource: string, Factory: { new(): Deserializable<T> }): Promise<T | null> {
    const mapper = (data: any): T => new Factory().from(JSON.parse(data))
    return this._do_get(url, resource, mapper)
  }

  async _get_array<T>(url: string, resource: string, Factory: { new(): Deserializable<T> }, unwrapper?: (data: any) => any): Promise<Array<T> | null> {

    const dataUnwrapper = unwrapper ?? ((data: any) => data)

    const mapper = (data: any): Array<T> => dataUnwrapper(JSON.parse(data)).map((elem: any): T => new Factory().from(elem))
    return this._do_get(url, resource, mapper)
  }

  async _do_get<T>(url: string, resource: string, mapper: (data: any) => T): Promise<T | null> {

    return this.axios.get(url).then(response => {
      if (response.status !== 200) {
        throw new Error(response.data)
      }
      console.log(`✅ Fetched ${resource} ${response.data}`)
      return mapper(response.data)

    }).catch(reason => {
      console.error(`❗ Failed to fetch ${resource} due to: ${reason}`)
      return null
    })
  }


  async apiGetUserBudgets(epoch: number): Promise<UserBudget[] | null> {
    return this._get_array(`/rewards/budgets/epoch/${epoch}`, "users' budgets", UserBudgetImpl, (data: ApiRewardsBudgets) => data.budgets)
  }

  async apiGetAllocations(epoch: number): Promise<AllocationRecord[] | null> {
    return this._get_array(`/allocations/epoch/${epoch}?includeZeroAllocations=true`, "users' allocations", AllocationImpl, (data: ApiAllocations) => data.allocations)
  }

  async apiGetRewards(epoch: number): Promise<Reward[] | null> {
    return this._get_array(`/rewards/projects/epoch/${epoch}`, "projects rewards", RewardImpl, (data: ApiRewards) => data.rewards)
  }

  async apiGetEpochInfo(epoch: number): Promise<EpochInfo | null> {
    return this._get(`/epochs/info/${epoch}`, "epoch info", EpochInfoImpl)
  }
}
