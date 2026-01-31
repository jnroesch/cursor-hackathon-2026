# Inkspire - Azure Infrastructure with Terraform

terraform {
  required_version = ">= 1.6"

  # Azure Storage backend for state
  backend "azurerm" {
    # Configured via CLI arguments in the deploy workflow
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.85"
    }
  }
}

provider "azurerm" {
  features {}
  use_oidc = true
}

# =============================================================================
# Variables
# =============================================================================

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "westeurope"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "inkspire"
}

variable "registry" {
  description = "Container registry"
  type        = string
  default     = "ghcr.io"
}

variable "repository" {
  description = "GitHub repository (owner/repo)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "db_password" {
  description = "PostgreSQL admin password"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}

variable "ghcr_token" {
  description = "GitHub Container Registry token (PAT or GITHUB_TOKEN)"
  type        = string
  sensitive   = true
}

# =============================================================================
# Locals
# =============================================================================

locals {
  resource_prefix = "${var.app_name}-${var.environment}"
  
  common_tags = {
    Application = var.app_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  backend_image  = "${var.registry}/${var.repository}/backend:${var.image_tag}"
  frontend_image = "${var.registry}/${var.repository}/frontend:${var.image_tag}"
}

# =============================================================================
# Resource Group
# =============================================================================

resource "azurerm_resource_group" "main" {
  name     = "${local.resource_prefix}-rg"
  location = var.location
  tags     = local.common_tags
}

# =============================================================================
# PostgreSQL Flexible Server
# =============================================================================

resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.resource_prefix}-db"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "16"
  administrator_login    = "inkspire_admin"
  administrator_password = var.db_password
  
  sku_name   = "B_Standard_B1ms"
  storage_mb = 32768
  
  # Let Azure choose an available zone automatically
  # (zone 1 is not available in westeurope for all subscriptions)

  tags = local.common_tags
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "inkspire"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rule to allow Azure services
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# =============================================================================
# Container Apps Environment
# =============================================================================

resource "azurerm_log_analytics_workspace" "main" {
  name                = "${local.resource_prefix}-logs"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.common_tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "${local.resource_prefix}-env"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = local.common_tags
}

# =============================================================================
# Backend Container App
# =============================================================================

resource "azurerm_container_app" "backend" {
  name                         = "${local.resource_prefix}-backend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"
  tags                         = local.common_tags

  template {
    container {
      name   = "backend"
      image  = local.backend_image
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Production"
      }

      env {
        name        = "ConnectionStrings__DefaultConnection"
        secret_name = "db-connection-string"
      }

      env {
        name        = "Jwt__Secret"
        secret_name = "jwt-secret"
      }

      env {
        name  = "Jwt__Issuer"
        value = "Inkspire"
      }

      env {
        name  = "Jwt__Audience"
        value = "Inkspire"
      }

      env {
        name  = "Jwt__ExpirationInDays"
        value = "7"
      }

      liveness_probe {
        path      = "/health"
        port      = 8080
        transport = "HTTP"
      }

      readiness_probe {
        path      = "/health"
        port      = 8080
        transport = "HTTP"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  secret {
    name  = "db-connection-string"
    value = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=inkspire;Username=inkspire_admin;Password=${var.db_password};SSL Mode=Require;Trust Server Certificate=true"
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server   = var.registry
    username = "token"
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }
}

# =============================================================================
# Frontend Container App
# =============================================================================

resource "azurerm_container_app" "frontend" {
  name                         = "${local.resource_prefix}-frontend"
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = azurerm_container_app_environment.main.id
  revision_mode                = "Single"
  tags                         = local.common_tags

  template {
    container {
      name   = "frontend"
      image  = local.frontend_image
      cpu    = 0.25
      memory = "0.5Gi"

      liveness_probe {
        path      = "/health"
        port      = 80
        transport = "HTTP"
      }
    }

    min_replicas = 1
    max_replicas = 3
  }

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server   = var.registry
    username = "token"
    password_secret_name = "ghcr-token"
  }

  secret {
    name  = "ghcr-token"
    value = var.ghcr_token
  }
}

# =============================================================================
# Outputs
# =============================================================================

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "app_url" {
  value = "https://${azurerm_container_app.frontend.ingress[0].fqdn}"
}

output "api_url" {
  value = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "database_fqdn" {
  value     = azurerm_postgresql_flexible_server.main.fqdn
  sensitive = true
}
