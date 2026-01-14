# E-commerce Backend API

## Overview
This backend provides a secure, production-ready REST API for a single-brand e-commerce application. It follows clean architecture, robust error handling, and industry best practices.

## API Base URL
```
/api/v1/
```

## Authentication
- JWT-based authentication (access & refresh tokens)
- Register and login endpoints return a JWT token in the response
- Pass the token in the `Authorization` header as `Bearer <token>` for protected routes

## Standard Response Format
All API responses follow this structure:
```
{
  "success": true | false,
  "data": { ... }, // present if success
  "message": "...", // present if success
  "error": {        // present if error
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... } // optional
  }
}
```

## Request Input
- **Query Parameters:**
  - Sent in the URL, e.g. `/api/v1/products?page=2&limit=10`
- **Body Parameters:**
  - Sent as JSON in the request body for POST/PUT/PATCH endpoints
  - Example:
    ```json
    {
      "name": "Product Name",
      "price": 100,
      "category": "Shoes"
    }
    ```

## Example: Register User
**POST** `/api/v1/auth/register`

**Body:**
```
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```

**Response:**
```
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "<jwt>"
  },
  "message": "Success"
}
```

## Example: Get Products (with Query Params)
**GET** `/api/v1/products?page=1&limit=20&sort=price`

**Response:**
```
{
  "success": true,
  "data": [ ...products... ],
  "message": "Success"
}
```

## Error Example
```
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required"
  }
}
```

## Integration Steps (Client Side)
1. Register or login to get a JWT token
2. Store the token securely (e.g., HttpOnly cookie or localStorage)
3. For protected endpoints, add the header:
   ```
   Authorization: Bearer <token>
   ```
4. Use query parameters for filtering, sorting, and pagination
5. Use JSON body for POST/PUT requests
6. Handle errors using the standard error response format

## API Documentation
See `src/docs/openapi.yaml` for full endpoint details (import into Swagger UI or Postman).

---
For further questions, see the OpenAPI docs or contact the backend team.
