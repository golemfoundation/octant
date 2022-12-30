import logging
from time import sleep

import beacon_chain
import execution_layer
from epochs import get_previous_epoch
from web3_service import get_nonce, get_latest_block

logging.basicConfig(format='%(asctime)s - %(levelname)s - %(message)s', level=logging.INFO)


def run_oracle_watcher():
    while True:
        logging.info('Running oracle watcher')
        previous_epoch = get_previous_epoch()
        block_number = get_latest_block()
        nonce = get_nonce()

        try:
            if beacon_chain.should_update_oracle(previous_epoch):
                logging.info(f'Updating beacon chain oracle at epoch: {previous_epoch}')
                tx_hash = beacon_chain.update_oracle(previous_epoch, block_number, nonce)
                nonce += nonce
                logging.info(f"Transaction updating beacon chain oracle sent: {tx_hash.hex()}")

            if execution_layer.should_update_oracle(previous_epoch):
                logging.info(f'Updating execution layer oracle at epoch: {previous_epoch}')
                tx_hash = execution_layer.update_oracle(previous_epoch, block_number, nonce)
                logging.info(f"Transaction updating execution layer oracle sent: {tx_hash.hex()}")
        except Exception as e:
            if ("nonce too low" or "nonce too high") in str(e).lower():
                continue
            logging.error(f"Cannot update the oracle: {e}")

        sleep(15)


if __name__ == "__main__":
    logging.info("Starting the oracle watcher...")
    run_oracle_watcher()
