# RealTalk

Une application de chat en temps réel moderne avec une interface inspirée de WhatsApp Desktop.

## Description

RealTalk est une application de messagerie instantanée qui permet aux utilisateurs de créer des canaux publics, d'envoyer des messages privés et de communiquer en temps réel. L'interface utilisateur s'inspire du design de WhatsApp Desktop pour offrir une expérience familière et intuitive.

## Fonctionnalités

### Communication
- **Canaux publics** : Créez et rejoignez des canaux de discussion thématiques
- **Messages privés** : Conversations directes entre utilisateurs
- **Messagerie en temps réel** : Communication instantanée via WebSocket
- **Historique des conversations** : Conservation des messages échangés

### Gestion des canaux
- **Création de canaux** : Tout utilisateur peut créer un nouveau canal
- **Suppression de canaux** : Seul le créateur peut supprimer son canal
- **Liste des utilisateurs** : Visualisation des membres connectés par canal
- **Gestion des permissions** : Contrôle d'accès basé sur la propriété

### Interface utilisateur
- **Design moderne** : Interface inspirée de WhatsApp Desktop
- **Navigation intuitive** : Sidebar avec onglets Canaux et Conversations
- **Responsive** : Adaptation automatique aux différentes tailles d'écran
- **Thème sombre** : Couleurs optimisées pour une utilisation prolongée

## Architecture technique

### Frontend (Client)
- **React 18** : Framework JavaScript moderne pour l'interface utilisateur
- **Vite** : Outil de build rapide et optimisé
- **Socket.IO Client** : Communication WebSocket en temps réel
- **CSS personnalisé** : Styles inspirés de WhatsApp Desktop

### Backend (Serveur)
- **Node.js** : Runtime JavaScript côté serveur
- **Socket.IO** : Gestion des connexions WebSocket
- **Gestion d'état en mémoire** : Stockage temporaire des utilisateurs et canaux

## Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. Clonez le repository
```bash
git clone [url-du-repository]
cd realtalk
```

2. Installez les dépendances du serveur
```bash
cd server
npm install
```

3. Installez les dépendances du client
```bash
cd ../client/RealTalk
npm install
```

### Démarrage

1. Démarrez le serveur (dans le dossier server)
```bash
node server.js
```
Le serveur démarre sur le port 3001

2. Démarrez le client (dans le dossier client/RealTalk)
```bash
npm run dev
```
L'application client démarre sur le port 5173

3. Accédez à l'application
Ouvrez votre navigateur et rendez-vous sur `http://localhost:5173`

## Utilisation

### Première connexion
1. Saisissez un pseudo unique sur la page de connexion
2. Cliquez sur "Se connecter" pour accéder à l'application

### Navigation
- **Onglet Canaux** : Parcourez et rejoignez les canaux disponibles
- **Onglet Conversations** : Accédez à vos canaux rejoints et conversations privées
- **Bouton +** : Créez un nouveau canal ou démarrez une conversation privée

### Gestion des canaux
- **Rejoindre un canal** : Cliquez sur le bouton + à côté du nom du canal
- **Créer un canal** : Utilisez le bouton + puis "Créer un canal"
- **Supprimer un canal** : Utilisez le bouton corbeille (visible uniquement pour le créateur)
- **Quitter un canal** : Utilisez le bouton de sortie dans l'interface du canal

### Messages privés
- **Démarrer une conversation** : Bouton + puis "Message privé"
- **Saisir le destinataire** : Entrez le pseudo de l'utilisateur cible
- **Converser** : Les messages s'affichent en temps réel

## Structure du projet

```
realtalk/
├── server/
│   ├── server.js              # Serveur principal Socket.IO
│   └── package.json           # Dépendances serveur
├── client/
│   └── RealTalk/
│       ├── src/
│       │   ├── components/    # Composants React
│       │   │   ├── Auth.jsx   # Page de connexion
│       │   │   ├── App.jsx    # Composant principal
│       │   │   ├── sidebar.jsx # Navigation latérale
│       │   │   ├── ChannelChat.jsx # Interface de canal
│       │   │   ├── PrivateChat.jsx # Interface privée
│       │   │   └── Logo.jsx   # Logo de l'application
│       │   ├── styles/
│       │   │   └── realtalk.css # Styles personnalisés
│       │   ├── socket.js      # Configuration Socket.IO
│       │   └── main.jsx       # Point d'entrée React
│       └── package.json       # Dépendances client
└── README.md                  # Documentation
```

## Commandes disponibles

### Commandes de chat
- `/nick [pseudo]` : Changer de pseudo
- `/list` : Lister les canaux disponibles
- `/create [nom]` : Créer un nouveau canal
- `/join [canal]` : Rejoindre un canal
- `/quit [canal]` : Quitter un canal
- `/delete [canal]` : Supprimer un canal (créateur uniquement)
- `/users [canal]` : Lister les utilisateurs d'un canal
- `/msg [utilisateur]` : Démarrer une conversation privée
- `/mychannels` : Lister ses canaux rejoints
- `/privates` : Lister ses conversations privées

## Développement

### Ajout de fonctionnalités
- Les composants React sont modulaires et réutilisables
- Les styles sont centralisés dans `realtalk.css`
- La communication client-serveur utilise des événements Socket.IO

### Personnalisation
- Modifiez `realtalk.css` pour adapter l'apparence
- Ajoutez de nouveaux composants dans le dossier `components`
- Étendez les fonctionnalités serveur dans `server.js`

## Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository GitHub.

---

Développé avec Node.js, React et Socket.IO
