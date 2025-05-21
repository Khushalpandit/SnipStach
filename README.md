# SnipStash - Smart Code Snippet Organizer

A modern web application for developers to organize, categorize, and manage their code snippets with smart auto-tagging capabilities.

## Features

- 🔐 Secure user authentication
- 💾 Save and organize code snippets
- 🏷️ Smart auto-tagging based on code patterns
- 🔍 Advanced search and filtering
- 📁 Custom folders and grouping
- 🌙 Dark mode by default
- 📋 One-click copy to clipboard
- 📊 Usage tracking and analytics

## Tech Stack

- **Frontend:**

  - React with TypeScript
  - Material-UI (MUI)
  - Vite
  - React Query
  - React Router

- **Backend:**
  - Node.js with Express
  - TypeScript
  - Bun runtime
  - MongoDB with Mongoose
  - JWT authentication

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (latest version)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/snipstash.git
   cd snipstash
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   yarn dev
   ```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development

- `yarn dev` - Start both frontend and backend in development mode
- `yarn build` - Build all packages
- `yarn test` - Run tests across all packages

## Project Structure

```
snipstash/
├── client/          # React frontend
├── server/          # Node.js backend
└── shared/          # Shared types and utilities
```

## License

MIT
