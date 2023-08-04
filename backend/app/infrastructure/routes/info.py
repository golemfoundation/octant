from flask import current_app as app
from flask import render_template, make_response, send_from_directory
from flask_restx import Resource, Namespace, fields

from app import settings
from app.controllers import info
from app.infrastructure import OctantResource
from app.extensions import api
from app.settings import config

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


if config.EPOCH_2_FEATURES_ENABLED:

    @ns.route("/websockets-api")
    @ns.doc(description="The documentation for websockets can be found under this path")
    class WebsocketsDocs(OctantResource):
        def get(self):
            headers = {"Content-Type": "text/html"}
            return make_response(
                render_template("websockets-api-docs.html"), 200, headers
            )

    @ns.route("/websockets-api.yaml")
    class WebsocketsDocsYaml(OctantResource):
        def get(self):
            docs_folder = f"{settings.config.PROJECT_ROOT}/docs"
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
            "id": config.DEPLOYMENT_ID,
            "env": config.ENV,
            "chain": config.CHAIN_NAME,
        }


@ns.response(200, "All services are healthy")
@ns.response(500, "At least one service is down")
@ns.route("/healthcheck")
class Healthcheck(Resource):
    @ns.doc(description="Application healthcheck endpoint")
    @api.marshal_with(healthcheck_model)
    def get(self):
        return info.healthcheck()
