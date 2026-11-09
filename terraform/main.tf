# 1. Abilitazione automatica delle API indispensabili su GCP
resource "google_project_service" "run_api" {
  service            = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry_api" {
  service            = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

# 2. Creazione del Repository Artifact Registry (per le immagini Docker)
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "promontolio-repo"
  description   = "Docker repository per Promontolio"
  format        = "DOCKER"

  depends_on = [google_project_service.artifactregistry_api]
}

# 3. Configurazione del Servizio Cloud Run (Serverless)
resource "google_cloud_run_v2_service" "app" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    annotations = {
      "force-refresh-url" = "v2"
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.service_name}:latest"
      
      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }
    }
  }

  depends_on = [google_project_service.run_api]
}




# 4. Output dell'URL pubblico del servizio Cloud Run
output "service_url" {
  value       = google_cloud_run_v2_service.app.uri
  description = "URL pubblico dell'applicazione su Cloud Run"
}