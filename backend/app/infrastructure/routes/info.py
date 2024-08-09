from flask import current_app as app
from flask import render_template, make_response, send_from_directory
from flask_restx import Resource, Namespace, fields

from app.legacy.controllers import info
from app.extensions import api
from app.infrastructure import OctantResource

ns = Namespace("info", description="Information about Octant's backend API")
api.add_namespace(ns)

smart_contract_model = api.model(
    "SmartContract",
    {
        "name": fields.String(description="The smart contract name."),
        "address": fields.String(description="The smart contract address."),
    },
)

chain_info_model = api.model(
    "ChainInfo",
    {
        "chainName": fields.String(description="The chain name."),
        "chainId": fields.String(description="The chain id."),
        "smartContracts": fields.List(
            fields.Nested(smart_contract_model),
            description="The smart contracts used by Octant in given network.",
        ),
    },
)

app_version_model = api.model(
    "AppVersion",
    {
        "id": fields.String(description="deployment identifier"),
        "env": fields.String(description="deployment environment"),
        "chain": fields.String(description="blockchain name"),
    },
)

healthcheck_model = api.model(
    "Healthcheck",
    {
        "blockchain": fields.String(
            description="UP if blockchain RPC is responsive, DOWN otherwise"
        ),
        "db": fields.String(description="UP if db is responsive, DOWN otherwise"),
        "subgraph": fields.String(
            description="UP if subgraph is responsive, DOWN otherwise"
        ),
    },
)

sync_status_model = api.model(
    "SyncStatus",
    {
        "blockchainEpoch": fields.Integer(
            required=True, description="Current Epoch number per blockchain state"
        ),
        "indexedEpoch": fields.Integer(
            required=True, description="Current Epoch number according to indexer"
        ),
        "blockchainHeight": fields.Integer(
            required=True, description="Current block/slot number per blockchain"
        ),
        "indexedHeight": fields.Integer(
            required=True, description="Current block/slot number according to indexer"
        ),
        "pendingSnapshot": fields.String(
            required=True,
            description="State of pending epoch snapshot (not_applicable, error, in_progress, done)",
        ),
        "finalizedSnapshot": fields.String(
            required=True,
            description="State of finalized epoch snapshot (not_applicable, error, too_early, in_progress, done)",
        ),
    },
)


@ns.route("/sync-status")
@ns.doc(description="Returns synchronization status for indexer and database")
class IndexedEpoch(OctantResource):
    @ns.marshal_with(sync_status_model)
    @ns.response(200, "All services are up and syncing")
    @ns.response(500, "Some services are down, sync status unknown")
    def get(self):
        return info.sync_status()


@ns.route("/websockets-api")
@ns.doc(description="The documentation for websockets can be found under this path")
class WebsocketsDocs(OctantResource):
    def get(self):
        headers = {"Content-Type": "text/html"}
        return make_response(render_template("websockets-api-docs.html"), 200, headers)


@ns.route("/websockets-api.yaml")
class WebsocketsDocsYaml(OctantResource):
    def get(self):
        docs_folder = f"{app.config['PROJECT_ROOT']}/docs"
        return send_from_directory(
            docs_folder, "websockets-api.yaml", mimetype="text/plain"
        )


@ns.route("/chain-info")
class ChainInfo(OctantResource):
    @ns.doc(description="Info about the blockchain network and smart contracts")
    @api.marshal_with(chain_info_model)
    def get(self):
        app.logger.debug("Getting chain info")
        chain_info = info.get_blockchain_info()
        return chain_info.to_dict()


@ns.route("/version")
class Version(OctantResource):
    @ns.doc(description="Application deployment information")
    @api.marshal_with(app_version_model)
    def get(self):
        return {
            "id": app.config["DEPLOYMENT_ID"],
            "env": app.config["ENV"],
            "chain": app.config["CHAIN_NAME"],
        }


@ns.response(200, "All services are healthy")
@ns.response(500, "At least one service is down")
@ns.route("/healthcheck")
class Healthcheck(Resource):
    @ns.doc(description="Application healthcheck endpoint")
    @api.marshal_with(healthcheck_model)
    def get(self):
        return info.healthcheck()
