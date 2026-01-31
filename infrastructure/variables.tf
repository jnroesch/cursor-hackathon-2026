# Inkspire - Terraform Variables
# These are defined in main.tf, this file documents the required inputs

# Required secrets to configure in GitHub:
#
# AZURE_CLIENT_ID        - Azure AD Application (Service Principal) Client ID
# AZURE_TENANT_ID        - Azure AD Tenant ID
# AZURE_SUBSCRIPTION_ID  - Azure Subscription ID
# AZURE_STORAGE_ACCOUNT  - Storage account name for Terraform state
# DB_PASSWORD            - PostgreSQL admin password
# JWT_SECRET             - JWT signing secret (min 256 bits)
#
# Setup instructions:
#
# 1. Create an Azure AD App Registration for GitHub Actions:
#    az ad app create --display-name "inkspire-github-actions"
#
# 2. Create a Service Principal:
#    az ad sp create --id <app-id>
#
# 3. Configure federated credentials for OIDC:
#    az ad app federated-credential create --id <app-id> --parameters @federation.json
#
# 4. Grant the Service Principal access to your subscription:
#    az role assignment create --assignee <app-id> --role Contributor --scope /subscriptions/<subscription-id>
#
# 5. Create a storage account for Terraform state:
#    az storage account create -n inkspireterraform -g inkspire-rg -l westeurope --sku Standard_LRS
#    az storage container create -n tfstate --account-name inkspireterraform
