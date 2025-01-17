# Traffic System API Documentation

## Frontend Updates (2025-01-07)

### Mobile Responsive Sidebar
- Added mobile-responsive sidebar with toggle functionality
- Sidebar automatically hides on mobile devices
- Toggle button appears in top-left corner on mobile screens
- Smooth sliding animation when opening/closing
- Auto-closes when menu item is selected on mobile

### UI Improvements
- Updated menu item hover effects (gray background)
- Active menu items highlighted in orange (#F26822)
- Improved header text visibility
- Better spacing between menu items
- Simplified header text (e.g., "Offences" instead of "Traffic Offences")
- Enhanced mobile layout with proper spacing

### Component Updates
- Sidebar.tsx: Added mobile responsiveness and toggle functionality
- Layout.tsx: Improved header text positioning and visibility
- Added z-index management for proper layering
- Implemented smooth transitions for better UX

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "driver"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

### Get Profile
```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Success Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin",
    "profileImage": "/uploads/profiles/image.jpg"
  }
}
```

### Update Profile
```http
PUT /auth/profile
```

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

**Request Body:**
```form-data
name: "Updated Name"
profileImage: (file)
currentPassword: "current_password"
newPassword: "new_password"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

## Traffic Offenses

### Get All Offenses
```http
GET /offenses
```

**Query Parameters:**
```
page: 1 (default)
limit: 10 (default)
search: "search term"
status: "pending"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "offenses": [
      {
        "_id": "offense_id",
        "driverId": "driver_id",
        "officerId": "officer_id",
        "type": "speeding",
        "amount": 100,
        "status": "pending",
        "location": "Main Street",
        "createdAt": "2025-01-07T00:00:00.000Z"
      }
    ],
    "total": 50,
    "page": 1,
    "pages": 5
  }
}
```

### Create Offense
```http
POST /offenses
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "driverId": "driver_id",
  "type": "speeding",
  "amount": 100,
  "location": "Main Street",
  "description": "Exceeding speed limit by 30km/h"
}
```

**Success Response:**
```json
{
  "success": true,
  "offense": {
    "_id": "offense_id",
    "driverId": "driver_id",
    "officerId": "officer_id",
    "type": "speeding",
    "amount": 100,
    "status": "pending",
    "location": "Main Street",
    "createdAt": "2025-01-07T00:00:00.000Z"
  }
}
```

### Update Offense
```http
PUT /offenses/:id
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "status": "paid",
  "amount": 150
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Offense updated successfully"
}
```

### Delete Offense
```http
DELETE /offenses/:id
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Success Response:**
```json
{
  "success": true,
  "message": "Offense deleted successfully"
}
```

## Payments

### Create Payment
```http
POST /payments
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "offenseId": "offense_id",
  "amount": 100,
  "method": "cash"
}
```

**Success Response:**
```json
{
  "success": true,
  "payment": {
    "_id": "payment_id",
    "offenseId": "offense_id",
    "amount": 100,
    "method": "cash",
    "status": "completed",
    "createdAt": "2025-01-07T00:00:00.000Z"
  }
}
```

### Get Payment History
```http
GET /payments
```

**Query Parameters:**
```
page: 1 (default)
limit: 10 (default)
status: "completed"
method: "cash"
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "_id": "payment_id",
        "offenseId": "offense_id",
        "amount": 100,
        "method": "cash",
        "status": "completed",
        "createdAt": "2025-01-07T00:00:00.000Z"
      }
    ],
    "total": 30,
    "page": 1,
    "pages": 3
  }
}
```

## Reports

### Get Statistics
```http
GET /reports/statistics
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "totalOffenses": 100,
    "totalPayments": 80,
    "pendingPayments": 20,
    "recentOffenses": [],
    "paymentsByMethod": {
      "cash": 50,
      "mobileMoney": 30
    }
  }
}
```

### Generate Report
```http
POST /reports/generate
```

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "type": "offenses",
  "startDate": "2025-01-01",
  "endDate": "2025-01-07",
  "format": "pdf"
}
```

**Success Response:**
```json
{
  "success": true,
  "reportUrl": "/reports/report-123.pdf"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data",
  "details": {
    "field": "error message"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

- Rate limit: 100 requests per minute
- Headers returned:
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 99
  X-RateLimit-Reset: 1609459200
  ```

## Authentication Headers

All protected routes require the following header:
```
Authorization: Bearer jwt_token_here
```

## File Upload

Supported file types for profile images:
- image/jpeg
- image/png
- image/gif

Maximum file size: 5MB
