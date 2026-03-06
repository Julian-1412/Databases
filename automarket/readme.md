# AutoMarket Pro

AutoMarket Pro is a full-stack learning project for managing a car dealership.  
It covers database normalization, a MySQL schema, a REST API with Node.js and Express, and a simple frontend in vanilla JavaScript.

---

## Features

- Sellers and buyers stored in a single `person` table  
- Vehicles stored in `car` with unique plate constraint  
- Purchase and sale records with referential integrity  
- MySQL trigger preventing selling cars that were never purchased  
- REST API (CRUD) focused on the main entity: `car`  
- Basic frontend (HTML/CSS/JS) to interact with the API:
  - Create vehicles via form
  - List inventory in real time
  - Edit and delete vehicles
  - Import data from CSV (through an existing backend endpoint)

---

## Tech Stack

- **Backend**
  - Node.js
  - Express
  - MySQL (InnoDB)
  - mysql2
  - dotenv
- **Frontend**
  - HTML5
  - CSS3
  - Vanilla JavaScript (Fetch API)
- **Dev tools**
  - nodemon
  - Git

---

## Database Design

Database: `automarket`

Main tables:

- `person`
  - `id_person` (PK)
  - `name`
  - `phone` (UNIQUE) — identifies sellers and buyers
- `car`
  - `id_car` (PK)
  - `plate` (UNIQUE)
  - `brand`
  - `color`
  - `kilometers`
  - `car_state`
  - `operational_status`
- `purchase`
  - `id_purchase` (PK)
  - `car_id` (FK → `car.id_car`)
  - `seller_id` (FK → `person.id_person`)
  - `entry_date`
  - `purchase_price`
- `sale`
  - `id_sale` (PK)
  - `car_id` (FK → `car.id_car`, UNIQUE)
  - `buyer_id` (FK → `person.id_person`)
  - `sale_date`
  - `sale_price`

### Business Rules Enforced

- Plates are unique across all cars.  
- Phone numbers are unique across all persons.  
- A car cannot be deleted if it has purchase or sale records (`ON DELETE RESTRICT`).  
- A car cannot be sold if there is no prior purchase record (trigger on `sale`).

---

## REST API

Base URL (development):

http://localhost:3000/api

## Car Endpoints
	•	 POST /cars Create a new car.
	•	 GET /cars Get the full list of cars.
	•	 GET /cars/:plate Get a car by its unique plate.
	•	 PUT /cars/:id Update technical information of a car (brand, color, kilometers, states).
	•	 DELETE /cars/:id Physically delete a car.Returns a conflict error if the car has related transactions (purchase/sale).

## Project Structure
automarket-api/
├── app.js                 # Express app entry point
├── .env                   # Environment variables (not committed)
├── package.json
├── public/                # Frontend
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── src/
    ├── db.js             # MySQL connection pool
    ├── controllers/
    │   ├── car.controller.js
    │   └── import.controller.js
    └── routes/
        ├── car.routes.js
        └── import.routes.js

## Getting started

Prerequisites
	•	Node.js (LTS recommended)
	•	MySQL server
1. Clone the repository
2. Install dependencies
3. Create the database
Connect to MySQL and run the SQL script (schema + trigger) included in the project.
4. Configure environment variables
Create a  .env  file in the project root:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=automarket
PORT=3000
5. Run the server:
npm run dev

## Git & Environment Files
The project uses a  .gitignore  that excludes:
	•	 node_modules/ 
	•	 .env 
This prevents heavy dependencies and sensitive credentials from being committed to the repository.
Learning Goals
This project was built to practice:
	•	Relational modeling and normalization up to 3NF
	•	Designing referential integrity and triggers in MySQL
	•	Building a REST API with Node.js and Express
	•	Working with a MySQL connection pool
	•	Handling errors and validation at both DB and API levels
	•	Creating a small vanilla JS frontend that consumes a REST API
	•	Using environment variables and Git best practices
You can extend it by adding authentication, pagination, more detailed reporting (profit per car, per seller, etc.), or a more advanced UI framework if desired.