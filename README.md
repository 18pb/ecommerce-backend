# Role-Based E-Commerce Dashboard — Backend

REST API backend for a role-based e-commerce dashboard, built with Express and MongoDB. Handles authentication, authorization, and product catalog operations for the [frontend](https://github.com/18pb/ecommerce-frontend).


## Features

- 🔐 **JWT Authentication** — Secure registration and login with hashed passwords (bcrypt) and signed tokens
- 🔒 **Server-Enforced Role Security** — Public registration can never create an admin account, regardless of what the client sends in the request body. Every new signup is forced to `role: "user"` at the database layer. Admin accounts are provisioned manually (e.g. directly in the database)
- 👥 **Role-Based Access Control** — Middleware (`authenticateToken`, `authorizeRoles`) enforces route-level permissions based on the role embedded in the JWT
- 🛒 **Product Catalog API** — Full CRUD support for products (create, read, delete) backed by MongoDB
- 🗄️ **MongoDB + Mongoose** — Schema-based data modeling for `User` and `Product` collections with timestamps
- 🌐 **CORS-enabled** — Configured to accept requests from the deployed frontend client

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** with **Mongoose**
- **JWT** (`jsonwebtoken`) for auth
- **bcryptjs** for password hashing
- **CORS**, **dotenv**
- **Deployed on Render**, connected to **MongoDB Atlas**

## Project Structure

```
backend/
  config/
    db.js               # MongoDB connection setup
  middleware/
    auth.js              # JWT verification + role-based authorization
  models/
    User.js               # User schema (name, email, password, role)
    Product.js             # Product schema (name, description, price, category, stock)
  routes/
    auth.js               # /api/auth — register & login
    products.js             # /api/products — catalog CRUD
  server.js                # App entry point
```

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/register` | Register a new user. Always creates a standard `user` account — the `role` field is never accepted from the client. Password is hashed before storage. |
| POST | `/login` | Authenticate and receive a JWT (`1d` expiry) along with the user's role and name. |

### Products — `/api/products`
| Method | Endpoint | Description |
|--------|----------|--------------|
| GET | `/` | Fetch all products, sorted by most recently created. |
| POST | `/` | Create a new product (name and price required). |
| DELETE | `/:id` | Delete a product by its ID. |

## Authentication & Authorization

- Passwords are hashed with `bcryptjs` via a Mongoose pre-save hook before being stored
- On login, a JWT is issued containing the user's `id` and `role`, valid for 1 day
- The frontend attaches this token as a `Bearer` token on subsequent requests
- **Admin accounts cannot be self-registered.** The `/register` route hardcodes `role: "user"` server-side, ignoring any role value sent in the request. This closes off a common privilege-escalation vector where a client could otherwise POST `role: "admin"` directly to the API
- `middleware/auth.js` exposes two reusable pieces:
  - `authenticateToken` — verifies the JWT and attaches the decoded user to `req.user`
  - `authorizeRoles(...roles)` — restricts a route to specific roles (e.g. `admin`)

## Provisioning an Admin Account

Since admin signup is intentionally disabled from the client, admin accounts are created manually:
1. Register normally through the app (this creates a `user` account)
2. In MongoDB Atlas (or via `mongosh`/Compass), update that user's document:
   ```js
   db.users.updateOne({ email: "your-email@example.com" }, { $set: { role: "admin" } })
   ```
3. Log out and log back in — the new JWT will carry the `admin` role

## Setup

1. Clone the repo
   ```bash
   git clone https://github.com/18pb/ecommerce-backend.git
   cd ecommerce-backend
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Create a `.env` file in the root:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the server
   ```bash
   node server.js
   ```
   Server runs on `http://localhost:5000` (or the port set in `.env`).

## Related Repo

- Frontend: [ecommerce-frontend](https://github.com/18pb/ecommerce-frontend)

## Author

Built by [Prasidh Bhardwaj](https://github.com/18pb)
