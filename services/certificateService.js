import forge from 'node-forge';
import fs from 'fs';

/**
 * Main function to load certificate - supports both production and development
 * In production: loads real CA-issued certificate from file
 * In development: generates self-signed certificate
 */
export async function loadCertificate() {
  // Check for production certificate configuration
  const certPath = process.env.CERT_P12_PATH;
  const certPassword = process.env.CERT_PASSWORD;

  // Production mode: use real certificate
  if (certPath && fs.existsSync(certPath)) {
    console.log('🔐 Loading production certificate from:', certPath);

    const p12Buffer = fs.readFileSync(certPath);

    console.log('✅ Production certificate loaded successfully');
    console.log('📋 Certificate type: CA-issued (trusted)');

    return {
      p12Buffer,
      password: certPassword,
      type: 'production'
    };
  }

  // Development mode: generate self-signed certificate
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '❌ Production mode requires real certificate!\n' +
      'Please set CERT_P12_PATH and CERT_PASSWORD environment variables.\n' +
      'See PRODUCTION_CERTIFICATES.md for details.'
    );
  }

  console.log('⚠️  No production certificate found - using self-signed (development only)');
  return generateSelfSignedCertificate();
}

/**
 * Generates a self-signed X.509 certificate in P12 format
 * This certificate will be used to digitally sign PDFs
 * ⚠️ For development only - not trusted in production!
 */
export function generateSelfSignedCertificate() {
  console.log('🔐 Generating self-signed X.509 certificate for PDF signing...');

  // Generate RSA key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);

  // Create certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);

  const attrs = [{
    name: 'commonName',
    value: 'Chain of Custody System'
  }, {
    name: 'countryName',
    value: 'US'
  }, {
    shortName: 'ST',
    value: 'California'
  }, {
    name: 'localityName',
    value: 'San Francisco'
  }, {
    name: 'organizationName',
    value: 'Chain of Custody PoC'
  }, {
    shortName: 'OU',
    value: 'Digital Signature Authority'
  }];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 6, // URI
      value: 'http://chainofcustody.local'
    }]
  }]);

  // Self-sign certificate
  cert.sign(keys.privateKey, forge.md.sha256.create());

  // Create P12 (PKCS#12) bundle
  const p12Asn = forge.pkcs12.toPkcs12Asn1(
    keys.privateKey,
    [cert],
    'password', // Password for the P12 file
    {
      algorithm: '3des',
      generateLocalKeyId: true,
      friendlyName: 'Chain of Custody Signing Certificate'
    }
  );

  const p12Der = forge.asn1.toDer(p12Asn).getBytes();
  const p12Buffer = Buffer.from(p12Der, 'binary');

  console.log('✅ Certificate generated successfully');

  return {
    p12Buffer,
    password: 'password',
    certificate: cert,
    privateKey: keys.privateKey
  };
}
