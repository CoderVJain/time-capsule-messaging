# Time Capsule Messaging System

A REST API backend that allows users to create messages scheduled for future delivery.

## Tech Stack
- **Backend**: Node.js, Express 5
- **Database**: PostgreSQL
- **Auth**: JWT (bcrypt for password hashing)
- **Scheduler**: node-cron (polls DB every minute)

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register with `{ email, password }` |
| POST | `/auth/login` | Login, returns JWT token |

### Messages (requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/messages` | Create scheduled message |
| GET | `/messages` | List all user messages |

### Create Message Body
```json
{
  "recipient_email": "recipient@example.com",
  "message": "Hello from the past!",
  "deliver_at": "2026-06-01T12:00:00Z"
}
```

## Local Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE timecapsule;
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Configure `.env`:
```
PORT=3000
JWT_SECRET=your_secret_key
DATABASE_URL=postgresql://username:password@localhost:5432/timecapsule
```

4. Start:
```bash
npm start
```

## Deployment (Render)

1. Push to GitHub
2. On Render, create a **PostgreSQL** database (free tier)
3. Create a **Web Service** linked to the repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Set environment variables:
   - `DATABASE_URL` → Internal Database URL from the PG instance
   - `JWT_SECRET` → a strong random string
   - `NODE_ENV` → `production`

## Delivery Mechanism

- **node-cron** runs a job every 60 seconds
- Queries all `pending` messages where `deliver_at <= NOW()`
- Updates `status` to `delivered`, sets `delivered_at`
- Appends log entry to `delivery.log`
- Runs immediately on server startup to catch missed deliveries
