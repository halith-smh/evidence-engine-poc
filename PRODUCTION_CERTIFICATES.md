# Production Certificate Setup Guide

## Overview

This PoC uses **self-signed certificates** which are perfect for testing but NOT trusted in production. For production, you need certificates from trusted Certificate Authorities (CAs).

---

## Certificate Types - Critical Distinction

### ❌ SSL/TLS Certificates (For HTTPS)
- **Purpose:** Encrypt web traffic between browser and server
- **Used For:** `https://yourdomain.com`
- **Example:** Let's Encrypt, DigiCert SSL
- **Cannot Be Used For:** PDF signing
- **Why:** Different key usage extensions

### ✅ Document Signing Certificates (For PDFs)
- **Purpose:** Digitally sign documents
- **Used For:** PDF signatures that show as "Valid" in Adobe Acrobat
- **Example:** DigiCert Document Signing
- **Cannot Be Used For:** HTTPS encryption
- **Why:** Different purpose and trust chain

---

## Obtaining Production PDF Signing Certificates

### Step 1: Choose a Certificate Authority

#### Option A: DigiCert (Recommended - Highest Trust)
- **URL:** https://www.digicert.com/signing/document-signing-certificates
- **Price:** $400-600/year
- **Validation Time:** 3-5 business days
- **Trust Level:** Pre-trusted by Adobe (AATL member)

**Process:**
1. Create account on DigiCert
2. Submit organization verification documents:
   - Business registration
   - D&B number (if applicable)
   - Authorized signatory details
3. Complete domain/email validation
4. Receive certificate as `.pfx` or `.p12` file

#### Option B: GlobalSign
- **URL:** https://www.globalsign.com/en/document-signing
- **Price:** $200-400/year
- **Validation Time:** 2-4 business days
- **Trust Level:** Adobe trusted

#### Option C: Sectigo
- **URL:** https://sectigo.com/ssl-certificates-tls/code-signing
- **Price:** $150-300/year
- **Validation Time:** 1-3 business days
- **Trust Level:** Adobe trusted

### Step 2: Validation Requirements

Certificate Authorities will verify:

1. **Organization Identity**
   - Legal business name
   - Business registration number
   - Address verification

2. **Domain Ownership** (if applicable)
   - Email to admin@yourdomain.com
   - DNS TXT record
   - File upload to website

3. **Authorized Signatory**
   - Person authorized to request certificate
   - Phone verification
   - Document verification

### Step 3: Certificate Delivery

You'll receive:
```
your-org.p12          # Certificate bundle
password.txt          # Password for P12 file
certificate-chain.pem # CA chain (optional)
instructions.pdf      # Installation guide
```

---

## Migrating from Self-Signed to Production Certificate

### Current Code (Development - Self-Signed):
```javascript
// services/certificateService.js
export async function generateCertificate() {
  // Generates self-signed certificate
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.sign(keys.privateKey, forge.md.sha256.create());
  // ...
}
```

### Production Code (Using Real Certificate):

**Option 1: Environment Variable (Recommended)**

`.env.production`:
```env
PORT=5000
MONGODB_URI=mongodb://mongo-prod:27017/chain_of_custody
SOLANA_NETWORK=mainnet-beta
NODE_ENV=production

# Production Certificate
CERT_P12_PATH=/secure/certs/your-org-document-signing.p12
CERT_PASSWORD=your-secure-password-from-ca
```

**Update `services/certificateService.js`:**
```javascript
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

export async function loadProductionCertificate() {
  console.log('🔐 Loading production certificate...');

  // Check if production certificate is configured
  const certPath = process.env.CERT_P12_PATH;
  const certPassword = process.env.CERT_PASSWORD;

  if (certPath && fs.existsSync(certPath)) {
    console.log('✅ Using production certificate from:', certPath);

    const p12Buffer = fs.readFileSync(certPath);

    return {
      p12Buffer,
      password: certPassword,
      type: 'production'
    };
  }

  // Fallback to self-signed for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️  Using self-signed certificate (development only)');
    return await generateCertificate();
  }

  throw new Error('Production certificate not configured! Set CERT_P12_PATH and CERT_PASSWORD');
}
```

**Update `server.js`:**
```javascript
// Replace generateCertificate() call:
// OLD:
// const certificateData = await generateCertificate();

// NEW:
const certificateData = await loadProductionCertificate();
```

**Option 2: Kubernetes Secret (For containerized deployments)**

```yaml
# kubernetes/certificate-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: pdf-signing-cert
type: Opaque
data:
  certificate.p12: <base64-encoded-p12-file>
  password: <base64-encoded-password>
```

Mount in deployment:
```yaml
volumes:
  - name: cert-volume
    secret:
      secretName: pdf-signing-cert
volumeMounts:
  - name: cert-volume
    mountPath: /secure/certs
    readOnly: true
```

---

## Certificate Security Best Practices

### 1. Storage
- ✅ Store P12 file outside web root
- ✅ Use environment variables for password
- ✅ Set file permissions: `chmod 400 certificate.p12`
- ✅ Encrypt at rest (use Kubernetes secrets, AWS Secrets Manager, etc.)
- ❌ Never commit certificate to Git
- ❌ Never hardcode password in code

