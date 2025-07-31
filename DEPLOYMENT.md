# PyLingo Production Deployment Guide

This guide covers deploying PyLingo to production with full Docker functionality.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificates (for HTTPS)
- Server with at least 2GB RAM and 20GB storage

## Quick Start

1. **Clone and configure:**
   ```bash
   git clone <your-repo>
   cd pylingo
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   # Required: Set strong passwords and secrets
   POSTGRES_PASSWORD=your_secure_password
   JWT_SECRET=your_long_random_jwt_secret
   
   # Optional: Configure your domain
   DOMAIN=your-domain.com
   ```

3. **Deploy:**
   ```bash
   ./deploy.sh
   ```

That's it! PyLingo will be available at http://localhost (or your domain).

## Detailed Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

#### Required Variables
- `POSTGRES_PASSWORD`: Strong password for PostgreSQL
- `JWT_SECRET`: Long random string for JWT token signing
- `POSTGRES_USER`: Database username (default: pylingo_user)

#### Optional Variables
- `DOMAIN`: Your domain name for production
- `SMTP_*`: Email configuration for user notifications
- `REDIS_URL`: Redis connection string (auto-configured)

### Docker Execution Setup

PyLingo uses Docker for advanced Python lessons (web frameworks, databases, etc.):

1. **Docker Socket Access**: The backend container has access to the Docker socket
2. **Security**: Containers run with resource limits and network isolation
3. **Supported Features**:
   - Flask/Django web applications
   - Database connections (SQLite, PostgreSQL)
   - External Python packages
   - File I/O operations

### SSL/HTTPS Setup

For production with HTTPS:

1. **Get SSL certificates** (Let's Encrypt recommended):
   ```bash
   certbot certonly --standalone -d your-domain.com
   ```

2. **Update nginx.conf**:
   - Uncomment SSL server block
   - Update certificate paths
   - Set your domain name

3. **Redeploy**:
   ```bash
   ./deploy.sh
   ```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     Nginx       │    │     FastAPI      │    │   PostgreSQL    │
│   (Frontend)    │────│    (Backend)     │────│   (Database)    │
│   Port 80/443   │    │    Port 8000     │    │   Port 5432     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              │ Docker Socket
                              ▼
                       ┌─────────────────┐
                       │ Docker Engine   │
                       │ (Code Execution)│
                       └─────────────────┘
```

## Monitoring

### Health Checks
- Frontend: `GET /health`
- Backend: `GET /health`
- Database: Built into Docker Compose

### Logs
```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Resource Monitoring
```bash
# Container stats
docker stats

# Disk usage
docker system df
```

## Maintenance

### Updates
```bash
git pull origin main
./deploy.sh
```

### Database Backup
```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U pylingo_user pylingo > backup.sql
```

### Database Restore
```bash
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U pylingo_user pylingo < backup.sql
```

### Scaling
To handle more users, you can scale the backend:
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## Troubleshooting

### Docker Execution Not Working
1. Check Docker daemon is running: `docker ps`
2. Verify backend container has Docker socket access
3. Check backend logs: `docker-compose logs backend`

### Database Connection Issues
1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify DATABASE_URL in .env
3. Check database logs: `docker-compose logs postgres`

### Performance Issues
1. Monitor resources: `docker stats`
2. Check disk space: `df -h`
3. Review application logs for slow queries

### SSL Certificate Issues
1. Verify certificates exist and are readable
2. Check nginx logs: `docker-compose logs frontend`
3. Test SSL: `openssl s_client -connect your-domain.com:443`

## Security Considerations

1. **Environment Variables**: Never commit `.env` file
2. **Firewall**: Only expose necessary ports (80, 443, 22)
3. **Updates**: Regularly update Docker images
4. **Monitoring**: Set up log monitoring and alerts
5. **Backups**: Regular database backups
6. **Docker**: Resource limits prevent container abuse

## Cloud Deployment

### AWS EC2
1. Launch t3.medium instance with Ubuntu
2. Install Docker and Docker Compose
3. Configure security groups (ports 80, 443, 22)
4. Follow deployment steps above

### DigitalOcean Droplet
1. Create $20/month droplet with Docker
2. Set up domain and DNS
3. Follow deployment steps above

### Google Cloud Platform
1. Create Compute Engine instance
2. Enable Docker and configure firewall
3. Follow deployment steps above

## Support

For issues:
1. Check logs first: `docker-compose logs`
2. Verify configuration: `cat .env`
3. Test connectivity: `curl http://localhost/health`
4. Review this documentation

## Next Steps

Once deployed, consider:
- Setting up monitoring (Prometheus/Grafana)
- Implementing automated backups
- Adding CDN for static assets
- Setting up logging aggregation
- Implementing user analytics