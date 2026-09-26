# StockSense Team Onboarding & Development Guide

Hey team! 👋 Welcome aboard the StockSense project. This guide will help you get set up quickly and start contributing cleanly.

---

## 1. Quick Start Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Abilesha/StockSense.git
   cd StockSense
   ```

2. **Configure Environment Variables**:
   - Backend: Copy `backend/.env.example` to `backend/.env`
   - Set your PostgreSQL credentials in `backend/.env`

3. **Install Dependencies**:
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend
   npm install
   ```

4. **Initialize PostgreSQL Database**:
   ```bash
   cd ../backend
   npm run migrate
   ```

5. **Start Dev Servers**:
   - Terminal 1 (Backend): `cd backend && npm start` (runs on http://localhost:5000)
   - Terminal 2 (Frontend): `cd frontend && npm run dev` (runs on http://localhost:3000)

---

## 2. Contribution Workflow

- **Branch Naming**: `feature/feature-name` or `fix/bug-description`
- **Git Commits**: Write clear, imperative commit messages (e.g., `feat: add product stock alert context`).
- **Code Comments**: Please write comments in a clear, friendly human tone explaining *why* a piece of code exists, not just *what* it does.
- **Pull Requests**: Open a PR against `main` and tag at least one teammate for review using our PR template.

Happy coding! If you hit any roadblocks, drop a message in the team chat. 🚀
