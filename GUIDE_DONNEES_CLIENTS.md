# 📊 Guide : Comment voir les données des clients

## 🎯 **Où trouver les données des clients**

### **1. 📧 Dans ta boîte email (EmailJS)**

**Configuration actuelle :**
- **Email de réception** : `titouanmouysset@gmail.com`
- **Service** : EmailJS
- **Template** : `template_x6961v9`

**Ce que tu reçois :**
- **Informations personnelles** : Prénom, nom, email, téléphone
- **Description du projet** : Ce que le client veut
- **Contenu du panier** : Produits sélectionnés et prix
- **Date et heure** : Quand la commande a été faite

### **2. 💾 Dans le navigateur du client (localStorage)**

**Comment accéder :**
1. Ouvre le site web
2. Appuie sur **F12** (outils de développement)
3. Va dans l'onglet **"Application"** ou **"Storage"**
4. Clique sur **"Local Storage"**
5. Sélectionne ton site web

**Données stockées :**
- `cart` : Contenu du panier
- `cartContact` : Informations du formulaire
- `lastOrder` : Dernière commande

### **3. 🔍 Dans la console du navigateur**

**Comment voir :**
1. Ouvre le site web
2. Appuie sur **F12**
3. Va dans l'onglet **"Console"**
4. Tous les logs s'affichent en temps réel

**Informations visibles :**
- Ajout d'articles au panier
- Validation du formulaire
- Envoi des emails
- Erreurs éventuelles

## 📋 **Exemple de données reçues**

### **Email reçu :**
```
De : Jean Dupont <jean.dupont@email.com>
Objet : Nouvelle commande - Site Vitrine + Hébergement

Informations client :
- Nom : Jean Dupont
- Email : jean.dupont@email.com
- Téléphone : 06 12 34 56 78
- Entreprise : Ma Société SARL

Description du projet :
Je souhaite créer un site vitrine pour mon entreprise de plomberie.
J'ai besoin d'un design moderne et d'un système de contact.

Panier :
Site Vitrine + Hébergement x1 — €500.00

Total : €500.00
Date : 15/01/2025 à 14:30
```

### **Données localStorage :**
```json
{
  "cart": [
    {
      "id": "site_hebergement",
      "name": "Site Vitrine + Hébergement",
      "price": 500,
      "quantity": 1
    }
  ],
  "cartContact": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@email.com",
    "phone": "06 12 34 56 78",
    "company": "Ma Société SARL",
    "request": "Je souhaite créer un site vitrine..."
  },
  "lastOrder": {
    "method": "PayPal",
    "date": "2025-01-15T14:30:00.000Z",
    "contact": { ... },
    "items": [ ... ],
    "total": 500
  }
}
```

## 🛠 **Comment améliorer la réception des données**

### **Option 1 : Base de données (Recommandé)**

**Services gratuits :**
- **Firebase** : Base de données en temps réel
- **Supabase** : Alternative à Firebase
- **Airtable** : Tableur en ligne avec API

**Avantages :**
- Toutes les données centralisées
- Historique complet
- Export facile
- Notifications en temps réel

### **Option 2 : Google Sheets**

**Comment faire :**
1. Crée un Google Sheet
2. Utilise Google Apps Script
3. Envoie les données via API
4. Toutes les commandes dans un tableau

### **Option 3 : Webhook**

**Services :**
- **Zapier** : Automatisation
- **Make.com** : Intégrations
- **Webhook.site** : Test de webhooks

## 📱 **Notifications en temps réel**

### **EmailJS + Zapier**
1. Configure Zapier
2. Connecte ton email
3. Crée des notifications automatiques
4. Reçois des alertes sur ton téléphone

### **Discord/Slack**
1. Crée un webhook Discord/Slack
2. Envoie les notifications automatiquement
3. Reçois les commandes en temps réel

## 🔧 **Configuration EmailJS avancée**

### **Template personnalisé**
```html
<h2>🎉 Nouvelle commande reçue !</h2>

<h3>👤 Informations client</h3>
<p><strong>Nom :</strong> {{from_name}}</p>
<p><strong>Email :</strong> {{from_email}}</p>
<p><strong>Téléphone :</strong> {{phone}}</p>
<p><strong>Entreprise :</strong> {{company}}</p>

<h3>📝 Description du projet</h3>
<p>{{message}}</p>

<h3>🛒 Panier</h3>
<pre>{{cart_items}}</pre>

<h3>💰 Total</h3>
<p><strong>{{cart_total}}</strong></p>

<h3>📅 Date</h3>
<p>{{date}}</p>
```

### **Variables disponibles :**
- `{{from_name}}` : Nom complet
- `{{from_email}}` : Email
- `{{phone}}` : Téléphone
- `{{company}}` : Entreprise
- `{{message}}` : Description
- `{{cart_items}}` : Articles du panier
- `{{cart_total}}` : Total
- `{{date}}` : Date et heure

## 🚨 **Points d'attention**

### **RGPD**
- Les données sont stockées localement
- L'utilisateur peut les supprimer
- Informe sur l'utilisation des données

### **Sécurité**
- Ne stocke pas d'informations sensibles
- Utilise HTTPS
- Valide les données côté serveur

### **Sauvegarde**
- Exporte régulièrement les données
- Fais des sauvegardes
- Garde un historique

## 📞 **Support**

Si tu as des questions sur la réception des données :
1. Vérifie ta configuration EmailJS
2. Teste avec le fichier `test-systeme-paiement.html`
3. Consulte les logs dans la console
4. Vérifie tes emails (spam inclus)

## 🎯 **Résumé**

**Tu reçois automatiquement :**
- ✅ Email avec toutes les informations
- ✅ Données stockées dans le navigateur
- ✅ Logs dans la console
- ✅ Notifications de paiement

**Pour aller plus loin :**
- 🔄 Base de données en temps réel
- 📱 Notifications push
- 📊 Tableau de bord
- 🔔 Webhooks automatiques

Ton système est déjà fonctionnel ! Tu reçois toutes les données des clients par email. 🚀
