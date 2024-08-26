# Octant backend server

### Prerequisites

This project uses Poetry, you can install it [here](https://python-poetry.org/docs/#installation).

### Setup

Before running shell commands, copy `.env.template` as `.env` and adjust variables. If you want to run server in production setup, set `OCTANT_ENV=production`

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

_Note: if you are trying to run local environment attached to psql instance,
instead of sqlite; please run the following command, so that psql connectors are available
and also set `DB_URI` environment accordingly e.g. `DB_URI="postgresql://user:password@localhost:5433/octant"`_

```bash
poetry install --with prod
```

Start the server

```bash
python3 startup.py
```

## Test

To run unit tests, do

```bash
pytest
```

To run API tests, you need to first setup the env and next run the tests.

```bash
cd ..
yarn apitest:up # in a first console
yarn apitest:run # in a second console
```

When backend code is changed, just re-run `yarn apitest:run`.
To run just one test, use standard pytest naming:
```
yarn apitest:run tests/legacy/test_api_snapshot.py::test_pending_snapshot
```

To stop the env, run `yarn apitest:down`

*NOTICE:* At least on Linux, anvil sometimes stops working in docker environment. This leads to multideployer timing out its startup. Restart of host machine helps.

## Lint

```bash
black .
flake8 app
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
- `OCTANT_ENV` - production | development | compose | test
- `CHAIN_ID` - Id of the blockchain network. Eg. 1 for Mainnet or 11155111 for Sepolia
- `CHAIN_NAME` - Name of the blockchain network corresponding to the CHAIN_ID.
- `GLM_CONTRACT_ADDRESS, EPOCHS_CONTRACT_ADDRESS, AUTH_CONTRACT_ADDRESS, DEPOSITS_CONTRACT_ADDRESS, PROPOSALS_CONTRACT_ADDRESS, WITHDRAWALS_TARGET_CONTRACT_ADDRESS, VAULT_CONTRACT_ADDRESS` - Octant smart contract addresses

### Optional

- `DB_URI` - Only used in production setup. Sets the postgres URI, eg. postgresql://user:password@localhost/octant

- `SQLALCHEMY_CONNECTION_POOL_SIZE` - Size of pool of connections to db, that is always maintained. More on connection pools can be found [here](https://docs.sqlalchemy.org/en/20/core/pooling.html#sqlalchemy.pool.QueuePool.params.pool_size).
- `SQLALCHEMY_CONNECTION_POOL_MAX_OVERFLOW` - Max number of additional connections, that can be established once pool exhausts during spikes. More on connection pools can be found [here](https://docs.sqlalchemy.org/en/20/core/pooling.html#sqlalchemy.pool.QueuePool.params.max_overflow).

- `SCHEDULER_ENABLED` - The app can run background tasks which are handled by [Flask-APScheduler](https://github.com/viniciuschiele/flask-apscheduler). Set this env var to `True` to enable it.
- `SCHEDULER_API_ENABLED` - Flask-APScheduler comes with a [build-in API](https://viniciuschiele.github.io/flask-apscheduler/rst/api.html). Enable it by setting this var to `True`
- `TESTNET_MULTISIG_PRIVATE_KEY` - Multisig private key, which is allowed to send transactions to `Vault.sol`. Needed for automatic withdrawals confirmations for test purposes.
- `VAULT_CONFIRM_WITHDRAWALS_ENABLED` - Confirming withdrawals requires sending a merkle root to `Vault.sol`. For test purposes you can enable sending this value automatically by setting this var to `True`. In order for it to work scheduler must be enabled as well

- `GLM_CLAIM_ENABLED` - Set it to `True` if you want to enable GLM claiming feature. It requires also to enable scheduler.
- `GLM_SENDER_ADDRESS` - Address, from which GLMs will be sent.
- `GLM_SENDER_PRIVATE_KEY` - Private key corresponding to `GLM_SENDER_ADDRESS`
- `GLM_SENDER_NONCE` - Current nonce of the `GLM_SENDER_ADDRESS`
- `MAINNET_PROPOSAL_CIDS` - List of CIDs per each epoch, must be updated after new epoch data is added to the `octant-funding-projects` repo
