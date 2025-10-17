// ========================================
// ANALYTICS & CONVERSION TRACKING
// ========================================

// Fonction pour envoyer des événements à Google Analytics
function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            event_category: parameters.category || 'User Interaction',
            event_label: parameters.label || '',
            value: parameters.value || 0,
            custom_parameter_1: parameters.page_type || 'unknown',
            custom_parameter_2: parameters.user_journey || 'unknown',
            ...parameters
        });
    }
}

// Tracking du funnel de conversion
const conversionFunnel = {
    // Étape 1: Visite de la page
    pageView: function(pageName) {
        trackEvent('page_view', {
            category: 'Funnel',
            label: pageName,
            page_type: pageName.toLowerCase().replace(/\s+/g, '_'),
            user_journey: 'awareness'
        });
    },
    
    // Étape 2: Interaction avec le contenu
    contentEngagement: function(contentType, contentId) {
        trackEvent('content_engagement', {
            category: 'Funnel',
            label: `${contentType}_${contentId}`,
            page_type: 'engagement',
            user_journey: 'interest'
        });
    },
    
    // Étape 3: Ajout au panier
    addToCart: function(productId, productName, price) {
        trackEvent('add_to_cart', {
            category: 'E-commerce',
            label: productName,
            value: price,
            page_type: 'conversion',
            user_journey: 'consideration',
            product_id: productId,
            product_name: productName,
            currency: 'EUR'
        });
    },
    
    // Étape 4: Début du formulaire
    formStart: function(formType) {
        trackEvent('form_start', {
            category: 'Funnel',
            label: formType,
            page_type: 'conversion',
            user_journey: 'intent'
        });
    },
    
    // Étape 5: Validation du formulaire
    formValidation: function(formType, cartValue) {
        trackEvent('form_validation', {
            category: 'Funnel',
            label: formType,
            value: cartValue,
            page_type: 'conversion',
            user_journey: 'purchase_intent'
        });
    },
    
    // Étape 6: Initiation du paiement
    paymentInitiated: function(paymentMethod, amount) {
        trackEvent('payment_initiated', {
            category: 'E-commerce',
            label: paymentMethod,
            value: amount,
            page_type: 'conversion',
            user_journey: 'purchase',
            payment_method: paymentMethod,
            currency: 'EUR'
        });
    },
    
    // Étape 7: Paiement réussi
    paymentSuccess: function(paymentMethod, amount, transactionId) {
        trackEvent('purchase', {
            category: 'E-commerce',
            label: 'payment_success',
            value: amount,
            page_type: 'conversion',
            user_journey: 'conversion',
            payment_method: paymentMethod,
            transaction_id: transactionId,
            currency: 'EUR'
        });
    },
    
    // Étape 8: Abandon du panier
    cartAbandonment: function(cartValue, itemsCount) {
        trackEvent('cart_abandonment', {
            category: 'Funnel',
            label: 'cart_abandoned',
            value: cartValue,
            page_type: 'abandonment',
            user_journey: 'abandoned',
            items_count: itemsCount,
            currency: 'EUR'
        });
    }
};

// Tracking des erreurs et problèmes
function trackError(errorType, errorMessage, errorLocation) {
    trackEvent('error_occurred', {
        category: 'Error Tracking',
        label: errorType,
        page_type: 'error',
        user_journey: 'error',
        error_message: errorMessage,
        error_location: errorLocation
    });
}

// Tracking des performances de chargement
function trackPageLoad() {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        trackEvent('page_load_time', {
            category: 'Performance',
            label: 'page_load',
            value: loadTime,
            page_type: 'performance',
            user_journey: 'loading'
        });
    });
}

