# Certificate Platform

A full-stack web application for managing digital certificates. Users can register, log in, and perform CRUD operations on certificates, including uploading certificate files.

## Features

- User authentication (register, login, logout)
- Certificate management (create, read, update, delete)
- File upload for certificate documents
- Responsive frontend with HTML, CSS, and JavaScript
- Backend API built with Node.js and Express
- MongoDB for data storage
- JWT-based authentication

## Project Structure

```
certificate-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── certificateController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── certificateRoutes.js
│   ├── uploads/
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── app.js
│   │   ├── auth.js
│   │   └── certificates.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd certificate-platform/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/certificate-platform
   JWT_SECRET=your-secret-key-here
   ```

4. Start the server:
   ```
   npm start
   ```

### Frontend Setup

1. Open `certificate-platform/frontend/index.html` in your browser to access the application.

2. For development, you can use a local server (e.g., Live Server extension in VS Code).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Certificates

- `GET /api/certificates` - Get all certificates for the authenticated user
- `POST /api/certificates` - Create a new certificate
- `PUT /api/certificates/:id` - Update a certificate
- `DELETE /api/certificates/:id` - Delete a certificate

## Technologies Used

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT, Multer
- **Frontend**: HTML, CSS, JavaScript (Vanilla JS)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
