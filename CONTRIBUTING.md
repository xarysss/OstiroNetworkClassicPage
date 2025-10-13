# 🤝 Guide de Contribution - Ostiro Network

Merci de votre intérêt pour contribuer au projet **Ostiro Network** ! Ce guide vous aidera à comprendre comment participer efficacement au développement de ce site web.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Contribution](#processus-de-contribution)
- [Standards de Code](#standards-de-code)
- [Rapport de Bugs](#rapport-de-bugs)
- [Demandes de Fonctionnalités](#demandes-de-fonctionnalités)

## 📜 Code de Conduite

### Nos Engagements

En participant à ce projet, vous vous engagez à :

- **Respecter** tous les contributeurs et utilisateurs
- **Être inclusif** et accueillant envers tous
- **Collaborer** de manière constructive
- **Rester professionnel** dans toutes les interactions

### Comportements Inacceptables

- Langage offensant ou discriminatoire
- Harcèlement sous toutes ses formes
- Spam ou contenu non pertinent
- Partage d'informations personnelles

## 🚀 Comment Contribuer

### Types de Contributions

1. **🐛 Correction de Bugs**
   - Signaler des problèmes
   - Proposer des corrections
   - Tester les solutions

2. **✨ Nouvelles Fonctionnalités**
   - Proposer des améliorations
   - Développer de nouvelles features
   - Améliorer l'expérience utilisateur

3. **📚 Documentation**
   - Améliorer le README
   - Ajouter des commentaires au code
   - Créer des guides d'utilisation

4. **🎨 Design & UI/UX**
   - Améliorer l'interface utilisateur
   - Optimiser l'expérience mobile
   - Créer de nouveaux composants

## 🔄 Processus de Contribution

### 1. Fork du Repository

```bash
# Cloner votre fork
git clone https://github.com/votre-username/ostiro-network.git
cd ostiro-network

# Ajouter le repository original comme remote
git remote add upstream https://github.com/ostiro-network/ostiro-network.git
```

### 2. Créer une Branche

```bash
# Créer une nouvelle branche pour votre fonctionnalité
git checkout -b feature/nom-de-votre-fonctionnalite

# Ou pour une correction de bug
git checkout -b bugfix/description-du-bug
```

### 3. Développer

- **Écrire du code propre** et bien commenté
- **Tester** vos modifications
- **Respecter** les standards de code
- **Documenter** vos changements

### 4. Commit et Push

```bash
# Ajouter vos modifications
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter carousel responsive sur la page d'accueil"

# Push vers votre fork
git push origin feature/nom-de-votre-fonctionnalite
```

### 5. Pull Request

- **Créer une Pull Request** sur GitHub
- **Décrire** clairement vos changements
- **Référencer** les issues liées
- **Attendre** la review de l'équipe

## 📝 Standards de Code

### HTML

```html
<!-- Structure sémantique -->
<main class="hero-section">
    <h1 class="hero-title">Titre Principal</h1>
    <p class="hero-description">Description claire et concise.</p>
</main>
```

### CSS

```css
/* Utiliser les variables CSS */
.hero-section {
    background: var(--primary-color);
    padding: 2rem 0;
    transition: all 0.3s ease;
}

/* Commentaires pour les sections importantes */
/* ========================================
   HERO SECTION - STYLES
   ======================================== */
```

### JavaScript

```javascript
// Fonctions avec des noms descriptifs
function initHeroCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    
    // Logique du carousel
    console.log('Carousel initialisé');
}

// Événements avec gestion d'erreur
document.addEventListener('DOMContentLoaded', () => {
    try {
        initHeroCarousel();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }
});
```

### Conventions de Nommage

- **Classes CSS** : `kebab-case` (ex: `hero-section`)
- **Variables CSS** : `--kebab-case` (ex: `--primary-color`)
- **Fonctions JS** : `camelCase` (ex: `initHeroCarousel`)
- **Fichiers** : `kebab-case` (ex: `about-us.html`)

## 🐛 Rapport de Bugs

### Template de Bug Report

```markdown
## 🐛 Description du Bug

**Résumé** : Description courte du problème

**Étapes pour reproduire** :
1. Aller sur la page X
2. Cliquer sur Y
3. Voir l'erreur Z

**Comportement attendu** : Ce qui devrait se passer

**Comportement actuel** : Ce qui se passe réellement

**Screenshots** : Si applicable

**Environnement** :
- OS : Windows 10
- Navigateur : Chrome 120
- Résolution : 1920x1080

**Informations supplémentaires** : Tout autre détail pertinent
```

## ✨ Demandes de Fonctionnalités

### Template de Feature Request

```markdown
## ✨ Nouvelle Fonctionnalité

**Description** : Description claire de la fonctionnalité souhaitée

**Problème résolu** : Quel problème cette fonctionnalité résoudrait-elle ?

**Solution proposée** : Comment implémenter cette fonctionnalité ?

**Alternatives considérées** : Autres solutions possibles

**Contexte supplémentaire** : Tout autre détail pertinent
```

## 🎯 Idées de Contributions

### Pour les Débutants

- [ ] Corriger les fautes de frappe dans la documentation
- [ ] Améliorer les commentaires dans le code
- [ ] Ajouter des tests simples
- [ ] Optimiser les images

### Pour les Intermédiaires

- [ ] Améliorer la responsivité mobile
- [ ] Ajouter de nouvelles animations CSS
- [ ] Optimiser les performances
- [ ] Créer de nouveaux composants

### Pour les Avancés

- [ ] Implémenter un système de blog
- [ ] Ajouter un CMS
- [ ] Créer des tests automatisés
- [ ] Optimiser le SEO avancé

## 📞 Contact

### L'Équipe Ostiro Network

- **Titouan** : [GitHub](https://github.com/titouan-mouysset) | [Email](mailto:titouanmouysset@gmail.com)
- **Robin** : [GitHub](https://github.com/robin-britelle) | [Email](mailto:robin.britelle@example.com)
- **Osman** : [GitHub](https://github.com/osman-cetiner) | [Email](mailto:osman.cetiner@example.com)

### Questions Générales

- **Issues GitHub** : Pour les bugs et demandes de fonctionnalités
- **Discussions GitHub** : Pour les questions générales
- **Email** : titouanmouysset@gmail.com

## 🏆 Reconnaissance

Tous les contributeurs seront mentionnés dans :
- Le fichier `CONTRIBUTORS.md`
- Les releases GitHub
- La documentation du projet

## 📄 Licence

En contribuant à ce projet, vous acceptez que vos contributions soient sous la même licence que le projet (MIT License).

---

**Merci de contribuer à Ostiro Network ! 🚀**

*Ensemble, nous créons un web plus beau et plus accessible.*
