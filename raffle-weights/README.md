This script is required to create an input file for running Octant Raffle / Sweepstakes with weights for each of the users.

In order to run it `leaderboard-guild.csv` is required with following columns: `userId,roleIds,totalPoints,oldestRoleDate,address`.

# How to run it?
1. Enter `raffle-weights` folder.
2. Put `leaderboard_guild.csv` file in this directory.
3. Create empty `raffle_weights_output.csv` in this directory.
4. Open terminal.
5. Ensure python in installed on your machine. If not, install it.
6. Verify python is installed by running command `python3 --version`.
7. Run `python3 -m venv .venv`.
8. Run `source .venv/bin/activate`.
9. Install dependencies by running `pip install csv && pip install requests && pip install eth_utils && pip install eth-hash[pycryptodome]`.
10. Run `python3 calc_weights.py`.
11. Wait for the script to finish (last line of the output should be "Results have been written to raffle_weights_output.csv").
12. `raffle_weights_output.csv` is now filled with input data for the Raffle.
