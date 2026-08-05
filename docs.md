# CMS-React — Build & Run

Prerequisites
- Node.js (16+ recommended)
- npm or pnpm

Frontend (CMS-React)
1. Install dependencies

```bash
npm install
```

2. Development

```bash
npm run dev
```

3. Production build

```bash
npm run build
```

Notes
- If TypeScript compile errors appear, fix the TS errors shown by `tsc` before running the Vite build.
- The project expects the backend API (Codeji.CMS.API) to be running for end-to-end testing.

Changes in URL validation
- The backend now accepts absolute `http` or `https` URLs for external links, and allows relative resource keys for logo/cover image fields. If you relied on strict HTTPS validation earlier, update any callers accordingly.

Backend (Codeji.CMS.API)

1. Restore and build (from repository root or the backend folder):

```bash
cd "..\CMS-Backend-Core\Codeji.CMS.API"
dotnet restore
dotnet build
dotnet run
```

2. Ensure the backend `appsettings.Development.json` contains correct connection strings and any required secrets.

Troubleshooting
- If frontend fetches return 500, check the backend logs and confirm API endpoints are healthy.
- For SignalR or WebSocket errors, confirm `SignalR` hub configuration and CORS settings on the backend.

Contact
- If you want, I can also run the backend build and attempt to reproduce the API 500s locally.
