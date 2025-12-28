document.addEventListener('DOMContentLoaded', () => {
    // Content Configuration
    const content = [
        { text: "Sites Web qui Convertissent.", cta: "Démarrer un projet" },
        { text: "Websites That Convert.", cta: "Start a project" },
        { text: "Sitios Web que Convierten.", cta: "Empezar un proyecto" },
        { text: "Websites, die Konvertieren.", cta: "Projekt starten" },
        { text: "Siti Web che Convertono.", cta: "Avvia un progetto" },
        { text: "Sites que Convertem.", cta: "Começar um projeto" },
        { text: "Website die Converteren.", cta: "Start een project" }
    ];

    let currentIndex = 0;
    const heroText = document.querySelector('.hero-text');
    const ctaText = document.querySelector('.cta-text');

    // Slower, more elegant timing for the "Moon Space" vibe
    const animationDelay = 50;
    const stayTime = 2500;

    function updateText() {
        const currentData = content[currentIndex];

        // --- Hero Text Setup ---
        heroText.innerHTML = '';
        const words = currentData.text.split(' ');

        words.forEach(word => {
            const wordSpan = document.createElement('span');
            wordSpan.classList.add('word');

            word.split('').forEach(char => {
                const charSpan = document.createElement('span');
                charSpan.classList.add('char');
                charSpan.innerText = char;
                wordSpan.appendChild(charSpan);
            });

            heroText.appendChild(wordSpan);
        });

        // --- CTA Text Update ---
        if (ctaText) {
            ctaText.innerText = currentData.cta;
            ctaText.classList.remove('changing');
        }

        // --- Animate Hero IN ---
        const allChars = heroText.querySelectorAll('.char');
        allChars.forEach((char, index) => {
            setTimeout(() => {
                char.classList.add('visible');
            }, 50 + (animationDelay * index));
        });

        // --- Schedule OUT phase ---
        const totalInTime = animationDelay * allChars.length;

        setTimeout(() => {
            // Anim Out
            const allCharsOut = heroText.querySelectorAll('.char');
            allCharsOut.forEach((char, index) => {
                setTimeout(() => {
                    char.classList.remove('visible');
                    char.classList.add('out');
                }, animationDelay * index);
            });

            // CTA Fade Out
            if (ctaText) {
                ctaText.classList.add('changing');
            }

            // Loop
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % content.length;
                updateText();
            }, (animationDelay * allCharsOut.length) + 800);

        }, totalInTime + stayTime);
    }

    updateText();

    // Floating Effect for the Moon (Parallax-ish mouse movement)
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const moon = document.querySelector('.glow-orb.moon');
        const secondary = document.querySelector('.glow-orb.secondary');

        // Note: moon/secondary elements might not exist in this simpler version, 
        // but keeping logic safe if they are added back.
        if (moon) {
            moon.style.transform = `translate(-50%, -50%) translate(${x * 20}px, ${y * 20}px)`;
        }
        if (secondary) {
            secondary.style.transform = `translate(${x * -30}px, ${y * -30}px)`;
        }
    });

    // --- Legal Modal Logic ---
    const legalBtn = document.getElementById('legal-btn');
    const legalModal = document.getElementById('legal-modal');

    // Open
    if (legalBtn && legalModal) {
        legalBtn.addEventListener('click', (e) => {
            e.preventDefault(); // prevent navigation behavior if it was a link
            legalModal.classList.add('active');
        });
    }

    // Close on click outside
    if (legalModal) {
        legalModal.addEventListener('click', (e) => {
            if (e.target === legalModal) {
                legalModal.classList.remove('active');
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal && legalModal.classList.contains('active')) {
            legalModal.classList.remove('active');
        }
    });

});
