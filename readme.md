Real-Time Chat Application (RTC)
A full-stack real-time communication platform built with Next.js, Express, Socket.IO, and PostgreSQL.

🏗 System Architecture
The application follows a layered architecture to ensure separation of concerns:

Frontend Layer: Built with Next.js, handling UI and client-side logic.

Backend Layer: Powered by Express.js and Socket.IO for RESTful APIs and real-time bidirectional communication.

Data Access: Uses Prisma ORM for type-safe database interactions.

Storage: PostgreSQL for persistent data and Redis for caching and session management.

🚀 Tech Stack
Frontend
Next.js 14

React 18

Socket.io-client

TypeScript

Backend
Express.js

Socket.IO

Prisma ORM

PostgreSQL

Redis (via ioredis)

Authentication: JWT & Bcrypt

📦 Getting Started with Docker
The easiest way to run the entire stack is using Docker Compose.

Environment Setup: Ensure you have a .env file based on the provided examples.

Launch the Services:

Bash

docker-compose up --build
Services Infrastructure:
Frontend: http://localhost:3000

Backend API: http://localhost:3001

PostgreSQL: Port 5432

Redis: Port 6379

🧪 Testing Strategy
The backend implementation maintains high reliability through a comprehensive testing suite:

Framework: Jest & Supertest.

Coverage: The project maintains over 70% coverage across branches and functions.

Focus Areas:

Controllers: Validating API endpoints and request handling.

Services: Core business logic and security constraints.

Middlewares: Authentication and permission guard verification.

To run the tests:

# Within the backend directory
npm test
npm test -- --coverage

🔒 Security Features
Rate Limiting: Protection against brute-force attacks.

Security Headers: Implemented via Helmet.

Permission Guards: Strict validation for administrative actions (e.g., deleting servers).

Data Integrity: Validation of all incoming payloads using express-validator.