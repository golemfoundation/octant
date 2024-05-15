import time
import json
from app.infrastructure.external_api.gc_passport.score import (
    issue_address_for_scoring,
    fetch_score,
)

pzelazko_eth_addr = "0x8d8Da6d2cB2c50d17E069E37F654c0B7D6D83bb6"

# Optionally: get user signing message to verify user's consent to check his/hers passport score.
# It is not required in our use-case, since we do check the siganture at delegation.
# print(signing_message())


scoring = issue_address_for_scoring(pzelazko_eth_addr)
print(f"Retreived scoring: {scoring}")

while scoring["status"] != "DONE":
    print("Waiting for score")
    time.sleep(5)
    scoring = fetch_score(pzelazko_eth_addr)

print(f"Users score: {scoring['score']}")
print(f"{json.dumps(scoring)}")
