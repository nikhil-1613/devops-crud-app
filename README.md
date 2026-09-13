# TaskSpace (Production-Ready DevOps CRUD Application)

TaskSpace is a full-stack task management application built to gain hands-on experience with modern DevOps practices. The project demonstrates how an application evolves from local development to a production-ready deployment using containerization, Kubernetes orchestration, Infrastructure as Code, and automated CI/CD pipelines.

Rather than focusing only on application development, this project emphasizes deploying, scaling, securing, and monitoring applications in a cloud-native environment.

## 🚀 Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* PostgreSQL

### DevOps & Infrastructure

* Docker
* Docker Compose
* Kubernetes
* Helm Charts
* GitHub Actions
* Terraform (In Progress)

---

# Project Architecture

```
                 GitHub
                    │
            GitHub Actions CI
                    │
       Build & Push Docker Images
                    │
          Kubernetes Cluster
     ┌────────────┬─────────────┐
     │            │             │
 Frontend      Backend     PostgreSQL
 Deployment    Deployment   StatefulSet
     │            │             │
     └──────Ingress─────────────┘
                │
           End Users

Persistent Volume Claims
ConfigMaps
Secrets
Horizontal Pod Autoscaler
Metrics Server
```

---

# DevOps Features Implemented

## Docker

* Containerized React frontend
* Containerized Express backend
* PostgreSQL container
* Multi-container orchestration using Docker Compose
* Environment variable management
* Multi-stage Docker builds

---

## Kubernetes

The application has been fully migrated from Docker Compose to Kubernetes.

Implemented components include:

* Deployments
* Services
* Ingress Controller
* ConfigMaps
* Secrets
* Persistent Volume Claims (PVC)
* StatefulSet for PostgreSQL
* Horizontal Pod Autoscaler (HPA)
* Metrics Server
* Resource Requests & Limits
* Namespace isolation
* Health Checks (Liveness & Readiness Probes)

---

## CI/CD

Implemented using GitHub Actions.

Pipeline includes:

* Code checkout
* Dependency installation
* Application build
* Docker image build
* Image tagging
* Docker image push
* Kubernetes deployment updates

Future enhancements include:

* Automated testing
* Security scanning
* Helm-based deployments
* GitOps with Argo CD

---

## Helm (Currently Learning)

The project is now being migrated to Helm for package management.

Current focus:

* Helm chart structure
* Templates
* Values files
* Environment-specific configurations
* Reusable Kubernetes manifests
* Release management and upgrades

---

## Infrastructure as Code (Upcoming)

Terraform will be used to provision cloud infrastructure including:

* VPC
* Networking
* Kubernetes Cluster
* Compute resources
* IAM
* Storage

---

# Project Structure

```
taskspace/
│
├── frontend/
├── backend/
├── k8s/
│   ├── namespace.yaml
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── postgres-statefulset.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── hpa.yaml
│   └── metrics-server/
│
├── helm/
│   └── taskspace/
│
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

# Learning Journey

* ✅ Containerized the complete application using Docker.
* ✅ Orchestrated services with Docker Compose.
* ✅ Migrated the application to Kubernetes.
* ✅ Configured Deployments, Services, ConfigMaps, Secrets, PVCs, and StatefulSets.
* ✅ Implemented Ingress for external access.
* ✅ Enabled Horizontal Pod Autoscaling using Metrics Server.
* ✅ Built CI/CD pipelines with GitHub Actions.
* 🔄 Learning Helm to simplify Kubernetes deployments.
* ⏳ Planning Infrastructure provisioning using Terraform.
* ⏳ Future goal: GitOps deployment with Argo CD.

---

# Future Enhancements

* Terraform Infrastructure
* Argo CD (GitOps)
* Prometheus & Grafana Monitoring
* Loki Logging
* Trivy Image Scanning
* SonarQube Code Analysis
* Blue-Green Deployments
* Canary Releases
* Kubernetes RBAC
* OpenTelemetry
* Production deployment on AWS (EKS)
