# StockSense - System Architecture & Technical Specifications

> **Note for Team**: Welcome to the StockSense system architecture guide! This document outlines how our modules, data layers, and services fit together. Please read through this before adding new endpoints or components.

---

## 1. System Overview

StockSense is a modular, enterprise-grade Inventory Management System (IMS) designed to track dynamic stock movements across multiple warehouse locations using a **Double-Entry Stock Ledger** pattern.

```
+-----------------------------------------------------------------------+
|                           React + Vite Frontend                      |
| (Pages, Component Layouts, Hooks, Context, Common UI & API Services)  |
+-----------------------------------------------------------------------+
                                   |
                                   | REST API (JSON / HTTP)
                                   v
+-----------------------------------------------------------------------+
|                         Node.js + Express Backend                     |
|  (Routes -> Controllers -> Services -> Data Models -> Middleware)     |
+-----------------------------------------------------------------------+
                                   |
                                   | Native pg pool (ACID Transactions)
                                   v
+-----------------------------------------------------------------------+
|                         PostgreSQL Database                           |
|   (Users, Products, Warehouses, Operations, Items, Movement Ledger)    |
+-----------------------------------------------------------------------+
```

---

## 2. Directory Structure Blueprint

Our codebase follows a clear separation of concerns across both frontend and backend layers:

```
StockSense/
├── .github/                  # CI/CD Workflows & Issue Templates
│   ├── ISSUE_TEMPLATE/       # Bug & feature request forms
│   └── workflows/            # GitHub Actions CI build pipelines
├── backend/                  # Express REST API Server
│   ├── src/
│   │   ├── config/           # Database connections & global constants
│   │   ├── controllers/      # API Request / Response handlers
│   │   ├── db/               # PostgreSQL schemas, migrations & seed scripts
│   │   ├── middleware/       # JWT Auth, error handler & input validators
│   │   ├── models/           # Database access layer (Queries & CRUD)
│   │   ├── routes/           # Express endpoint router definitions
│   │   ├── services/         # Core business logic (Stock ledger, validation)
│   │   └── utils/            # Helper utilities, logger & formatters
│   └── tests/                # Unit and Integration test suites
├── frontend/                 # React + Vite Single Page Application
│   ├── src/
│   │   ├── api/              # Axios / Fetch client & API endpoint map
│   │   ├── assets/           # Dynamic images, icons & global CSS
│   │   ├── components/       # UI Components (common, inventory, layout, dashboard)
│   │   ├── context/          # React Context (Auth, Stock Alert State)
│   │   ├── hooks/            # Custom React Hooks (useAuth, useStock, useDebounce)
│   │   ├── pages/            # View pages (Dashboard, Products, Operations, Reports)
│   │   ├── services/         # Client-side API service wrappers
│   │   └── utils/            # Client-side formatters & validation rules
│   └── tests/                # React component & page tests
├── docs/                     # System documentation & team specs
└── scripts/                  # Database management & dev automation scripts
```

---

## 3. Key Architectural Patterns

1. **Double-Entry Stock Ledger**:
   - Stock is never mutated directly without a logged movement record.
   - Every operation (Receipt, Delivery, Internal Transfer, Adjustment) logs `origin_location_id` and `destination_location_id`.
   - Prevents stock discrepancies and maintains an accurate historical audit trail.

2. **ACID Compliant Transactions**:
   - Database updates execute inside PostgreSQL transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
   - If stock shortages occur during a transfer, the entire operation is safely rolled back.

3. **Layered Service Architecture**:
   - Routes only map URLs to Controllers.
   - Controllers handle HTTP requests and responses.
   - Services process business rules and double-entry logic.
   - Models execute raw or parameterized SQL queries.

---

## 4. How to Contribute

- **Pick a module**: Refer to the TODO comments in individual scaffold files inside `services/`, `controllers/`, or `components/`.
- **Follow coding style**: Use camelCase for JS functions/variables and PascalCase for React components.
- **Test your changes**: Write corresponding test cases in the `tests/` folder.
