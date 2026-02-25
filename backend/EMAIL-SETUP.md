#  Configuration des notifications email par Gmail

## Problème actuel
Les notifications email ne sont pas envoyées car le système utilise `notificationServiceSimple.js` qui ne fait que des logs en console.

##  Solution
Le système est maintenant configuré pour utiliser `notificationService.js` qui envoie de vrais emails via Gmail.

## Étapes de configuration

### 1. Configurer Gmail pour l'envoi d'emails

#### Option A: Mot de passe d'application (recommandé)
1. Allez dans votre compte Google: https://myaccount.google.com/
2. Activez la **vérification en deux étapes** si ce n'est pas déjà fait
3. Allez dans: https://myaccount.google.com/apppasswords
4. Créez un nouveau mot de passe d'application:
   - Sélectionnez "Autre (nom personnalisé)"
   - Donnez un nom comme "Task Management App"
   - Copiez le mot de passe généré (16 caractères)

#### Option B: Activer "Less secure apps" (moins sécurisé)
1. Allez dans: https://myaccount.google.com/lesssecureapps
2. Activez l'option "Permettre les applications moins sécurisées"
3. **Attention**: Cette option est moins sécurisée et peut être désactivée par Google

### 2. Mettre à jour le fichier .env

```env
# Configuration Email (Gmail)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app-généré
FRONTEND_URL=http://localhost:3000
```

**Important**: 
- `EMAIL_USER`: Votre adresse Gmail complète
- `EMAIL_PASS`: Le mot de passe d'application de 16 caractères (pas votre mot de passe normal!)

### 3. Tester la configuration

Exécutez le script de test:
```bash
cd backend
node test-email.js
```

### 4. Redémarrer le serveur

```bash
npm run dev
```

## Fréquence des notifications

Le système envoie automatiquement:

###  Tâches en retard
- **Fréquence**: Toutes les heures
- **Condition**: Deadline dépassée ET statut != "terminé"
- **Email**: Notification rouge avec détails du retard

###  Rappels de deadline
- **Fréquence**: Tous les jours à 9h et 18h
- **Condition**: Deadline dans 2 jours ET statut != "terminé"
- **Email**: Rappel jaune avec deadline approchante

##  Vérification

### Logs du serveur
Vous devriez voir ces messages dans la console:
```
Starting notification cron jobs (Email Mode)...
Cron jobs started successfully!
- Overdue tasks check: Every hour
- Upcoming deadlines check: Daily at 9:00 AM and 6:00 PM
 Mode: Email sending (Gmail configured)
```

### Logs des notifications
```
Running overdue tasks check...
Email service is ready to send messages
Overdue tasks check completed. 2 emails sent.
```

##  Dépannage

### Erreur: "535-5.7.8 Username and Password not accepted"
- **Cause**: Mauvais email ou mot de passe
- **Solution**: Vérifiez EMAIL_USER et EMAIL_PASS dans .env
- **Conseil**: Utilisez un mot de passe d'application

### Erreur: "Host is unreachable"
- **Cause**: Problème de connexion réseau
- **Solution**: Vérifiez votre connexion internet

### Erreur: "Application-specific password required"
- **Cause**: La vérification en deux étapes est activée mais pas de mot de passe d'application
- **Solution**: Créez un mot de passe d'application

##  Test manuel

Pour tester manuellement une notification:
1. Créez une tâche avec une deadline dépassée
2. Assurez-vous que `notified: false`
3. Exécutez: `node test-email.js`

##  Notes importantes

- Le système marque automatiquement les tâches comme `notified: true` pour éviter les doublons
- Les emails sont envoyés uniquement aux utilisateurs assignés aux tâches
- Les administrateurs reçoivent aussi des notifications dans le panneau d'admin
- Le design des emails est professionnel et responsive

##  Vérification finale

Après configuration, vous devriez recevoir:
1. **Email de test** immédiatement
2. **Notifications automatiques** toutes les heures pour les tâches en retard
3. **Rappels** quotidiens pour les deadlines approchantes
