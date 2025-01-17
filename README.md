# Traffic Management System

A comprehensive web-based system for managing traffic offenses, driver records, and payments. Built with React, Node.js, and MongoDB.

## Features

- 🚦 **Traffic Offense Management**
  - Record and track traffic violations
  - Manage offense categories
  - Generate offense reports

- 👤 **User Management**
  - Role-based access control (Superadmin, Admin/Officer, Driver)
  - Secure authentication with JWT
  - Profile management with image upload
  - Two-factor authentication support

- 💰 **Payment Processing**
  - Multiple payment methods (Cash, Mobile Money)
  - Real-time payment tracking
  - Automated receipt generation
  - Payment history

- 📊 **Reports & Analytics**
  - Comprehensive reporting system
  - Statistical analysis
  - Data visualization
  - Export functionality

- 🔔 **Notifications**
  - Real-time notifications
  - Email notifications
  - System alerts

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- i18next for internationalization
- Chart.js for data visualization

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Multer for file uploads
- Passport.js for social auth

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd traffic-system
```

2. Install Backend Dependencies
```bash
cd Backend
npm install
```

3. Configure Backend Environment
Create a .env file in the Backend directory:
```env

```

4. Install Frontend Dependencies
```bash
cd ../Frontend
npm install
```

5. Start the Development Servers

Backend:
```bash
cd Backend
npm run dev
```

Frontend:
```bash
cd Frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
traffic-system/
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   └── utils/
│   └── public/
└── Backend/
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── utils/
```

## Key Features Implementation

### Authentication Flow
1. User submits login credentials
2. Backend validates and returns JWT
3. Frontend stores token in local storage
4. Token used for subsequent requests

### Traffic Offense Recording
1. Officer logs offense details
2. System generates unique reference
3. Notification sent to driver
4. Record stored in database

### Payment Processing
1. Driver selects payment method
2. System validates payment
3. Receipt generated automatically
4. Payment status updated

## API Documentation

### Auth Endpoints
- POST /api/auth/login
- POST /api/auth/register
- GET /api/auth/profile
- PUT /api/auth/profile

### Offense Endpoints
- GET /api/offenses
- POST /api/offenses
- PUT /api/offenses/:id
- DELETE /api/offenses/:id

### Payment Endpoints
- GET /api/payments
- POST /api/payments
- GET /api/payments/:id

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security Features

- JWT Authentication
- Password Hashing
- Input Validation
- File Upload Validation
- Rate Limiting
- XSS Protection
- CSRF Protection

## Testing

```bash
# Run backend tests
cd Backend
npm test

# Run frontend tests
cd Frontend
npm test
```

## Support

For support, email ilyaasinji@gmail.com
