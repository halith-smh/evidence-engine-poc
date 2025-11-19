# Testing Guide

## Comprehensive Test Scenarios

### Test 1: Single Approver Flow

**Objective**: Test basic signature flow with one approver

**Steps**:
1. Login as Alice
2. Create request with Bob as sole approver
3. Set coordinates: X=50, Y=100, Page=0
4. Login as Bob
5. Sign document
6. Verify:
   - Visual signature appears
   - P12 signature applied
   - Blockchain transaction created
   - Status changed to "completed"

**Expected Result**:
- ✅ Document finalized immediately after Bob signs
- ✅ Blockchain TX visible in Completed view
- ✅ PDF downloadable with all signatures

---

### Test 2: Multiple Approvers Flow

**Objective**: Test sequential signing with multiple approvers

**Steps**:
1. Login as Alice
2. Create request with Bob and Diana as approvers
3. Set different coordinates for each:
   - Bob: X=50, Y=100, Page=0
   - Diana: X=50, Y=200, Page=0
4. Login as Bob, sign
5. Verify status is "in-progress"
6. Login as Diana, sign
7. Verify finalization

**Expected Result**:
- ✅ Status changes: pending → in-progress → completed
- ✅ Both visual signatures visible
- ✅ Finalization only after last signature

---

### Test 3: Multi-Page Document

**Objective**: Test signatures on different pages

**Steps**:
1. Upload a multi-page PDF (3+ pages)
2. Add approvers with different page numbers:
   - Bob: Page 0 (first page)
   - Diana: Page 1 (second page)
3. Complete signing flow

**Expected Result**:
- ✅ Signatures appear on correct pages
- ✅ All pages preserved in final PDF

---

### Test 4: Coordinate Positioning

**Objective**: Verify accurate coordinate mapping

**Test Cases**:

| Case | X   | Y   | Expected Position    |
|------|-----|-----|---------------------|
| A    | 50  | 100 | Top-left area       |
| B    | 300 | 100 | Top-center area     |
| C    | 50  | 500 | Middle-left area    |
| D    | 300 | 700 | Bottom-center area  |

**Steps**:
1. Create 4 separate requests with different coordinates
2. Sign each
3. Download and verify visual placement

**Expected Result**:
- ✅ Signatures appear at specified coordinates
- ✅ No overlap or cutoff

---

### Test 5: Blockchain Verification

**Objective**: Verify blockchain anchoring integrity

**Steps**:
1. Complete a document signing flow
2. Note the transaction signature
3. Visit Solana Explorer
4. Search for transaction
5. Check memo data

**Expected Result**:
- ✅ Transaction found on Solana
- ✅ Status: Success
- ✅ Memo contains document hash
- ✅ Hash matches PDF hash in database

**Verification Command**:
```bash
curl http://localhost:5000/verify/[TX_SIGNATURE]
```

---

### Test 6: Adobe Acrobat Signature Verification

**Objective**: Verify P12 signature in Adobe Acrobat

**Steps**:
1. Complete document and download
2. Open in Adobe Acrobat Reader DC
3. Look for signature panel
4. Click signature panel
5. View certificate details

**Expected Result**:
- ✅ Signature panel visible (blue ribbon)
- ✅ Certificate details viewable
- ✅ Signer: "Chain of Custody System"
- ✅ Date/time present

**Note**: Self-signed cert will show warning - this is expected

---

### Test 7: Concurrent Signing Attempts

**Objective**: Test race conditions

**Steps**:
1. Create request with Bob and Diana
2. Open two browser windows
3. Login as Bob in window 1
4. Login as Diana in window 2
5. Both click "Sign" simultaneously

**Expected Result**:
- ✅ Both signatures recorded
- ✅ No database conflicts
- ✅ Finalization occurs only once

---

### Test 8: Wallet Balance Scenarios

**Objective**: Test behavior with insufficient balance

**Test Cases**:

**Case A: Zero Balance**
1. Don't request airdrop
2. Complete signing flow
3. Observe error handling

**Expected**: Error logged, but PDF still signed (crypto only)

**Case B: Sufficient Balance**
1. Request airdrop
2. Complete flow
3. Verify blockchain anchoring

