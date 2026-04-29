# NexusDesk

**A modern, premium productivity desktop-style web app that feels like a personal command center.**

NexusDesk combines the power of a workspace manager with the elegance of a desktop application. It's built with a modern MERN stack and designed to look professional, minimal, and beautiful.

## ✨ Features

- **🎯 Dashboard** - Summary cards, today's tasks, streak tracking, activity feed
- **📝 Notes** - Markdown notes with tags, folders, and starred favorites
- **✅ Tasks** - Todo/doing/done status, priorities, due dates, filtering
- **⏱️ Focus Mode** - Pomodoro timer, session tracking, focus statistics
- **🤖 AI Assistant** - Chat interface with conversation history
- **🔗 Jobs & Links** - Save and organize resources by category
- **📁 File Explorer** - Folder-based navigation with modern UI
- **⚡ Command Palette** - Ctrl+K for quick actions and searches
- **🔐 Authentication** - Secure signup, login, and protected routes
- **⚙️ Settings** - Theme toggle, layout preferences, profile management

## 🛠️ Tech Stack

### Frontend
- **React 18** + **Vite** (ultra-fast bundling)
- **Redux Toolkit** (state management)
- **Tailwind CSS** (styling with dark theme)
- **Framer Motion** (smooth animations)
- **Lucide React** (premium icons)
- **React Hook Form + Zod** (form validation)

### Backend
- **Node.js + Express** (REST API)
- **MongoDB + Mongoose** (real database)
- **JWT** (secure authentication with httpOnly cookies)
- **Helmet** (security headers)
- **CORS** (cross-origin requests)

## 📦 Project Structure

```
nexusdesk/
├── client/                    # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── store/             # Redux slices and store
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Utility functions
│   │   ├── constants/         # App constants
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # React DOM entry
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Express + MongoDB backend
│   ├── src/
│   │   ├── config/            # Database & app config
│   │   ├── controllers/       # Request handlers
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API route definitions
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── services/          # Business logic
│   │   ├── validations/       # Zod schemas
│   │   ├── utils/             # Helper functions
│   │   ├── jobs/              # Background jobs (seed data)
│   │   ├── app.js             # Express app setup
│   │   └── server.js          # Server startup
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **MongoDB** (local or Atlas)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd nexusdesk
   npm install
   
   cd client && npm install && cd ..
   cd server && npm install && cd ..
   ```

2. **Set up environment variables:**
   ```bash
   # Server
   cp server/.env.example server/.env
   # Update server/.env with your MongoDB URI and JWT secrets
   
   # Client
   cp client/.env.example client/.env
   # Update client/.env with backend API URL
   ```

3. **Seed demo data:**
   ```bash
   cd server
   npm run seed
   cd ..
   ```

4. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```
   Server runs on `http://localhost:5000`

5. **Start the frontend (new terminal):**
   ```bash
   cd client
   npm run dev
   ```
   App runs on `http://localhost:5173`

6. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🔑 Demo Credentials

After seeding the database, use these credentials to log in:

```
Email: demo@nexusdesk.com
Password: DemoPass123
```

Or create a new account using the signup form.

## 📚 API Documentation

### Auth Endpoints
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Notes Endpoints
- `GET /api/notes` - List all notes (paginated)
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note details
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `GET /api/notes/search?q=query` - Search notes

### Tasks Endpoints
- `GET /api/tasks` - List all tasks (with filters)
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/filter?status=todo` - Filter by status

### Dashboard Endpoints
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/activity` - Get activity feed
- `GET /api/dashboard/pinned` - Get pinned items

### Other Endpoints
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `GET /api/sessions/stats` - Get focus stats
- `POST /api/assistant/chat` - Send message to AI
- `GET /api/links` - List saved links
- `GET /api/settings` - Get user settings

## 🎨 UI/UX Highlights

- **Dark-first design** - Midnight blue (#0a0e27) with cyan (#00d9ff) and violet (#9945ff) accents
- **Glassmorphism** - Subtle frosted glass effects on cards and panels
- **Smooth animations** - Fade-ins, slide-ins, and transitions with Framer Motion
- **Responsive** - Works beautifully on desktop, tablet, and mobile
- **Accessible** - Semantic HTML, proper contrast ratios, keyboard navigation
- **Performance** - Lazy-loaded components, optimized images, efficient state updates

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth with refresh tokens
- **HTTP-Only Cookies** - Tokens stored securely (not accessible via JS)
- **Password Hashing** - bcryptjs for secure password storage
- **Input Validation** - Zod schemas on frontend and backend
- **CORS Protection** - Whitelist frontend origin only
- **Rate Limiting** - Prevent brute force attacks on auth endpoints
- **Helmet** - Security headers for XSS, CSRF, and more

## 🧪 Testing

Run the backend:
```bash
cd server && npm run dev
```

Test API with curl or Postman:
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nexusdesk.com","password":"DemoPass123"}'
```

## 📝 Data Models

### User
- email, username, password hash
- profile (avatar, bio)
- preferences (theme, layout, notifications)

### Note
- title, content (markdown)
- tags, folder assignment
- starred, timestamps

### Task
- title, description
- status (todo/doing/done), priority
- dueDate, folder, timestamps

### Folder
- name, icon, color
- parent folder (for nesting)
- user-specific organization

### Session
- type (pomodoro/focus), duration
- completion timestamp, streak tracking

### Link
- title, URL, category
- tags, notes, timestamps

### Conversation
- user messages and AI responses
- session tracking

### Activity
- audit log of user actions
- target models and IDs

## 🎯 Production Checklist

- [ ] Update JWT secrets in `.env`
- [ ] Set MongoDB connection to production Atlas
- [ ] Enable HTTPS
- [ ] Add rate limiting for production
- [ ] Set `NODE_ENV=production`
- [ ] Build frontend: `npm run build`
- [ ] Serve frontend with a reverse proxy (nginx)
- [ ] Monitor logs and errors
- [ ] Set up backups for MongoDB

## 🤝 Contributing

This is a portfolio project. Feel free to fork, modify, and use as a template for your own projects.

## 📄 License

MIT License - feel free to use for personal or commercial projects.

---

Built with ❤️ as a premium productivity workspace app. **NexusDesk** — *Your digital command center.*
