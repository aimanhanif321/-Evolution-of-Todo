# GitHub Secrets Configuration

This document describes all secrets required for the GitHub Actions CI/CD pipeline for Taskora.

## Overview

GitHub Secrets are encrypted environment variables that you can create in your repository settings. They are used to store sensitive information like API tokens, credentials, and connection strings that your CI/CD workflows need to deploy and test your application.

## Required Secrets

Configure these secrets in your GitHub repository settings under **Settings > Secrets and variables > Actions**.

### Repository Secrets (Required)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | DigitalOcean API token for DOKS cluster access | deploy-prod.yml |
| `GITHUB_TOKEN` | Auto-provided by GitHub Actions | All workflows |

### Registry Secrets (If not using GHCR)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `DOCKER_USERNAME` | Docker Hub or registry username | build.yml |
| `DOCKER_PASSWORD` | Docker Hub or registry password | build.yml |
| `REGISTRY_URL` | Custom container registry URL | build.yml |

### Optional Secrets (Notifications & Testing)

| Secret Name | Description | Required For |
|-------------|-------------|--------------|
| `NEON_DATABASE_URL` | Neon DB connection string for integration tests | ci.yml (optional) |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for deploy notifications | deploy-*.yml (optional) |
| `DISCORD_WEBHOOK_URL` | Discord webhook for deploy notifications | deploy-prod.yml (optional) |
| `DEPLOY_WEBHOOK_URL` | Generic webhook for custom integrations | deploy-prod.yml (optional) |

## Environment Configuration

Create a **production** environment in **Settings > Environments** with the following configuration.

### Creating the Production Environment

1. Go to **Settings > Environments**
2. Click **New environment**
3. Name: `production`
4. Configure protection rules (recommended)
5. Add environment secrets

### Protection Rules (Recommended)

| Rule | Setting | Description |
|------|---------|-------------|
| Required reviewers | 1+ | Require approval before deployment |
| Wait timer | 0-30 minutes | Optional delay before deploy |
| Deployment branches | Only `main` | Restrict which branches can deploy |

### Environment Secrets (Production)

Configure these secrets at the environment level:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/taskora?sslmode=require` |
| `COHERE_API_KEY` | Cohere API key for AI features | `co-xxxxxxxxxxxxxxxxxxxx` |
| `BETTER_AUTH_SECRET` | Authentication secret key (32+ chars) | `your-secure-random-string-here` |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | `AIza...` |

## Step-by-Step Setup Instructions

### 1. Create DigitalOcean API Token

1. Log in to [DigitalOcean Control Panel](https://cloud.digitalocean.com)
2. Navigate to **API > Tokens**
3. Click **Generate New Token**
4. Configure the token:
   - **Name**: `github-actions-taskora`
   - **Expiration**: 90 days or custom (set reminder to rotate)
   - **Scopes**: Select **Read** and **Write** for full access
5. Click **Generate Token**
6. **IMPORTANT**: Copy the token immediately - it will not be shown again

Add to GitHub:
```bash
# Via GitHub CLI
gh secret set DIGITALOCEAN_ACCESS_TOKEN --body "dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 2. Set Up Database URL

For DigitalOcean Managed Databases:

1. Go to **Databases** in DO Control Panel
2. Select your PostgreSQL cluster
3. Click **Connection Details**
4. Copy the connection string (with SSL mode)

Format:
```
postgresql://username:password@host:port/database?sslmode=require
```

Add to GitHub (production environment):
```bash
gh secret set DATABASE_URL --env production --body "postgresql://..."
```

### 3. Create Cohere API Key

