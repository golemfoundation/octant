from flask import render_template, make_response, send_from_directory
from flask_restx import Resource, Namespace

from app import settings
from app.extensions import api

ns = Namespace("docs", description="Octant websockets documentation")
api.add_namespace(ns)


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
