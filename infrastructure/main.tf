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

  # Connection string for PostgreSQL
  db_connection_string = "Host=${azurerm_postgresql_flexible_server.main.fqdn};Database=inkspire;Username=inkspire_admin;Password=${var.db_password};SSL Mode=Require;Trust Server Certificate=true"
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

  depends_on = [azurerm_postgresql_flexible_server.main]
}

# =============================================================================
# App Service Plan (shared by backend and frontend)
# =============================================================================

resource "azurerm_service_plan" "main" {
  name                = "${local.resource_prefix}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "B2" # Basic tier

  tags = local.common_tags
}

# =============================================================================
# Backend App Service
# =============================================================================

resource "azurerm_linux_web_app" "backend" {
  name                = "${local.resource_prefix}-backend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  site_config {
    always_on = true

    application_stack {
      docker_registry_url      = "https://${var.registry}"
      docker_image_name        = "${var.repository}/backend:${var.image_tag}"
      docker_registry_username = "token"
      docker_registry_password = var.ghcr_token
    }

    health_check_path = "/health"
  }

  app_settings = {
    "WEBSITES_PORT"                       = "8080"
    "ASPNETCORE_ENVIRONMENT"              = "Production"
    "ASPNETCORE_URLS"                     = "http://+:8080"
    "ConnectionStrings__DefaultConnection" = local.db_connection_string
    "Jwt__Secret"                         = var.jwt_secret
    "Jwt__Issuer"                         = "Inkspire"
    "Jwt__Audience"                       = "Inkspire"
    "Jwt__ExpirationInDays"               = "7"
  }

  tags = local.common_tags
}

# =============================================================================
# Frontend App Service
# =============================================================================

resource "azurerm_linux_web_app" "frontend" {
  name                = "${local.resource_prefix}-frontend"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  https_only = true

  site_config {
    always_on = true

    application_stack {
      docker_registry_url      = "https://${var.registry}"
      docker_image_name        = "${var.repository}/frontend:${var.image_tag}"
      docker_registry_username = "token"
      docker_registry_password = var.ghcr_token
    }

    health_check_path = "/health"
  }

  app_settings = {
    "WEBSITES_PORT" = "80"
    # Pass the backend API URL to the frontend for runtime configuration
    "API_URL" = "https://${azurerm_linux_web_app.backend.default_hostname}"
  }

  tags = local.common_tags
}

# =============================================================================
# Outputs
# =============================================================================

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "app_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

output "api_url" {
  value = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "database_fqdn" {
  value     = azurerm_postgresql_flexible_server.main.fqdn
  sensitive = true
}
