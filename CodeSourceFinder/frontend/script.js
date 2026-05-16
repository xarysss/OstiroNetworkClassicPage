document.addEventListener('DOMContentLoaded', () => {
    // Constantes et Refs
    const form = document.getElementById('scan-form');
    const scanBtn = document.getElementById('scan-btn');
    const progSec = document.getElementById('progress-section');
    const stopBtn = document.getElementById('stop-btn');
    const logLines = document.getElementById('log-lines');
    const progFill = document.getElementById('prog-bar-fill');
    const progLabel = document.getElementById('prog-bar-label');
    const resNav = document.getElementById('results-nav');
    const resSec = document.getElementById('results-section');
    const sPages = document.getElementById('s-pages');
    const sErrors = document.getElementById('s-errors');
    const globalError = document.getElementById('global-error');
    const globalErrorMsg = document.getElementById('global-error-msg');
    
    let currentJobId = null;
    let pollInterval = null;
    let isStopped = false;
    let finalPages = [];

    // Connexion Backend FastAPI
    const API_BASE = "http://127.0.0.1:8000/api";

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('url-input').value.trim();
        const maxPages = document.getElementById('opt-max-pages').value;
        const maxDepth = document.getElementById('opt-max-depth').value;

        if (!url) return;
        globalError.classList.add('hidden');

        try {
            scanBtn.disabled = true;
            document.getElementById('scan-panel').classList.add('hidden');
            progSec.classList.remove('hidden');
            logLines.innerHTML = '<div>Initialisation du worker...</div>';
            
            const res = await fetch(`${API_BASE}/scan`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ url, max_pages: parseInt(maxPages), max_depth: parseInt(maxDepth) })
            });
            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.detail || data.error || "Erreur lors de la requête API.");
            }
            
            currentJobId = data.job_id;
            isStopped = false;
            startPolling();

        } catch (err) {
            let msg = err.message;
            if (msg.includes("Failed to fetch")) {
                msg = "Le backend CodeSourceFinder ne répond pas. (Assurez-vous d'avoir lancé `uvicorn main:app --host 127.0.0.1 --port 8000`)";
            }
            globalErrorMsg.textContent = msg;
            globalError.classList.remove('hidden');
            
            document.getElementById('scan-panel').classList.remove('hidden');
            progSec.classList.add('hidden');
            scanBtn.disabled = false;
        }
    });

    function startPolling() {
        pollInterval = setInterval(async () => {
            if (!currentJobId || isStopped) return;
            try {
                const res = await fetch(`${API_BASE}/status/${currentJobId}`);
                if (!res.ok) return;
                const data = await res.json();
                
                // Mettre à jour l'UI en direct
                const progressPct = data.total_queued === 0 ? 0 : Math.min(100, (data.progress / data.total_queued) * 100);
                progFill.style.width = progressPct + '%';
                progLabel.textContent = `${data.progress}/${data.total_queued}`;
                sPages.textContent = data.pages_count;
                sErrors.textContent = data.errors_count;

                if (data.log && data.log.length > 0) {
                    logLines.innerHTML = data.log.map(l => `<div>${l}</div>`).join('');
                    logLines.scrollTop = logLines.scrollHeight;
                }

                if (data.status === 'done' || data.status === 'error') {
                    clearInterval(pollInterval);
                    setTimeout(() => loadResults(), 1000); // laisser le temps de lire le dernier log
                }

            } catch (e) {
                console.error("Polling error", e);
            }
        }, 1500);
    }

    stopBtn.addEventListener('click', () => {
        isStopped = true;
        clearInterval(pollInterval);
        logLines.innerHTML += '<div style="color:var(--accent-pink);">Arrêt forcé par l\'utilisateur. Récupération des données partielles...</div>';
        loadResults();
    });

    document.getElementById('clear-log-btn').addEventListener('click', (e) => {
        e.preventDefault();
        logLines.innerHTML = '';
    });

    document.getElementById('new-scan-btn').addEventListener('click', () => {
        location.reload();
    });

    document.getElementById('dl-zip-btn').addEventListener('click', () => {
        if (!currentJobId) return;
        window.location.href = `${API_BASE}/download/${currentJobId}`;
    });

    async function loadResults() {
        progSec.classList.add('hidden');
        try {
            const res = await fetch(`${API_BASE}/result/${currentJobId}`);
            if (!res.ok) return;
            const data = await res.json();
            finalPages = data.pages;
            
            resNav.classList.remove('hidden');
            resSec.classList.remove('hidden');
            document.getElementById('results-badge').textContent = finalPages.length;

            renderSidebar();
        } catch (e) {
            console.error("Failed loading results", e);
        }
    }

    function renderSidebar() {
        const sidebar = document.getElementById('pages-sidebar');
        sidebar.innerHTML = '';
        
        if (finalPages.length === 0) {
            sidebar.innerHTML = '<div style="padding:15px; color:var(--muted);">Aucune donnée à afficher.</div>';
            return;
        }

        finalPages.forEach((p, i) => {
            const el = document.createElement('div');
            el.className = 'page-item';
            
            // Format d'une entrée sidebar sympa
            el.innerHTML = `
                <div style="font-weight:600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${p.url}</div>
                <div style="font-size:0.75rem; color:var(--muted); margin-top:4px;">${p.css_count} CSS • ${Math.round(p.html_size / 1024)} Ko</div>
            `;

            el.onclick = () => showPage(p, el);
            sidebar.appendChild(el);
        });
    }

    function showPage(page, el) {
        document.querySelectorAll('.page-item').forEach(e => e.classList.remove('active'));
        el.classList.add('active');

        document.getElementById('viewer-empty').classList.add('hidden');
        document.getElementById('viewer-content').classList.remove('hidden');
        
        const tabs = document.getElementById('viewer-tabs');
        const panels = document.getElementById('viewer-panels');
        
        // Tab system
        let tabsHtml = `<button class="tab-btn active" data-target="html-panel">index.html</button>`;
        let panelsHtml = `<div id="html-panel" class="tab-panel"><pre><code>${escapeHtml(page.html)}</code></pre></div>`;
        
        // Extraire les noms de CSS pour que l'interface soit propre
        page.css_files.forEach((css, i) => {
            let name = css.url.split('/').pop() || `style_${i}.css`;
            if (name.includes('?')) name = name.split('?')[0];
            if (css.type === 'inline') name = `inline_style_${i}.css`;

            tabsHtml += `<button class="tab-btn" data-target="css-panel-${i}">${name}</button>`;
            panelsHtml += `<div id="css-panel-${i}" class="tab-panel hidden"><pre><code>${escapeHtml(css.content)}</code></pre></div>`;
        });

        tabs.innerHTML = tabsHtml;
        panels.innerHTML = panelsHtml;

        // Wire event listeners on new tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.target).classList.remove('hidden');
            });
        });
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    // Modal Logic Liquid Glass Ostiro
    const legalBtn = document.getElementById('legal-btn');
    if (legalBtn) {
        legalBtn.onclick = () => document.getElementById('legal-modal').classList.add('active');
        document.getElementById('legal-modal').onclick = (e) => {
            if (e.target.id === 'legal-modal') e.target.classList.remove('active');
        };
    }
});
