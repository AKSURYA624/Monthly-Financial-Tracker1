# Backend Usage Guide

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/financial_tracker
JWT_SECRET=your-secret-key
PORT=3000
```

3. Start the server:
```bash
node server.js
```

## API Endpoints

### Authentication

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "your_username",
    "email": "your_email@example.com",
    "password": "your_password"
}
```

Response:
```json
{
    "success": true,
    "message": "Registration successful",
    "token": "jwt_token",
    "userId": "user_id"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

Response:
```json
{
    "success": true,
    "message": "Login successful",
    "token": "jwt_token",
    "userId": "user_id"
}
```

#### 3. Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
    "email": "your_email@example.com"
}
```

Response:
```json
{
    "success": true,
    "message": "Password reset email sent",
    "resetToken": "reset_token"
}
```

#### 4. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
    "token": "reset_token",
    "newPassword": "new_password"
}
```

Response:
```json
{
    "success": true,
    "message": "Password reset successful"
}
```

### Financial Records

#### 1. Get Records
```http
GET /api/records
Authorization: Bearer your_jwt_token
```

#### 2. Create Record
```http
POST /api/records
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
    "date": "2024-03-20",
    "monthlyIncome": 5000,
    "rent": 1000,
    "otherExpenses": 500,
    "roomExpenses": 300,
    "sipAmount": 1000
}
```

### Expenses

#### 1. Get Expenses
```http
GET /api/expenses
Authorization: Bearer your_jwt_token
```

#### 2. Create Expense
```http
POST /api/expenses
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
    "date": "2024-03-20",
    "amount": 100,
    "type": "delayed"
}
```

### Transactions

#### 1. Get Transactions
```http
GET /api/transactions
Authorization: Bearer your_jwt_token
```

#### 2. Create Transaction
```http
POST /api/transactions
Authorization: Bearer your_jwt_token
Content-Type: application/json

{
    "type": "given",
    "personName": "John Doe",
    "date": "2024-03-20",
    "amount": 100,
    "recoveryDate": "2024-04-20",
    "status": "pending"
}
```

## Error Handling

All API responses follow this format:
```json
{
    "success": false,
    "message": "Error message",
    "error": "Detailed error (in development mode only)"
}
```

Common error codes:
- 400: Bad Request (missing or invalid data)
- 401: Unauthorized (invalid or missing token)
- 403: Forbidden (invalid token)
- 404: Not Found
- 500: Server Error

## Testing

To test the backend functionality:

1. Install test dependencies:
```bash
npm install node-fetch
```

2. Run the test script:
```bash
node test-backend.js
```

## Security Notes

1. Always use HTTPS in production
2. Keep your JWT_SECRET secure and complex
3. Never expose sensitive data in responses
4. Use environment variables for configuration
5. Implement rate limiting in production 