1. Visit [Cohere Dashboard](https://dashboard.cohere.com)
2. Go to **API Keys**
3. Click **Create API Key**
4. Copy the key

Add to GitHub:
```bash
gh secret set COHERE_API_KEY --env production --body "co-xxxxxxxxxxxxxxxx"
```

### 4. Generate Better Auth Secret

Generate a secure random string:

```bash
# Using openssl
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Add to GitHub:
```bash
gh secret set BETTER_AUTH_SECRET --env production --body "your-generated-secret"
```

### 5. (Optional) Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key

Add to GitHub:
```bash
gh secret set GEMINI_API_KEY --env production --body "AIza..."
```

## GitHub CLI Commands Reference

### List All Secrets
```bash
# Repository secrets
gh secret list

# Environment secrets
gh secret list --env production
```

### Set a Secret
```bash
# Repository secret
gh secret set SECRET_NAME --body "value"

# From file
gh secret set SECRET_NAME < secret.txt

# Environment secret
gh secret set SECRET_NAME --env production --body "value"
```

### Delete a Secret
```bash
gh secret delete SECRET_NAME
gh secret delete SECRET_NAME --env production
```

## Kubernetes Secrets Setup

After configuring GitHub secrets, you also need to create Kubernetes secrets for the deployed application.

### Create Application Secrets

```bash
# Create the taskora-secrets secret
kubectl create secret generic taskora-secrets -n taskora \
  --from-literal=DATABASE_URL='postgresql://user:pass@host:5432/taskora?sslmode=require' \
  --from-literal=COHERE_API_KEY='co-xxxxxxxxxxxxxxxx' \
  --from-literal=BETTER_AUTH_SECRET='your-secure-secret' \
  --from-literal=GEMINI_API_KEY='AIza...'
```

### Verify Secrets

```bash
# List secrets in namespace
kubectl get secrets -n taskora

# Describe a secret (shows keys, not values)
kubectl describe secret taskora-secrets -n taskora
```

### Update a Secret

```bash
# Delete and recreate
kubectl delete secret taskora-secrets -n taskora
kubectl create secret generic taskora-secrets -n taskora \
  --from-literal=...
```

Or use `kubectl edit`:
```bash
kubectl edit secret taskora-secrets -n taskora
```

## Workflow Environment Variables

The CI/CD workflows reference secrets as follows:

```yaml
# .github/workflows/deploy-prod.yml
env:
  DIGITALOCEAN_ACCESS_TOKEN: ${{ secrets.DIGITALOCEAN_ACCESS_TOKEN }}
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Security Best Practices

### 1. Token Rotation
- Set calendar reminders to rotate tokens every 90 days
- Update both GitHub secrets and Kubernetes secrets when rotating

### 2. Least Privilege
- Create dedicated API tokens with minimal required permissions
- Use environment-specific secrets for production values

### 3. Access Control
- Enable required reviewers for production environment
- Restrict who can access repository settings

### 4. Audit Regularly
- Review GitHub Actions logs for secret usage
- Check DigitalOcean API access logs
- Monitor for unauthorized access attempts

### 5. Secret Management
- Never commit secrets to the repository
- Use `.gitignore` to exclude `.env` files
- Consider using a secrets manager for complex setups

## Troubleshooting

### "Authentication failed" Errors

1. Verify the `DIGITALOCEAN_ACCESS_TOKEN` is correct:
   ```bash
   # Test with doctl
   doctl auth init --access-token YOUR_TOKEN
   doctl account get
   ```

2. Check token hasn't expired
3. Verify token has read/write permissions

### "Cluster not found" Errors

1. Verify cluster exists:
   ```bash
   doctl kubernetes cluster list
   ```

2. Check cluster name matches `taskora-cluster`
3. Ensure token has access to the cluster's region

### "Permission denied" on Image Push

1. For GHCR, the `GITHUB_TOKEN` has automatic package permissions
2. For other registries, verify `DOCKER_USERNAME` and `DOCKER_PASSWORD`
3. Check registry URL is correct

### "Secret not found" in Kubernetes

1. Verify secrets exist:
   ```bash
   kubectl get secrets -n taskora
   ```

2. Check secret name matches what deployments expect
3. Ensure secrets are in the correct namespace

## Notification Webhooks Setup

### Slack Webhook

1. Go to your Slack workspace settings
2. Navigate to **Apps > Incoming Webhooks**
3. Click **Add New Webhook to Workspace**
4. Select a channel for notifications
5. Copy the webhook URL

```bash
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/services/T.../B.../..."
```

### Discord Webhook

1. Open Discord server settings
2. Navigate to **Integrations > Webhooks**
3. Click **New Webhook**
4. Configure name and channel
5. Copy the webhook URL

```bash
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..."
```

### Generic Webhook

For custom integrations (PagerDuty, custom services, etc.):

```bash
gh secret set DEPLOY_WEBHOOK_URL --body "https://your-service.com/webhook"
```

The webhook receives JSON with:
- `event`: "deployment"
- `status`: "success" or "failure"
- `environment`: "production" or "staging"
- `repository`, `commit_sha`, `actor`, `run_id`, `run_url`, `timestamp`

### Neon DB for Integration Tests

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Get the connection string from the dashboard
3. Add to GitHub secrets:

```bash
gh secret set NEON_DATABASE_URL --body "postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Note**: The CI workflow will automatically use Neon for integration tests if this secret is set.

## Related Documentation

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [DigitalOcean API Tokens](https://docs.digitalocean.com/reference/api/create-personal-access-token/)
- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Cohere API Keys](https://docs.cohere.com/docs/rate-limits)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Neon Documentation](https://neon.tech/docs)
