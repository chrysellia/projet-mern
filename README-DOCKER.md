# 🐳 Dockerisation de l'application Task Management

## 📋 Description

Configuration Docker complète pour l'application MERN (MongoDB, Express, React, Node.js) avec :
- **MongoDB** : Base de données avec persistance
- **Backend** : API Node.js avec Express
- **Frontend** : Application React avec Nginx
- **Redis** : Cache optionnel
- **Health checks** : Surveillance de l'état des services

## 🚀 Démarrage rapide

### Production
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier l'état
docker-compose ps

# Voir les logs
docker-compose logs -f
```

### Développement
```bash
# Démarrer en mode développement (avec hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Arrêter les services
docker-compose down
```

## 🌐 Accès à l'application

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5001
- **MongoDB** : mongodb://localhost:27017
- **Health Check Backend** : http://localhost:5001/health
- **Health Check Frontend** : http://localhost:3000/health

## 📁 Structure des fichiers

```
├── docker-compose.yml          # Production
├── docker-compose.dev.yml      # Développement
├── .dockerignore               # Fichiers à exclure
├── mongo-init.js               # Initialisation MongoDB
├── backend/
│   ├── Dockerfile              # Backend production
│   └── healthcheck.js          # Health check
├── frontend/
│   ├── Dockerfile              # Frontend production
│   ├── Dockerfile.dev          # Frontend développement
│   └── nginx.conf              # Configuration Nginx
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine :
```env
# Email configuration
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app-généré

# Optional: Override default values
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
JWT_SECRET=votre-secret-key-tres-securise-123456789
```

### MongoDB

- **Utilisateur admin** : admin / password123
- **Base de données** : task-management
- **Utilisateur app** : taskapp / taskapp123
- **Persistance** : Volume `mongodb_data`

### Backend

- **Port** : 5001
- **Node.js** : 18 Alpine
- **Utilisateur** : Non-root (nodejs)
- **Health check** : `/health`

### Frontend

- **Port** : 3000
- **Serveur** : Nginx Alpine
- **Build** : Multi-stage build
- **Compression** : Gzip activé

## 🏊‍♂️ Services et ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Application React |
| Backend | 5001 | API Node.js |
| MongoDB | 27017 | Base de données |
| Redis | 6379 | Cache (optionnel) |

## 🔍 Health Checks

### Backend
```bash
curl http://localhost:5001/health
```

### Frontend
```bash
curl http://localhost:3000/health
```

### MongoDB
```bash
docker exec task-management-mongodb mongosh --eval "db.adminCommand('ping')"
```

## 📊 Monitoring

### Vérifier l'état des conteneurs
```bash
docker-compose ps
```

### Voir les logs en temps réel
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Ressources utilisées
```bash
docker stats
```

## 🛠️ Commandes utiles

### Reconstruction
```bash
# Reconstruire les images
docker-compose build --no-cache

# Recréer les conteneurs
docker-compose up --force-recreate
```

### Nettoyage
```bash
# Arrêter et supprimer les conteneurs
docker-compose down

# Supprimer les volumes (attention, données perdues)
docker-compose down -v

# Supprimer les images orphelines
docker image prune
```

### Debug
```bash
# Entrer dans un conteneur
docker exec -it task-management-backend sh
docker exec -it task-management-mongodb mongosh

# Redémarrer un service spécifique
docker-compose restart backend
```

## 🔐 Sécurité

- **Utilisateur non-root** pour les conteneurs
- **Headers de sécurité** Nginx
- **Variables d'environnement** pour les secrets
- **Network isolé** pour les services
- **Health checks** pour la surveillance

## 📈 Performance

- **Multi-stage build** pour le frontend
- **Nginx** pour servir les fichiers statiques
- **Gzip compression** activée
- **Cache headers** pour les assets statiques
- **Indexes MongoDB** optimisés

## 🔄 Déploiement

### Production
```bash
# Pull des dernières images
docker-compose pull

# Mise à jour
docker-compose up -d --force-recreate
```

### Scaling
```bash
# Scaler le backend
docker-compose up -d --scale backend=3
```

## 🐛 Dépannage

### Problèmes courants

1. **Port déjà utilisé**
   ```bash
   # Vérifier les ports utilisés
   netstat -tulpn | grep :3000
   
   # Tuer le processus
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   # Donner les permissions
   sudo chown -R $USER:$USER .
   ```

3. **MongoDB ne démarre pas**
   ```bash
   # Vérifier les logs
   docker-compose logs mongodb
   
   # Recréer le volume
   docker-compose down -v
   docker-compose up -d mongodb
   ```

4. **Frontend inaccessible**
   ```bash
   # Vérifier Nginx
   docker exec -it task-management-frontend nginx -t
   
   # Recharger Nginx
   docker exec -it task-management-frontend nginx -s reload
   ```

## 📝 Notes importantes

- Les données MongoDB sont persistées dans des volumes
- Les logs sont disponibles via `docker-compose logs`
- L'application est accessible en HTTPS si configuré
- Les health checks permettent une surveillance automatique
- Le mode développement supporte le hot reload

## 🚀 Next steps

1. **Configurer un reverse proxy** (Traefik/Nginx)
2. **Ajouter SSL/TLS** avec Let's Encrypt
3. **Monitorer avec Prometheus/Grafana**
4. **Backup automatique** des volumes
5. **CI/CD** avec GitHub Actions
