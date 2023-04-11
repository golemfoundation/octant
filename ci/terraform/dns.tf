data "google_dns_managed_zone" "octant" {
  name = var.gcp_domain_zone_name
}

resource "google_dns_record_set" "domain" {
  managed_zone = data.google_dns_managed_zone.octant.name
  name         = "${var.dns_endpoint}.${local.dns_root_domain}."
  type         = "A"
  ttl          = 300
  rrdatas      = [google_compute_instance.vm.network_interface[0].access_config[0].nat_ip]
}

resource "google_dns_record_set" "subdomains" {
  count = length(local.dns_subdomains)

  managed_zone = data.google_dns_managed_zone.octant.name
  name         = "${local.dns_subdomains[count.index]}.${var.dns_endpoint}.${local.dns_root_domain}."
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["${var.dns_endpoint}.${local.dns_root_domain}."]
}
