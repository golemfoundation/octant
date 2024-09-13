/* eslint-disable no-console */
import { Context } from "./data/context"

export type VerificationResult = { message: string, result: boolean }
type VerifyFunc = (context: Context) => VerificationResult;

export interface Verification {
  readonly name: string
  verify: VerifyFunc
}

export class Runner {

  verifications: Verification[]

  constructor() {
    this.verifications = []
  }

  register(verification: Verification): void {
    this.verifications.push(verification)
  }

  async run(context: Context): Promise<number> {
    console.log("Starting verifications ... ")

    const results = await Promise.all(this.verifications.map((v: Verification) => {

      const task = new Promise<[string, VerificationResult]>((resolve, _) => {
        console.log(`Verification ${v.name} started`)
        const result = v.verify(context)

        if (result.result) {
          console.log(`Verification ${v.name} succeeded`)
        }

        resolve([v.name, result])
      })

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Task ${v.name} timed out`))
        }, 15_000)
      })

      return Promise.race<[string, VerificationResult] | never>([task, timeout])

    }))


    console.log("Run all verifications")

    const ok = results.filter(([_, result]) => result.result)
    const failures = results.filter(([_, result]) => !result.result)

    ok.forEach(([name, result]) => {
      console.log(`✅ ${name}: ${result.message}`)
    })

    failures.forEach(([name, result]) => {
      console.log(`❗ ${name}: ${result.message}`)
    })

    console.log(`Verifications have finished with ${ok.length} successes and ${failures.length} failures`)

    return failures.length
  }

} 