**Expected**: Full success with blockchain TX

---

### Test 9: Large PDF Files

**Objective**: Test file size limits

**Test Cases**:
- 1MB PDF: Should work ✅
- 5MB PDF: Should work ✅
- 10MB PDF: Should work ✅
- 15MB PDF: Should fail (limit is 10MB) ❌

**Expected Result**:
- ✅ Files under 10MB processed
- ✅ Files over 10MB rejected with error

---

### Test 10: Invalid Inputs

**Objective**: Test error handling

**Test Cases**:

**Invalid File Type**:
- Upload .docx → Should fail ❌
- Upload .jpg → Should fail ❌

**Invalid Coordinates**:
- X: -50 → Should work (renders outside page)
- X: 10000 → Should work (renders outside page)

**Missing Approvers**:
- Create request with no approvers → Should fail ❌

**Invalid Email**:
- Approver email: "not-an-email" → Should accept (mock auth)

---

### Test 11: History Tracking

**Objective**: Verify audit trail

**Steps**:
1. Create request as Alice
2. Sign as Bob
3. Sign as Diana
4. View request details

**Expected History**:
```
1. created - Alice - [timestamp]
2. signed - Bob - [timestamp]
3. signed - Diana - [timestamp]
4. finalized - SYSTEM - [timestamp] with TX signature
```

---

### Test 12: API Endpoints

**Objective**: Test all API endpoints

```bash
# Health Check
curl http://localhost:5000/health
# Expected: 200 OK with system status

# Wallet Info
curl http://localhost:5000/wallet-info
# Expected: Address, balance, network info

# Request Airdrop
curl -X POST http://localhost:5000/request-airdrop \
  -H "Content-Type: application/json" \
  -d '{"amount": 2}'
# Expected: Success with new balance

# Get All Requests
curl http://localhost:5000/requests
# Expected: Array of requests

# Get User Requests
curl http://localhost:5000/requests/alice@example.com
# Expected: Alice's requests only

# Download PDF
curl http://localhost:5000/download/[REQUEST_ID] -o test.pdf
# Expected: PDF file downloaded

# Verify Transaction
curl http://localhost:5000/verify/[TX_SIGNATURE]
# Expected: Transaction details
```

---

### Test 13: Container Restart Persistence

**Objective**: Verify data persistence after restart

**Steps**:
1. Create and complete a request
2. Stop containers: `docker-compose down`
3. Start containers: `docker-compose up`
4. Check if:
   - Requests still exist
   - Wallet address same
   - Uploaded PDFs accessible

**Expected Result**:
- ✅ All data persisted
- ✅ Wallet unchanged
- ✅ PDFs available

---

### Test 14: Frontend Navigation

**Objective**: Test UI navigation flows

**Flows to Test**:

1. **Login → Create → Dashboard**
   - Login as Alice
   - Create request
   - Check it appears in "My Initiated Requests"

2. **Login → Sign → Completed**
   - Login as Bob
   - Sign document
   - Check it appears in Completed after Diana signs

3. **Tab Switching**
   - Switch between Dashboard, Create, Completed
   - Verify no data loss

---

### Test 15: Error Recovery

**Objective**: Test system recovery from errors

**Scenarios**:

**MongoDB Disconnect**:
1. Stop mongo: `docker-compose stop mongo`
2. Try to create request
3. Restart mongo: `docker-compose start mongo`
4. Retry

**Network Issues**:
1. Disable network during signing
2. Observe error
3. Re-enable and retry

---

## Performance Tests

### Load Test: Multiple Requests

```bash
# Create 10 requests rapidly
for i in {1..10}; do
  curl -X POST http://localhost:5000/create-request \
    -F "name=Test $i" \
    -F "category=test" \
    -F "initiator=alice@example.com" \
    -F "pdf=@test.pdf" \
    -F 'approvers=[{"email":"bob@example.com","x":50,"y":100,"pageNumber":0}]'
done
```

### Stress Test: Concurrent Signing

Open 5 browser tabs, login as different users, sign simultaneously.

---

## Security Tests

### Test 16: PDF Tampering Detection

**Objective**: Verify tamper detection

