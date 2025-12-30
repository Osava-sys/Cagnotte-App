# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cagnotte App is a French crowdfunding platform (cagnotte = money pool/crowdfunding). The application allows users to create fundraising campaigns and receive contributions from supporters.

## Development Commands

### Backend (Express/Node.js)
```bash
cd backend
npm install         # Install dependencies
npm run dev         # Start development server with nodemon (port 5000)
npm start           # Start production server
```

### Frontend (React)
```bash
cd frontend
npm install         # Install dependencies
npm start           # Start development server (port 3000)
npm run build       # Build for production
npm test            # Run tests
```

### Environment Setup
1. Copy `backend/.env.example` to `backend/.env`
2. Required variables: `MONGODB_URI`, `JWT_SECRET` (production)
3. Optional: Stripe keys for payments, SMTP for emails

## Architecture

### Backend (`backend/src/`)
- **Express REST API** with MongoDB (Mongoose ODM)
- **Authentication**: JWT-based with bcrypt password hashing
- **File structure**:
  - `server.js` - Entry point, middleware setup, route registration
  - `config/` - Environment config (`env.js`), database connection, Stripe setup
  - `models/` - Mongoose schemas (User, Campaign, Contribution)
  - `controllers/` - Business logic for each resource
  - `routes/` - Route definitions with validation middleware
  - `middlewares/` - Auth verification, file uploads (multer), validation (express-validator)

### Frontend (`frontend/src/`)
- **React 19** with React Router v6
- **State management**: Local state + React Query for server state
- **UI**: Material UI components with custom CSS
- **Payments**: Stripe integration (@stripe/react-stripe-js)
- **File structure**:
  - `app.js` - Main component with routing
  - `pages/` - Route components (Home, CampaignDetail, Dashboard, Login, etc.)
  - `components/` - Reusable UI components
  - `services/api.js` - API client with fetch wrapper and auth helpers
  - `services/stripe.js` - Stripe payment integration

### API Endpoints
- `/api/auth/*` - Authentication (register, login, me, refresh-token)
- `/api/campaigns/*` - CRUD operations for campaigns
- `/api/contributions/*` - Contribution management
- `/api/payments/*` - Stripe payment processing and webhooks

### Data Models
- **Campaign**: Title, description, goalAmount, currentAmount, status (draft/pending/active/successful/expired/cancelled), category, creator reference
- **Contribution**: Links user to campaign with amount and payment status
- **User**: Email, password (hashed), name, profile info

## Key Patterns

### Backend Response Format
All API responses follow: `{ success: boolean, data?: any, error?: string }`

### Frontend API Client
Use the `api` object from `services/api.js`:
```javascript
import { api, auth } from './services/api';
api.get('/campaigns');
api.post('/contributions/campaign/:id', { amount });
```

### Authentication Flow
- Token stored in localStorage
- `auth.isAuthenticated()` checks for valid token
- Protected routes redirect to `/login?from=<path>`

### Stripe Webhook
The webhook endpoint (`/api/payments/webhook`) must be registered **before** body parsers to receive raw body for signature verification.

## Language Note
Code comments, error messages, and UI text are primarily in French. Variable names and code structure follow English conventions.
