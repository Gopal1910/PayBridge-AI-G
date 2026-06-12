# PayBridge AI — Backend Service

A production-grade, enterprise-scale B2B payment negotiation and invoice intelligence backend. Built with **Node.js**, **Express.js**, and **TypeScript**, integrated with **Firebase (Auth, Firestore, Storage)**, **Ollama Llama 3**, and PDF OCR capabilities.

---

## Architecture Overview

The backend uses a layered architecture to maximize testability, code reuse, and separation of concerns:

- **Entry Point (`src/index.ts`)**: Initializes Express, registers core middlewares (CORS, Helmet security headers, rate limits, morgan logs), mounts modular routers, and captures unhandled exceptions.
- **Routes (`src/routes/*`)**: Standard REST routers mapping parameters, calling validators, and invoking service functions.
- **Middlewares (`src/middlewares/*`)**: Handles auth guards (JWT & Firebase), request size limits, CORS configuration, Multer file parsing, validation, and error translation.
- **Services (`src/services/*`)**: Handles database transactions, company scoping, metrics aggregation, and AI processing.
- **AI Engine (`src/ai/aiService.ts`)**: Interfaces with local Ollama or triggers heuristic fallbacks if Ollama is unreachable.
- **OCR Engine (`src/utils/ocr.ts`)**: Extracts plain text from PDF files using `pdf-parse`.
- **Database/Auth Provider (`src/firebase/*`)**: Connects to Firebase Admin and Client SDKs. Fallbacks to a file-based JSON DB if Firebase credentials are not supplied.

---

## Features

1. **Dual Auth Layer**: Protects routes using standard JWTs (Access + Refresh tokens) with a fallback to verify native Firebase ID tokens. Includes custom Role Guard checking: `Admin`, `Company`, or `Employee`.
2. **Resilient Mock Mode (Zero Configuration)**: Runs out-of-the-box! If Firebase credentials are not found in `.env`, the database layer automatically routes reads and writes to a persistent, structured local file (`data/mock-db.json`) and handles JWT signing locally.
3. **Local Llama 3 Integration**: Processes contract risk analyses and suggests renegotiation structures using local Ollama. Automatically falls back to a regex-based NLP rules model if Ollama is offline.
4. **End-to-End Upload OCR**: 
   - Uploading a **contract PDF** saves the file to Firebase Storage, extracts text via `pdf-parse`, parses term clauses via AI, and stores details.
   - Uploading an **invoice PDF** performs OCR to identify amount, buyer name, and due date, auto-registers the buyer credit score, and creates the invoice record in Firestore.
5. **Unified Dashboard Compilation**: Aggregates total invoices, payments, overdue sums, computed Average Days Sales Outstanding (DSO), and AI working capital forecasts into unified endpoints.

---

## Environment Variables

Create a `.env` file in the `backend/` folder:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_access_secret_key_change_me_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_change_me_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Firebase Admin SDK Configuration (Optional - runs in Mock Database mode if empty)
FIREBASE_PROJECT_ID=paybridge-ai-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@paybridge-ai-dev.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQ...\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK Configuration (Optional)
FIREBASE_API_KEY=AIzaSyAxxxxxxx-xxxxxxxxxxxx
FIREBASE_AUTH_DOMAIN=paybridge-ai-dev.firebaseapp.com
FIREBASE_STORAGE_BUCKET=paybridge-ai-dev.appspot.com

# Local AI Configuration (Ollama)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```

---

## Installation & Running

### Requirements
- Node.js (v18+) or Bun
- Ollama (Optional, for real Llama 3 integration. Download from [ollama.com](https://ollama.com))

### Steps

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Run Dev Mode** (Nodemon + ts-node live reload):
   ```bash
   npm run dev
   ```
   Server starts at `http://localhost:5000`.

3. **Build & Start Production**:
   ```bash
   npm run build
   npm start
   ```

---

## API Documentation & Curl Examples

All API paths are prefixed with `/api`. Protected routes require the header `Authorization: Bearer <access_token>`.

### 1. Authentication (`/api/auth`)

#### Register User
`POST /api/auth/register`
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "passwordHash": "securepassword123",
    "name": "Jane Doe",
    "role": "Company",
    "companyName": "Acme Industries",
    "industry": "Manufacturing"
  }'
```

#### Login User (Returns JWT)
`POST /api/auth/login`
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@acme.com",
    "password": "securepassword123"
  }'
```
*Take note of the returned `accessToken` in the JSON response.*

#### Fetch Profile (Protected)
`GET /api/auth/profile`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5000/api/auth/profile
```

---

### 2. Invoices (`/api/invoices`)

#### Create Invoice
`POST /api/invoices`
```bash
curl -X POST http://localhost:5000/api/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "buyer-xyz-99",
    "buyerName": "Global Retailers Inc",
    "amount": 25000,
    "dueDate": "2026-09-30"
  }'
```

#### List Invoices
`GET /api/invoices`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5000/api/invoices
```

---

### 3. File Uploads & OCR (`/api/upload`)

#### Upload Contract PDF
`POST /api/upload/contract`
This accepts a form-data payload with a `file` field containing a PDF contract document.
```bash
curl -X POST http://localhost:5000/api/upload/contract \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/contract.pdf"
```

#### Upload Invoice PDF (Autoconfigures invoice & registers buyer)
`POST /api/upload/invoice`
This runs OCR to extract key numbers/dates, auto-adds the invoice, and saves it.
```bash
curl -X POST http://localhost:5000/api/upload/invoice \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/invoice.pdf"
```

---

### 4. Dashboards & Analytics (`/api/dashboard` / `/api/analytics`)

#### Overview Cards Metrics
`GET /api/dashboard/overview`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5000/api/dashboard/overview
```

#### Cashflow forecast & Top Insights
`GET /api/dashboard/analytics`
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" http://localhost:5000/api/dashboard/analytics
```
