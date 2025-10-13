// Navigation mobile améliorée
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animation des barres du hamburger
        const bars = hamburger.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (hamburger.classList.contains('active')) {
                if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (index === 1) bar.style.opacity = '0';
                if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            }
        });
    });

    // Fermer le menu mobile en cliquant sur un lien
    document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        const bars = hamburger.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.transform = 'none';
            bar.style.opacity = '1';
        });
    }));
}


// Smooth scrolling amélioré avec easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80; // Compenser la navbar fixe
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Animation des compteurs avec effet de rebond
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            element.style.transform = 'scale(1.1)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 50);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
            element.style.transform = 'scale(1)';
        }
    }
    
    updateCounter();
}

// Observer amélioré pour les animations au scroll inspiré Blue Star
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animation des compteurs
            if (entry.target.classList.contains('stat-number')) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                if (target) {
                    animateCounter(entry.target, target);
                    observer.unobserve(entry.target);
                }
            }
            
            // Animation des éléments avec classes d'animation
            if (entry.target.classList.contains('animate-on-scroll')) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
            
            if (entry.target.classList.contains('animate-on-scroll-left')) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
            
            if (entry.target.classList.contains('animate-on-scroll-right')) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
            
            if (entry.target.classList.contains('animate-on-scroll-scale')) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

// Effet parallaxe avancé inspiré Blue Star
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    // Parallaxe pour les éléments avec classe parallax
    document.querySelectorAll('.parallax-element').forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
    
    // Effet de flou pour les éléments en arrière-plan
    document.querySelectorAll('.blur-on-scroll').forEach(element => {
        const rect = element.getBoundingClientRect();
        const blurAmount = Math.max(0, (rect.top / window.innerHeight) * 10);
        element.style.filter = `blur(${blurAmount}px)`;
    });
});

// Animation du navbar au scroll avec effet de flou
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// Système de particules flottantes inspiré Blue Star
function createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Position aléatoire
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 20 + 10) + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        
        // Taille aléatoire
        const size = Math.random() * 3 + 1;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Couleur aléatoire
        const colors = ['#00ff88', '#0088ff', '#ff0088'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        particlesContainer.appendChild(particle);
        
        // Supprimer la particule après l'animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 30000);
    }
    
    // Créer des particules périodiquement
    setInterval(createParticle, 2000);
}

// Effet de typing amélioré pour le hero
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            
            // Effet de curseur clignotant
            if (i < text.length) {
                element.innerHTML += '<span class="cursor">|</span>';
            }
            
            setTimeout(type, speed);
        } else {
            // Supprimer le curseur à la fin
            const cursor = element.querySelector('.cursor');
            if (cursor) {
                cursor.remove();
            }
        }
    }
    
    type();
}

// Animation des cartes avec effet de lueur
function addGlowEffect() {
    document.querySelectorAll('.card, .feature-card, .portfolio-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.add('glow-effect');
        });
        
        card.addEventListener('mouseleave', () => {
            card.classList.remove('glow-effect');
        });
    });
}

// Effet de focus sur les éléments interactifs
function addFocusEffects() {
    document.querySelectorAll('.btn, .nav-link').forEach(element => {
        element.addEventListener('focus', () => {
            element.style.transform = 'scale(1.05)';
            element.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.5)';
        });
        
        element.addEventListener('blur', () => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = 'none';
        });
    });
}

// Animation de chargement avec effet de pulsation
function showLoadingAnimation() {
    const loader = document.createElement('div');
    loader.className = 'loading-overlay';
    loader.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Chargement de Ostiro Network...</p>
        </div>
    `;
    
    // Styles pour le loader
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(10, 10, 10, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(loader);
    
    // Supprimer le loader après 2 secondes
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(loader);
        }, 500);
    }, 2000);
}

// Système de notifications amélioré
function showNotification(message, type = 'info', duration = 4000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type]}</div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Styles pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--bg-card);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        padding: 16px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
    `;
    
    // Couleur selon le type
    const colors = {
        success: '#00ff88',
        error: '#ff0088',
        warning: '#ffaa00',
        info: '#0088ff'
    };
    
    notification.style.borderLeft = `4px solid ${colors[type]}`;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Suppression automatique
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
    
    function closeNotification(notif) {
        notif.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notif.parentNode) {
                document.body.removeChild(notif);
            }
        }, 300);
    }
}

