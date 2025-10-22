
# Operator Training & Operator of the Month Dashboard

A full-stack web app for managing operator training statuses and awarding points based on performance/team contributions.

## Overview

This dashboard has two major features:

### 1. Skills Matrix
A visual board that shows each operator's training status across various skills:
- **Not Trained**
- **Trained**
- **Shadowed**
- **Ran in Workshop**
- **Can Train**

Drag-and-drop functionality lets supervisors update training status easily.

### 2. Operator of the Month (OOTM) Points
Points can be assigned to operators based on predefined categories, examples being:
- Ran a new module infront of Clients
- Arrived at work on time for a Month
- Created and Completed a project to benefit the facility

The total points for each operator are tracked and updated in real-time, with whoever having the most being awarded the Operator of the Month.

## 🚀 Tech Stack

### Frontend
- **React** (with functional components and hooks)
- **Axios** for API calls

### Backend
- **Flask** + **Flask-CORS**
- **SQLAlchemy** for ORM
- Modular route handling with Flask Blueprints

### Database
- **PostgreSQL**, connected via SQLAlchemy
- Five core tables:
  - `operators`
  - `trainings`
  - `training_statuses` (current operator standings within each respective training)
  - `points` (current point total per operator)
  - `ootm_categories` (categories and how many points each is worth)

### 📁 Project Structure
```
ILC_Operator_Central/ 
├── backend/
│   ├── app.py                  # Flask app entrypoint
│   ├── config.py               # App configuration
│   ├── db_setup.py             # SQLAlchemy setup
│   ├── models/
│   │   ├── operator.py
│   │   ├── skills_matrix.py
│   │   └── operator_points.py
│   ├── routes/
│   │   ├── skills_matrix_routes.py
│   │   └── operator_points_routes.py
│   └── services/
│       ├── skills_matrix_service.py
│       └── operator_points_service.py
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
│   └── package.json
├── .gitignore
├── README.md
└── requirements.txt
```


## ⚙️ Setup

### Backend

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables in a `.env` file (optional if hardcoded in `config.py`):
   ```
   DATABASE_URL=postgresql://user:password@localhost/db_name
   ```

4. Run the backend:
   ```bash
   python app.py
   ```

### Frontend

1. Go to the frontend directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Add a `.env` file:
   ```
   REACT_APP_API_BASE=(Excluded)
   ```

4. Run the frontend:
   ```bash
   npm start
   ```

## 🧪 Example API Endpoints

- `GET /api/operators` – list of all operators
- `GET /api/ootm_categories` – point-giving categories
- `GET /api/points` – current point totals by operator
- `POST /api/add_points` – add points to an operator

## 📌 Future Improvements

- Restricted Access for supervisors
- Exportable reports (e.g., CSV)
- Leaderboard view
- Operator-level history/log of points added
- Mobile-friendly design

## 🧑‍💻 Author
Jason Perez — [GitHub](https://github.com/jperez318)  
Built as part of a personal portfolio to demonstrate full-stack development and backend architecture skills.
