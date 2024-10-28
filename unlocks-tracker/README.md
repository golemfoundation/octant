# Steps to do the analysis
1. Clone the repository
2. Place the file `addresses.txt` in the `resources/input` folder.
4. Run the following commands
```bash
poetry install
poetry shell
poetry run python run.py
```
5. Read the analysis from the `resources/output` folder.

# Algorithm Overview
This algorithm scans Etherscan and Subgraph to retrieve all transfers made by organizations and users involved in the Octant promotional event. It processes these transfers to identify addresses that should be removed from the allowlist by validating the coverage of transferred funds by appropriate locks and checking whether unlocks have exceeded the locks.

## Steps:
1. **Retrieve Golem and Partner Transfers:**
The algorithm retrieves all outgoing transfers from the Golem Foundation and partner organizations. Using a predefined list of addresses, it fetches transfers via the Etherscan and Subgraph APIs and processes them for further validation.

2. **Accumulate and Filter Transfers:**
It accumulates all outgoing transfers from both Golem and partner organizations, filtering out any redundant or unnecessary transfers.
These transfers are saved for reference and further processing.

3. **Cross-Check with Original Allow List:**
The processed transfers are checked against the original allowlist to identify any discrepancies. Addresses found in the transfers but not on the allowlist (and vice versa) are flagged for review.

4. **Lock Validation and Removal Decisions:**
For each address in the outgoing transfers, the algorithm retrieves associated locks (funds restricted for a specific period) and validates whether the locked funds sufficiently cover the transferred amount.
If the locks do not cover the total amount transferred, the address is flagged for removal from the allowlist with the reason: "Transfer not covered by locks."

5. **Unlock Validation:**
If the locks cover the transfers, the algorithm checks for unlocks (released locked funds). If unlocks exceed locks or donations related to the locks have decreased, the address is flagged for removal with the reason: "Unlocks exceed locks."

6. **Special Case for KARLAGODETH_ADDRESS:**
When processing transfers from the KARLAGODETH_ADDRESS, the algorithm applies a special error margin of 100 units when validating whether the locked funds cover the transferred amount. This allows for slight discrepancies in lock coverage for transfers from this specific address.

7. **Process Organization-Specific Transfers:**
The algorithm accumulates and validates transfers from partner organizations, ensuring that their locked funds cover the total transferred amount.
For each organization, the accepted amount of locked funds is decreased by the total amount transferred to other addresses. If the locks no longer cover the organization’s total transfers after this adjustment, the organization’s address is flagged for removal from the allowlist.
If the locks do not cover the adjusted transfers, the organization’s address is flagged for removal from the allowlist with the reason: "Organization transfer not covered by locks."

8. Final Output:
After processing, the algorithm compiles a list of addresses (both individual users and organizations) that should be removed from the allowlist. Detailed reasons for removal are provided for each flagged address.
