# Enquiry API

Base path: `/api/enquiries`

## App: submit an enquiry

`POST /api/enquiries`

Authentication is not required.

### Request body

```json
{
  "name": "Suganesh Flavio",
  "email": "name@example.com",
  "category": "General Inquiry",
  "message": "I would like to know more about the courses."
}
```

All fields are required. `email` must be a valid email address.

### Success response: `201 Created`

```json
{
  "success": true,
  "message": "Enquiry submitted successfully",
  "data": {
    "id": "cm enquiry id",
    "name": "Suganesh Flavio",
    "email": "name@example.com",
    "category": "General Inquiry",
    "message": "I would like to know more about the courses.",
    "createdAt": "2026-09-05T12:00:00.000Z",
    "updatedAt": "2026-09-05T12:00:00.000Z"
  }
}
```

## Admin: list enquiries

`GET /api/enquiries?page=1&limit=10`

Requires `Authorization: Bearer <admin-token>`. Only users with role `ADMIN` can access this endpoint. Results are newest first. `limit` defaults to `10` and has a maximum of `100`.

### Success response: `200 OK`

```json
{
  "success": true,
  "message": "Enquiries fetched successfully",
  "data": {
    "enquiries": [
      {
        "id": "cm enquiry id",
        "name": "Suganesh Flavio",
        "email": "name@example.com",
        "category": "General Inquiry",
        "message": "I would like to know more about the courses.",
        "createdAt": "2026-09-05T12:00:00.000Z",
        "updatedAt": "2026-09-05T12:00:00.000Z"
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```
