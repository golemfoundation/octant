import json
import os
import subprocess

from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qsl, urlparse
from http.server import HTTPServer
from typing import Dict

subgraph_admin_url = os.environ["SUBGRAPH_ADMIN_URL"]
subgraph_query_url = os.environ["SUBGRAPH_QUERY_URL"]
rpc_url = os.environ["RPC_URL"]
ipfs_url = os.environ["IPFS_URL"]

# cache for already deployed environments
# key is subgraph name
# value is a dict
deployments = {}


def make_env(defs):
    os.environ.update(defs)
    return os.environ


def get_addresses(lines):
    def is_address(line):
        return "CONTRACT_ADDRESS=" in line

    envs = list(filter(is_address, lines))
    return {var.split("=")[0]: var.split("=")[1] for var in envs}


def drop_subgraph(testname):
    subprocess.run(
        ["yarn", "graph", "remove", "--node", subgraph_admin_url, testname],
        check=True,
    )


def setup_subgraph(contracts, testname):
    env = dict(contracts)
    fn = f"/tmp/{testname}_subgraph_networks.json"
    env["NETWORK_FILE"] = fn
    subprocess.run(["./configure-network.sh"], env=make_env(env), check=True)
    subprocess.run(
        ["yarn", "codegen"],
        env=make_env(env),
        check=True,
    )
    subprocess.run(
        ["yarn", "graph", "build", "--network", "localhost", "--network-file", fn],
        check=True,
    )
    subprocess.run(
        ["yarn", "graph", "create", "--node", subgraph_admin_url, testname],
        check=True,
    )
    subprocess.run(
        [
            "yarn",
            "graph",
            "deploy",
            "--ipfs",
            ipfs_url,
            "--node",
            subgraph_admin_url,
            "--network",
            "localhost",
            "--version-label=v0.0.1",
            "--network-file",
            fn,
            testname,
        ],
        check=True,
    )
    subprocess.run(
        ["./wait_for_subgraph.sh", f"{subgraph_query_url}/subgraphs/name/{testname}"],
        check=True,
    )


class WebRequestHandler(BaseHTTPRequestHandler):
    def run_sync(self, query):
        return subprocess.run(query, capture_output=True, text=True)

    def drop_env(self, name):
        assert name in deployments
        drop_subgraph(name)
        deployments.pop(name, None)

    def get_env(self, name):
        if name in deployments:
            print(f"Cached deployment of {name}")
            return deployments[name]
        else:
            print(f"New deployment of {name}")
            new_deployment = self.new_deployment(name)
            deployments[name] = new_deployment
            return new_deployment

    def new_deployment(self, name) -> Dict[str, str]:
        contracts = subprocess.run(
            [
                "npx",
                "hardhat",
                "--network",
                "localhost",
                "deploy",
                "--reset",
                "--write",
                "false",
                "--tags",
                "local",
            ],
            check=True,
            capture_output=True,
            text=True,
            cwd="../hardhat/",
        )
        addrs = get_addresses(contracts.stdout.split("\n"))

        setup_subgraph(addrs, name)
        addrs["SUBGRAPH_NAME"] = name

        return addrs

    def url(self):
        return urlparse(self.path)

    def query_data(self):
        return dict(parse_qsl(self.url().query))

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/ping":
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            return

        if path == "/remove":
            query = self.query_data()
            if "name" not in query:
                self.send_response(400)
                self.wfile.write(
                    'Missing "name" field in GET query fields'.encode("utf-8")
                )
                return
            subgraph_name = query["name"]
            if subgraph_name not in deployments:
                self.send_response(400)
                self.wfile.write(r"No deployment with {subgraph_name}".encode("utf-8"))
                return

            self.drop_env(subgraph_name)
            self.send_response(200)
            self.send_header('Content-type', "text/plain")
            self.end_headers()
            return

        query = self.query_data()
        if "name" not in query:
            self.send_response(400)
            self.wfile.write('Missing "name" field in GET query fields'.encode("utf-8"))
            return
        results = self.get_env(query["name"])
        if ("Accept" in self.headers) and (
            self.headers["Accept"] == "application/json"
        ):
            content_type = "application/json"
            output = json.dumps(results).encode("utf-8")
        else:
            content_type = "text/plain"
            output = "\n".join([f"{k}={v}" for k, v in results.items()]).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(output)


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8022
    print(f"Multideployer listening on http://{host}:{port}")
    print(
        f"Run GET with appropriate timeout value against http://{host}:{port}/?name=NAME_OF_YOUR_SUBGRAPH"
    )
    server = HTTPServer((host, port), WebRequestHandler)
    server.serve_forever()
