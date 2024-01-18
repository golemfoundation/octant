import json
import subprocess
import os
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qsl, urlparse
from http.server import HTTPServer

subgraph_admin_url = os.environ["SUBGRAPH_ADMIN_URL"]
subgraph_query_url = os.environ["SUBGRAPH_QUERY_URL"]
rpc_url = os.environ["RPC_URL"]
ipfs_url = os.environ["IPFS_URL"]


def make_env(defs):
    os.environ.update(defs)
    return os.environ


def get_addresses(lines):
    def is_address(line):
        return "CONTRACT_ADDRESS=" in line

    envs = list(filter(is_address, lines))
    return {var.split("=")[0]: var.split("=")[1] for var in envs}


def setup_subgraph(contracts, testname):
    env = dict(contracts)
    fn = f"/tmp/{testname}_subgraph_networks.json"
    env["NETWORK_FILE"] = fn
    subprocess.run(["./configure-network.sh", fn], env=make_env(env), check=True)
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

    def get_response(self):
        name = self.query_data()["name"]
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
            capture_output=True,
            text=True,
            cwd="../hardhat/",
        )
        addrs = get_addresses(contracts.stdout.split("\n"))

        setup_subgraph(addrs, name)
        addrs["SUBGRAPH_NAME"] = name

        return json.dumps(addrs)

    def url(self):
        return urlparse(self.path)

    def query_data(self):
        return dict(parse_qsl(self.url().query))

    def do_GET(self):
        query = self.query_data()
        if "name" not in query:
            self.send_response(400)
            self.wfile.write('Missing "name" field in GET query fields'.encode("utf-8"))
            return
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(self.get_response().encode("utf-8"))


if __name__ == "__main__":
    host = "0.0.0.0"
    port = 8022
    print(f"Multideployer listening on http://{host}:{port}")
    print(
        f"Run GET with appropriate timeout value against http://{host}:{port}/?name=NAMEOFYOURSUBGRAPH"
    )
    server = HTTPServer((host, port), WebRequestHandler)
    server.serve_forever()
