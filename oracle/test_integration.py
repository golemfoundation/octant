#!/usr/bin/env python3
import subprocess
from time import sleep

from eth_utils import from_wei

from config import settings
from contracts import Oracle, Epochs

print(f"Starting hardhat node...")
node_process = subprocess.Popen(['yarn', 'start-node'], cwd=settings.ROOT_DIR)
sleep(10)
print(f"Starting beaconchain api mock server...")
beacon_api_mock_process = subprocess.Popen(['python3', 'api_mock/mock.py'],
                                           cwd=settings.PROJECT_DIR)
sleep(1)

print(f"Starting oracle watcher...")
oracle_watcher_process = subprocess.Popen(['python3', 'app.py'], cwd=settings.PROJECT_DIR)

epochs_contract = Epochs()
beacon_contract = Oracle(settings.BEACONCHAIN_ORACLE_CONTRACT_DEF,
                         settings.BEACONCHAIN_ORACLE_CONTRACT_ADDRESS)
execution_layer_contract = Oracle(settings.EXECUTION_LAYER_ORACLE_CONTRACT_DEF,
                                  settings.EXECUTION_LAYER_ORACLE_CONTRACT_ADDRESS)

try:
    print("Checking beaconchain balance in epoch 0 and 1")
    if beacon_contract.get_balance(0) != 0:
        raise Exception("Beaconchain balance is already set in epoch 0")
    if beacon_contract.get_balance(1) != 0:
        raise Exception("Beaconchain balance is already set in epoch 1")

    print("Checking execution layer balance in epoch 0 and 1")
    if execution_layer_contract.get_balance(0) != 0:
        raise Exception("Beaconchain balance is already set in epoch 0")
    if execution_layer_contract.get_balance(1) != 0:
        raise Exception("Beaconchain balance is already set in epoch 1")

    print("Forwarding an epoch")
    epoch_duration = epochs_contract.epoch_duration()
    subprocess.Popen(
        ['npx', 'hardhat', 'increase-time', '--time', str(epoch_duration), '--network', 'localhost'],
        cwd=settings.ROOT_DIR)

    print("Waiting for oracle watcher to update oracle balance")
    sleep(45)

    print("Checking beaconchain balance in epoch 0 and 1 one more time")
    if beacon_contract.get_balance(0) != 0:
        raise Exception("Beaconchain balance shouldn't be updated in epoch 0")
    beacon_balance_epoch1 = from_wei(beacon_contract.get_balance(1), "ether")
    expected_beacon_balance_epoch1 = 169.786068793
    if float(beacon_balance_epoch1) != expected_beacon_balance_epoch1:
        raise Exception(
            f"Balance in epoch 1 incorrect. Expected: {expected_beacon_balance_epoch1}, "
            f"given: {beacon_balance_epoch1}")
    print("Beaconchain balance in epoch 1 successfully updated")

    print("Checking execution layer balance in epoch 0 and 1 one more time")
    if execution_layer_contract.get_balance(0) != 0:
        raise Exception("Execution layer balance shouldn't be updated in epoch 0")
    execution_layer_balance_epoch1 = from_wei(execution_layer_contract.get_balance(1), "ether")
    expected_execution_layer_balance_epoch1 = 2.225924353734758688
    if float(execution_layer_balance_epoch1) != expected_execution_layer_balance_epoch1:
        raise Exception(
            f"Balance in epoch 1 incorrect. Expected: {expected_execution_layer_balance_epoch1}, "
            f"given: {execution_layer_balance_epoch1}")
    print("Execution layer balance in epoch 1 successfully updated")

except Exception as e:
    print("Tests failed")
    print(str(e))

finally:
    print("Done")
    node_process.terminate()
    beacon_api_mock_process.terminate()
    oracle_watcher_process.terminate()
