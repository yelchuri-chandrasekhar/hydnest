# 🏠 HydNest

A full-stack rental platform for finding PGs, hostels, flats, and shared rooms in Hyderabad. Built as a real-world project to demonstrate end-to-end full-stack development — from database design to a responsive, role-based UI, backed by a polyglot microservices architecture (Node.js + Java Spring Boot).

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
**Core Backend:** Node.js, Express.js — handles auth, property CRUD, image uploads, saved properties, enquiries
**Search Microservice:** Java, Spring Boot 4, Spring Data JPA — handles property search & filtering
**Database:** PostgreSQL (shared by both backend services)
**Auth:** JWT, bcrypt.js
**File Uploads:** Multer
**Styling:** Plain CSS with a shared design system (CSS custom properties)

## 📂 Project Structure

```
hydnest/
├── backend/              # Node.js/Express - auth, CRUD, uploads, enquiries
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   └── server.js
├── search-service/       # Java Spring Boot - property search microservice
│   └── src/main/java/com/hydnest/searchservice/
│       ├── controller/   # REST endpoint for search
│       ├── model/        # Property entity (maps to shared DB)
│       └── repository/   # JPA query logic with dynamic filters
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/     # Axios instances for both backend services
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
| GET | `/api/search/properties` | Search/filter properties (Java service) | Public |

> Note: Property search/filtering is served by the Java Spring Boot microservice (port 8081), while all other endpoints are served by the Node backend (port 5000). Both connect to the same PostgreSQL database.

## 🚀 Running Locally

**Backend (Node):**
```bash
cd backend
npm install
# add a .env file with DB credentials and JWT_SECRET
node config/createTables.js   # creates tables
nodemon server.js
```

**Search Microservice (Java):**
```bash
cd search-service
cp src/main/resources/application.properties.example src/main/resources/application.properties
# edit application.properties with your DB credentials, or set DB_PASSWORD as an env var
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Node backend runs on `http://localhost:5000`, Java search service on `http://localhost:8081`, frontend on `http://localhost:5173`.

## 🔮 Planned Enhancements
- Deployment (Vercel + Render/Railway)
- Pagination and input validation with express-validator
- Expand Java microservice with full-text search / Elasticsearch integration

## 👤 Author

**Yelchuri Chandrasekhar**
[GitHub](https://github.com/yelchuri-chandrasekhar) · [LinkedIn](https://linkedin.com/in/chandrasekhar-yelchuri)