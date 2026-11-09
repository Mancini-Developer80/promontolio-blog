variable "project_id" {
  type        = string
  description = "Il Google Cloud Project ID"
  default     = "promontolio-prod"
}

variable "region" {
  type        = string
  description = "La regione GCP per Cloud Run"
  default     = "europe-west3" # Francoforte
}

variable "service_name" {
  type        = string
  description = "Nome del servizio Cloud Run"
  default     = "promontolio-app"
}

variable "database_url" {
  type      = string
  sensitive = true
}