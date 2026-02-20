# Plateforme de gestion de tâches collaboratives

Une application Fullstack MERN complète avec authentification, rôles et API sécurisée.

## Fonctionnalités

### Backend (Node.js + Express + MongoDB)
- ✅ Authentification (JWT)
- ✅ CRUD des utilisateurs
- ✅ CRUD des tâches
- ✅ Attribution de tâches à un utilisateur
- ✅ Statut de tâche : à faire / en cours / terminé
- ✅ Validation des données (Joi)
- ✅ Gestion des erreurs
- ✅ Sécurité (CORS)

### Frontend (React)
- ✅ Pages Login / Register
- ✅ Tableau de bord
- ✅ Création / modification / suppression de tâches
- ✅ Filtrage par statut
- ✅ Appels API avec Axios
- ✅ Context API pour l'état global
- ✅ Protection des routes

### Rôles
- **Admin** : gérer les utilisateurs
- **User** : gérer ses tâches

## Structure du projet

```
projet-mern/
├── backend/          # API Node.js/Express
├── frontend/         # Application React
└── README.md         # Ce fichier
```

## Installation

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Technologies

- **Backend**: Node.js, Express, MongoDB, JWT, Joi, CORS
- **Frontend**: React, Axios, Context API, React Router
- **Base de données**: MongoDB
