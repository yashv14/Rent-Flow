🏠 RentFlow — Smart Real Estate Rental Management Platform
View Website-https://rent-flow-flax.vercel.app/

RentFlow is a full-stack rental property management system designed to simplify property rentals, tenant management, booking workflows, rent tracking, and communication between stakeholders.

The platform provides:

🏢 Property management for landlords
🏠 Rental and booking system for tenants
👨‍💼 Administrative monitoring tools
🔐 Secure authentication & authorization
📊 Real-time dashboard analytics
📩 Digital notice management
🎯 Problem Statement

Traditional rental management often involves:

Manual spreadsheets
WhatsApp-based communication
No centralized booking workflow
Untracked rent payments
Poor visibility for tenants

RentFlow solves these issues through automation, structured workflows, and centralized management.

✨ Core Features:- 

👨‍💼 Admin Module
Full platform visibility
User management
Property moderation
System-wide notices
Administrative controls

🏢 Landlord Module
Add/Edit/Delete properties
Upload property details
Approve or reject bookings
Rent tracking system
Notice management
Dashboard analytics

🏠 Tenant Module
Browse available properties
Booking request system
Rent history tracking
Mark rent as paid
Receive notices
Track booking approvals

🔐 Security Features
JWT Authentication
bcrypt Password Hashing
Protected Routes
Role-Based Authorization
Ownership Verification
Duplicate Booking Prevention
Secure API Middleware

🛠 Tech Stack
Layer	Technology
Frontend	React.js + Vite + TailwindCSS
Backend	Node.js + Express.js
Database	MySQL
Authentication	JWT + bcrypt
API Testing	Postman
Deployment	Vercel + Render
Containerization	Docker

🏗 System Architecture
CLIENT (React SPA)
        ↓
Axios + JWT
        ↓
Node.js + Express API
        ↓
Middleware Layer
        ↓
Controllers
        ↓
MySQL Database

🗄 Database Design
Main Tables
users
properties
bookings
rent_records
notices
Relationships
users → properties
users → bookings
properties → bookings
users → notices
users → rent_records

📂 Project Structure
rentflow/
│
├── client/                 # React Frontend
├── server/                 # Node.js Backend
├── README.md
├── .gitignore
└── package.json

🚀 Installation Guide
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/rentflow.git
cd rentflow
2️⃣ Install Dependencies
Backend
cd server
npm install
Frontend
cd client
npm install
3️⃣ Configure Environment Variables
Backend .env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rental_management

JWT_SECRET=your_secret_key
4️⃣ Start Backend
cd server
node server.js
5️⃣ Start Frontend
cd client
npm run dev


⭐ Support

If you found this project useful:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest features
