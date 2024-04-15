/* eslint-disable no-console */
import { Axios } from "axios"

import {
  AllocationImpl,
  Allocation,
  Deserializable,
  EpochInfo,
  EpochInfoImpl,
  RewardImpl,
  Reward,
  UserBudgetImpl,
  UserBudget,
  AllocationRecord
} from "./models";

const REQUEST_TIMEOUT = 150_000;

export class HttpFetcher {
  readonly axios: Axios

  constructor(baseUrl: string){
    this.axios = new Axios({baseURL: baseUrl, timeout: REQUEST_TIMEOUT})
  }

  async _get <T>(url: string, resource: string, Factory: {new(): Deserializable<T>}): Promise<T | null>{
    const mapper = (data: any): T => new Factory().from(JSON.parse(data))
    return this._do_get(url, resource, mapper)
  }

  async _get_array <T>(url: string, resource: string, Factory: {new(): Deserializable<T>}, unwrapper?: (data: any) => any): Promise<Array<T> | null>{

    const dataUnwrapper = unwrapper ?? ((data: any) => data)

    const mapper = (data: any): Array<T> => dataUnwrapper(JSON.parse(data)).map((elem: any): T => new Factory().from(elem))
    return this._do_get(url, resource, mapper)
  }

  async _do_get<T>(url: string, resource: string, mapper: (data: any) => T): Promise<T | null>{

    return this.axios.get(url).then( response => {
      if (response.status !== 200){
        throw new Error(response.data)
      }
      console.log(`✅ Fetched ${resource}`)
      return mapper(response.data)

    }).catch(reason => {
      console.error(`❗ Failed to fetch ${resource} due to: ${reason}`)
      return null
    })
  }


  async userBudgets(epoch: number): Promise<UserBudget[] | null>{
    return this._get_array(`/rewards/budgets/epoch/${epoch}`, "users' budgets", UserBudgetImpl, (data: any) => data.budgets)
  }

  async allocations(epoch: number): Promise<AllocationRecord[] | null> {
    return this._get_array(`/allocations/epoch/${epoch}`, "users' allocations", AllocationImpl, (data: any) => data.allocations)
  }

  async rewards(epoch: number): Promise<Reward[] | null>{
      return this._get_array(`/rewards/proposals/epoch/${epoch}`, "proposals rewards", RewardImpl, (data: any) => data.rewards)
  }

  async epochInfo(epoch: number): Promise<EpochInfo | null> {
    return this._get(`/epochs/info/${epoch}`, "epoch info", EpochInfoImpl)
  }


 }
