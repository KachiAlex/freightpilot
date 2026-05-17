# Freightpilot Deployment Guide

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- Redis (optional, for caching)
- Docker (optional, for containerized deployment)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
DJANGO_CORS_ORIGINS=http://localhost:5173,https://yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost:5173,https://yourdomain.com

# Database
POSTGRES_DB=freightpilot
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT
JWT_ACCESS_TOKEN_MINUTES=30
JWT_REFRESH_TOKEN_DAYS=7

# Email
DJANGO_EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DJANGO_DEFAULT_FROM_EMAIL=noreply@freightpilot.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=true

# Frontend
FRONTEND_BASE_URL=https://yourdomain.com

# Security
SECURE_SSL_REDIRECT=true
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=true
SECURE_HSTS_PRELOAD=true
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

## Database Setup

### PostgreSQL Installation

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### Database Creation

```bash
createdb freightpilot
createuser freightpilot_user
psql -U postgres -d freightpilot -c "ALTER USER freightpilot_user WITH PASSWORD 'your-password';"
psql -U postgres -d freightpilot -c "GRANT ALL PRIVILEGES ON DATABASE freightpilot TO freightpilot_user;"
```

### Run Migrations

```bash
cd backend
python manage.py migrate
```

## Backend Deployment

### Local Development

```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/v1`

### Production Deployment

#### Using Gunicorn

```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

#### Using Docker

Create a `Dockerfile` in the backend directory:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

Build and run:

```bash
docker build -t freightpilot-api .
docker run -p 8000:8000 --env-file .env freightpilot-api
```

#### Using Heroku

```bash
heroku create freightpilot-api
heroku addons:create heroku-postgresql:standard-0
heroku config:set DJANGO_SECRET_KEY=your-secret-key
git push heroku main
heroku run python manage.py migrate
```

## Frontend Deployment

### Local Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### Deployment Options

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Docker

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t freightpilot-web .
docker run -p 80:80 freightpilot-web
```

## Static Files Configuration

### Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Serve with Nginx

Create an Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }

    location /media/ {
        alias /path/to/backend/media/;
    }

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## SSL/TLS Configuration

### Using Let's Encrypt with Certbot

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

Update Nginx configuration to use SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring and Logging

### Application Logging

Configure logging in Django settings:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/freightpilot/django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### Health Checks

Add a health check endpoint:

```python
# In config/urls.py
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy'})

urlpatterns = [
    path('health/', health_check),
    # ... other urls
]
```

## Backup and Recovery

### Database Backup

```bash
pg_dump -U freightpilot_user freightpilot > backup.sql
```

### Database Restore

```bash
psql -U freightpilot_user freightpilot < backup.sql
```

### Media Files Backup

```bash
tar -czf media_backup.tar.gz backend/media/
```

## Performance Optimization

### Enable Caching

Install Redis:

```bash
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu
```

Configure Django to use Redis:

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

### Database Optimization

Create indexes:

```bash
python manage.py sqlsequencereset trips | python manage.py dbshell
```

### Frontend Optimization

- Enable gzip compression in Nginx
- Use CDN for static assets
- Enable browser caching

## Troubleshooting

### Database Connection Issues

```bash
psql -U freightpilot_user -h localhost -d freightpilot
```

### Static Files Not Loading

```bash
python manage.py collectstatic --clear --noinput
```

### CORS Errors

Check `DJANGO_CORS_ORIGINS` environment variable matches frontend URL.

### Email Not Sending

Verify email credentials and SMTP settings in `.env` file.

## Support

For issues or questions, please refer to the API documentation or contact support.
