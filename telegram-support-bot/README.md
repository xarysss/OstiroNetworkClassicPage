# Ostiro Concierge Telegram Bot

Bot de contact prive pour Ostiro Network.

## Principe

- Les visiteurs du site ouvrent le bot Telegram.
- Ils ecrivent au bot en prive.
- Le bot copie le message dans un groupe admin prive.
- Tu reponds au message dans le groupe admin.
- Le bot renvoie ta reponse au client, en prive, au nom du bot.

## Creation Telegram

1. Ouvre `@BotFather` dans Telegram.
2. Envoie `/newbot`.
3. Nom conseille : `Ostiro Concierge`.
4. Username conseille : `OstiroNetworkSupportBot`.
5. Copie le token dans `.env`.
6. Dans `@BotFather`, utilise `/setuserpic` et envoie `assets/logo.svg` converti en PNG si Telegram refuse le SVG.

## Configuration

Copie `.env.example` vers `.env`, puis remplis :

```env
BOT_TOKEN=<token_botfather>
ADMIN_CHAT_ID=<id_du_groupe_admin>
BRAND_NAME=Ostiro Concierge
```

Pour trouver `ADMIN_CHAT_ID` :

1. Cree un groupe Telegram prive, par exemple `Ostiro - Inbox privee`.
2. Ajoute le bot au groupe.
3. Envoie `/id` dans le groupe.
4. Copie l'identifiant renvoye dans `.env`.

## Lancement local

```bash
npm install
npm run bot:check
npm run bot
```

Le bot utilise le polling Telegram. Pour le garder actif en production, lance-le sur un VPS, Railway, Render, Fly.io ou tout autre hebergeur Node.
