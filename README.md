# StockSmart

Medicine inventory management with low-stock alerts and smart reorder suggestions. Built for medical stores.

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Query  
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer

## Project Structure

```
├── src/                  # React frontend
├── server/               # Express backend (deploy separately)
│   ├── src/
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── lib/          # DB, auth, email utilities
│   ├── index.js          # Server entry point
│   └── .env.example      # Backend env template
├── .env.example           # Frontend env template
└── vercel.json            # Frontend SPA config
```

## Local Development

### 1. Install dependencies

```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your MongoDB URI, JWT secret, and Gmail SMTP credentials.

### 3. Run both frontend and backend

```bash
npm run dev:all
```

Or run them separately:

```bash
npm run dev        # Frontend on http://localhost:8080
npm run dev:api    # Backend on http://localhost:5001
```

## Deployment

### Backend (Render)

1. Create a new **Web Service** on Render
2. Set **Root Directory** to `server`
3. Set **Build Command** to `npm install`
4. Set **Start Command** to `npm start`
5. Add all environment variables from `server/.env.example`

### Frontend (Vercel)

1. Import the repo on Vercel
2. Set **Framework Preset** to Vite
3. Add environment variable: `VITE_API_URL` = your Render backend URL (e.g. `https://stocksmart-api.onrender.com`)

## Features

- Secure JWT authentication (signup / login)
- Add medicines manually or via CSV import
- Record sales with automatic stock deduction
- Low-stock and critical-stock visual indicators
- Smart reorder suggestions based on sales history
- Automatic email alerts when stock drops to critical/low levels
- Manual email alert reports on demand
- Sample data loader for quick demo
