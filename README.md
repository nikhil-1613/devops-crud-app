# TaskSpace (DevOps CRUD App)

A full-stack task management application built to practice DevOps principles, including Containerization (Docker), CI/CD, and Kubernetes orchestration.

## 🚀 Tech Stack

- **Frontend:** React.js, Vite, TailwindCSS
- **Backend:** Node.js, Express, JWT Authentication
- **Database:** PostgreSQL
- **Infrastructure:** Docker & Docker Compose

## 📁 Project Structure

```text
.
├── backend/           # Node.js Express API
├── frontend/          # React + Vite application
├── docker-compose.yml # Orchestrates local development
└── README.md          # Project documentation
```

## 🐳 Running Locally with Docker

You do not need Node.js or PostgreSQL installed on your host machine to run this project. Everything runs inside Docker containers.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. Clone the repository:
   ```bash
   git clone <your-repository-url>
   cd devops-crud-app
   ```

2. Start the application:
   ```bash
   docker-compose up -d --build
   ```

3. Access the services:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:5000
   - **Database:** `localhost:5432` (User: `postgres`, Password: `password`)

### Stopping the Application

To stop the containers without destroying your database data:
```bash
docker-compose stop
```

To stop and remove containers:
```bash
docker-compose down
```

## 🛤️ DevOps Learning Roadmap

This project is structured to progress through various DevOps stages:
1. [x] **Local Containerization:** Dockerizing frontend, backend, and DB using `docker-compose`.
2. [ ] **CI/CD:** Implementing GitHub Actions/GitLab CI for automated testing and image building.
3. [ ] **Kubernetes:** Deploying the application to a local K8s cluster (Minikube/Kind) with Deployments, Services, and StatefulSets.
4. [ ] **Infrastructure as Code (IaC):** Using Terraform for cloud provisioning.
