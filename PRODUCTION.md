# KTern Evidence Engine - Production Deployment Guide

## Production Checklist

### Security Requirements

#### 1. Certificate Generation
Replace self-signed certificates with CA-issued certificates:

```bash
# Current: Self-signed certificates (Development only)
# Required: CA-issued certificates from trusted authority
```

**Options:**
- **Let's Encrypt**: Free SSL/TLS certificates (recommended for web servers)
- **DigiCert/Sectigo**: Commercial certificates for document signing
- **Internal CA**: If deploying within enterprise network

**Certificate Requirements:**
- **P12/PKCS#12 Format**: For PDF digital signatures
- **Password Protected**: Store password in environment variables
- **Valid Chain of Trust**: Verifiable by Adobe Acrobat and other PDF readers

#### 2. Environment Variables

Create a production `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://username:password@mongo-host:27017/ktern_evidence?authSource=admin

# Solana Configuration
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Certificate Configuration (if using file-based certs)
P12_CERT_PATH=/secure/path/to/certificate.p12
P12_CERT_PASSWORD=your_secure_password

# Optional: Rate Limiting
MAX_FILE_SIZE=52428800
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important:**
- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- Rotate credentials regularly

#### 3. Solana Wallet Security

**Development:** Uses file-based wallet (`wallet.json`)
**Production:** Use one of these approaches:

**Option A: Hardware Wallet Integration**
```javascript
// Recommended for high-value transactions
// Integrate with Ledger or other hardware wallets
```

**Option B: Key Management Service**
```javascript
// Store private keys in AWS KMS, Azure Key Vault, or HSM
```

**Option C: Dedicated Hot Wallet**
```javascript
// Separate wallet for blockchain operations
// Regular monitoring and balance alerts
// Auto-replenishment from cold storage
```

**Security Practices:**
- Never store wallet in source code
- Use environment variables or secure vault
- Monitor wallet balance and transactions
- Set up alerts for unusual activity

### Infrastructure

#### 1. Database (MongoDB)

**Production Setup:**

```yaml
# MongoDB Replica Set (High Availability)
services:
  mongo-primary:
    image: mongo:7.0
    command: mongod --replSet rs0 --bind_ip_all

  mongo-secondary:
    image: mongo:7.0
    command: mongod --replSet rs0 --bind_ip_all

  mongo-arbiter:
    image: mongo:7.0
    command: mongod --replSet rs0 --bind_ip_all
```

**Features:**
- Automatic failover
- Data redundancy
- Read scaling

**Backup Strategy:**
```bash
# Daily automated backups
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)

# Retention: 30 days
# Test restoration monthly
```

#### 2. Application Server

**Scaling Options:**

**Option A: Docker Swarm**
```yaml
version: '3.8'
services:
  backend:
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

**Option B: Kubernetes**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ktern-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ktern-backend
```

**Option C: Cloud Platform**
- **AWS**: Elastic Beanstalk or ECS
- **Azure**: App Service or AKS
- **Google Cloud**: App Engine or GKE

#### 3. Load Balancing

**Nginx Configuration:**

```nginx
upstream ktern_backend {
    least_conn;
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}

