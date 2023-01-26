import { newMockEvent } from 'matchstick-as';
import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from 'matchstick-as'
import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
import { Deposited } from "../generated/schema"
import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent
} from '../generated/Deposits/Deposits';
import { handleDeposited, handleWithdrawn } from '../src/deposits';

let DEPOSIT_ENTITY_TYPE = 'Deposited';
let WITHDRAWAL_ENTITY_TYPE = 'Withdrawn';

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let amount = BigInt.fromI32(234)
    let when = BigInt.fromI32(234)
    let depositor = Address.fromString(
      "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
    )
    let depositedEvent = createDepositedEvent(amount, when, depositor)
    let withdrawnEvent = createWithdrawnEvent(amount, when, depositor)
    handleDeposited(depositedEvent)
    handleWithdrawn(withdrawnEvent)
  })

  afterAll(() => {
    clearStore()
  })

  test("Deposited created and stored", () => {
    assert.entityCount(DEPOSIT_ENTITY_TYPE, 1)
    assert.fieldEquals(DEPOSIT_ENTITY_TYPE, "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000", "amount", "234")
    assert.fieldEquals(DEPOSIT_ENTITY_TYPE, "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000", "depositor", "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199".toLowerCase())
    assert.fieldEquals(DEPOSIT_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'blockTimestamp', '1');
    assert.fieldEquals(DEPOSIT_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'blockNumber', '1');
    assert.fieldEquals(DEPOSIT_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'transactionHash', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a');
  })

  test("Withdrawn created and stored", () => {
    assert.entityCount(WITHDRAWAL_ENTITY_TYPE, 1)
    assert.fieldEquals(WITHDRAWAL_ENTITY_TYPE, "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000", "amount", "234")
    assert.fieldEquals(WITHDRAWAL_ENTITY_TYPE, "0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000", "depositor", "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199".toLowerCase())
    assert.fieldEquals(WITHDRAWAL_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'blockTimestamp', '1');
    assert.fieldEquals(WITHDRAWAL_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'blockNumber', '1');
    assert.fieldEquals(WITHDRAWAL_ENTITY_TYPE, '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000', 'transactionHash', '0xa16081f360e3847006db660bae1c6d1b2e17ec2a');
  })
})

export function createDepositedEvent(
  amount: BigInt,
  when: BigInt,
  depositor: Address
): DepositedEvent {
  let depositedEvent = changetype<DepositedEvent>(newMockEvent())

  depositedEvent.parameters = []

  depositedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  depositedEvent.parameters.push(
    new ethereum.EventParam("depositor", ethereum.Value.fromAddress(depositor))
  )

  return depositedEvent
}

export function createWithdrawnEvent(
  amount: BigInt,
  when: BigInt,
  depositor: Address
): WithdrawnEvent {
  let withdrawnEvent = changetype<WithdrawnEvent>(newMockEvent())

  withdrawnEvent.parameters = []

  withdrawnEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  withdrawnEvent.parameters.push(
    new ethereum.EventParam("when", ethereum.Value.fromUnsignedBigInt(when))
  )
  withdrawnEvent.parameters.push(
    new ethereum.EventParam("depositor", ethereum.Value.fromAddress(depositor))
  )

  return withdrawnEvent
}