// Validation du formulaire de contact améliorée
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation d'EmailJS
    if (typeof EMAIL_CONFIG !== 'undefined') {
        emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    }
    
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Animation de soumission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<div class="loading"></div> Envoi en cours...';
            submitBtn.disabled = true;
            
            // Validation
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Envoi de l'email via EmailJS
            if (typeof EMAIL_CONFIG === 'undefined') {
                // Fallback si la configuration n'est pas chargée
                console.error('Configuration EmailJS non trouvée');
                showNotification('Configuration email manquante. Contactez l\'administrateur.', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // Debug: Afficher la configuration
            console.log('Configuration EmailJS:', EMAIL_CONFIG);
            console.log('Données du formulaire:', data);
            
            // Préparer les paramètres pour EmailJS
            const templateParams = {
                from_name: `${data.firstName} ${data.lastName}`,
                from_email: data.email,
                objective: data.objective,
                activity: data.activity,
                message: data.message,
                to_email: EMAIL_CONFIG.TO_EMAIL
            };
            
            console.log('Paramètres du template:', templateParams);
            
            emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, templateParams)
            .then((response) => {
                console.log('Email envoyé avec succès!', response.status, response.text);
                
                submitBtn.innerHTML = '✓ Message envoyé !';
                submitBtn.style.background = 'var(--success-color)';
                
                showNotification('Votre message a été envoyé avec succès !', 'success');
                
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 2000);
            })
            .catch((error) => {
                console.error('Erreur détaillée lors de l\'envoi:', error);
                console.error('Code d\'erreur:', error.status);
                console.error('Message d\'erreur:', error.text);
                
                submitBtn.innerHTML = '✗ Erreur d\'envoi';
                submitBtn.style.background = 'var(--error-color)';
                
                // Message d'erreur plus détaillé
                let errorMessage = 'Erreur lors de l\'envoi du message. ';
                if (error.status === 400) {
                    errorMessage += 'Vérifiez votre configuration EmailJS.';
                } else if (error.status === 401) {
                    errorMessage += 'Clé API invalide.';
                } else if (error.status === 403) {
                    errorMessage += 'Service non autorisé.';
                } else {
                    errorMessage += 'Veuillez réessayer.';
                }
                
                showNotification(errorMessage, 'error');
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            });
        });
        
        // Validation en temps réel
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.style.borderColor === 'rgb(255, 107, 107)') {
                    validateField(input);
                }
            });
        });
    }
});

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }
    
    if (isValid) {
        field.style.borderColor = 'var(--success-color)';
        field.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
    } else {
        field.style.borderColor = 'var(--accent-color)';
        field.style.boxShadow = '0 0 10px rgba(255, 0, 136, 0.3)';
    }
    
    return isValid;
}

// FAQ Accordion amélioré
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Fermer tous les autres items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherAnswer = otherItem.querySelector('.faq-answer');
                        const otherIcon = otherItem.querySelector('.faq-question i');
                        if (otherAnswer && otherIcon) {
                            otherAnswer.style.maxHeight = '0';
                            otherIcon.style.transform = 'rotate(0deg)';
                        }
                    }
                });
                
                // Toggle l'item actuel
                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    if (icon) icon.style.transform = 'rotate(45deg)';
                } else {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0';
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            });
        }
    });
});