server {
    listen 443 ssl http2;
    server_name evidence.ktern.com;

    ssl_certificate /etc/ssl/certs/ktern.crt;
    ssl_certificate_key /etc/ssl/private/ktern.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 50M;

    location /api {
        proxy_pass http://ktern_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        root /var/www/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### Monitoring and Logging

#### 1. Application Monitoring

**Recommended Tools:**
- **Application Performance**: New Relic, DataDog, or Prometheus
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot, Pingdom

**Key Metrics to Monitor:**
- Request throughput (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Database connection pool usage
- Solana transaction success rate
- File upload sizes
- Memory and CPU usage

#### 2. Logging

**Production Logger Configuration:**

```javascript
// Use winston or pino for production
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

**Log Aggregation:**
- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Cloud Options**: CloudWatch, Stackdriver, Azure Monitor
- **SaaS**: Loggly, Papertrail

#### 3. Blockchain Monitoring

**Monitor:**
- Transaction success/failure rates
- Blockchain network status (Solana Devnet vs Mainnet)
- Wallet balance alerts
- Transaction costs

**Solana Explorer:**
- Mainnet: https://explorer.solana.com
- Devnet: https://explorer.solana.com?cluster=devnet

### Backup and Disaster Recovery

#### 1. Database Backups

```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Compress
tar -czf "$BACKUP_DIR/$DATE.tar.gz" "$BACKUP_DIR/$DATE"
rm -rf "$BACKUP_DIR/$DATE"

# Upload to S3 or Azure Blob Storage
aws s3 cp "$BACKUP_DIR/$DATE.tar.gz" s3://ktern-backups/mongodb/

# Cleanup old backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

#### 2. File Storage Backups

**Options:**
- Store PDFs in cloud storage (S3, Azure Blob, Google Cloud Storage)
- Replicate across regions
- Enable versioning for tamper protection

#### 3. Disaster Recovery Plan

**RTO (Recovery Time Objective):** 1 hour
**RPO (Recovery Point Objective):** 24 hours

**Steps:**
1. Restore database from latest backup
2. Deploy application containers
3. Restore uploaded files from cloud storage
4. Verify blockchain data integrity (data on Solana is immutable)
5. Test verification flow with sample documents

### Performance Optimization

#### 1. Caching

**Redis Integration:**
```javascript
// Cache frequently accessed documents
const redis = require('redis');
const client = redis.createClient();

// Cache document verification results (30 minutes)
await client.setEx(`doc:${hash}`, 1800, JSON.stringify(result));
```

#### 2. Database Indexing

```javascript
// Create indexes for faster queries
db.requests.createIndex({ documentHash: 1 });
db.requests.createIndex({ blockchainTxId: 1 });
db.requests.createIndex({ 'initiator.email': 1 });
db.requests.createIndex({ createdAt: -1 });
```

#### 3. CDN for Frontend

**Cloudflare, AWS CloudFront, or Azure CDN:**
- Cache static assets
- Reduce latency globally
- DDoS protection

### Security Hardening

#### 1. API Security

**Rate Limiting:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Input Validation:**
```javascript
import { body, validationResult } from 'express-validator';

app.post('/api/request',
  body('documentName').isLength({ min: 1, max: 255 }),
  body('approvers').isArray({ min: 1, max: 10 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

#### 2. HTTPS Only

```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

#### 3. CORS Configuration

```javascript
import cors from 'cors';

app.use(cors({
  origin: 'https://evidence.ktern.com',
  credentials: true,
}));
```

### Compliance and Auditing

#### 1. Audit Logging

**Log All Critical Actions:**
- Document uploads
- Signature applications
- Blockchain transactions
- Verification attempts
- Administrative actions

**Audit Log Format:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "action": "DOCUMENT_SIGNED",
  "user": "bob@example.com",
  "documentId": "507f1f77bcf86cd799439011",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "result": "success"
}
```

#### 2. Compliance Requirements

**Consider:**
- **GDPR**: EU data protection (if handling EU citizen data)
- **eIDAS**: EU electronic signatures regulation
- **ESIGN Act**: US electronic signature law
- **SOC 2**: If providing SaaS

#### 3. Data Retention

**Policy:**
- Signed documents: 7 years (configurable)
- Audit logs: 7 years
- Blockchain records: Permanent (immutable)

### Deployment Process

#### 1. CI/CD Pipeline

**Example GitHub Actions:**

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Run Tests
        run: npm test

      - name: Build Docker Image
        run: docker build -t ktern-evidence:${{ github.sha }} .

      - name: Push to Registry
        run: docker push ktern-evidence:${{ github.sha }}

      - name: Deploy to Production
        run: |
          ssh production "docker pull ktern-evidence:${{ github.sha }}"
          ssh production "docker-compose up -d"
```

#### 2. Blue-Green Deployment

```bash
# Deploy to green environment
docker-compose -f docker-compose.green.yml up -d

# Run smoke tests
curl https://green.evidence.ktern.com/health

# Switch traffic
# Update load balancer to point to green environment

# Keep blue environment for 24 hours for quick rollback
```

#### 3. Database Migrations

```bash
# Always backup before migration
mongodump --uri="$MONGODB_URI" --out=/backup/pre-migration

# Run migration
npm run migrate

# Verify
npm run migrate:verify
```

### Cost Optimization

#### 1. Solana Network Costs

**Network Comparison:**
| Network | Transaction Cost | Use Case |
|---------|-----------------|----------|
| Mainnet | ~$0.00025 | Production |
| Devnet  | Free          | Development/Testing |
| Testnet | Free          | Staging |

**Estimated Monthly Cost (1000 documents/month):**
- Solana transactions: ~$0.25
- Minimal compared to infrastructure costs

#### 2. Infrastructure Costs

**Small Scale (< 1000 docs/month):**
- Single server: $50-100/month
- MongoDB: $25/month (managed)
- Total: ~$100/month

**Medium Scale (< 10,000 docs/month):**
- 2-3 servers: $150-300/month
- MongoDB replica set: $100/month
- Load balancer: $25/month
- Total: ~$300-500/month

**Large Scale (> 10,000 docs/month):**
- Auto-scaling cluster
- Managed services
- CDN and caching
- Total: $1000+/month

### Support and Maintenance

#### 1. Regular Updates

**Monthly:**
- Security patches
- Dependency updates
- Certificate renewal checks

**Quarterly:**
- Performance optimization review
- Cost analysis
- Disaster recovery testing

#### 2. Incident Response

**On-Call Rotation:**
- 24/7 monitoring
- Escalation procedures
- Runbooks for common issues

**Common Issues:**
| Issue | Solution |
|-------|----------|
| High response time | Scale horizontally, check DB queries |
| Solana transaction failures | Verify network status, check wallet balance |
| PDF processing errors | Check memory limits, validate input files |
| Database connection issues | Check connection pool, verify credentials |

### Migration from Development

#### 1. Pre-Production Checklist

- [ ] Replace self-signed certificates with CA-issued certificates
- [ ] Update environment variables for production
- [ ] Configure production MongoDB with authentication
- [ ] Set up Solana Mainnet wallet with proper security
- [ ] Configure backup procedures
- [ ] Set up monitoring and alerting
- [ ] Configure HTTPS and SSL certificates
- [ ] Test disaster recovery procedures
- [ ] Review and harden security settings
- [ ] Set up logging and log aggregation
- [ ] Configure rate limiting
- [ ] Test with production-like load
- [ ] Document runbooks for operations team

#### 2. Go-Live Steps

1. **T-1 Week**: Deploy to staging environment
2. **T-3 Days**: Load testing and security scanning
3. **T-1 Day**: Final backup of development data
4. **T-0**: Deploy to production (off-peak hours)
5. **T+1 Hour**: Smoke tests and monitoring
6. **T+24 Hours**: Full verification of all flows
7. **T+1 Week**: Post-deployment review

## Support

For production support, contact:
- **Email**: support@ktern.com
- **Emergency**: [On-call number]

## License

Proprietary - KTern
