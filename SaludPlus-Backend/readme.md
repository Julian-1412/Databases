# SaludPlus API - Hybrid Healthcare Management System

SaludPlus is a backend API designed for a comprehensive healthcare management system. It utilizes a **hybrid architecture**, combining **MySQL** for relational transactional data and **MongoDB** for flexible, document-based patient clinical histories.

---

## 🚀 Features

* **Massive Data Migration**: Custom CSV parser to migrate large datasets into two databases simultaneously.
* **Relational Integrity**: Complete SQL schema with foreign key constraints for Doctors, Insurances, and Patients.
* **NoSQL Clinical Histories**: Automated synchronization of patient appointments into MongoDB documents.
* **Cross-Database Sync**: Real-time synchronization; updating a doctor's name in MySQL automatically reflects in the MongoDB clinical records.
* **Business Intelligence**: Financial reporting for revenue calculation by insurance provider and date range.

---

## 🏗️ Architecture Design

The system follows a **Polyglot Persistence** strategy:

* **MySQL**: Handles structured, relational data where ACID compliance is critical (e.g., financial totals, core entity management).
* **MongoDB**: Stores clinical history as a single document per patient, allowing fast retrieval of a patient's entire medical timeline without complex joins.

---

## 🛠️ Tech Stack

* **Runtime**: Node.js
* **Framework**: Express.js
* **Databases**:
    * MySQL (Transactional: Doctors, Patients, Appointments)
    * MongoDB (Document-oriented: Clinical Histories)
* **Middleware**: Multer (File Uploads), csv-parser (Data Processing), Mongoose (NoSQL ODM).

---

## 📋 Prerequisites

* Node.js installed (v18 or higher recommended).
* A running instance of MySQL.
* A running instance of MongoDB.

---

## ⚙️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd SaludPlus-Backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and configure your credentials:
    ```env
    PORT=3000
    MYSQL_HOST=localhost
    MYSQL_USER=your_user
    MYSQL_PASSWORD=your_password
    MYSQL_DATABASE=saludplus
    MONGO_URI=mongodb://localhost:27017/saludplus
    ```

4.  **Important**: Create an `uploads/` folder in the root directory to allow Multer to store temporary files during migration.

5.  **Run the application:**
    ```bash
    npm run dev
    ```

---

## 🛣️ API Endpoints

### 1. Data Migration
* **POST** `/api/migration/migrate`
* **Description**: Processes CSV files to populate the database.
* **Body (form-data)**: 
    * **Key**: `file` (Must be type **File**).
* **Required Order**: To maintain relational integrity, files must be migrated in this order:
    1.  Insurances
    2.  Doctors
    3.  Patients
    4.  Appointments

### 2. Doctors (MySQL)
* **GET** `/api/doctors`: Retrieve all doctors.
* **GET** `/api/doctors?specialty=Cardiology`: Filter doctors by specialty via query parameters.
* **GET** `/api/doctors/:id`: Get detailed information for a specific doctor.
* **PUT** `/api/doctors/:id`: Update doctor details. *Note: Updating the name will trigger a sync update across all MongoDB appointment records.*

### 3. Reports (MySQL)
* **GET** `/api/reports/revenue`: Financial management report.
* **Query Params**: `startDate` (YYYY-MM-DD), `endDate` (YYYY-MM-DD).
* **Response**: Returns `totalRevenue` and a breakdown by insurance provider.

### 4. Patient History (MongoDB)
* **GET** `/api/patients/:email/history`: Retrieve the full clinical history document for a patient, including all nested appointments.

---

## 👤 Author

**Julian Elejalde** - Coder