**Steps**:
1. Complete and download a signed PDF
2. Open in PDF editor
3. Add text or modify content
4. Save
5. Open in Adobe Acrobat

**Expected Result**:
- ❌ Signature invalidated
- ⚠️ Warning: "Document has been altered"

---

### Test 17: Blockchain Immutability

**Objective**: Verify blockchain record cannot change

**Steps**:
1. Complete document, note hash
2. Try to modify blockchain record (impossible)
3. Verify hash on chain matches PDF

**Expected Result**:
- ✅ Hash on blockchain immutable
- ✅ Any PDF change results in different hash

---

## Automated Test Script

Save as `test.sh`:

```bash
#!/bin/bash

echo "🧪 Running Chain of Custody Tests..."

# Test 1: Health Check
echo "Test 1: Health Check"
curl -s http://localhost:5000/health | grep "healthy" && echo "✅ PASS" || echo "❌ FAIL"

# Test 2: Wallet Info
echo "Test 2: Wallet Info"
curl -s http://localhost:5000/wallet-info | grep "address" && echo "✅ PASS" || echo "❌ FAIL"

# Test 3: Request Airdrop
echo "Test 3: Request Airdrop"
curl -s -X POST http://localhost:5000/request-airdrop \
  -H "Content-Type: application/json" \
  -d '{"amount": 1}' | grep "success" && echo "✅ PASS" || echo "❌ FAIL"

# Test 4: Get Requests
echo "Test 4: Get Requests"
curl -s http://localhost:5000/requests | grep -q "\[" && echo "✅ PASS" || echo "❌ FAIL"

echo "✅ All basic tests completed!"
```

Run: `chmod +x test.sh && ./test.sh`

---

## Test Checklist

Use this checklist for manual testing:

### Functionality Tests
- [ ] Alice can create request
- [ ] Bob can sign document
- [ ] Diana triggers finalization
- [ ] Visual signatures appear correctly
- [ ] P12 signature applied
- [ ] Blockchain transaction created
- [ ] PDF downloadable
- [ ] Solana Explorer link works

### UI Tests
- [ ] Login switcher works
- [ ] All tabs accessible
- [ ] Forms validate input
- [ ] Errors display properly
- [ ] Loading states show
- [ ] Wallet banner updates
- [ ] Airdrop button works

### Integration Tests
- [ ] MongoDB stores data
- [ ] Files upload correctly
- [ ] Coordinates map accurately
- [ ] Status updates properly
- [ ] History tracks actions

### Security Tests
- [ ] Tampering detected
- [ ] Signatures valid
- [ ] Blockchain immutable
- [ ] File size limits enforced

### Performance Tests
- [ ] Handles 10+ requests
- [ ] Concurrent signing works
- [ ] No memory leaks
- [ ] Fast response times (<2s)

---

## Debugging Tips

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# MongoDB only
docker-compose logs -f mongo
```

### Check Database
```bash
docker exec -it chain-custody-mongo mongosh
use chain_of_custody
db.requests.find().pretty()
db.requests.countDocuments()
```

### Check Wallet
```bash
curl http://localhost:5000/wallet-info | jq
```

### Monitor Transactions
Visit: https://explorer.solana.com/?cluster=devnet
Search for your wallet address

---

## Test Environment Reset

To start fresh:

```bash
# Stop and remove everything
docker-compose down -v

# Remove uploaded files
rm -rf uploads/*

# Remove wallet (new one will be generated)
rm wallet.json

# Rebuild
docker-compose up --build
```

---

## Success Criteria

A test is successful if:

1. ✅ No errors in logs
2. ✅ Expected behavior matches actual
3. ✅ Data persists correctly
4. ✅ UI responsive and functional
5. ✅ Blockchain transaction confirmed
6. ✅ PDF signatures valid

---

## Reporting Issues

When reporting bugs, include:

1. Test scenario being executed
2. Expected behavior
3. Actual behavior
4. Error messages (if any)
5. Browser/system info
6. Docker logs
7. Screenshots/videos

---

## Continuous Testing

Recommended testing schedule:

- **After code changes**: Run automated tests
- **Before demo**: Run full manual test suite
- **Weekly**: Performance and load tests
- **Before production**: Complete security audit

---

Happy Testing! 🧪✅
