# AI Code Reviewer - Production & Vercel Deployment Guide

This project is built as a production-ready, full-stack application combining a high-performance modern client with a resilient serverless backend powered by Google Gemini AI.

---

## 🚀 One-Click / Manual Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (GitHub Import)

1. **Push to GitHub**:
   Ensure your changes are committed and pushed to your GitHub repository:
   ```bash
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** → **"Project"**.
   - Select your repository: `Raj-Panwar/AICode-Reviewer`.

3. **Configure Build & Framework Settings**:
   - **Framework Preset**: `Vite` (or `Other`)
   - **Build Command**: `npm run build` (configured automatically in `vercel.json`)
   - **Output Directory**: `dist` (configured automatically in `vercel.json`)

4. **Set Environment Variables**:
   Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
   - `GITHUB_TOKEN` *(Optional)*: A GitHub Personal Access Token to increase GitHub API rate limits.
   - `JWT_SECRET` *(Optional)*: Custom secret key for authentication tokens.

5. **Deploy**:
   - Click **Deploy**.
   - Vercel will build the frontend assets into `dist/` and automatically route all `/api/*` endpoints to the serverless function in `api/index.ts`.

---

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add your environment variable when prompted or via CLI:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🏗️ Architecture & File Structure

```text
├── api/
│   └── index.ts                 # Universal Vercel Serverless Function entry point (/api/*)
├── html/                        # Clean multi-page frontend views
│   ├── index.html               # High-converting landing page
│   ├── dashboard.html           # Real-time metrics & health score
│   ├── new-review.html          # 3 input workflows (Editor, File, GitHub)
│   ├── review.html              # Detailed inspection, diff, Big-O analysis & mentor advice
│   ├── reviews.html             # Filterable review history table
│   ├── repositories.html        # GitHub repository connection & tracking
│   ├── complexity.html          # Standalone algorithmic complexity lab
│   └── settings.html            # API modes, preferences & health diagnostics
├── css/                         # Production CSS design system
│   ├── style.css                # Base variables, reset, design tokens
│   ├── components.css           # Cards, buttons, tables, badges, modals
│   └── responsive.css           # Mobile & tablet drawer layout rules
├── js/                          # Client-side ES Modules
│   ├── app.js                   # Application shell & live badge sync
│   ├── api.js                   # Unified REST API client
│   ├── reviewService.js         # Review analysis & history data client
│   ├── repositoryService.js     # GitHub repository management client
│   ├── languageState.js         # Supported languages (9) & templates
│   └── pages/                   # Dedicated page controllers
├── server/                      # Production REST API Engine
│   ├── router.ts                # HTTP router for /api/* endpoints
│   ├── controllers/             # Review, Auth, and GitHub controllers
│   ├── services/                # Gemini AI, Big-O heuristics, Auth & GitHub services
│   ├── database/db.ts           # Resilient storage (memory + /tmp on serverless, data/ on local)
│   └── server.test.ts           # Comprehensive backend test suite (21 test cases)
├── vercel.json                  # Vercel deployment & routing configuration
├── vite.config.ts               # Multi-page build & dev server middleware
└── package.json                 # Dependency manifest & build scripts
```

---

## 🧪 Testing & Verification

Run the automated backend test suite:
```bash
npm test
```

Run type checking & linting:
```bash
npm run lint
```

Build production bundle:
```bash
npm run build
```
