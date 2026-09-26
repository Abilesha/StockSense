# Database Schema & Data Dictionary

> **Developer Note**: StockSense uses PostgreSQL 18. All stock changes are protected by strict foreign keys, unique constraints, and transaction blocks. Here is our database schema layout.

---

## Entity Relationship Overview

```
+----------------+          +-------------------+          +-----------------+
|     users      |          |    warehouses     |          |    partners     |
+----------------+          +-------------------+          +-----------------+
| id (PK)        |          | id (PK)           |          | id (PK)         |
| email          |          | name              |          | name            |
| password_hash  |          | code              |          | type (vendor/..) |
| role           |          | location_type     |          +-----------------+
+----------------+          +-------------------+                   ^
                                      ^                             |
                                      |                             |
+----------------+          +-------------------+                   |
|    products    |          |    operations     |-------------------+
+----------------+          +-------------------+
| id (PK)        |          | id (PK)           |
| name           |          | reference_no      |
| sku (UNIQUE)   |          | operation_type    |
| min_stock      |          | status            |
+----------------+          +-------------------+
        ^                             ^
        |                             |
+-----------------------------------------------+
|                operation_items                |
+-----------------------------------------------+
| id (PK)                                       |
| operation_id (FK -> operations.id)           |
| product_id (FK -> products.id)                |
| quantity                                      |
+-----------------------------------------------+
        ^
        |
+-----------------------------------------------+
|                stock_movements                |
+-----------------------------------------------+
| id (PK)                                       |
| product_id (FK -> products.id)                |
| source_location_id (FK -> warehouses.id)      |
| dest_location_id (FK -> warehouses.id)        |
| quantity                                      |
| movement_date                                 |
+-----------------------------------------------+
```

---

## Core Tables Breakdown

### 1. `users`
Stores system accounts, credential hashes, and user roles (`admin`, `manager`, `worker`).

### 2. `products`
Holds SKU catalog metadata, unit of measure (UOM), cost price, selling price, and reorder threshold limits.

### 3. `warehouses` / `locations`
Defines storage locations (Internal Warehouses, Vendor Locations, Customer Locations, Physical Inventory Adjustment Virtual Locations).

### 4. `operations`
Tracks dynamic stock tickets (Receipts, Deliveries, Internal Transfers, Inventory Adjustments) with their lifecycle status (`draft`, `ready`, `done`, `canceled`).

### 5. `operation_items`
Line items linking products and target quantities to a specific operation ticket.

### 6. `stock_movements`
The double-entry immutable audit ledger. Whenever an operation is set to `done`, movement rows are inserted recording movement of stock between locations.
