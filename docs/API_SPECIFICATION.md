# StockSense REST API Specification

> **Team Guide**: Here is the reference guide for all backend REST endpoints in StockSense. When implementing new routes or updating controllers, please keep this document updated so the frontend team knows what to expect!

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently logged-in user profile | Yes (JWT) |

---

## 2. Product & Inventory Endpoints (`/api/products`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve all products with current stock counts | Yes |
| `GET` | `/api/products/:id` | Fetch specific product details by ID | Yes |
| `POST` | `/api/products` | Create a new SKU / product entry | Yes (Manager) |
| `PUT` | `/api/products/:id` | Update product metadata or minimum thresholds | Yes (Manager) |
| `DELETE` | `/api/products/:id` | Soft delete or archive a product SKU | Yes (Admin) |

---

## 3. Stock Operations (`/api/operations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/operations` | List all operations (Receipts, Transfers, Deliveries) | Yes |
| `GET` | `/api/operations/:id` | Get detail for a specific operation & line items | Yes |
| `POST` | `/api/operations` | Create a draft stock operation | Yes |
| `POST` | `/api/operations/:id/validate` | Validate operation & execute double-entry movements | Yes |
| `POST` | `/api/operations/:id/cancel` | Cancel draft operation | Yes |

---

## 4. Move History & Audit Ledger (`/api/move-history`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/move-history` | Fetch global double-entry stock movement log | Yes |
| `GET` | `/api/move-history/product/:id` | Filter movement log for a specific product SKU | Yes |

---

## 5. Reports & Analytics (`/api/reports`) - *Under Construction*

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reports/summary` | Generate inventory summary metrics | Yes |
| `GET` | `/api/reports/export/csv` | Export stock inventory ledger to CSV file | Yes |

---

## Error Handling Standard

All endpoints return errors in a standardized JSON envelope:

```json
{
  "status": "error",
  "code": "INSUFFICIENT_STOCK",
  "message": "Cannot deliver 50 units. Current available balance in Main Warehouse is 20 units."
}
```
