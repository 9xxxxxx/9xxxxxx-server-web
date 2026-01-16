# Deployment Guide (Volcengine / Linux)

This guide assumes you are deploying to a Linux server (e.g., Ubuntu) on Volcengine (火山引擎).

## Prerequisites

On your server, ensure you have:

1.  **Node.js 18+** installed.
2.  **Git** installed.
3.  **PostgreSQL** database (can be on the same server or a managed RDS).
4.  **PM2** (process manager) installed: `npm install -g pm2`.
5.  **Nginx** (optional, for domain mapping).

## 1. Prepare your Database

Ensure your `.env` file on the server points to the correct database.

```env
DATABASE_URL="postgresql://user:password@localhost:5432/website?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://your-domain.com"
RESEND_API_KEY="re_..."
```

## 2. Get the Code

Clone your repository to the server:

```bash
git clone <your-repo-url>
cd <project-folder>
```

## 3. Install & Build

Run the following commands on the server:

```bash
# Install dependencies
npm install

# Generate Database Client
npx prisma generate

# Update Database Schema (if needed)
npx prisma db push

# Build the application
npm run build
```

## 4. Start with PM2

Use PM2 to keep your app running in the background:

```bash
pm2 start npm --name "website" -- start
```

## 5. Verify

Your app should be running on `http://localhost:3000`.
Use `pm2 logs` to check for errors.

## 6. Nginx Proxy (Recommended)

If you want to access via a domain on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
