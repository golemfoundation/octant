# Octant backend server

## Running

### Docker
```
docker-compose up --build
```

### Local

### Prerequisites

This project uses Poetry, you can install it [here](https://python-poetry.org/docs/#installation).

### Setup

Before running shell commands, copy `.env.template` as `.env` and adjust variables. If you want to run server in production setup, set `OCTANT_ENV=production`

If you want to run locally, modify .env to `EPOCH_0_END` and `EPOCH_1_END` to low values, to make sure that backend fetches epoch number from the contract.

Then run the following commands to bootstrap your environment

#### Development
```bash
poetry install
poetry shell
```

#### Production
```bash
poetry install --no-interaction --no-ansi -v --with prod --without dev
poetry shell
```

Run the following commands to create your app's
database tables and perform the initial migration

```bash
flask db upgrade
```

Start the server

#### Development
```bash
python3 startup.py
```

#### Production
```bash
gunicorn -c gunicorn_config.py startup:app
```

## Test
```bash
pytest
```

## Lint
```bash
black .
```

## Docs
First, Run the server as described above. Then, open a web browser and navigate to the following URL to view documentation:

### HTTP endpoints
http://localhost:5000/

### Websockets
http://localhost:5000/docs/websockets-api

### Blockchain info
http://localhost:5000/docs/chain-info


## Env variables

### Required

- `OCTANT_BACKEND_SECRET_KEY` - A secret key which used to sign session cookies for protection against cookie data tampering, required by Flask
- `ETH_RPC_PROVIDER_URL` - RPC provider to Ethereum node client
- `SUBGRAPH_ENDPOINT` - Endpoint to subgraph graphQL containing indexed Octant contracts
- `OCTANT_ENV` - production | development | test
- `EPOCH_0_END` - Timestamp in second when epoch 0 will finish
- `EPOCH_1_END` - Timestamp in second when epoch 1 will finish
- `CHAIN_ID` - Id of the blockchain network. Eg. 1 for Mainnet or 11155111 for Sepolia
- `CHAIN_NAME` - Name of the blockchain network corresponding to the CHAIN_ID.
- `GNT_CONTRACT_ADDRESS, GLM_CONTRACT_ADDRESS, EPOCHS_CONTRACT_ADDRESS, AUTH_CONTRACT_ADDRESS, DEPOSITS_CONTRACT_ADDRESS, PROPOSALS_CONTRACT_ADDRESS, WITHDRAWALS_TARGET_CONTRACT_ADDRESS, VAULT_CONTRACT_ADDRESS` - Octant smart contract addresses



### Optional
- `DB_URI` - Only used in production setup. Sets the postgres URI, eg. postgresql://user:password@localhost/octant
- `SCHEDULER_ENABLED` - The app can run background tasks which are handled by [Flask-APScheduler](https://github.com/viniciuschiele/flask-apscheduler). Set this env var to `True` to enable it.
- `SCHEDULER_API_ENABLED` - Flask-APScheduler comes with a [build-in API](https://viniciuschiele.github.io/flask-apscheduler/rst/api.html). Enable it by setting this var to `True`
- `TESTNET_MULTISIG_PRIVATE_KEY` - Multisig private key, which is allowed to send transactions to `Vault.sol`. Needed for automatic withdrawals confirmations for test purposes.
- `VAULT_CONFIRM_WITHDRAWALS_ENABLED` - Confirming withdrawals requires sending a merkle root to `Vault.sol`. For test purposes you can enable sending this value automatically by setting this var to `True`. In order for it to work scheduler must be enabled as well


- `GLM_CLAIM_ENABLED` - Set it to `True` if you want to enable GLM claiming feature. It requires also to enable scheduler.
- `GLM_SENDER_ADDRESS` - Address, from which GLMs will be sent.
- `GLM_SENDER_PRIVATE_KEY` - Private key corresponding to `GLM_SENDER_ADDRESS`
- `GLM_SENDER_NONCE` - Current nonce of the `GLM_SENDER_ADDRESS`
