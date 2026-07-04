# 🏠 HydNest

A full-stack rental platform for finding PGs, hostels, flats, and shared rooms in Hyderabad. Built as a real-world project to demonstrate end-to-end full-stack development — from database design to a responsive, role-based UI.

## 🔗 Live Demo
*(Add your deployed link here once hosted)*

## ✨ Features

### For Tenants
- Browse and filter properties by city, type, and rent range
- View detailed property pages with images, amenities, and pricing
- Save/bookmark properties for later
- Send enquiries directly to property owners
- Track sent enquiries and their status

### For Owners
- List new properties with full details and amenities
- Upload and manage property images
- Edit or delete listings
- View and respond to enquiries from interested tenants
- Update enquiry status (pending / responded / closed)

### General
- JWT-based authentication with role-based access (tenant / owner)
- Persistent login sessions
- Fully responsive design — works on mobile, tablet, and desktop

## 🛠️ Tech Stack

**Frontend:** React.js, React Router, Axios, Context API, Vite
**Backend:** Node.js, Express.js
**Database:** PostgreSQL
**Auth:** JWT, bcrypt.js
**File Uploads:** Multer
**Styling:** Plain CSS with a shared design system (CSS custom properties)

## 📂 Project Structure

```
hydnest/
├── backend/
│   ├── config/          # DB connection, table creation, multer config
│   ├── controllers/     # Route logic (auth, properties, users, enquiries)
│   ├── middleware/      # JWT auth middleware
│   ├── routes/          # Express route definitions
│   ├── uploads/         # Uploaded property images
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI (Navbar)
│       ├── context/     # AuthContext for global auth state
│       ├── pages/       # Route-level pages
│       ├── services/    # Axios API instance
│       └── App.jsx
└── README.md
```

## 🗄️ Database Schema

- **users** — id, name, email, password (hashed), phone, role (tenant/owner)
- **properties** — id, owner_id, title, description, property_type, rent, deposit, area, address, city, coordinates, availability
- **amenities** — wifi, ac, parking, food, laundry, gym, cctv, pet_friendly (1:1 with properties)
- **property_images** — image URLs linked to properties
- **saved_properties** — many-to-many join between users and properties
- **enquiries** — tenant messages to owners about specific properties, with status tracking

## 🔐 API Overview

| Method | Endpoint | Description | Access |
|--------|----------|--------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT | Public |
| GET | `/api/properties` | List/filter properties | Public |
| GET | `/api/properties/:id` | Get property details | Public |
| POST | `/api/properties` | Create a property | Owner |
| PUT | `/api/properties/:id` | Update a property | Owner |
| DELETE | `/api/properties/:id` | Delete a property | Owner |
| POST | `/api/properties/:id/images` | Upload property images | Owner |
| GET | `/api/users/saved-properties` | Get saved properties | Tenant |
| POST | `/api/enquiries/:propertyId` | Send an enquiry | Tenant |
| GET | `/api/enquiries/received` | View received enquiries | Owner |

## 🚀 Running Locally

**Backend:**
```bash
cd backend
npm install
# add a .env file with DB credentials and JWT_SECRET
node config/createTables.js   # creates tables
nodemon server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`, frontend on `http://localhost:5173`.

## 🔮 Planned Enhancements
- Java Spring Boot microservice for advanced property search
- Deployment (Vercel + Render/Railway)
- Pagination and input validation with express-validator

## 👤 Author

**Yelchuri Chandrasekhar**
[GitHub](https://github.com/yelchuri-chandrasekhar) · [LinkedIn](https://linkedin.com/in/chandrasekhar-yelchuri)