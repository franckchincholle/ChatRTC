🧪 Testing Documentation - Backend API
📌 Overview
This document outlines the automated testing strategy implemented for the backend API. The primary goal was to ensure high reliability and security by maintaining a code coverage of at least 70% across all metrics: Statements, Branches, Functions, and Lines.

🛠 Tech Stack
Testing Framework: Jest

Integration Testing: Supertest (for API endpoints and HTTP cycle)

Mocking Utility: Jest Mocks (used to isolate services, repositories, and third-party libraries like Bcrypt or JWT).
📂 Project Structure
The test files are located in test/src/, mirroring the source code structure:

controllers/: Validates API entry points, request handling, and JSON response structures.

services/: Validates core business logic, security constraints, and data processing.

middlewares/: Ensures authentication, permission guards, and global error handling are functioning correctly.

utils/: Tests helper functions such as JWT generation/verification and password hashing.

🎯 Testing Strategies
1. Dependency Isolation (Mocking)
To ensure tests are fast, predictable, and independent of external factors, we use a mocking strategy:

Repositories: Mocked to prevent actual database writes while ensuring data access patterns are correct.

Services: Mocked during Controller tests to focus strictly on HTTP request/response logic.

2. Logic & Edge Case Coverage (Branches)
We focused heavily on Branch Coverage to ensure that all logical paths, especially error handling, are tested:

Security Guards: Testing forbidden actions (e.g., a regular member attempting to delete a server).

Auth Failures: Simulating expired, malformed, or missing JWT tokens.

Validation Errors: Using express-validator mocks to ensure the API correctly rejects invalid payloads.

3. Request Context Simulation
Using Supertest, we simulate the full Express.js lifecycle. This includes injecting a mock user into req.user to bypass or test authentication and permission middlewares accurately.

🚀 How to Run Tests
Standard Execution
Run all tests with the following command:

npm test

Coverage Report
To generate a detailed coverage report (HTML and CLI):

npm test -- --coverage

Targeted Testing
Run a specific test file:

npm test path/to/file.test.ts