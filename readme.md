# Footstats

## About Project
Footstats is a full-stack football management platform where players, clubs, and tournament organizers can manage teams, fixtures, tournaments, communication, and match data in one place.

## Functionalities
- User authentication with email/password login and JWT-based authorization.
- Email verification flow with code verification and resend verification support.
- Google login support.
- Player profile management (view, update, delete, upload profile photo).
- Player stats and club-wise player listing.
- Club management (create, update, delete, upload club logo, search clubs).
- Club member management with role controls (add member, remove member, update role, leave club).
- Club join request workflow (request, review, approve, reject, status tracking).
- Tournament management (create, update, delete, list, my tournaments, enrolled tournaments).
- Tournament enrollment workflow (club join requests, admin review, registration status updates).
- Tournament status and enrollment status control.
- Schedule management for clubs and tournaments (create, view, update, delete).
- Schedule request flow (create request, approve/reject requests).
- Match management (create, list, update, delete, schedule-based retrieval).
- Match lineup management (single and bulk lineup operations).
- Match events tracking (create, update, delete, fetch by match).
- Club messaging module (list messages, send message, delete message).
- Notification system (fetch notifications, unread count, mark one/all as read).
- Payment integration endpoints (initiate payment, check payment status, fetch transaction by product).
- Location search and location recommendation endpoints.
- File uploads support for user profiles and club logos.

## How To Run

### Prerequisites
- Node.js (LTS recommended)
- npm
- PostgreSQL database

### 1. Install dependencies
From project root:

```bash
npm install
```

### 2. Configure environment variables
Create `Backend/.env` and set at least:

```env
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_direct_postgresql_connection_string"
JWT_SECRET="your_jwt_secret"
PORT=5555
FRONTEND_URL="http://localhost:5173"
EMAIL_USER="your_email"
EMAIL_PASSWORD="your_email_app_password"
GOOGLE_CLIENT_ID="your_google_client_id"
```

### 3. Run database migration and generate Prisma client

```bash
cd Backend
npx prisma migrate dev
npx prisma generate
cd ..
```

### 4. (Optional) Seed database

```bash
cd Backend
npm run seed
cd ..
```

### 5. Start development servers (frontend + backend)
From project root:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5555`

## Deployment
Frontend is deployed at: `https://footstatsnp.vercel.app`

## Developed By
- Rakshak Sigdel
- Rojash Thapa
- Smana Upreti
- Bibek Chaudhary
