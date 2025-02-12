# Express.js + Prisma CRUD API

This is a simple CRUD API built with Express.js and Prisma, using TypeScript. The API provides endpoints for creating, retrieving, updating, and deleting resources with pagination and filtering support.

## 🚀 Features
- Create a resource
- List resources with pagination and filters
- Get details of a resource
- Update resource details
- Delete a resource

## 📌 Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 📂 Installation & Setup
1. Install dependencies:
   ```sh
   npm install
   ```
   or
   ```sh
   yarn install
   ```

2. Initialize Prisma and migrate the database:
   ```sh
   npx prisma migrate dev --name init
   ```

3. Generate Prisma client:
   ```sh
   npx prisma generate
   ```

4. (Optional) Seed the database:
   ```sh
   npx prisma db seed
   ```

## ▶️ Running the Server
Start the server in development mode:
```sh
npm run dev
```

Or in production mode:
```sh
npm run build && npm start
```

## 📡 API Endpoints
### Create a Resource
**POST** `/resources`
```json
{
  "name": "Example File",
  "description": "Sample description"
}
```

### List Resources (with Pagination & Filters)
**GET** `/resources?page=1&limit=10&name=example`

### Get a Resource by ID
**GET** `/resources/:id`

### Update a Resource
**PUT** `/resources/:id`
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete a Resource
**DELETE** `/resources/:id`

## 📝 License
This project is licensed under the MIT License.

