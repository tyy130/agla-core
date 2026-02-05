# Networking: VCN, Subnets, and Security Groups

resource "oci_core_vcn" "agla_vcn" {
  cidr_block     = "10.0.0.0/16"
  compartment_id = var.compartment_ocid
  display_name   = "agla-secure-vcn"
}

resource "oci_core_internet_gateway" "agla_ig" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.agla_vcn.id
  enabled        = true
}

resource "oci_core_route_table" "public_rt" {
  compartment_id = oci_core_vcn.agla_vcn.compartment_id
  vcn_id         = oci_core_vcn.agla_vcn.id
  route_rules {
    destination       = "0.0.0.0/0"
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_internet_gateway.agla_ig.id
  }
}

resource "oci_core_subnet" "public_subnet" {
  cidr_block        = "10.0.1.0/24"
  display_name      = "agla-public-subnet"
  compartment_id    = var.compartment_ocid
  vcn_id            = oci_core_vcn.agla_vcn.id
  route_table_id    = oci_core_route_table.public_rt.id
  security_list_ids = [oci_core_security_list.public_sl.id]
}

resource "oci_core_subnet" "private_db_subnet" {
  cidr_block                 = "10.0.2.0/24"
  display_name               = "agla-private-db-subnet"
  compartment_id             = var.compartment_ocid
  vcn_id                     = oci_core_vcn.agla_vcn.id
  prohibit_public_ip_on_vnic = true
}

# Network Security Groups (NSGs)

resource "oci_core_network_security_group" "agla_app_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.agla_vcn.id
  display_name   = "AGLA Application NSG"
}

resource "oci_core_network_security_group_security_rule" "allow_http" {
  network_security_group_id = oci_core_network_security_group.agla_app_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6" # TCP
  source                    = "0.0.0.0/0"
  tcp_options {
    destination_port_range {
      min = 80
      max = 80
    }
  }
}

resource "oci_core_network_security_group_security_rule" "allow_https" {
  network_security_group_id = oci_core_network_security_group.agla_app_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6" # TCP
  source                    = "0.0.0.0/0"
  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_security_list" "public_sl" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.agla_vcn.id
  display_name   = "Public Security List"

  egress_security_rules {
    destination = "0.0.0.0/0"
    protocol    = "all"
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = 80
      min = 80
    }
  }
  
  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      max = 443
      min = 443
    }
  }
}
