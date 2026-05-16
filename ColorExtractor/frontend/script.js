document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('analyze-form');
    const urlInput = document.getElementById('url-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const loader = document.getElementById('loader');
    const errorMsg = document.getElementById('error-msg');
    
    const screenshotWrapper = document.getElementById('screenshot-wrapper');
    const screenshotPlaceholder = document.getElementById('screenshot-placeholder');
    const screenshotImg = document.getElementById('screenshot-img');
    
    const resultsPlaceholder = document.getElementById('results-placeholder');
    const resultsLayout = document.getElementById('results');
    
    const blockCustom = document.getElementById('block-custom');
    const gridCustom = document.getElementById('grid-custom');
    const blockVisual = document.getElementById('block-visual');
    const gridVisual = document.getElementById('grid-visual');
    const blockCode = document.getElementById('block-code');
    const gridCode = document.getElementById('grid-code');
    
    const countVisual = document.getElementById('count-visual');
    const countCode = document.getElementById('count-code');
    const paletteTitle = document.getElementById('palette-title');
    
    const toast = document.getElementById('toast');
    
    let currentData = null;
    let customColorsList = [];
    let isEditingColors = false;

    // Edit Colors Logic
    const editColorsBtn = document.getElementById('edit-colors-btn');
    editColorsBtn.addEventListener('click', () => {
        isEditingColors = !isEditingColors;
        if (isEditingColors) {
            editColorsBtn.classList.add('editing-active');
            editColorsBtn.innerHTML = '<i class="fas fa-check"></i> Done Editing';
            document.body.classList.add('delete-mode');
        } else {
            editColorsBtn.classList.remove('editing-active');
            editColorsBtn.innerHTML = '<i class="fas fa-pen"></i> Edit Colors';
            document.body.classList.remove('delete-mode');
        }
    });

    // Legal Modal Logic
    const legalBtn = document.getElementById('legal-btn');
    const legalModal = document.getElementById('legal-modal');
    if (legalBtn && legalModal) {
        legalBtn.addEventListener('click', () => {
            legalModal.classList.add('active');
        });
        legalModal.addEventListener('click', (e) => {
            if (e.target === legalModal) {
                legalModal.classList.remove('active');
            }
        });
    }

    // Dropdown Logic
    const dropdownTrigger = document.getElementById('dropdown-trigger');
    const downloadDropdown = document.getElementById('download-dropdown');
    
    dropdownTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => downloadDropdown.classList.add('hidden'));

    // Download functions
    function downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const objUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objUrl; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(objUrl);
    }
    
    document.getElementById('dl-json').addEventListener('click', () => {
        if (!currentData) return;
        const payload = { url: currentData.url, custom: customColorsList, visual: currentData.visualColors, code: currentData.codeColors };
        downloadTextFile(JSON.stringify(payload, null, 2), 'palette.json');
    });

    document.getElementById('dl-css').addEventListener('click', () => {
        if (!currentData) return;
        let css = ':root {\n';
        customColorsList.forEach((c,i) => css += `  --custom-${i+1}: ${c.hex};\n`);
        if (currentData.visualColors) currentData.visualColors.forEach((c,i) => css += `  --visual-${i+1}: ${c.hex};\n`);
        if (currentData.codeColors) currentData.codeColors.forEach((c,i) => css += `  --code-${i+1}: ${c};\n`);
        css += '}';
        downloadTextFile(css, 'palette.css');
    });

    document.getElementById('dl-scss').addEventListener('click', () => {
        if (!currentData) return;
        let scss = '';
        customColorsList.forEach((c,i) => scss += `$custom-${i+1}: ${c.hex};\n`);
        if (currentData.visualColors) currentData.visualColors.forEach((c,i) => scss += `$visual-${i+1}: ${c.hex};\n`);
        if (currentData.codeColors) currentData.codeColors.forEach((c,i) => scss += `$code-${i+1}: ${c};\n`);
        downloadTextFile(scss, 'palette.scss');
    });

    // Wave SVG mimicking the exact screenshot
    const waveSVG = `
        <svg class="wave-divider" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" fill-opacity="1" d="M0,192L60,181.3C120,171,240,149,360,165.3C480,181,600,235,720,240C840,245,960,203,1080,186.7C1200,171,1320,181,1380,186.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
        </svg>
    `;

    // Initialize Canvas for Eyedropper
    const imgCanvas = document.createElement('canvas');
    const imgCtx = imgCanvas.getContext('2d', { willReadFrequently: true });
    
    screenshotImg.addEventListener('load', () => {
        imgCanvas.width = screenshotImg.naturalWidth;
        imgCanvas.height = screenshotImg.naturalHeight;
        if (imgCanvas.width && imgCanvas.height) {
            imgCtx.drawImage(screenshotImg, 0, 0);
        }
    });

    const eyedropperTooltip = document.getElementById('eyedropper-tooltip');
    let isHoveringImg = false;
    let currentEyedropColor = null;

    screenshotImg.addEventListener('mouseenter', () => {
        if (!screenshotImg.src || screenshotImg.style.opacity === '0.5') return;
        isHoveringImg = true;
        eyedropperTooltip.classList.remove('hidden');
    });

    screenshotImg.addEventListener('mouseleave', () => {
        isHoveringImg = false;
        eyedropperTooltip.classList.add('hidden');
    });

    screenshotImg.addEventListener('mousemove', (e) => {
        if (!isHoveringImg || !imgCanvas.width) return;
        
        const rect = screenshotImg.getBoundingClientRect();
        const scaleX = imgCanvas.width / rect.width;
        const scaleY = imgCanvas.height / rect.height;
        
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        
        if (x < 0 || x >= imgCanvas.width || y < 0 || y >= imgCanvas.height) return;

        const pixel = imgCtx.getImageData(x, y, 1, 1).data;
        const r = pixel[0], g = pixel[1], b = pixel[2], a = pixel[3];
        if (a === 0) return;

        const rgbStr = `rgb(${r}, ${g}, ${b})`;
        const hex = "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
        
        currentEyedropColor = { rgbStr, hex };

        // Position tooltip
        eyedropperTooltip.style.left = (e.clientX + 15) + 'px';
        eyedropperTooltip.style.top = (e.clientY + 15) + 'px';

        document.getElementById('eyedropper-swatch').style.backgroundColor = rgbStr;
        document.getElementById('eyedropper-rgb').textContent = rgbStr;
    });

    // Handle Eyedropper click
    screenshotImg.addEventListener('click', () => {
        if (!currentEyedropColor) return;
        blockCustom.classList.remove('hidden');
        
        customColorsList.unshift({ hex: currentEyedropColor.hex, rgb: currentEyedropColor.rgbStr });
        const newCard = createColorCard(currentEyedropColor.hex, currentEyedropColor.rgbStr, 'custom');
        newCard.dataset.hex = currentEyedropColor.hex;
        newCard.dataset.category = 'custom';
        gridCustom.insertBefore(newCard, gridCustom.firstChild);
        
        showToast(`Color sampled!`);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let url = urlInput.value.trim();
        if (!url) return;

        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        errorMsg.textContent = '';
        errorMsg.classList.add('hidden');
        resultsPlaceholder.classList.add('hidden');
        resultsLayout.classList.add('hidden');
        blockCustom.classList.add('hidden');
        gridCustom.innerHTML = '';
        customColorsList = [];
        if (isEditingColors) editColorsBtn.click();
        
        screenshotPlaceholder.classList.add('hidden');
        screenshotWrapper.classList.remove('hidden');
        loader.classList.remove('hidden');
        analyzeBtn.disabled = true;
        
        screenshotImg.style.opacity = '0.5';

        try {
            const response = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, maxVisualCount: 15 })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur inconnue lors de l\'analyse.');
            }

            currentData = data;
            renderResults(data);

        } catch (err) {
            let msg = err.message;
            if (msg.includes("Failed to fetch")) {
                msg = "Échec de l'extraction ! Assurez-vous que Node.js (port 3000) tourne via 'node server.js'.";
            }
            errorMsg.textContent = msg;
            errorMsg.classList.remove('hidden');
            loader.classList.add('hidden');
            screenshotPlaceholder.classList.remove('hidden');
            screenshotWrapper.classList.add('hidden');
        } finally {
            loader.classList.add('hidden');
            screenshotImg.style.opacity = '1';
            analyzeBtn.disabled = false;
        }
    });

    function renderResults(data) {
        screenshotImg.src = data.screenshot;
        
        paletteTitle.textContent = (new URL(data.url).hostname) + " Palette";

        blockVisual.classList.remove('hidden');
        blockCode.classList.remove('hidden');

        if (data.visualColors) {
            gridVisual.innerHTML = '';
            countVisual.textContent = `Colors: ${data.visualColors.length}`;
            data.visualColors.forEach(color => {
                const card = createColorCard(color.hex, color.rgb, color.name || 'visual');
                card.dataset.hex = color.hex;
                card.dataset.category = 'visual';
                gridVisual.appendChild(card);
            });
        }

        if (data.codeColors) {
            gridCode.innerHTML = '';
            countCode.textContent = `Colors: ${data.codeColors.length}`;
            const fakeNames = ["whitesmoke", "black", "cornflowerblue", "orchid", "darkgray", "plum"];
            data.codeColors.forEach((colorStr, idx) => {
                const isHex = colorStr.startsWith('#');
                const card = createColorCard(colorStr, colorStr, isHex ? fakeNames[idx % fakeNames.length] : 'rgb code');
                card.dataset.hex = colorStr;
                card.dataset.category = 'code';
                gridCode.appendChild(card);
            });
        }

        resultsLayout.classList.remove('hidden');
    }

    function hexToRgbStr(hex) {
        let h = hex.replace('#', '');
        if(h.length === 3) h = [...h].map(x => x + x).join('');
        const num = parseInt(h, 16);
        return `rgb(${num >> 16}, ${(num >> 8) & 255}, ${num & 255})`;
    }

    function createColorCard(bgColor, rgbText, nameText) {
        const div = document.createElement('div');
        div.className = 'color-card';

        let displayRgb = rgbText;
        if (bgColor.startsWith('#') && rgbText === bgColor) {
            displayRgb = hexToRgbStr(bgColor);
        }

        div.innerHTML = `
            <div class="color-swatch-wrap">
                <div class="swatch-fill" style="background-color: ${bgColor}"></div>
                ${waveSVG}
            </div>
            <div class="color-info">
                <div class="color-name">${nameText}</div>
                <div class="color-rgb">${displayRgb}</div>
                <button class="copy-btn">
                    <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    Copy
                </button>
            </div>
        `;

        div.addEventListener('click', (e) => {
            if (isEditingColors) {
                e.stopPropagation();
                div.remove();
                
                const cat = div.dataset.category;
                const hx = div.dataset.hex;
                
                if (cat === 'custom') {
                    customColorsList = customColorsList.filter(c => c.hex !== hx);
                    if (customColorsList.length === 0) blockCustom.classList.add('hidden');
                } else if (cat === 'visual' && currentData) {
                    currentData.visualColors = currentData.visualColors.filter(c => c.hex !== hx);
                    countVisual.textContent = `Colors: ${currentData.visualColors.length}`;
                } else if (cat === 'code' && currentData) {
                    currentData.codeColors = currentData.codeColors.filter(c => c !== hx);
                    countCode.textContent = `Colors: ${currentData.codeColors.length}`;
                }
                showToast("Couleur supprimée.");
                return;
            }
        });

        const btn = div.querySelector('.copy-btn');
        btn.addEventListener('click', (e) => {
            if (isEditingColors) return;
            e.stopPropagation();
            navigator.clipboard.writeText(displayRgb).then(() => {
                showToast("Copied to clipboard!");
                const oldHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i> Copied';
                setTimeout(() => { btn.innerHTML = oldHtml; }, 2000);
            });
        });

        return div;
    }

    let toastTimeout;
    function showToast(msg) {
        toast.classList.remove('hidden');
        void toast.offsetWidth;
        if(msg) document.getElementById('toast').innerHTML = ` <i class="fas fa-check-circle"></i> ${msg}`;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
    }
});
