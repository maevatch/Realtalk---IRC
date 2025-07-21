# RealTalk - Présentation du Projet

---

## Slide 1 : Titre

### RealTalk
**Application de chat en temps réel moderne avec interface WhatsApp Desktop**

*Présentation du projet - 2024*

---

## Slide 2 : Sommaire

- **Contexte** - Objectifs et besoins du projet
- **Organisation** - Architecture et technologies  
- **Difficultés rencontrées** - Défis techniques et solutions
- **Démonstration** - Fonctionnalités et interface

---

## Slide 3 : Contexte

### Objectif du projet
- Créer une application de chat moderne et intuitive
- Offrir une alternative simple aux solutions existantes
- Implémenter une communication en temps réel
- Proposer une interface familière inspirée de WhatsApp

### Besoins identifiés
- Communication par canaux thématiques
- Messages privés entre utilisateurs
- Gestion des permissions (création/suppression)
- Interface responsive et moderne
- Expérience utilisateur optimisée

---

## Slide 4 : Organisation

### Frontend (Client)
- **React 18** - Interface utilisateur
- **Vite** - Build tool moderne
- **Socket.IO Client** - WebSocket
- **CSS personnalisé** - Design WhatsApp

### Backend (Serveur)
- **Node.js** - Runtime JavaScript
- **Socket.IO** - Communication temps réel
- **Gestion en mémoire** - Stockage temporaire
- **API événementielle** - Architecture modulaire

### Architecture du projet
- **Composants modulaires** - Réutilisabilité et maintenance
- **Communication bidirectionnelle** - Client ↔ Serveur
- **Gestion d'état centralisée** - React hooks
- **Styles centralisés** - CSS personnalisé (realtalk.css)

---

## Slide 5 : Difficultés rencontrées

### Problème : Bouton supprimer invisible
**Symptôme :** Le bouton de suppression de canal n'apparaissait pas pour les créateurs
**Cause :** Information de l'auteur du canal non transmise depuis la sidebar

### Solution mise en place
- Ajout d'un state `joinedChannelsWithAuthor` dans la sidebar
- Enrichissement des données avec l'information d'auteur
- Transmission correcte de l'auteur lors de la sélection
- Synchronisation des événements socket (join/quit/force_quit)

### Défi : Design cohérent et moderne
**Objectif :** Créer une interface professionnelle inspirée de WhatsApp Desktop

### Approche adoptée
- Création d'un système de design complet (realtalk.css)
- Palette de couleurs authentique WhatsApp
- Composants réutilisables avec classes CSS
- Interface responsive pour tous les appareils

---

## Slide 6 : Démonstration

### Fonctionnalités principales
- **Authentification** - Page de connexion avec logo personnalisé
- **Navigation** - Sidebar avec onglets Canaux/Conversations
- **Canaux publics** - Création, jointure, suppression
- **Messages privés** - Conversations directes
- **Temps réel** - Communication instantanée

### Interface utilisateur
- **Design moderne** - Inspiré de WhatsApp Desktop
- **Sidebar noire** - Navigation intuitive
- **Zone de chat claire** - Messages stylisés
- **Responsive** - Adaptation mobile/desktop
- **Interactions fluides** - Animations et transitions

### Gestion des permissions
- **Créateur de canal** - Droits de suppression
- **Membres** - Participation et sortie libre
- **Sécurité** - Confirmations pour actions critiques