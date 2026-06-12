# PayBridge AI — B2B Payment Intelligence Workspace

This is the workspace for **PayBridge AI**, a payment intelligence platform built to help SMEs evaluate payment cycle risks and negotiate terms.

## Repository Structure

The workspace is organized into two primary subdirectories:

- **`/frontend`**: Re-architected client-side Single Page Application (React 19, Vite, Tailwind CSS v4, Lucide Icons, and Recharts) configured with a development proxy.
- **`/backend`**: Production-ready Express API (Node.js, TypeScript, Winston Logger, and Multer) integrated with Firebase, OCR Parsing (`pdf-parse`), and local AI (`Ollama Llama 3`).

---

## Getting Started

### 1. Pre-requisites
- Node.js (v18+)
- Ollama (Optional, for real local AI model analysis. Install from [ollama.com](https://ollama.com))

---

### 2. Backend Setup & Run

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables. Copy the example template:
   ```bash
   cp .env.example .env
   ```
   *(By default, the server runs in **mock fallback mode** out-of-the-box if Firebase keys are empty).*

3. Start the server in development mode:
   ```bash
   npm run dev
   ```
   The backend API will start on `http://localhost:5000`.

---

### 3. Frontend Setup & Run

1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the Vite client dev server:
   ```bash
   npm run dev
   ```
   The frontend UI will start on `http://localhost:3000`. Any request targeting `/api/*` is automatically proxied to the backend on port `5000`.

---

## Compiling for Production

To compile both services for production:

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build
```
