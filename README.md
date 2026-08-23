# ☁️ Cloud Personal Finance & Expense Tracker

A full-stack cloud computing web application built with **Node.js**, **Express.js**, **MongoDB / Mongoose**, and **Glassmorphic Vanilla HTML/CSS/JS** with interactive **Chart.js** data analytics. 

Designed for 1-click cloud deployment on platforms like **Render**, **Vercel**, or **Railway** paired with a free **MongoDB Atlas** database.

---

## ✨ Features

- 📊 **Real-Time KPI Dashboard**: Metrics for Total Income, Total Expenses, Net Balance, and Savings Rate.
- 📈 **Interactive Charts**: Donut chart for category expense distribution.
- 💳 **Transaction CRUD Operations**: Add, filter, search, and delete transactions.
- 📥 **CSV Data Export**: Export financial transaction logs directly to CSV files.
- ☁️ **Cloud Database Support**: Seamless connection to MongoDB Atlas cloud database.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: HTML5, Modern CSS Glassmorphism design system, Vanilla JavaScript, Chart.js.
- **Backend**: Node.js, Express.js REST API.
- **Database**: MongoDB via Mongoose ORM.
- **Deployment**: Render Blueprint (`render.yaml`), Vercel (`vercel.json`), Procfile.

---

## 🚀 Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
# Local MongoDB connection (or MongoDB Atlas string)
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/finance_tracker
```

### 3. Run the App
```bash
# Start server
npm start

# Or run in development mode with auto-reload
npm run dev
```

Open your browser at: `http://localhost:5000`

---

## ☁️ Step-by-Step Cloud Deployment Guide

### Step 1: Create a Free MongoDB Atlas Database

1. Sign up / Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Cluster**.
3. Under **Database Access**, create a database user (username & password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)** so your cloud hosting provider can connect.
5. Click **Connect** > **Drivers** and copy your **MongoDB Connection String**, e.g.:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/finance_tracker?retryWrites=true&w=majority`

---

### Step 2: Deploy to Render (Recommended Free Option)

1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com/).
3. Click **New +** > **Web Service**.
4. Connect your GitHub repository.
5. Set the settings:
   - **Name**: `cloud-finance-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add Environment Variable under **Environment Variables**:
   - `MONGODB_URI`: *<Paste your MongoDB Atlas Connection String from Step 1>*
7. Click **Create Web Service**. Your live cloud URL will be ready in ~2 minutes!

---

### Step 3: Deploy to Vercel (Alternative Option)

1. Install Vercel CLI or connect via the [Vercel Dashboard](https://vercel.com).
2. Import your GitHub repository.
3. In **Environment Variables**, add:
   - `MONGODB_URI`: *<Paste your MongoDB Atlas Connection String>*
4. Click **Deploy**.

---

## 🧪 API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck & DB status |
| `GET` | `/api/transactions` | Fetch all transactions (supports `?type=`, `?category=`, `?search=`) |
| `GET` | `/api/transactions/summary` | Aggregated KPI totals & category breakdown |
| `POST` | `/api/transactions` | Create new transaction |
| `DELETE` | `/api/transactions/:id` | Delete transaction |
