# Storage & Security: Vault and Object Storage

resource "oci_kms_vault" "agla_vault" {
  compartment_id = var.compartment_ocid
  display_name   = "agla-secrets-vault"
  vault_type     = "DEFAULT"
}

resource "oci_kms_key" "agla_master_key" {
  compartment_id      = var.compartment_ocid
  display_name        = "agla-master-encryption-key"
  management_endpoint = oci_kms_vault.agla_vault.management_endpoint
  key_shape {
    algorithm = "AES"
    length    = 32
  }
}

resource "oci_objectstorage_bucket" "agla_docs_bucket" {
  compartment_id = var.compartment_ocid
  name           = "agla-secure-documents"
  namespace      = data.oci_objectstorage_namespace.ns.namespace
  access_type    = "NoPublicAccess" # Strict Private Access
  kms_key_id     = oci_kms_key.agla_master_key.id # Server-Side Encryption
}

data "oci_objectstorage_namespace" "ns" {
  compartment_id = var.compartment_ocid
}
