# Gitlab variables

variable "CI_COMMIT_REF_NAME" {
  type        = string
  description = "GitLab variable CI_COMMIT_REF_NAME"
}

variable "CI_COMMIT_SHA" {
  type        = string
  description = "GitLab variable CI_COMMIT_SHA"
}

variable "CI_ENVIRONMENT_NAME" {
  type        = string
  description = "GitLab variable CI_ENVIRONMENT_NAME"
}

variable "CI_PROJECT_ID" {
  type        = string
  description = "GitLab variable CI_PROJECT_ID"
}

variable "gitlab_username" {
  type        = string
  description = "User to authenticate to GitLab"
}

variable "gitlab_token" {
  type        = string
  description = "Token to authenticate to GitLab"
  sensitive   = true
}

# GCP variables
variable "gcp_project" {
  type        = string
  description = "GCP project"
}

variable "coingecko_api_key" {
  type        = string
  description = "CoinGecko API key"
  default     = ""
  sensitive   = true
}

variable "gcp_domain_zone_name" {
  type        = string
  description = "Domain zone name of domain"
}

# API keys / private keys
variable "contracts_alchemy_api_url" {
  type        = string
  description = "Alchemy API URL for Contracts use"
  sensitive   = true
}

variable "etherscan_api_key" {
  type        = string
  description = "Etherscan.io API key"
  sensitive   = true
}


variable "subgraph_alchemy_api_url" {
  type        = string
  description = "Alchemy API URL for Subgraph use"
  sensitive   = true
}

variable "wallet_private_key" {
  type        = string
  description = "Cryptocurrency wallet private key"
  sensitive   = true
}

# HackMD
variable "hackmd_note_header" {
  type        = string
  description = "Header after which new contract addresses should be inserted"
  default     = "Deployed contracts addresses"
}

variable "hackmd_noteid" {
  type        = string
  description = "hackmd.io note id"
}

variable "hackmd_token" {
  type        = string
  description = "hackmd.io access token"
  sensitive   = true
}

# Deployment variables
variable "dns_endpoint" {
  type        = string
  description = "Endpoint name of service (part of URL XXX.gle.domain"
}

variable "generate_contracts" {
  type        = bool
  description = "Run contracts image to generate new smart contracts"
  default     = false
}

variable "network" {
  type        = string
  description = "Target network"
  default     = "goerli"
}

variable "octant_branch" {
  type        = string
  description = "Octant branch to fetch images from"
  default     = null
}

variable "octant_tag" {
  type        = string
  description = "Octant images tag"
}
