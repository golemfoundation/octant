import csv
import requests
from eth_utils import to_checksum_address

# Epoch to use
epoch_number = 6
# Multiplier for ETH allocations / Patron donations:
eth_donation_amount_multiplier = 2000
# Dictionary to store address -> totalPoints mapping
address_points = {}
# Dictionary to store address -> total allocation amount (in WEI)
address_allocations = {}
# Dictionary to store address -> total allocation amount (in ETH)
address_allocations_eth = {}
# Dictionary to store final total points
final_points = {}

WEI_TO_ETH = 1_000_000_000_000_000_000  # 1 ETH = 1,000,000,000,000,000,000 WEI
MAX_ETH = 0.1  # Maximum ETH cap

# Get list of patrons for epoch
patrons_response = requests.get(f"https://backend.mainnet.octant.app/flask/user/patrons/{epoch_number}")
patrons = []
if patrons_response.status_code == 200:
    patrons = [to_checksum_address(addr) for addr in patrons_response.json().get('patrons', [])]

# Read the CSV file and convert addresses to checksum format
with open('leaderboard-guild.csv', mode='r') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in list(reader):
        original_address = row['address']
        checksum_address = to_checksum_address(original_address)
        total_points = int(row['totalPoints'])  # Convert points to integer

        # Print if totalPoints is 0
        if total_points == 0:
            print(f"Warning: Address {checksum_address} has 0 total points")

        # Store in dictionary
        address_points[checksum_address] = total_points

        url = f"https://backend.mainnet.octant.app/flask/allocations/user/{checksum_address}/epoch/{epoch_number}"
        response = requests.get(url)

        # Initialize total allocation amount for this address
        total_allocation = 0

        if response.status_code == 200:
            allocations = response.json().get('allocations', [])
            if not allocations and checksum_address in patrons:
                # This is a patron with no allocations, get their budget
                budget_url = f"https://backend.mainnet.octant.app/flask/rewards/budget/{checksum_address}/epoch/{epoch_number}"
                budget_response = requests.get(budget_url)
                if budget_response.status_code == 200:
                    total_allocation = int(budget_response.json().get('budget', 0))
                    # print(f"Donor found: {checksum_address} with budget: {total_allocation / WEI_TO_ETH:.4f} ETH")
            else:
                # Sum up all allocation amounts for this address
                for allocation in allocations:
                    amount = int(allocation.get('amount', 0))  # amount in WEI
                    total_allocation += amount

        # Store total allocation for this address (in WEI)
        address_allocations[checksum_address] = total_allocation
        # Store total allocation in ETH (capped at 0.1 ETH)
        eth_amount = total_allocation / WEI_TO_ETH
        capped_eth_amount = min(eth_amount, MAX_ETH)

        # Print if amount was capped
        if eth_amount > MAX_ETH:
            print(f"Notice: Address {checksum_address} allocation capped from {eth_amount:.4f} ETH to {MAX_ETH} ETH")

        address_allocations_eth[checksum_address] = capped_eth_amount

        # Calculate final points
        # total = total_points + (eth_value * eth_donation_amount_multiplier) if total_points > 0 and eth_value > 0
        # total = 0 otherwise
        if total_points > 0 and capped_eth_amount > 0:
            final_total = total_points + (capped_eth_amount * eth_donation_amount_multiplier)
        else:
            final_total = 0

        final_points[checksum_address] = final_total

        print(f"Address: {checksum_address}, Weight: {final_total:.4f}, Points: {total_points}, Eth: {eth_amount:.4f}, Patron: {checksum_address in patrons}")

# Write results to new CSV file (only non-zero weights)
output_file = 'raffle_weights_output.csv'
with open(output_file, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    # Write header
    writer.writerow(['wallet address', 'weight'])
    # Write data (only non-zero weights)
    for address, weight in final_points.items():
        if weight > 0:  # Only write if weight is non-zero
            writer.writerow([address, weight])

print(f"\nResults have been written to {output_file}")
