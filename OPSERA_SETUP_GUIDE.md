# Opsera Code-to-Cloud Enterprise - Setup Guide

**Application:** all-is-well
**Generated:** 2026-02-12
**Version:** v0.924

---

## 🎉 Files Successfully Generated!

All CI/CD workflows and Kubernetes manifests have been created and pushed to your repository.

### Files Created

#### GitHub Workflows
- `.github/workflows/1-bootstrap-infrastructure-all-is-well.yaml` - One-time infrastructure setup
- `.github/workflows/2-deploy-dev-all-is-well.yaml` - Dev environment CI/CD pipeline

#### Kubernetes Manifests
- `.opsera-all-is-well/k8s/base/` - Base Kubernetes resources
  - `deployment.yaml` - Application deployment
  - `service.yaml` - ClusterIP service
  - `ingress.yaml` - Ingress configuration
  - `kustomization.yaml` - Kustomize base config
- `.opsera-all-is-well/k8s/overlays/dev/` - Dev environment overlay
  - `kustomization.yaml` - Dev-specific configuration
  - `namespace.yaml` - Namespace definition

#### ArgoCD Configuration
- `.opsera-all-is-well/argocd/application-dev.yaml` - ArgoCD application for dev

#### Application Files
- `Dockerfile` - Multi-stage Docker build for Vite + React
- `.opsera-all-is-well/opsera-config.yaml` - Configuration single source of truth

---

## 🔐 Step 1: Configure GitHub Secrets

Before running the workflows, you **MUST** configure these secrets in your GitHub repository:

### Required Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `AWS_ACCESS_KEY_ID` | AWS access key with ECR and EKS permissions | IAM user credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS secret access key | IAM user credentials |
| `GH_PAT` | GitHub Personal Access Token | Settings → Developer settings → Personal access tokens |

### AWS IAM Permissions Required

Your AWS IAM user needs these permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:*",
        "eks:DescribeCluster",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

### GitHub PAT Scopes Required

Your GitHub Personal Access Token needs these scopes:
- `repo` (Full control of private repositories)
- `workflow` (Update GitHub Action workflows)

### Kubernetes Secrets Required

Your Kubernetes admin should provide these kubeconfig secrets:

| Secret Name | Description |
|-------------|-------------|
| `KUBE_CONFIG_HUB` | Kubeconfig for ArgoCD hub cluster (argocd-usw2) |
| `KUBE_CONFIG_SPOKE` | Kubeconfig for spoke cluster (opsera-usw2-np) |

**Note:** If you don't have these kubeconfig files yet, your cluster admin needs to generate them with appropriate RBAC permissions.

---

## 🚀 Step 2: Run Bootstrap Workflow (ONE TIME)

The bootstrap workflow creates all infrastructure resources needed for CI/CD.

### Trigger Bootstrap

```bash
# Using GitHub CLI
gh workflow run "1-bootstrap-infrastructure-all-is-well.yaml"

# Monitor execution
gh run watch

# Or check status
gh run list --workflow="1-bootstrap-infrastructure-all-is-well.yaml" --limit 1
```

### What Bootstrap Creates

✅ **ECR Repository** - `opsera/all-is-well`
✅ **Repository Registration** - Registers GitHub repo with ArgoCD
✅ **Spoke Cluster Registration** - Registers `opsera-usw2-np` with ArgoCD hub
✅ **Folder Structure** - Creates `.opsera-all-is-well/` directory
✅ **Namespace** - `opsera-all-is-well-dev`
✅ **Service Account** - `all-is-well-sa`

**Duration:** ~8-10 minutes

### Verify Bootstrap Success

```bash
# Check ECR repository
aws ecr describe-repositories --repository-names "opsera/all-is-well"

# Check namespace (requires kubectl configured for spoke cluster)
kubectl get namespace opsera-all-is-well-dev

# Check ArgoCD applications (requires kubectl configured for hub cluster)
kubectl get applications -n argocd | grep all-is-well
```

---

## 🔄 Step 3: Deploy to Dev Environment

After bootstrap completes, every push to the `main` branch automatically triggers the dev deployment pipeline.

### Automatic Deployment

Simply push code to `main`:
```bash
git push origin main
```

This triggers the 10-stage CI/CD pipeline:

1. **Security Scan** - Gitleaks secret scanning
2. **Build Image** - Docker build (not pushed yet)
3. **Grype Scan** - Container vulnerability scanning (warn mode)
4. **Push to ECR** - Push to Amazon ECR
5. **ECR Secret Refresh** - Update image pull credentials
6. **Update Manifests** - Update Kustomize with new image tag
7. **ArgoCD Refresh** - Hard refresh ArgoCD application
8. **Sync ArgoCD** - Trigger sync and wait for completion
9. **Verify Deployment** - Health checks and pod verification
10. **Deployment Landscape** - Generate deployment summary

**Duration:** ~12-13 minutes (first run) | ~10-11 minutes (cached)

