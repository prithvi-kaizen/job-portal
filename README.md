# Team-1

Team-1 is a minimalist, full-stack job board platform built for clarity and speed. It connects talent with companies through a clean, modern interface, supporting role-based authentication and secure file uploads.

## Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- shadcn/ui
- Zustand (State management)
- React Router DOM
- Framer Motion

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (Authentication)
- bcrypt (Password encryption)
- Multer (File uploads)

## Features

- Role-based Access Control: Distinct interfaces for Candidate and Employer roles.
- Employer Dashboard: Employers can post jobs and track applicants.
- Application Workflow: Candidates can search, bookmark, and apply with PDF resumes.
- Global State: Session management handles authentication persistence.

## Installation and Setup

### Prerequisites
- Node.js
- MongoDB running locally or a MongoDB Atlas URI

### 1. Clone the repository
```bash
git clone https://github.com/prithvi-kaizen/job-portal.git
cd job-portal
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/job-board
JWT_SECRET=your_jwt_secret_key_here
```

Run the backend server:
```bash
node index.js
```

### 3. Frontend Setup
Open a new terminal window.
```bash
cd client
npm install
```

Run the development server:
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

## Deployment Notes

The frontend is configured to deploy to GitHub Pages, while the backend requires a Node.js hosting platform. Ensure the `API_URL` in the frontend store files is updated to point to your live backend endpoint prior to running production builds.
