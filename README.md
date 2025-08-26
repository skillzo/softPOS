# SoftPOS Transaction Handler

A simple NFC tap-to-pay transaction handler for Nigerian payments built with Node.js, Express, and SQLite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
```

Server runs on `http://localhost:3000`

## API Endpoints

### Health Check

```bash
GET /health
curl http://localhost:3000/health
```

### Process Transaction

```bash
POST /transaction
curl -X POST http://localhost:3000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "amount": 1000.00,
    "currency": "NGN",
    "merchantId": "MERCHANT001",
    "reference": "TXN12345"
  }'
```

### Get Transactions

```bash
# All transactions
GET /transactions
curl http://localhost:3000/transactions

# Filter by status
GET /transactions?status=SUCCESS
curl "http://localhost:3000/transactions?status=DECLINED"

# Filter by merchant
GET /transactions?merchantId=MERCHANT001
curl "http://localhost:3000/transactions?merchantId=MERCHANT001"

# Pagination
GET /transactions?page=1&limit=10
curl "http://localhost:3000/transactions?page=1&limit=5"
```

### Get Transaction by ID

```bash
GET /transactions/:id
curl http://localhost:3000/transactions/{transaction-id}
```

## Response Examples

**Success Response:**

```json
{
  "status": "SUCCESS",
  "transaction": {
    "id": "uuid-string",
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "amount": 1000.0,
    "currency": "NGN",
    "merchantId": "MERCHANT001",
    "reference": "TXN12345",
    "status": "SUCCESS",
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
}
```

**Decline Response:**

```json
{
  "status": "DECLINED",
  "reasonCode": "14",
  "message": "Invalid card number"
}
```

## Response Codes

| Code | Message              | Description                 |
| ---- | -------------------- | --------------------------- |
| `00` | Transaction approved | Successful transaction      |
| `14` | Invalid card number  | Failed Luhn algorithm check |
| `54` | Card expired         | Card expiry date has passed |
| `13` | Invalid amount       | Amount validation failed    |
| `05` | General decline      | Other validation failures   |

## Validation Rules

### Card Number

- Must be 13-19 digits
- Must pass Luhn algorithm validation
- Only Visa and Mastercard accepted

### Expiry Date

- Month: 1-12
- Year: Current year or future

### Amount

- Must be positive number
- Maximum 2 decimal places

### Currency

- Only NGN (Nigerian Naira) supported

### Merchant ID & Reference

- Alphanumeric characters, underscores, hyphens only
- Merchant ID: Max 20 characters
- Reference: Max 50 characters

## Test Data

### Valid Cards

```json
// Visa
"4111111111111111"
"4012888888881881"

// Mastercard
"5555555555554444"
"5105105105105100"
```

### Invalid Cards (for testing declines)

```json
"4111111111111112"  // Fails Luhn check
"5555555555554445"  // Fails Luhn check
```

### Sample Test Requests

**Valid Transaction:**

```json
{
  "cardNumber": "4111111111111111",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "amount": 5000.0,
  "currency": "NGN",
  "merchantId": "MERCHANT001",
  "reference": "TXN001"
}
```

**Invalid Card:**

```json
{
  "cardNumber": "4111111111111112",
  "expiryMonth": 12,
  "expiryYear": 2025,
  "amount": 1000.0,
  "currency": "NGN",
  "merchantId": "MERCHANT001",
  "reference": "TXN002"
}
```

**Expired Card:**

```json
{
  "cardNumber": "4111111111111111",
  "expiryMonth": 1,
  "expiryYear": 2020,
  "amount": 1000.0,
  "currency": "NGN",
  "merchantId": "MERCHANT001",
  "reference": "TXN003"
}
```

## Logging

- `logs/logs.log` - All application logs
- `logs/transactions.log` - Transaction-specific logs only

## Environment Configuration

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./data/transactions.db
LOG_PATH=./logs/logs.log
TRANSACTION_LOG_PATH=./logs/transactions.log
```
