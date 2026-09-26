# StockSense - Modular Inventory Management System (IMS)

StockSense is an enterprise-grade Inventory Management System that digitizes and streamlines stock operations.

## Architecture
```
React + Vite (Frontend: http://localhost:3000)
     │
     │ REST API (JSON)
     ▼
Node.js + Express (Backend: http://localhost:5000)
     │
     │ pg (Native node-postgres pool with ACID transactions)
     ▼
PostgreSQL 18 (Local database: localhost:5432/stocksense_db)
```

---

## Key Features & Adherence to Requirements

1. **Real Local Database**:
   - Interacts directly with PostgreSQL on `localhost:5432/stocksense_db`.
   - Inspectable and queryable in **pgAdmin 4**.
   - Strict ACID transactions (`BEGIN`/`COMMIT`/`ROLLBACK`) ensure inventory consistency and prevent negative stock balances.
2. **Dynamic Live Data**:
   - Zero static JSON or mock arrays in the frontend. Every metric, SKU, partner, and stock level is fetched live via REST API.
3. **Double-Entry Stock Ledger**:
   - `Move History` records every single validated movement (Receipts, Deliveries, Transfers, Adjustments) with origin, destination, timestamp, and quantity.
4. **Meaningful Feedback for Errors**:
   - Centralized error handler returning clear, human-readable error messages for stock shortages, duplicate SKUs, or foreign key constraints.
5. **Clean & Scalable Code**:
   - Layered architecture: `config/`, `middleware/`, `controllers/`, `routes/`, `db/`.
6. **No Trendy Tech Bloat**:
   - Minimal, battle-tested dependencies (`express`, `pg`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`). No heavy ORMs.

---

## How to Run

### Start Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# Vite runs on http://localhost:3000
```

### Database Management
To re-run migrations and reset seed data at any time:
```bash
cd backend
npm run migrate
```
