# Blog Management API

A secure and scalable Blog App REST API built with **Node.js**, **Express.js**, **PostgreSQL**, and **Sequelize**. This API allows for blog CRUD operations, user authentication, and a comment system.

---

## Auth APIs

| Method | Endpoint                   | Description         | Access |
|--------|----------------------------|---------------------|--------|
| POST   | `/api/v1/auth/register`    | Register a new user | Public |
| POST   | `/api/v1/auth/login`       | Login existing user | Public |

---

## User APIs

> All user APIs are **protected** and require a valid JWT token.

| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | `/api/v1/users`       | Get all users     |
| GET    | `/api/v1/users/:id`   | Get user by ID    |
| PATCH  | `/api/v1/users/:id`   | Update user by ID |
| DELETE | `/api/v1/users/:id`   | Delete user by ID |

---

## Blog APIs

> `GET /api/v1/blogs` is public. All other blog routes are **protected** and require JWT.

| Method | Endpoint                  | Description                         |
|--------|---------------------------|-------------------------------------|
| GET    | `/api/v1/blogs`           | Get all blogs (with pagination)     |
| POST   | `/api/v1/blogs`           | Create a new blog                   |
| GET    | `/api/v1/blogs/user/blog` | Get all blogs by authenticated user |
| GET    | `/api/v1/blogs/:id`       | Get a specific blog by ID           |
| PATCH  | `/api/v1/blogs/:id`       | Update blog by ID                   |
| DELETE | `/api/v1/blogs/:id`       | Delete blog by ID                   |

---

## Comment APIs

> All comment creation and deletion routes are **protected** and require JWT.

| Method | Endpoint                     | Description                      |
|--------|------------------------------|----------------------------------|
| GET    | `/api/v1/comments/blog/:id`  | Get all comments for a blog post |
| POST   | `/api/v1/comments/blog/:id`  | Create comment for a blog post   |
| DELETE | `/api/v1/comments/:id`       | Delete a comment by ID           |

---

## Tech Stack

- Node.js
- Express.js
- PostgreSQL with Sequelize ORM
- JWT (JSON Web Tokens) for Authentication
- Cloudinary (for image upload)
- Dotenv for environment variable management

---

## Installation

```bash
git clone https://github.com/SumitKumar-2000/Blog-App-Server.git
cd Blog-App-Server
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=1d
DATABASE_URL=your-database-url
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```
