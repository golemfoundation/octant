module "context" {
  source  = "cloudposse/label/null"
  version = "0.25.0"

  namespace = local.context.namespace
  stage     = local.context.stage
}
