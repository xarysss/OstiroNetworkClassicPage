document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('speed-test-form');
    const inputUrl = document.getElementById('url-input');
    const btnTest = document.getElementById('test-btn');
    const loading = document.getElementById('loading');
    const dashboard = document.getElementById('dashboard');

    // Dashboard Elements
    const apdexScoreLabel = document.getElementById('apdex-score');
    const apdexCircle = document.getElementById('apdex-circle');
    const apdexRatingText = document.getElementById('apdex-rating');
    const apdexRatingDesc = document.querySelector('.apdex-info p');
    
    const metricFCP = document.getElementById('metric-fcp');
    const metricSI = document.getElementById('metric-si');
    const metricCLS = document.getElementById('metric-cls');
    const metricPerf = document.getElementById('metric-perf');

    const opportunitiesList = document.getElementById('opportunities-list');

    // Google PageSpeed Insights API endpoint
    const API_ENDPOINT = 'https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed';
    // Optionnel : Ajoutez votre clé API Google Cloud ici pour éviter les limites de quota
    const API_KEY = 'AIzaSyAdL60OCHjjDDZJmEux0pAQRQgK79lNTlM'; 

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let url = inputUrl.value.trim();
        // Ensure valid URL
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            inputUrl.value = url;
        }

        // UI Reset & Loading state
        dashboard.classList.add('hidden');
        loading.classList.remove('hidden');
        btnTest.disabled = true;
        btnTest.textContent = 'Analyse...';

        try {
            // Construction de l'URL avec clé API si présente
            let apiUrl = `${API_ENDPOINT}?url=${encodeURIComponent(url)}&strategy=desktop&category=performance`;
            if (API_KEY) {
                apiUrl += `&key=${API_KEY}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error("Limite de requêtes atteinte (Quota Google). Veuillez réessayer plus tard ou ajouter une clé API.");
                } else if (data.error && data.error.message) {
                    throw new Error(data.error.message);
                } else {
                    throw new Error("L'API PageSpeed a retourné une erreur. Veuillez vérifier l'URL.");
                }
            }

            processMetrics(data);
            
            // Show Dashboard
            loading.classList.add('hidden');
            dashboard.classList.remove('hidden');
            
            // Scroll to dashboard smoothly
            dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            alert(`Erreur : ${error.message}`);
            loading.classList.add('hidden');
        } finally {
            btnTest.disabled = false;
            btnTest.textContent = 'Tester';
        }
    });

    function processMetrics(data) {
        const lighthouse = data.lighthouseResult;
        const audits = lighthouse.audits;
        
        // Extract Core Web Vitals
        const fcp = audits['first-contentful-paint'].numericValue / 1000; // in seconds
        const si = audits['speed-index'].numericValue / 1000;
        const cls = audits['cumulative-layout-shift'].numericValue;
        const performanceScore = Math.round(lighthouse.categories.performance.score * 100);

        // Process APDEX
        const apdex = calculateApdex(fcp, si);
        updateApdexUI(apdex);

        // Update Metric Cards Data
        metricFCP.textContent = `${fcp.toFixed(1)} s`;
        metricFCP.className = `metric-value ${getMetricColorClass(fcp, 1.8, 3.0)}`;

        metricSI.textContent = `${si.toFixed(1)} s`;
        metricSI.className = `metric-value ${getMetricColorClass(si, 3.4, 5.8)}`;

        metricCLS.textContent = cls.toFixed(3);
        metricCLS.className = `metric-value ${getMetricColorClass(cls, 0.1, 0.25)}`;

        metricPerf.textContent = `${performanceScore} / 100`;
        metricPerf.className = `metric-value ${getMetricColorClass(100 - performanceScore, 10, 50)}`;

        // Extract Opportunities
        opportunitiesList.innerHTML = '';
        const opps = Object.values(audits).filter(audit => audit.details && audit.details.type === 'opportunity' && audit.numericValue > 0);
        
        // Sort by biggest savings
        opps.sort((a, b) => b.numericValue - a.numericValue);
        
        if (opps.length === 0) {
            opportunitiesList.innerHTML = '<li class="opportunity-item"><span class="opp-title">Aucune opportunité majeure détectée. Bon travail !</span></li>';
        } else {
            // Take top 4 opportunities
            opps.slice(0, 4).forEach(opp => {
                const savings = (opp.numericValue / 1000).toFixed(2);
                const li = document.createElement('li');
                li.className = 'opportunity-item';
                li.innerHTML = `
                    <span class="opp-title">${opp.title}</span>
                    <span class="opp-savings">-${savings}s</span>
                `;
                opportunitiesList.appendChild(li);
            });
        }
    }

    /**
     * Compute a theoretical APDEX score based on page load characteristics.
     * Target Response Time (T) is assumed to be 1.5s.
     */
    function calculateApdex(fcp, si) {
        // We simulate apdex based on typical response times.
        const T = 1.2; 
        const loadMetric = (fcp + si) / 2; // blending FCP and Speed Index to evaluate total visual readiness
        
        let score = 0;
        if (loadMetric <= T) {
            // Excellent
            score = 1.0 - (loadMetric / T) * 0.1; // 0.9 to 1.0 range
        } else if (loadMetric <= 4 * T) {
            // Tolerating
            // Linear scale from 0.85 down to 0.4
            const ratio = (loadMetric - T) / (3 * T);
            score = 0.85 - (ratio * 0.45);
        } else {
            // Frustrated
            score = Math.max(0.1, 0.4 - ((loadMetric - 4*T) * 0.05));
        }

        return Math.max(0, Math.min(1, score)); // strict bounds
    }

    function updateApdexUI(score) {
        // Animate count and circle
        const targetPercent = score * 100;
        apdexCircle.style.strokeDasharray = `${targetPercent}, 100`;

        let statusText = "";
        let statusColor = "";
        let statusDesc = "";

        if (score >= 0.85) {
            statusText = "Excellente Expérience";
            statusColor = "var(--status-excellent)";
            statusDesc = "Les utilisateurs navigueront de manière fluide et se sentiront satisfaits des temps de réponse.";
        } else if (score >= 0.70) {
            statusText = "Bonne Expérience";
            statusColor = "var(--status-good)";
            statusDesc = "La performance est bonne, mais quelques optimisations pourraient encore améliorer l'expérience globale.";
        } else if (score >= 0.50) {
            statusText = "Expérience Passable";
            statusColor = "var(--status-fair)";
            statusDesc = "Les visiteurs tolèrent la lenteur, mais le taux de rebond risque d'augmenter si des actions ne sont pas prises.";
        } else {
            statusText = "Expérience Médiocre";
            statusColor = "var(--status-poor)";
            statusDesc = "Le temps de chargement frustre fortement les utilisateurs. Une optimisation technique prioritaire est requise.";
        }

        apdexCircle.style.stroke = statusColor;
        apdexRatingText.textContent = statusText;
        apdexRatingText.style.color = statusColor;
        apdexRatingDesc.textContent = statusDesc;
        
        // Counter animation
        let currentScore = 0;
        const interval = setInterval(() => {
            currentScore += 0.02;
            if (currentScore >= score) {
                currentScore = score;
                clearInterval(interval);
            }
            apdexScoreLabel.textContent = currentScore.toFixed(2);
        }, 20);
    }

    // Helper thresholds based on Core Web Vitals targets
    function getMetricColorClass(value, goodThreshold, poorThreshold) {
        if (value <= goodThreshold) return 'text-excellent';
        if (value <= poorThreshold) return 'text-fair';
        return 'text-poor';
    }
});