### 2. Access Control
```bash
# Production server setup
mkdir -p /secure/certs
chown app-user:app-user /secure/certs
chmod 700 /secure/certs
cp your-org.p12 /secure/certs/
chmod 400 /secure/certs/your-org.p12
```

### 3. Rotation
- Set calendar reminder for certificate expiration
- Typically 1-3 years validity
- Update certificate 30 days before expiration
- Test new certificate in staging first

### 4. Backup
```bash
# Encrypted backup
tar -czf cert-backup-$(date +%Y%m%d).tar.gz /secure/certs/
openssl enc -aes-256-cbc -salt -in cert-backup-*.tar.gz -out cert-backup-encrypted.tar.gz.enc
# Store encrypted backup in secure location (S3, vault, etc.)
```

---

## Verifying Production Certificate

### Test Before Deployment:

**1. Check Certificate Details:**
```bash
# Extract certificate info from P12
openssl pkcs12 -in your-org.p12 -clcerts -nokeys | openssl x509 -noout -text

# Look for:
# - Issuer: CN=DigiCert (or other CA)
# - Subject: O=Your Organization Name
# - Extended Key Usage: Document Signing
# - Validity dates
```

**2. Test Signing:**
```bash
# Start server with production cert
CERT_P12_PATH=/path/to/your-org.p12 CERT_PASSWORD=yourpassword npm start

# Sign a test document
# Download and open in Adobe Acrobat
# Should show: "Signed and all signatures are valid" with green checkmark
```

**3. Verify in Adobe Acrobat:**
- Open signed PDF
- Click signature panel
- Should show: ✅ "Signed by: Your Organization Name"
- Should show: ✅ "Certificate issued by: DigiCert" (or your CA)
- Should NOT show warnings about unknown certificate

---

## Cost Comparison

| Provider | Annual Cost | Validation Time | Adobe Trust | Support |
|----------|-------------|-----------------|-------------|---------|
| **DigiCert** | $400-600 | 3-5 days | AATL (highest) | 24/7 |
| **GlobalSign** | $200-400 | 2-4 days | AATL | Business hours |
| **Sectigo** | $150-300 | 1-3 days | AATL | Business hours |
| **Self-Signed** | $0 | Instant | ❌ Not trusted | N/A |

---

## Additional Production Considerations

### 1. Solana Mainnet Migration
```javascript
// .env.production
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**Important:** Mainnet transactions cost real SOL
- Each transaction: ~0.000005 SOL (~$0.0001)
- Ensure wallet has sufficient balance
- Consider using Helius/QuickNode for reliable RPC

### 2. MongoDB Production Setup
```javascript
MONGODB_URI=mongodb://admin:password@mongo-cluster:27017/chain_of_custody?authSource=admin&replicaSet=rs0
```

### 3. HTTPS/SSL for API
Your domain SSL certificate is still needed for:
- ✅ Encrypting API traffic (https://api.yourdomain.com)
- ✅ Protecting user credentials
- ✅ Meeting compliance requirements

But it's separate from PDF signing certificate!

---

## Production Deployment Checklist

- [ ] Purchase document signing certificate from CA
- [ ] Complete organization validation (3-5 days)
- [ ] Receive P12 certificate file
- [ ] Store certificate securely (outside web root)
- [ ] Set CERT_P12_PATH environment variable
- [ ] Set CERT_PASSWORD in secure vault
- [ ] Test signing in staging environment
- [ ] Verify signature in Adobe Acrobat (green checkmark)
- [ ] Update to Solana mainnet
- [ ] Configure MongoDB replica set
- [ ] Set up certificate expiration monitoring
- [ ] Document certificate renewal process
- [ ] Create encrypted backup

---

## FAQ

**Q: Can I use my Let's Encrypt certificate?**
A: No. Let's Encrypt issues SSL/TLS certificates for HTTPS, not document signing certificates.

**Q: Can I use the same certificate for code signing and document signing?**
A: Technically possible if CA allows dual-purpose cert, but best practice is separate certificates.

**Q: Do I need a different certificate for each environment?**
A: No, you can use the same production certificate across environments. But keep dev/staging with self-signed for cost savings.

**Q: What happens if my certificate expires?**
A: New signatures will fail. Existing signatures remain valid but show expiration date. Users may see warnings.

**Q: Can users verify signatures offline?**
A: Yes, if their Adobe Acrobat has the CA's root certificate (all major CAs are pre-installed).

---

## Support Resources

- **DigiCert Support:** https://www.digicert.com/support
- **Adobe AATL (Approved Trust List):** https://helpx.adobe.com/acrobat/kb/approved-trust-list2.html
- **PDF Signature Standards:** https://www.iso.org/standard/51502.html (ISO 32000-1)

---

## Next Steps

1. Evaluate CA providers based on budget and trust requirements
2. Initiate certificate purchase and validation process
3. While waiting for certificate, continue testing with self-signed
4. Once received, update production environment variables
5. Test thoroughly in staging before production deployment

**Estimated Timeline:**
- Certificate purchase: 1 day
- Organization validation: 3-5 business days
- Certificate issuance: 1 day
- Testing and deployment: 1-2 days
- **Total: ~1-2 weeks**