// Tracking des interactions utilisateur
function trackUserInteractions() {
    // Clics sur les boutons CTA
    document.addEventListener('click', (e) => {
        const button = e.target.closest('button, .btn, .cta-button');
        if (button) {
            const buttonText = button.textContent.trim();
            const buttonClass = button.className;
            
            trackEvent('button_click', {
                category: 'User Interaction',
                label: buttonText,
                page_type: 'interaction',
                user_journey: 'engagement',
                button_class: buttonClass
            });
        }
    });
    
    // Scroll depth tracking
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll && scrollPercent % 25 === 0) {
            maxScroll = scrollPercent;
            trackEvent('scroll_depth', {
                category: 'User Engagement',
                label: `${scrollPercent}%`,
                value: scrollPercent,
                page_type: 'engagement',
                user_journey: 'engagement'
            });
        }
    });
    
    // Time on page tracking
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        trackEvent('time_on_page', {
            category: 'User Engagement',
            label: 'page_duration',
            value: timeOnPage,
            page_type: 'engagement',
            user_journey: 'engagement'
        });
    });
}

// Tracking de l'abandon du panier
function trackCartAbandonment() {
    let cartAbandonmentTracked = false;
    
    // Vérifier l'abandon du panier avant de quitter la page
    window.addEventListener('beforeunload', () => {
        const cart = loadCart();
        if (cart.length > 0 && !cartAbandonmentTracked) {
            const cartValue = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            conversionFunnel.cartAbandonment(cartValue, itemsCount);
            cartAbandonmentTracked = true;
        }
    });
    
    // Marquer comme non abandonné si l'utilisateur revient
    window.addEventListener('focus', () => {
        cartAbandonmentTracked = false;
    });
}

// Initialiser le tracking
document.addEventListener('DOMContentLoaded', () => {
    // Tracking de la page actuelle
    const currentPage = document.title.split(' - ')[0] || 'Unknown Page';
    conversionFunnel.pageView(currentPage);
    
    // Initialiser les trackers
    trackPageLoad();
    trackUserInteractions();
    trackCartAbandonment();
});

