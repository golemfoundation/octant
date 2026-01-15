#!/usr/bin/env python3
"""
Calculate E11 staking portion reserved for v2.

This script reads the stored staking matched portion from the finalized snapshot
and optionally verifies it by recalculating from the pending snapshot data.

Usage:
    python scripts/calculate_e11_staking_matched.py --epoch 11
"""

import asyncio
import argparse
from decimal import Decimal
from sqlalchemy import select

from app.infrastructure.database.connection import get_session
from app.infrastructure.database.models import (
    FinalizedEpochSnapshot,
    PendingEpochSnapshot,
)
from v2.matched_rewards.services import calculate_staking_matched_rewards


async def main(epoch_number: int = 11):
    """
    Calculate and display the staking matched portion reserved for v2.

    Args:
        epoch_number: The epoch number to calculate for (default: 11)
    """
    async with get_session() as session:
        # Get finalized and pending snapshots
        result = await session.execute(
            select(FinalizedEpochSnapshot, PendingEpochSnapshot)
            .join(
                PendingEpochSnapshot,
                PendingEpochSnapshot.epoch == FinalizedEpochSnapshot.epoch,
            )
            .filter(FinalizedEpochSnapshot.epoch == epoch_number)
        )
        row = result.first()

        if row is None:
            print(f"Error: No finalized snapshot found for epoch {epoch_number}")
            return

        finalized, pending = row

        # Get stored value
        stored_value = int(finalized.staking_matched_reserved_for_v2)

        # Verify by recalculating
        calculated_value = calculate_staking_matched_rewards(
            staking_proceeds=int(pending.eth_proceeds),
            locked_ratio=Decimal(pending.locked_ratio),
        )

        # Convert to ETH
        stored_eth = Decimal(stored_value) / Decimal(10**18)
        calculated_eth = Decimal(calculated_value) / Decimal(10**18)
        patron_rewards_eth = Decimal(finalized.patrons_rewards) / Decimal(10**18)
        staking_proceeds_eth = Decimal(pending.eth_proceeds) / Decimal(10**18)

        # Display results
        print("=" * 80)
        print(f"Epoch {epoch_number} Staking Matched Rewards Calculation")
        print("=" * 80)
        print(f"\nStored Value:      {stored_eth:.6f} ETH ({stored_value} wei)")
        print(f"Calculated Value:  {calculated_eth:.6f} ETH ({calculated_value} wei)")
        print(f"Match:             {'✓ YES' if stored_value == calculated_value else '✗ NO - MISMATCH!'}")

        if stored_value != calculated_value:
            print(f"\nWARNING: Stored value does not match calculation!")
            print(f"Difference: {abs(stored_value - calculated_value)} wei")

        print(f"\nPatron Rewards:    {patron_rewards_eth:.6f} ETH ({finalized.patrons_rewards} wei)")
        print(f"Locked Ratio:      {Decimal(pending.locked_ratio):.4f}")
        print(f"Staking Proceeds:  {staking_proceeds_eth:.6f} ETH")

        # Calculate formula used
        locked_ratio = Decimal(pending.locked_ratio)
        ire_percent = Decimal("0.35")
        tr_percent = Decimal("0.7")
        matched_rewards_percent = Decimal("0.35")

        print(f"\nFormula Used:")
        if locked_ratio < ire_percent:
            print(f"  locked_ratio ({locked_ratio:.4f}) < IRE ({ire_percent})")
            print(f"  Formula: {matched_rewards_percent} * staking_proceeds")
            print(f"  Calculation: {matched_rewards_percent} * {staking_proceeds_eth:.2f} ETH = {stored_eth:.2f} ETH")
        elif ire_percent <= locked_ratio < tr_percent:
            print(f"  IRE ({ire_percent}) <= locked_ratio ({locked_ratio:.4f}) < TR ({tr_percent})")
            print(f"  Formula: ({tr_percent} - {locked_ratio:.4f}) * staking_proceeds")
            print(f"  Calculation: ({tr_percent} - {locked_ratio:.4f}) * {staking_proceeds_eth:.2f} ETH = {stored_eth:.2f} ETH")
        else:
            print(f"  locked_ratio ({locked_ratio:.4f}) >= TR ({tr_percent})")
            print(f"  Formula: 0 (no staking contribution)")

        print("\n" + "=" * 80)
        print("Breakdown:")
        print("=" * 80)
        print(f"  Staking portion → Multisig (reserved for v2): {stored_eth:.6f} ETH")
        print(f"  Patron rewards → QF distribution:              {patron_rewards_eth:.6f} ETH")

        print("\n" + "=" * 80)
        print("Next Steps:")
        print("=" * 80)
        print(f"1. Review the amount above")
        print(f"2. Use Safe interface to call WithdrawalsTarget.withdraw({stored_value})")
        print(f"3. Verify transaction on Etherscan")
        print(f"4. Document transfer in docs/e11-matching-fund-v2.md")

        print("\n" + "=" * 80)
        print("Contract Information:")
        print("=" * 80)
        print("WithdrawalsTarget address: 0xF78c8bDD42Bce1995D0ded00b7fa2ed34457DAdD (mainnet)")
        print("Function: withdraw(uint256 amount)")
        print(f"Amount parameter: {stored_value}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Calculate staking matched portion reserved for v2"
    )
    parser.add_argument(
        "--epoch",
        type=int,
        default=11,
        help="Epoch number to calculate for (default: 11)",
    )
    args = parser.parse_args()

    try:
        asyncio.run(main(args.epoch))
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
