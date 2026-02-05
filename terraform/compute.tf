# Compute: OKE Cluster for Docker Containers

resource "oci_containerengine_cluster" "agla_oke" {
  compartment_id     = var.compartment_ocid
  kubernetes_version = "v1.28.2"
  name               = "agla-production-cluster"
  vcn_id             = oci_core_vcn.agla_vcn.id

  endpoint_config {
    is_public_ip_enabled = true
    subnet_id            = oci_core_subnet.public_subnet.id
    nsg_ids              = [oci_core_network_security_group.agla_app_nsg.id]
  }
}

resource "oci_containerengine_node_pool" "agla_node_pool" {
  cluster_id     = oci_containerengine_cluster.agla_oke.id
  compartment_id = var.compartment_ocid
  name           = "agla-node-pool"
  node_shape     = "VM.Standard.E4.Flex"
  
  node_shape_config {
    memory_in_gbs = 16
    ocpus         = 2
  }

  node_config_details {
    placement_configs {
      availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
      subnet_id           = oci_core_subnet.private_db_subnet.id # Nodes in private subnet for security
    }
    size = 2
  }
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_ocid
}