// ========================================
// NAVIGATION & UI
// ========================================

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
// Animation de chargement supprimée pour améliorer l'expérience utilisateur

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
        background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(30, 58, 138, 0.3);
        color: #ffffff;
        padding: 16px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10001;
        box-shadow: 0 8px 32px rgba(30, 58, 138, 0.4);
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 400px;
        font-weight: 500;
    `;
    
    // Couleur selon le type
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    notification.style.borderLeft = `4px solid ${colors[type]}`;
    notification.style.borderTop = `1px solid ${colors[type]}`;
    notification.style.borderRight = `1px solid ${colors[type]}`;
    notification.style.borderBottom = `1px solid ${colors[type]}`;
    
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
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
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
        const icon = question ? question.querySelector('.question-arrow i') : null;
        
        if (question && answer) {
            question.addEventListener('click', (e) => {
                e.preventDefault();
                const isActive = item.classList.contains('active');
                
                // Si la question est déjà ouverte, la fermer
                if (isActive) {
                    item.classList.remove('active');
                    answer.style.maxHeight = '0';
                    answer.style.opacity = '0';
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                    }
                } else {
                    // Fermer tous les autres items d'abord
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                            const otherAnswer = otherItem.querySelector('.faq-answer');
                            const otherIcon = otherItem.querySelector('.question-arrow i');
                            if (otherAnswer) {
                                otherAnswer.style.maxHeight = '0';
                                otherAnswer.style.opacity = '0';
                            }
                            if (otherIcon) {
                                otherIcon.style.transform = 'rotate(0deg)';
                            }
                        }
                    });
                    
                    // Puis ouvrir l'item actuel
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.style.opacity = '1';
                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
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
    // Animation de chargement supprimée
    
    
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
        
        /* Styles de chargement supprimés */
        
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

// Gestion des erreurs JavaScript (silencieuse)
window.addEventListener('error', (e) => {
    // Erreur gérée silencieusement pour éviter les messages d'erreur
});

// Optimisations de performance
(function optimizePerformance() {
    // Désactiver les animations sur les appareils lents
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
        document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }
    
    // Optimisation du scroll
    let ticking = false;
    function updateScroll() {
        // Optimisations de scroll ici si nécessaire
        ticking = false;
    }
    
    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    });
    
    // Optimisation des images lazy loading
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
})();

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

// ===============================
// CART AND CHECKOUT INTEGRATION
// ===============================

(function initCartAndCheckout() {
    const floatingCartBtn = document.querySelector('.floating-cart-btn');
    const cartDrawer = document.getElementById('cartDrawer');
    
    // Debug: vérifier que le bouton est trouvé
    console.log('Bouton panier trouvé:', floatingCartBtn);
    console.log('Tiroir panier trouvé:', cartDrawer);
    const cartClose = cartDrawer ? cartDrawer.querySelector('.cart-close') : null;
    const cartItemsList = cartDrawer ? cartDrawer.querySelector('.cart-items') : null;
    const cartEmpty = cartDrawer ? cartDrawer.querySelector('.cart-empty') : null;
    const cartTotalEl = cartDrawer ? cartDrawer.querySelector('.cart-total') : null;
    const stripeCheckoutBtn = cartDrawer ? cartDrawer.querySelector('.btn-checkout-stripe') : null;
    const cartCountBadge = document.querySelector('.cart-count-badge');
    const cartTotalPaypalEl = cartDrawer ? cartDrawer.querySelector('.cart-total-paypal') : null;
    const cartContactForm = document.getElementById('cartContactForm');

    let cart = loadCart();

    function loadCart() {
        try {
            const raw = localStorage.getItem('cart');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function getTotal() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    function getPaypalTotal() {
        return getTotal() * 0.85; // -15%
    }

    function updateBadge() {
        if (!cartCountBadge) return;
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountBadge.textContent = String(count);
    }

    function renderCart() {
        if (!cartItemsList || !cartTotalEl || !cartEmpty) return;
        cartItemsList.innerHTML = '';
        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
        } else {
            cartEmpty.style.display = 'none';
        }
        cart.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'cart-item';
            li.innerHTML = `
                <div>
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">€${item.price.toFixed(2)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-dec" aria-label="Diminuer">−</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-inc" aria-label="Augmenter">+</button>
                    <button class="cart-remove" aria-label="Supprimer">&times;</button>
                </div>
            `;
            const dec = li.querySelector('.qty-dec');
            const inc = li.querySelector('.qty-inc');
            const rem = li.querySelector('.cart-remove');
            dec.addEventListener('click', () => {
                if (cart[index].quantity > 1) cart[index].quantity -= 1; else cart.splice(index, 1);
                saveCart();
                renderCart();
                updateBadge();
            });
            inc.addEventListener('click', () => {
                cart[index].quantity += 1;
                saveCart();
                renderCart();
                updateBadge();
            });
            rem.addEventListener('click', () => {
                cart.splice(index, 1);
                saveCart();
                renderCart();
                updateBadge();
            });
            cartItemsList.appendChild(li);
        });
        cartTotalEl.textContent = `€${getTotal().toFixed(2)}`;
        if (cartTotalPaypalEl) {
            cartTotalPaypalEl.textContent = `€${getPaypalTotal().toFixed(2)}`;
        }
    }

    function openCart() {
        console.log('Fonction openCart appelée');
        if (!cartDrawer) {
            console.error('Tiroir panier non trouvé dans openCart');
            return;
        }
        console.log('Ouverture du tiroir panier');
        cartDrawer.classList.add('open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        renderCart();
    }
    function closeCart() {
        if (!cartDrawer) return;
        cartDrawer.classList.remove('open');
        cartDrawer.setAttribute('aria-hidden', 'true');
    }

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-product-id');
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price') || '0');
            const existing = cart.find(i => i.id === id);
            if (existing) existing.quantity += 1; else cart.push({ id, name, price, quantity: 1 });
            saveCart();
            updateBadge();
            showNotification(`${name} a été ajouté au panier`, 'success', 2000);
            
            // Tracking analytics
            conversionFunnel.addToCart(id, name, price);
        });
    });

    if (floatingCartBtn) {
        console.log('Ajout de l\'event listener au bouton panier');
        floatingCartBtn.addEventListener('click', function(e) {
            console.log('Clic sur le bouton panier détecté');
            e.preventDefault();
            openCart();
        });
    } else {
        console.error('Bouton panier non trouvé!');
    }
    if (cartClose) cartClose.addEventListener('click', closeCart);

    updateBadge();

    // ===== Initialisation : Cacher la section de paiement =====
    function hidePaymentSection() {
        const paymentSection = document.getElementById('paymentOptionsSection');
        if (paymentSection) {
            paymentSection.style.display = 'none';
        }
    }
    
    // Cacher la section de paiement au chargement
    hidePaymentSection();

    // ===== Fermer le panier en cliquant en dehors =====
    function setupClickOutsideToClose() {
        document.addEventListener('click', function(event) {
            const cartDrawer = document.getElementById('cartDrawer');
            const floatingCartBtn = document.querySelector('.floating-cart-btn');
            
            // Vérifier si le panier est ouvert
            if (cartDrawer && cartDrawer.classList.contains('open')) {
                // Vérifier si le clic est en dehors du panier et du bouton
                const isClickInsideCart = cartDrawer.contains(event.target);
                const isClickOnCartButton = floatingCartBtn && floatingCartBtn.contains(event.target);
                
                // Si le clic est en dehors, fermer le panier
                if (!isClickInsideCart && !isClickOnCartButton) {
                    closeCart();
                }
            }
        });
    }
    
    // Initialiser la fermeture en cliquant en dehors
    setupClickOutsideToClose();

    // ===== Fermer le panier avec la touche Échap =====
    function setupEscapeKeyToClose() {
        document.addEventListener('keydown', function(event) {
            const cartDrawer = document.getElementById('cartDrawer');
            
            // Si la touche Échap est pressée et que le panier est ouvert
            if (event.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
                closeCart();
            }
        });
    }
    
    // Initialiser la fermeture avec Échap
    setupEscapeKeyToClose();

    // ========== Stripe Checkout ==========
    if (stripeCheckoutBtn) {
        stripeCheckoutBtn.addEventListener('click', async () => {
            if (!isContactFormValid()) {
                showNotification('Veuillez renseigner vos coordonnées avant le paiement.', 'warning');
                return;
            }
            if (!window.PAYMENT_CONFIG || !window.PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY) {
                showNotification('Configuration Stripe manquante.', 'error');
                return;
            }
            if (cart.length === 0) {
                showNotification('Votre panier est vide.', 'warning');
                return;
            }

            // Save order snapshot for success page and email
            const orderData = buildOrderSnapshot('Stripe');
            try { localStorage.setItem('lastOrder', JSON.stringify(orderData)); } catch (e) {}

            // Load Stripe.js
            const stripeJs = await loadStripeJs();
            const stripe = window.Stripe(window.PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY);

            // Build line items from price IDs
            const lineItems = cart.map(item => {
                const priceId = window.PAYMENT_CONFIG.STRIPE_PRICES[item.id];
                return priceId ? { price: priceId, quantity: item.quantity } : null;
            }).filter(Boolean);

            if (lineItems.length === 0) {
                showNotification('Aucun article avec Price ID Stripe configuré.', 'error');
                return;
            }

            stripe.redirectToCheckout({
                mode: 'payment',
                lineItems,
                successUrl: window.location.origin + '/success.html',
                cancelUrl: window.location.href
            }).then(function(result) {
                if (result.error) {
                    showNotification(result.error.message || 'Erreur Stripe.', 'error');
                }
            });
        });
    }

    function loadStripeJs() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) return resolve();
            const s = document.createElement('script');
            s.src = 'https://js.stripe.com/v3/';
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // ========== PayPal Buttons ==========
    if (cartDrawer) {
        setupPayPalButtons();
    }

    function setupPayPalButtons() {
        const container = document.getElementById('paypal-buttons-container');
        if (!container) return;
        if (!window.PAYMENT_CONFIG || !window.PAYMENT_CONFIG.PAYPAL_CLIENT_ID) return;

        // Load PayPal SDK with client-id and currency
        loadPayPalSdk(window.PAYMENT_CONFIG.PAYPAL_CLIENT_ID, window.PAYMENT_CONFIG.CURRENCY || 'EUR')
        .then(() => {
            if (!window.paypal) return;
            window.paypal.Buttons({
                style: { layout: 'horizontal', color: 'gold', shape: 'rect', label: 'paypal' },
                createOrder: function(data, actions) {
                    if (!isContactFormValid()) {
                        showNotification('Veuillez renseigner vos coordonnées avant le paiement.', 'warning');
                        return;
                    }
                    const total = getPaypalTotal().toFixed(2);
                    if (total === '0.00') {
                        showNotification('Votre panier est vide.', 'warning');
                        return;
                    }
                    return actions.order.create({
                        purchase_units: [{ amount: { currency_code: window.PAYMENT_CONFIG.CURRENCY || 'EUR', value: total } }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        // Tracking: paiement réussi
                        const total = getTotal();
                        conversionFunnel.paymentSuccess('PayPal', total, details.id);
                        
                        showNotification('Paiement PayPal réussi. Merci ' + (details.payer?.name?.given_name || ''), 'success');
                        saveContactForLater();
                        // Save snapshot, send receipt, then clear
                        const orderData = buildOrderSnapshot('PayPal', true);
                        try { localStorage.setItem('lastOrder', JSON.stringify(orderData)); } catch (e) {}
                        
                        // Envoyer le reçu au client
                        ensureAndSendReceipt(orderData);
                        
                        // Envoyer la notification au propriétaire
                        sendPaymentNotificationToOwner(orderData);
                        
                        cart = [];
                        saveCart();
                        updateBadge();
                        renderCart();
                        closeCart();
                        
                        // Afficher le message de confirmation
                        showSuccessMessage();
                        
                        // Optional: redirect to a success page
                        setTimeout(() => {
                            window.location.href = 'success.html';
                        }, 3000);
                    });
                },
                onError: function(err) {
                    console.error('PayPal error', err);
                    showNotification('Erreur PayPal.', 'error');
                }
            }).render('#paypal-buttons-container');
        })
        .catch(() => {
            console.warn('PayPal SDK failed to load');
        });
    }

    function loadPayPalSdk(clientId, currency) {
        return new Promise((resolve, reject) => {
            if (window.paypal) return resolve();
            const s = document.createElement('script');
            s.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}`;
            s.onload = () => resolve();
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    // ===== Contact form validation & storage =====
    function isContactFormValid() {
        if (!cartContactForm) return false;
        const data = new FormData(cartContactForm);
        const firstName = (data.get('firstName') || '').toString().trim();
        const lastName = (data.get('lastName') || '').toString().trim();
        const email = (data.get('email') || '').toString().trim();
        const phone = (data.get('phone') || '').toString().trim();
        const request = (data.get('request') || '').toString().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = firstName && lastName && emailRegex.test(email) && phone && request;
        return Boolean(isValid);
    }

    // ===== Envoi automatique des informations du formulaire =====
    function sendContactFormEmail() {
        if (!cartContactForm || !isContactFormValid()) {
            showNotification('Veuillez remplir tous les champs obligatoires.', 'warning');
            return Promise.reject('Formulaire invalide');
        }

        const formData = new FormData(cartContactForm);
        const contactData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            request: formData.get('request'),
            company: formData.get('company') || ''
        };

        // Préparer les paramètres pour EmailJS
        const templateParams = {
            to_email: EMAIL_CONFIG.TO_EMAIL,
            from_name: `${contactData.firstName} ${contactData.lastName}`,
            from_email: contactData.email,
            phone: contactData.phone,
            company: contactData.company,
            message: contactData.request,
            cart_items: cart.map(item => `${item.name} x${item.quantity} - €${item.price}`).join('\n'),
            cart_total: `€${getTotal().toFixed(2)}`,
            date: new Date().toLocaleString('fr-FR')
        };

        console.log('Envoi des informations du formulaire:', templateParams);

        return emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, templateParams)
            .then((response) => {
                console.log('✅ Informations du formulaire envoyées avec succès!', response.status, response.text);
                showNotification('Vos informations ont été enregistrées avec succès !', 'success');
                return response;
            })
            .catch((error) => {
                console.error('❌ Erreur lors de l\'envoi des informations:', error);
                showNotification('Erreur lors de l\'envoi des informations. Veuillez réessayer.', 'error');
                throw error;
            });
    }

    function saveContactForLater() {
        if (!cartContactForm) return;
        const data = Object.fromEntries(new FormData(cartContactForm).entries());
        try { localStorage.setItem('cartContact', JSON.stringify(data)); } catch (e) {}
    }

    function buildOrderSnapshot(method, applyPaypalDiscount = false) {
        const contact = (() => {
            try { return JSON.parse(localStorage.getItem('cartContact') || '{}'); } catch (e) { return {}; }
        })();
        const items = cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }));
        const total = getTotal();
        const discountedTotal = applyPaypalDiscount ? total * 0.85 : total;
        return {
            method,
            date: new Date().toISOString(),
            contact,
            items,
            total,
            discountedTotal,
            currency: (window.PAYMENT_CONFIG && window.PAYMENT_CONFIG.CURRENCY) || 'EUR'
        };
    }

    function ensureAndSendReceipt(orderData) {
        try {
            if (typeof EMAIL_CONFIG !== 'undefined' && window.emailjs) {
                const toEmail = orderData?.contact?.email || EMAIL_CONFIG.TO_EMAIL;
                // Build a simple text summary
                const itemsText = orderData.items.map(it => `${it.name} x${it.quantity} — €${(it.price * it.quantity).toFixed(2)}`).join('\n');
                const totalText = `Total: €${orderData.total.toFixed(2)}${orderData.method === 'PayPal' ? ` (PayPal -15%: €${orderData.discountedTotal.toFixed(2)})` : ''}`;

                const templateParams = {
                    to_email: toEmail,
                    from_name: `${orderData.contact.firstName || ''} ${orderData.contact.lastName || ''}`.trim() || 'Client',
                    from_email: orderData.contact.email || '',
                    phone: orderData.contact.phone || '',
                    request: orderData.contact.request || '',
                    method: orderData.method,
                    items: itemsText,
                    total: totalText,
                    currency: orderData.currency,
                    date: orderData.date
                };

                emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, templateParams)
                    .then(() => console.log('📧 Reçu envoyé'))
                    .catch(err => console.warn('EmailJS error', err));
            }
        } catch (e) {
            console.warn('Receipt send skipped', e);
        }
    }

    // ===== Notifications de paiement pour le propriétaire =====
    function sendPaymentNotificationToOwner(orderData) {
        try {
            if (typeof EMAIL_CONFIG !== 'undefined' && window.emailjs) {
                const itemsText = orderData.items.map(it => `${it.name} x${it.quantity} — €${(it.price * it.quantity).toFixed(2)}`).join('\n');
                const totalText = `Total: €${orderData.total.toFixed(2)}${orderData.method === 'PayPal' ? ` (PayPal -15%: €${orderData.discountedTotal.toFixed(2)})` : ''}`;

                const notificationParams = {
                    to_email: EMAIL_CONFIG.TO_EMAIL, // Email du propriétaire
                    from_name: 'Système de Paiement',
                    from_email: 'noreply@ostiro-network.com',
                    subject: `🎉 NOUVEAU PAIEMENT REÇU - ${orderData.method}`,
                    client_name: `${orderData.contact.firstName || ''} ${orderData.contact.lastName || ''}`.trim() || 'Client',
                    client_email: orderData.contact.email || '',
                    client_phone: orderData.contact.phone || '',
                    client_request: orderData.contact.request || '',
                    payment_method: orderData.method,
                    items: itemsText,
                    total: totalText,
                    currency: orderData.currency,
                    date: orderData.date,
                    message: `Un nouveau paiement a été effectué via ${orderData.method} pour un montant de ${totalText}.`
                };

                // Utiliser un template différent pour les notifications admin
                const adminTemplateId = 'template_admin_notification'; // Tu devras créer ce template dans EmailJS
                
                emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, notificationParams)
                    .then(() => {
                        console.log('📧 Notification de paiement envoyée au propriétaire');
                        showNotification('✅ Paiement confirmé ! Vous recevrez un email de confirmation.', 'success');
                    })
                    .catch(err => {
                        console.warn('Erreur envoi notification admin:', err);
                        // Fallback: utiliser le template principal
                        emailjs.send(EMAIL_CONFIG.SERVICE_ID, EMAIL_CONFIG.TEMPLATE_ID, notificationParams)
                            .then(() => console.log('📧 Notification envoyée via template principal'))
                            .catch(err2 => console.warn('Erreur template principal:', err2));
                    });
            }
        } catch (e) {
            console.warn('Notification admin skipped', e);
        }
    }

    if (cartContactForm) {
        cartContactForm.addEventListener('input', () => {
            // Visual validation feedback (simple border color)
            const inputs = cartContactForm.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                if (input.checkValidity()) {
                    input.style.borderColor = 'var(--success-color)';
                } else {
                    input.style.borderColor = 'var(--accent-color)';
                }
            });
        });
    }

    // ===== Gestion du bouton de validation du formulaire =====
    const validateFormBtn = document.getElementById('validateFormBtn');
    if (validateFormBtn) {
        validateFormBtn.addEventListener('click', async () => {
            if (!isContactFormValid()) {
                showNotification('Veuillez remplir tous les champs obligatoires.', 'warning');
                return;
            }

            // Animation du bouton
            const originalText = validateFormBtn.innerHTML;
            validateFormBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            validateFormBtn.disabled = true;

            try {
                // Tracking: début de validation du formulaire
                const cartValue = getTotal();
                conversionFunnel.formValidation('contact_form', cartValue);
                
                // Envoyer les informations par email
                await sendContactFormEmail();
                
                // Sauvegarder localement
                saveContactForLater();
                
                // Afficher les boutons de paiement dynamiques
                showDynamicPaymentButtons();
                
                // Marquer le formulaire comme validé
                validateFormBtn.innerHTML = '<i class="fas fa-check"></i> Informations validées !';
                validateFormBtn.style.background = 'var(--success-color)';
                validateFormBtn.disabled = true;
                
            } catch (error) {
                console.error('Erreur lors de la validation:', error);
                validateFormBtn.innerHTML = originalText;
                validateFormBtn.disabled = false;
            }
        });
    }

    // ===== Affichage des boutons de paiement dynamiques =====
    function showDynamicPaymentButtons() {
        const paymentSection = document.getElementById('paymentOptionsSection');
        const dynamicButtons = document.getElementById('dynamicPaymentButtons');
        
        if (!paymentSection || !dynamicButtons) return;

        // S'assurer que la section est cachée au début
        paymentSection.style.display = 'none';
        
        // Afficher la section de paiement seulement après validation
        paymentSection.style.display = 'block';

        // Générer les boutons selon le contenu du panier
        let buttonsHTML = '';
        
        // Vérifier quels produits sont dans le panier
        const hasSiteVitrine = cart.some(item => item.id === 'site_vitrine');
        const hasSiteHebergement = cart.some(item => item.id === 'site_hebergement');
        const hasHebergementSupport = cart.some(item => item.id === 'hebergement_support');

        if (hasSiteHebergement) {
            // Si "Site Vitrine + Hébergement" est dans le panier
            buttonsHTML += `
                <div class="payment-option">
                    <p class="payment-note">Paiement sécurisé via PayPal</p>
                    <div id="paypal-buttons-container"></div>
                </div>
            `;
        } else if (hasSiteVitrine) {
            // Si "Site Vitrine" est dans le panier
            buttonsHTML += `
                <div class="payment-option">
                    <p class="payment-note">Paiement sécurisé via PayPal</p>
                    <div id="paypal-container-TWF4DWMJETCMS"></div>
                </div>
            `;
        } else if (hasHebergementSupport) {
            // Si "Hébergement + Support" est dans le panier
            buttonsHTML += `
                <div class="payment-option">
                    <p class="payment-note">Nous vous contacterons pour établir un devis personnalisé.</p>
                    <button class="btn-contact-devis">
                        <i class="fas fa-envelope"></i>
                        Demander un devis
                    </button>
                </div>
            `;
        } else {
            // Panier vide ou produits non reconnus
            buttonsHTML = `
                <div class="payment-option">
                    <p class="payment-note">Aucun produit valide dans le panier.</p>
                </div>
            `;
        }

        dynamicButtons.innerHTML = buttonsHTML;

        // Réinitialiser les boutons PayPal si nécessaire
        if (typeof paypal !== 'undefined') {
            setTimeout(() => {
                if (hasSiteHebergement) {
                    paypal.HostedButtons({
                        hostedButtonId: "3HFFE75LH2LBS",
                    }).render("#paypal-buttons-container");
                } else if (hasSiteVitrine) {
                    paypal.HostedButtons({
                        hostedButtonId: "TWF4DWMJETCMS",
                    }).render("#paypal-container-TWF4DWMJETCMS");
                }
            }, 100);
        }
    }

    // ===== Message de confirmation après paiement =====
    function showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'payment-success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <h3>✅ Merci !</h3>
                <p>Votre commande a bien été enregistrée.</p>
                <p>Nous vous recontacterons sous peu pour finaliser votre projet.</p>
                <div class="success-details">
                    <p><strong>Prochaines étapes :</strong></p>
                    <ul>
                        <li>Vous recevrez un email de confirmation</li>
                        <li>Nous vous contacterons dans les 24h</li>
                        <li>Nous commencerons votre projet</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Styles pour le message de succès
        successMessage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;
        
        const successContent = successMessage.querySelector('.success-content');
        successContent.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 1px solid rgba(0, 255, 136, 0.3);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 500px;
            margin: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            animation: slideInUp 0.5s ease;
        `;
        
        const successIcon = successMessage.querySelector('.success-icon');
        successIcon.style.cssText = `
            font-size: 60px;
            color: #00ff88;
            margin-bottom: 20px;
            animation: bounce 1s ease;
        `;
        
        const successTitle = successMessage.querySelector('h3');
        successTitle.style.cssText = `
            color: #ffffff;
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 600;
        `;
        
        const successText = successMessage.querySelectorAll('p');
        successText.forEach(p => {
            p.style.cssText = `
                color: #c0c8d8;
                font-size: 16px;
                margin-bottom: 10px;
                line-height: 1.5;
            `;
        });
        
        const successDetails = successMessage.querySelector('.success-details');
        successDetails.style.cssText = `
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 255, 136, 0.2);
        `;
        
        const successList = successMessage.querySelector('ul');
        successList.style.cssText = `
            text-align: left;
            color: #c0c8d8;
            margin-top: 10px;
        `;
        
        const successListItems = successMessage.querySelectorAll('li');
        successListItems.forEach(li => {
            li.style.cssText = `
                margin-bottom: 8px;
                padding-left: 20px;
                position: relative;
            `;
            li.innerHTML = `<i class="fas fa-arrow-right" style="position: absolute; left: 0; color: #00ff88; font-size: 12px;"></i>${li.textContent}`;
        });
        
        document.body.appendChild(successMessage);
        
        // Ajouter les animations CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                60% {
                    transform: translateY(-5px);
                }
            }
        `;
        document.head.appendChild(style);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            successMessage.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (successMessage.parentNode) {
                    document.body.removeChild(successMessage);
                }
            }, 300);
        }, 5000);
    }
})();

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
    createStarField,
    createParticleBurst,
    initSpaceTravelEffect,
    initHeroCarousel,
    initAboutCarousel
};

// ========================================
// FAQ ACCORDION FUNCTIONALITY
// ========================================

// L'accordéon FAQ est déjà initialisé dans la section FAQ Accordion amélioré ci-dessus