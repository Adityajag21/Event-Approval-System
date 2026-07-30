# 🎓 Event Approval System

A full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** application that streamlines the campus event approval process through a secure, role-based workflow. The system replaces manual paperwork with a digital platform where students can submit event requests and track their approval status in real time.

---

## 📌 Overview

The **Event Approval System** is designed to automate the process of requesting and approving college events. Students can submit event requests with supporting documents, while coordinators and administrators review, approve, or reject requests through a structured multi-level approval workflow.

The platform improves transparency, reduces paperwork, and enables efficient communication between students and authorities.

---

## ✨ Features

* 🔐 Secure JWT-based Authentication
* 👥 Role-Based Access Control
* 📝 Online Event Permission Request Submission
* 📄 Document Upload Support
* 📊 Multi-Level Approval Workflow
* ⏳ Real-Time Request Status Tracking
* 🏛️ Admin Dashboard for Managing Users and Requests
* 📱 Responsive User Interface
* ⚡ RESTful API Architecture

---

## 👨‍💻 User Roles

### 🎓 Student

* Register and log in
* Submit event permission requests
* Upload supporting documents
* Track request status
* View approval history

### 🏛️ Coordinator / Authority

* View assigned requests
* Approve or reject requests
* Add remarks
* Monitor pending approvals

### ⚙️ Administrator

* Manage users and roles
* Manage approval workflow
* Monitor all event requests
* Access system-wide dashboard

---

## 🏗️ Approval Workflow

```text
Student
   │
   ▼
Coordinator
   │
   ▼
Department Authority
   │
   ▼
Final Approval
```

Each request progresses through multiple approval stages until it is either approved or rejected.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* Context API

### Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

### Database

* MongoDB
* Mongoose

### Tools

* Git
* GitHub
* Postman
* VS Code

---

## 📂 Project Structure

```text
Event-Approval-System
│
├── backend
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── package.json
│   └── index.js
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   └── api
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Adityajag21/Event-Approval-System.git
```

### 2. Navigate to the Project

```bash
cd Event-Approval-System
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 5. Configure Environment Variables

Create a `.env` file inside the `backend` folder and add your configuration, for example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### 6. Start the Backend

```bash
cd backend
npm start
```

### 7. Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend will typically be available at:

```text
http://localhost:5173
```

---

## 📸 Screenshots

Add screenshots of your application here.

* Login Page
* Student Dashboard
* Create Request Page
* Request Tracking
* Admin Dashboard
* Approval Panel

---

## 🔒 Security Features

* JWT Authentication
* Protected Routes
* Role-Based Authorization
* Secure Password Handling
* Environment Variable Configuration

---

## 📈 Future Enhancements

* Email Notifications
* QR Code Verification
* PDF Permission Letter Generation
* Mobile Responsive Improvements
* Analytics Dashboard
* AI-Based Event Risk Analysis
* Event Calendar Integration
* Cloud File Storage

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome. Feel free to fork the repository and submit a pull request.

---

## 👨‍💻 Author

**Aditya Jagtap**

GitHub: https://github.com/Adityajag21

---

## ⭐ Support

If you found this project helpful, consider giving it a **⭐ Star** on GitHub!
