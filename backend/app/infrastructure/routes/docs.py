from flask import render_template, make_response, send_from_directory
from flask_restx import Resource, Namespace, fields

from app import settings
from app.controllers import docs
from app.extensions import api

ns = Namespace("docs", description="Octant websockets documentation")
api.add_namespace(ns)

smart_contract_model = api.model('SmartContract', {
    'name': fields.String(description='The smart contract name.'),
    'address': fields.String(description='The smart contract address.'),
})

chain_info_model = api.model('ChainInfo', {
    'chainName': fields.String(description='The chain name.'),
    'chainId': fields.String(description='The chain id.'),
    'smartContracts': fields.List(fields.Nested(smart_contract_model),
                                  description='The smart contracts used by Octant in given network.')
})


@ns.route("/websockets-api")
@ns.doc(description="The documentation for websockets can be found under this path")
class WebsocketsDocs(Resource):
    def get(self):
        headers = {"Content-Type": "text/html"}
        return make_response(render_template("websockets-api-docs.html"), 200, headers)


@ns.route("/websockets-api.yaml")
class WebsocketsDocsYaml(Resource):
    def get(self):
        docs_folder = f"{settings.config.PROJECT_ROOT}/docs"
        return send_from_directory(
            docs_folder, "websockets-api.yaml", mimetype="text/plain"
        )


@ns.route("/chain-info")
class ChainInfo(Resource):
    @ns.doc(description="Info about the blockchain network and smart contracts")
    @api.marshal_with(chain_info_model)
    def get(self):
        chain_info = docs.get_blockchain_info()
        return chain_info.to_dict()
