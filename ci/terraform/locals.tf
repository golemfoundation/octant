locals {
  context = {
    namespace = "octant"
    stage     = "gitlabenv"
  }

  vm_config = {
    machine_type = "e2-small"
    zone         = "us-central1-a"
    network      = "default"
  }

  dns_root_domain = "gle.${trimsuffix(data.google_dns_managed_zone.octant.dns_name, ".")}"
  dns_subdomains = [
    "subgraph",
    "cps",
    "backend",
  ]

  images_prefix = var.octant_branch == null ? "registry.gitlab.com/wildland/governance/octant" : "registry.gitlab.com/wildland/governance/octant/${var.octant_branch}"

  image_versions = {
    ipfs       = "v0.19.0"
    graph-node = "v0.30.0"
    postgres   = "15.2"
    traefik    = "v2.9"
  }

  docker_services = {
    postgres = {
      image = "postgres:${local.image_versions.postgres}"
      envs = [
        "POSTGRES_USER=graph-node",
        "POSTGRES_PASSWORD=let_me_in",
        "POSTGRES_DB=graph-node",
        "PGDATA=/data/postgres",
      ]
      params = "-e POSTGRES_INITDB_ARGS='--encoding=UTF-8 --lc-collate=C --lc-ctype=C'",
    },
    postgres-backend = {
      image = "postgres:${local.image_versions.postgres}"
      envs = [
        "POSTGRES_USER=backend-server",
        "POSTGRES_PASSWORD=let_me_in",
        "POSTGRES_DB=backend-server",
        "PGDATA=/data/postgres",
      ]
      params = "-e POSTGRES_INITDB_ARGS='--encoding=UTF-8 --lc-collate=C --lc-ctype=C'",
    },
    ipfs = {
      image = "ipfs/kubo:${local.image_versions.ipfs}"
    },
  }
  traefik_services = {
    backend = {
      image = "${local.images_prefix}/backend:${var.octant_tag}"
      labels = [
        "traefik.enable=true",
        "traefik.http.routers.backend.entrypoints=web",
        "traefik.http.routers.backend.rule=Host(\\`backend.${var.dns_endpoint}.${local.dns_root_domain}\\`)",
      ]
      envs = [
        "OCTANT_ENV=production",
        "ETH_RPC_PROVIDER_URL=${var.subgraph_alchemy_api_url}",
        "DB_URI=postgresql://backend-server:let_me_in@postgres-backend:5432/backend-server",
        "OCTANT_BACKEND_SECRET_KEY=${uuid()}"
      ]
      envFileEnable = true
    },
    client = {
      image = "${local.images_prefix}/client:${var.octant_tag}"
      labels = [
        "traefik.enable=true",
        "traefik.http.routers.client.entrypoints=web",
        "traefik.http.routers.client.rule=Host(\\`${var.dns_endpoint}.${local.dns_root_domain}\\`)",
      ]
      envFileEnable = true
    },
    graph-node = {
      image = "graphprotocol/graph-node:${local.image_versions.graph-node}"
      envs = [
        "postgres_host=postgres",
        "postgres_user=graph-node",
        "postgres_pass=let_me_in",
        "postgres_db=graph-node",
        "ipfs=ipfs:5001",
        "GRAPH_LOG=info",
        "ethereum=${var.network}:${var.subgraph_alchemy_api_url}",
      ]
      labels = [
        "traefik.enable=true",
        "traefik.http.routers.subgraph.entrypoints=web",
        "traefik.http.routers.subgraph.rule=Host(\\`subgraph.${var.dns_endpoint}.${local.dns_root_domain}\\`)",
      ]
    }
    coin_prices_server = {
      image = "${local.images_prefix}/coin-prices-server:${var.octant_tag}"
      envs = [
        "API_KEY=${var.coingecko_api_key}"
      ]
      labels = [
        "traefik.enable=true",
        "traefik.http.routers.cps.entrypoints=web",
        "traefik.http.routers.cps.rule=Host(\\`cps.${var.dns_endpoint}.${local.dns_root_domain}\\`)",
      ]
    }
  }
}