### Manual Deployment Trigger

```bash
# Trigger manually
gh workflow run "2-deploy-dev-all-is-well.yaml"

# Monitor
gh run watch
```

### Monitor Deployment

```bash
# Watch workflow runs
gh run list --workflow="2-deploy-dev-all-is-well.yaml" --limit 5

# View detailed logs
gh run view --log

# Check pod status (requires kubectl)
kubectl get pods -n opsera-all-is-well-dev -l app=all-is-well
```

---

## 📊 Configuration Reference

### Application Configuration

| Setting | Value |
|---------|-------|
| **Application Name** | all-is-well |
| **Tenant** | opsera |
| **Cloud Provider** | AWS |
| **Region** | us-west-2 (usw2) |
| **Build Tool** | npm |
| **Build Command** | npm run build |
| **Server Port** | 8080 |

### Infrastructure Configuration

| Resource | Value |
|----------|-------|
| **Hub Cluster** | argocd-usw2 |
| **Spoke Cluster** | opsera-usw2-np |
| **ArgoCD Server** | argocd-usw2.agent.opsera.dev |
| **Domain** | agent.opsera.dev |
| **ECR Repository** | opsera/all-is-well |
| **Namespace (dev)** | opsera-all-is-well-dev |

### Dev Environment Settings

| Setting | Value |
|---------|-------|
| **Replicas** | 2 |
| **Deployment Strategy** | Rolling |
| **Branch** | main |
| **Auto Deploy** | Enabled |
| **Ingress Host** | all-is-well-dev.agent.opsera.dev |
| **TLS** | Disabled (HTTP only) |

### Security Settings

| Tool | Status | Mode |
|------|--------|------|
| **Gitleaks** | ✅ Enabled | Block |
| **Grype** | ✅ Enabled | Warn (non-blocking) |
| **SonarQube** | ⏭️ Skipped | N/A |

---

## 🎯 Access Your Application

After successful deployment, your application will be available at:

**Dev Environment:**
🌐 http://all-is-well-dev.agent.opsera.dev

---

## 📋 Workflow Protection

The CI/CD workflow is configured to prevent infinite loops:

- **Path Ignore**: Skips `.opsera-**/k8s/**` changes
- **Commit Skip**: Uses `[skip ci]` in manifest updates
- **Concurrency Control**: Queues deployments, prevents parallel runs

---

## 🔧 Troubleshooting

### Bootstrap Fails

**Check Secrets:**
```bash
gh secret list
```

**Verify AWS Credentials:**
```bash
aws sts get-caller-identity
```

**Check Cluster Access:**
```bash
aws eks describe-cluster --name argocd-usw2 --region us-west-2
aws eks describe-cluster --name opsera-usw2-np --region us-west-2
```

### CI/CD Pipeline Fails

**View Workflow Logs:**
```bash
gh run view --log
```

**Check ArgoCD Application Status:**
```bash
kubectl --context hub get application opsera-all-is-well-dev -n argocd -o yaml
```

**Check Pod Status:**
```bash
kubectl --context spoke get pods -n opsera-all-is-well-dev
kubectl --context spoke describe pod <pod-name> -n opsera-all-is-well-dev
```

### Image Pull Errors

The pipeline automatically refreshes ECR secrets, but if you see `ImagePullBackOff`:

```bash
# Manually trigger workflow to refresh secret
gh workflow run "2-deploy-dev-all-is-well.yaml"
```

---

## 📚 Additional Resources

### Configuration Files

All configuration is stored in `.opsera-all-is-well/opsera-config.yaml` - this is the single source of truth.

### Updating Configuration

To modify environment settings:
1. Edit `.opsera-all-is-well/opsera-config.yaml`
2. Update corresponding K8s manifests if needed
3. Commit and push

### Adding Environments

To add QA, Staging, or Production environments:
1. Create overlay directory: `.opsera-all-is-well/k8s/overlays/{env}/`
2. Create kustomization and namespace files
3. Create ArgoCD application: `.opsera-all-is-well/argocd/application-{env}.yaml`
4. Create CI/CD workflow: `.github/workflows/2-deploy-{env}-all-is-well.yaml`

---

## ✅ Checklist

- [ ] Configure all GitHub secrets
- [ ] Verify AWS credentials and permissions
- [ ] Obtain kubeconfig for hub and spoke clusters
- [ ] Run bootstrap workflow
- [ ] Verify bootstrap success
- [ ] Push code to trigger first deployment
- [ ] Monitor deployment pipeline
- [ ] Access application URL
- [ ] Verify application health

---

## 🆘 Support

For issues or questions:
- Check workflow logs: `gh run view --log`
- Review GitHub Actions tab in repository
- Consult Opsera documentation
- Contact your DevOps team

---

**Generated by Opsera Code-to-Cloud Enterprise v0.924**
**Powered by Claude Sonnet 4.5**
