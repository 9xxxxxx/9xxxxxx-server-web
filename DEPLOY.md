# Docker Deployment Guide (Recommended)

This guide uses **Docker Compose** to run the entire stack (Next.js App + PostgreSQL + Redis) in containers. This is the most stable and reproducible way to deploy.

## Prerequisites

On your Volcengine (Linux) server:

1.  **Docker** installed.
2.  **Docker Compose** installed.
3.  **Git** installed.

## 1. Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/9xxxxxx/9xxxxxx-server-web.git
    cd 9xxxxxx-server-web
    ```

2.  **Configure Environment**:
    Create a `.env` file in the project root.
    ```bash
    cp .env.example .env
    nano .env
    ```
    **Critical**: Ensure `DATABASE_URL` points to the docker service name `db` if using the internal database:
    ```env
    DATABASE_URL="postgresql://postgres:password@db:5432/website?schema=public"
    REDIS_URL="redis://redis:6379"
    NEXTAUTH_URL="http://your-server-ip-or-domain"
    NEXTAUTH_SECRET="...your secret..."
    ```

## 2. Start Services

Run the application in the background:

```bash
docker-compose up -d --build
```

- This command will:
  - Build the Next.js app image (using `Dockerfile`).
  - Start PostgreSQL.
  - Start Redis.
  - Connect them all together.

## 3. Verify

- Check status: `docker-compose ps`
- View logs: `docker-compose logs -f app`
- Access site: `http://your-server-ip:3000`

## 4. Maintenance

### How to Update

When you have pushed new code to GitHub:

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and restart (Zero-downtime-ish)
docker-compose up -d --build
```

### Database Management

To run Prisma migrations manually inside the container:

```bash
docker-compose exec app npx prisma db push
```

## 5. Troubleshooting

If the build fails due to network issues (GFW) in China:

- The `Dockerfile` uses `node:20-alpine`, which usually works fine.
- If `npm install` fails, you might need to configure a registry mirror in the Dockerfile (not usually necessary for Alpine in Volcengine).
