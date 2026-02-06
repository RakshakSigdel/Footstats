# Footstat Test Zone

A full-stack application with React frontend and Express backend.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (for Prisma)

## Getting Started

### Quick Start (Recommended)

The project uses `concurrently` to run both frontend and backend simultaneously from the root directory.

1. Install all dependencies (root, backend, and frontend):
   ```bash
   npm install
   ```

2. Set up environment variables:
   - Create a `.env` file in the Backend directory
   - Add required environment variables:
     ```
     DATABASE_URL="your_database_connection_string"
     JWT_SECRET="your_jwt_secret"
     PORT=5555
     ```

3. Run Prisma migrations (from Backend directory):
   ```bash
   cd Backend
   npx prisma migrate dev
   npx prisma generate
   cd ..
   ```

4. Start both frontend and backend in development mode:
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm run start
   ```

The backend will run on `http://localhost:5555` and the frontend on `http://localhost:5173`.

### Manual Setup (Alternative)

If you prefer to run the frontend and backend separately:

#### Backend Setup

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (same as above)

4. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

### Root Directory
- `npm run dev` - Start both frontend and backend in development mode
- `npm run start` - Start both frontend (preview) and backend in production mode
- `npm install` - Install dependencies for all workspaces (root, backend, and frontend)

### Backend
- `npm start` - Run the server in production mode
- `npm run dev` - Run the server in development mode with nodemon (auto-restart on changes)

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

### Backend
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 19
- Vite
- Tailwind CSS
- Axios for API calls

## Project Structure

```
├── Backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── Component/
    │   └── Pages/
    └── package.json
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

ISC
