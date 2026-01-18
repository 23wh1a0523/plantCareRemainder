🌱 Plant Care Reminder App

Full-Stack MERN / MEAN Web Application

1. Introduction
1.1 Purpose

The Plant Care Reminder App is a full-stack web application designed to help users manage their plants efficiently by tracking watering schedules and accessing detailed care instructions.

This project demonstrates real-world full-stack development using MongoDB, Express, Node.js, and either React (MERN) or Angular (MEAN) as the frontend.

The application focuses on:

CRUD operations

Role-based access control

Reminder scheduling

Image upload

Clean and beginner-friendly UI

1.2 Target Audience

Beginner to intermediate students learning MERN / MEAN

Developers building portfolio projects

Learners practicing full-stack architecture

Anyone interested in plant care management systems

1.3 Learning Outcomes

By building this project, you will learn:

REST API design using Express.js

MongoDB schema design using Mongoose

JWT-based authentication

Role-based access control (Admin/User)

Image upload handling using Multer

Frontend routing and API integration

Full-stack project structure (industry-style)

2. System Overview
2.1 User Roles
Role	Description
Admin	Manages plant care instructions and plant types
User	Manages personal plants and watering schedules
2.2 Core Features

User authentication using JWT

Plant CRUD management

Watering reminder scheduling

Image upload for plants

Admin-managed care guides

User profile management

3. High-Level Architecture
[ React App / Angular App ]
           |
           | —— REST API ——
           |
     [ Node.js + Express ]
           |
        [ MongoDB ]


Key Principle:
✔ One backend
✔ One database
✔ Two possible frontends (React or Angular)

4. Technology Stack
4.1 Frontend (Choose One)
Option A – MERN (React)

React.js (Hooks)

React Router

Axios

Tailwind CSS / Material UI / Bootstrap

Option B – MEAN (Angular)

Angular Components

Angular Routing

HttpClient

Angular Material

4.2 Backend

Node.js

Express.js

MongoDB

Mongoose ORM

JWT Authentication

bcrypt (Password Hashing)

Multer (Image Upload)

5. Database Design
5.1 Database

MongoDB (Local or Atlas)

ODM: Mongoose

5.2 Collections
5.2.1 users
{
  "_id": "ObjectId",
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "admin | user",
  "profilePic": "string",
  "createdAt": "Date"
}

5.2.2 plants
{
  "_id": "ObjectId",
  "userId": "ObjectId (ref users)",
  "name": "string",
  "type": "string",
  "imageUrl": "string",
  "wateringFrequency": "string",
  "notes": "string"
}

5.2.3 wateringSchedules
{
  "_id": "ObjectId",
  "plantId": "ObjectId (ref plants)",
  "frequency": "daily | weekly | custom",
  "nextWateringDate": "Date",
  "notificationEnabled": "boolean"
}

5.2.4 careGuides
{
  "_id": "ObjectId",
  "plantType": "string",
  "sunlightNeeded": "string",
  "wateringTips": "string",
  "fertilizerTips": "string",
  "temperatureRange": "string",
  "commonIssues": "string"
}

6. Backend Design
6.1 Folder Structure
backend/
│── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── app.js
│── .env
│── package.json

6.2 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	User registration
POST	/auth/login	User/Admin login
Plant APIs
Method	Endpoint	Description
POST	/plants	Add plant
GET	/plants	Get user plants
PUT	/plants/:id	Update plant
DELETE	/plants/:id	Delete plant
Watering Schedule APIs
Method	Endpoint	Description
POST	/schedule	Add schedule
GET	/schedule	View schedules
PUT	/schedule/:id	Update schedule
DELETE	/schedule/:id	Delete schedule
Care Guide APIs (Admin)
Method	Endpoint	Description
POST	/care-guides	Add guide
PUT	/care-guides/:id	Edit guide
DELETE	/care-guides/:id	Delete guide
GET	/care-guides	View guides
7. Frontend Pages

1️⃣ Login Page

JWT authentication

Role-based redirection

2️⃣ Plant List Page

View all plants

Add / Edit / Delete plant

Display next watering date

3️⃣ Watering Schedule Page

Set watering frequency

View upcoming reminders

4️⃣ Care Instructions Page

Admin: CRUD access

User: Read-only access

5️⃣ Profile Page

Update username

Update profile picture

Change password

8. Security Features

JWT authentication

Password hashing using bcrypt

Role-based authorization

Protected API routes

9. Complexity Level

✔ Beginner–Intermediate

Reason:

Simple CRUD logic

Easy UI

No complex algorithms

Yet includes real-world features like:

Authentication

Image upload

Scheduling

Admin control

10. Future Enhancements

Email or push notifications

Calendar integration

Weather-based watering suggestions

Mobile application

AI-based plant care tips