// Filtre du portfolio amélioré
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Animation du bouton
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);
            
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Ajouter la classe active au bouton cliqué
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            portfolioItems.forEach((item, index) => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    item.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s both`;
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
});

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Afficher l'animation de chargement
    showLoadingAnimation();
    
    // Créer les particules flottantes
    createFloatingParticles();
    
    // Ajouter les effets de lueur
    addGlowEffect();
    
    // Ajouter les effets de focus
    addFocusEffects();
    
    // Observer les éléments à animer
    document.querySelectorAll('.animate-on-scroll, .animate-on-scroll-left, .animate-on-scroll-right, .animate-on-scroll-scale').forEach(el => {
        observer.observe(el);
    });
    
    // Observer les compteurs
    document.querySelectorAll('.stat-number').forEach(el => {
        observer.observe(el);
    });
    
    // Ajouter des styles CSS dynamiques
    const style = document.createElement('style');
    style.textContent = `
        .cursor {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        
        .loading-overlay {
            transition: opacity 0.5s ease;
        }
        
        .loading-content {
            text-align: center;
            color: var(--text-primary);
        }
        
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top: 3px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .notification-icon {
            font-size: 20px;
            font-weight: bold;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            transition: color 0.3s ease;
        }
        
        .notification-close:hover {
            color: var(--text-primary);
        }
        
        .faq-answer {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .faq-question i {
            transition: transform 0.3s ease;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .btn, .nav-link {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card, .feature-card, .portfolio-card, .testimonial-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Effet de survol pour les cartes */
        .card:hover, .feature-card:hover, .portfolio-card:hover {
            transform: translateY(-10px) scale(1.02);
        }
        
        /* Animation des liens */
        .nav-link:hover {
            transform: translateY(-2px);
        }
        
        /* Effet de pulsation pour les éléments importants */
        .pulse {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        /* Effet de lueur pour les boutons */
        .btn-primary:hover {
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
        }
        
        .btn-secondary:hover {
            box-shadow: 0 0 30px rgba(0, 136, 255, 0.5);
        }
    `;
    document.head.appendChild(style);
    
    // Message de succès
    setTimeout(() => {
        console.log('🚀 Ostiro Network - Site chargé avec succès !');
        console.log('✨ Animations et effets activés');
        console.log('🎨 Thème spatial inspiré Blue Star');
    }, 2000);
});

// Gestion des erreurs JavaScript
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error);
    showNotification('Une erreur est survenue. Veuillez recharger la page.', 'error');
});

// Gestion des boutons de type de formulaire
document.addEventListener('DOMContentLoaded', function() {
    const formTypeButtons = document.querySelectorAll('.form-type-btn');
    
    formTypeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Retirer la classe active de tous les boutons
            formTypeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Ajouter la classe active au bouton cliqué
            this.classList.add('active');
            
            // Optionnel : changer le formulaire selon le type sélectionné
            const formType = this.getAttribute('data-form');
            console.log('Type de formulaire sélectionné:', formType);
        });
    });
});


// Amélioration du formulaire astronaute
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const inputs = form?.querySelectorAll('input, select, textarea');
    
    if (inputs) {
        inputs.forEach(input => {
            // Animation au focus
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
            });
            
            // Animation de remplissage
            input.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    this.classList.add('filled');
                } else {
                    this.classList.remove('filled');
                }
            });
        });
        
        // Soumission du formulaire
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.btn-astronaut');
            const originalContent = submitBtn.innerHTML;
            
            // Animation de soumission
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            submitBtn.disabled = true;
            
            // Simulation d'envoi (remplacer par vraie logique)
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Envoyé !';
                submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                
                setTimeout(() => {
                    submitBtn.innerHTML = originalContent;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                    form.reset();
                }, 2000);
            }, 1500);
        });
    }
});

// Optimisation des performances
let ticking = false;

function updateAnimations() {
    // Mettre à jour les animations de parallaxe
    const scrolled = window.pageYOffset;
    
    document.querySelectorAll('.parallax-element').forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
});

// Détection de la connexion
window.addEventListener('online', () => {
    showNotification('Connexion rétablie !', 'success', 2000);
});

window.addEventListener('offline', () => {
    showNotification('Connexion perdue. Certaines fonctionnalités peuvent être limitées.', 'warning', 5000);
});

// Gestion des boutons du hero contact
document.addEventListener('DOMContentLoaded', function() {
    const questionsBtn = document.querySelector('.btn-contact-secondary');
    const auditBtn = document.querySelector('.btn-contact-primary');
    
    if (questionsBtn) {
        questionsBtn.addEventListener('click', function() {
            // Scroll vers le formulaire de contact
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Activer le bouton "Poser mes questions" dans le formulaire
                const formTypeBtn = document.querySelector('.form-type-btn[data-form="questions"]');
                if (formTypeBtn) {
                    // Retirer la classe active de tous les boutons
                    document.querySelectorAll('.form-type-btn').forEach(btn => btn.classList.remove('active'));
                    // Ajouter la classe active au bouton questions
                    formTypeBtn.classList.add('active');
                }
            }
        });
    }
    
    if (auditBtn) {
        auditBtn.addEventListener('click', function() {
            // Scroll vers le formulaire de contact
            const contactSection = document.querySelector('.contact-section');
            if (contactSection) {
                contactSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Activer le bouton "Audit Gratuit" dans le formulaire
                const formTypeBtn = document.querySelector('.form-type-btn[data-form="audit"]');
                if (formTypeBtn) {
                    // Retirer la classe active de tous les boutons
                    document.querySelectorAll('.form-type-btn').forEach(btn => btn.classList.remove('active'));
                    // Ajouter la classe active au bouton audit
                    formTypeBtn.classList.add('active');
                }
            }
        });
    }
});

// Gestion des boutons de la page services
document.addEventListener('DOMContentLoaded', function() {
    const methodBtn = document.querySelector('.btn-services-secondary');
    const auditBtn = document.querySelector('.btn-services-primary');
    const problemMethodBtn = document.querySelector('.btn-problem-primary');
    
    if (methodBtn) {
        methodBtn.addEventListener('click', function() {
            // Scroll vers la section méthode
            const methodSection = document.querySelector('.method-section');
            if (methodSection) {
                methodSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    if (auditBtn) {
        auditBtn.addEventListener('click', function() {
            // Rediriger vers la page contact
            window.location.href = 'contact.html';
        });
    }
    
    if (problemMethodBtn) {
        problemMethodBtn.addEventListener('click', function() {
            // Scroll vers la section méthode
            const methodSection = document.querySelector('.method-section');
            if (methodSection) {
                methodSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
});

// Gestion du Hero Exceptionnel - Page d'accueil
document.addEventListener('DOMContentLoaded', function() {
    // Boutons du hero exceptionnel
    const heroMethodBtn = document.querySelector('.btn-hero-secondary');
    const heroAuditBtn = document.querySelector('.btn-hero-primary');
    const videoThumbnail = document.querySelector('.video-thumbnail');
    const playButton = document.querySelector('.play-button');
    
    if (heroMethodBtn) {
        heroMethodBtn.addEventListener('click', function() {
            // Scroll vers la section méthode
            const methodSection = document.querySelector('#methode');
            if (methodSection) {
                methodSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Si pas de section méthode, scroll vers la section suivante
                const nextSection = document.querySelector('.problems-section');
                if (nextSection) {
                    nextSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
    
    if (heroAuditBtn) {
        heroAuditBtn.addEventListener('click', function() {
            // Rediriger vers la page contact
            window.location.href = 'contact.html';
        });
    }
    
    if (videoThumbnail) {
        videoThumbnail.addEventListener('click', function() {
            // Animation de clic sur la vidéo
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1.02)';
            }, 150);
            
            // Ici vous pouvez ajouter la logique pour ouvrir une vraie vidéo
            console.log('Ouverture de la vidéo...');
        });
    }
    
    if (playButton) {
        playButton.addEventListener('click', function(e) {
            e.stopPropagation();
            // Animation du bouton play
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1.1)';
            }, 150);
            
            console.log('Lecture de la vidéo...');
        });
    }
    
    // Effet parallax pour les éléments flottants
    const floatingElements = document.querySelectorAll('.floating-element');
    const particles = document.querySelectorAll('.particle');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        floatingElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            element.style.transform = `translateY(${rate * speed}px) rotate(${rate * 0.1}deg)`;
        });
        
        particles.forEach((particle, index) => {
            const speed = 0.2 + (index * 0.05);
            particle.style.transform = `translateY(${rate * speed}px)`;
        });
    });
    
    // Animation des badges au survol
    const heroBadges = document.querySelectorAll('.hero-badge');
    heroBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        });
        
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Animation des logos au survol
    const logoItems = document.querySelectorAll('.logo-item');
    logoItems.forEach(logo => {
        logo.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });
        
        logo.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Effet de shimmer sur le texte highlight
    const highlightText = document.querySelector('.highlight-text');
    if (highlightText) {
        setInterval(() => {
            highlightText.style.animation = 'none';
            setTimeout(() => {
                highlightText.style.animation = 'textShimmer 3s ease-in-out infinite';
            }, 100);
        }, 5000);
    }
    
    // Animation du scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator-exceptional');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('.problems-section');
            if (nextSection) {
                nextSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
    
    // Effet de typing pour le titre principal
    const heroTitle = document.querySelector('.hero-exceptional-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid #6c7b95';
        
        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            } else {
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Démarrer l'effet de typing après un délai
        setTimeout(typeWriter, 1000);
    }
});

// ========================================
// EFFETS SPATIAUX IMMERSIFS
// ========================================

// Génération du champ d'étoiles
function createStarField() {
    const starField = document.getElementById('starField');
    if (!starField) return;
    
    const starCount = 150;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Position aléatoire
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // Taille aléatoire
        const size = Math.random() * 3 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // Couleur aléatoire
        const colors = ['#ffffff', '#00ff88', '#0088ff', '#ff0088', '#ffff00'];
        star.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        // Délai d'animation aléatoire
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 2) + 's';
        
        starField.appendChild(star);
    }
}

// Effet de voyage spatial au scroll
function initSpaceTravelEffect() {
    const floatingElements = document.querySelectorAll('.floating-element');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        floatingElements.forEach((element, index) => {
            const speed = (index + 1) * 0.1;
            element.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });
}

// Effet de particules au survol des cartes
function initParticleEffects() {
    const cards = document.querySelectorAll('.hover-lift');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            createParticleBurst(e.target);
        });
    });
}

// Création d'une explosion de particules
function createParticleBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.background = '#00ff88';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        // Animation de la particule
        const angle = (i / 8) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const duration = 1000 + Math.random() * 500;
        
        particle.animate([
            {
                transform: 'translate(0, 0) scale(1)',
                opacity: 1
            },
            {
                transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
                opacity: 0
            }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Effet de nébuleuse sur les sections
function initNebulaEffect() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.background = `
                        linear-gradient(135deg, rgba(0, 255, 136, 0.05) 0%, rgba(0, 136, 255, 0.05) 100%),
                        ${entry.target.style.background}
                    `;
                }
            });
        }, { threshold: 0.3 });
        
        observer.observe(section);
    });
}

// Animation de l'astronaute au scroll
function initAstronautAnimation() {
    const astronaut = document.querySelector('.astronaut-logo');
    if (!astronaut) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rotation = scrolled * 0.1;
        const translation = Math.sin(scrolled * 0.01) * 10;
        
        astronaut.style.transform = `translateY(${translation}px) rotate(${rotation}deg)`;
    });
}

// Initialisation de tous les effets spatiaux
document.addEventListener('DOMContentLoaded', () => {
    createStarField();
    initSpaceTravelEffect();
    initParticleEffects();
    initNebulaEffect();
    initAstronautAnimation();
    initHeroCarousel();
    initAboutCarousel();
});

// ========================================
// HERO CAROUSEL
// ========================================

function initHeroCarousel() {
    const carousel = document.querySelector('.hero-carousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.carousel-indicator');
    const prevArrow = document.querySelector('.carousel-arrow-prev');
    const nextArrow = document.querySelector('.carousel-arrow-next');
    let currentSlide = 0;
    let autoplayInterval;
    
    // Fonction pour changer de slide
    function goToSlide(index) {
        // S'assurer que l'index est dans les limites
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Retirer la classe active de tous les slides et indicateurs
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Ajouter la classe active au slide et indicateur actuel
        slides[index].classList.add('active');
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    // Navigation par les flèches
    if (prevArrow) {
        prevArrow.addEventListener('click', () => {
            goToSlide(currentSlide - 1);
            resetAutoplay();
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', () => {
            goToSlide(currentSlide + 1);
            resetAutoplay();
        });
    }
    
    // Navigation par les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
            resetAutoplay();
        });
    });
    
    // Navigation au clavier
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            goToSlide(currentSlide - 1);
            resetAutoplay();
        } else if (e.key === 'ArrowRight') {
            goToSlide(currentSlide + 1);
            resetAutoplay();
        }
    });
    
    // Autoplay
    function startAutoplay() {
        autoplayInterval = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 4000); // Change toutes les 4 secondes
    }
    
    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Démarrer l'autoplay
    startAutoplay();
    
    // Pause au survol du carousel
    const carouselContainer = document.querySelector('.hero-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            startAutoplay();
        });
    }
}

// ========================================
// ABOUT CAROUSEL
// ========================================

function initAboutCarousel() {
    console.log('=== Initialisation About Carousel ===');
    
    const carousel = document.querySelector('.about-carousel');
    if (!carousel) {
        console.log('❌ About carousel non trouvé');
        return;
    }
    
    const slides = document.querySelectorAll('.about-carousel-slide');
    const indicators = document.querySelectorAll('.about-carousel-indicator');
    const prevArrow = document.querySelector('.about-carousel-arrow-prev');
    const nextArrow = document.querySelector('.about-carousel-arrow-next');
    
    console.log('✅ About carousel trouvé:', {
        carousel: carousel,
        slides: slides.length,
        indicators: indicators.length,
        prevArrow: !!prevArrow,
        nextArrow: !!nextArrow
    });
    
    if (slides.length === 0) {
        console.log('❌ Aucun slide trouvé!');
        return;
    }
    
    let currentSlide = 0;
    let autoplayInterval;
    
    // Fonction pour changer de slide
    function goToSlide(index) {
        console.log('Changement vers slide:', index);
        
        // S'assurer que l'index est dans les limites
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        
        // Retirer la classe active de tous les slides et indicateurs
        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            console.log(`Slide ${i} désactivé`);
        });
        indicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Ajouter la classe active au slide et indicateur actuel
        slides[index].classList.add('active');
        console.log(`Slide ${index} activé`);
        
        if (indicators[index]) {
            indicators[index].classList.add('active');
        }
        
        currentSlide = index;
    }
    
    // Navigation par les flèches
    if (prevArrow) {
        prevArrow.addEventListener('click', (e) => {
            console.log('Clic flèche précédente');
            e.preventDefault();
            goToSlide(currentSlide - 1);
            resetAutoplay();
        });
    }
    
    if (nextArrow) {
        nextArrow.addEventListener('click', (e) => {
            console.log('Clic flèche suivante');
            e.preventDefault();
            goToSlide(currentSlide + 1);
            resetAutoplay();
        });
    }
    
    // Navigation par les indicateurs
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', (e) => {
            console.log('Clic indicateur:', index);
            e.preventDefault();
            goToSlide(index);
            resetAutoplay();
        });
    });
    
    // Autoplay
    function startAutoplay() {
        console.log('▶️ Autoplay démarré');
        autoplayInterval = setInterval(() => {
            console.log('🔄 Autoplay - changement de slide');
            goToSlide(currentSlide + 1);
        }, 5000); // Change toutes les 5 secondes
    }
    
    function resetAutoplay() {
        console.log('🔄 Reset autoplay');
        clearInterval(autoplayInterval);
        startAutoplay();
    }
    
    // Test initial - afficher tous les slides
    console.log('Slides trouvés:');
    slides.forEach((slide, i) => {
        console.log(`Slide ${i}:`, slide, 'Active:', slide.classList.contains('active'));
    });
    
    // Démarrer l'autoplay
    setTimeout(() => {
        console.log('⏱️ Démarrage autoplay dans 2 secondes');
        startAutoplay();
    }, 2000);
    
    // Pause au survol
    const carouselContainer = document.querySelector('.about-carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            console.log('⏸️ Pause autoplay (survol)');
            clearInterval(autoplayInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            console.log('▶️ Reprise autoplay');
            startAutoplay();
        });
    }
    
    console.log('✅ About carousel complètement initialisé');
}

// Export des fonctions pour utilisation externe
window.OstiroNetwork = {
    showNotification,
    typeWriter,
    animateCounter,
    createFloatingParticles,
    createStarField,
    createParticleBurst,
    initSpaceTravelEffect,
    initFAQAccordion,
    initHeroCarousel,
    initAboutCarousel
};

// ========================================
// FAQ ACCORDION FUNCTIONALITY
// ========================================

function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Fermer tous les autres items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle l'item actuel
            item.classList.toggle('active');
        });
    });
}

// Initialiser l'accordéon FAQ
document.addEventListener('DOMContentLoaded', () => {
    initFAQAccordion();
});