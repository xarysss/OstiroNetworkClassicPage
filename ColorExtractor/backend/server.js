const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const Vibrant = require('node-vibrant');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
// Servir les fichiers statiques du dossier frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Route racine pour confirmer que le serveur fonctionne
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Utils: Extraire les couleurs via Regex
function extractColorsFromText(text) {
    const colors = [];

    // Hexa
    const hexRegex = /#([a-f0-9]{3}|[a-f0-9]{6})\b/gi;
    let match;
    while ((match = hexRegex.exec(text)) !== null) {
        colors.push(match[0].toLowerCase());
    }

    // RGB / RGBA
    const rgbRegex = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)/gi;
    while ((match = rgbRegex.exec(text)) !== null) {
        colors.push(match[0].toLowerCase().replace(/\s+/g, ''));
    }

    // HSL / HSLA
    const hslRegex = /hsla?\(\s*\d+\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?\s*(?:,\s*[\d.]+\s*)?\)/gi;
    while ((match = hslRegex.exec(text)) !== null) {
        colors.push(match[0].toLowerCase().replace(/\s+/g, ''));
    }

    // Compter les occurrences
    const colorCounts = {};
    colors.forEach(c => {
        colorCounts[c] = (colorCounts[c] || 0) + 1;
    });

    // Trier par fréquence descendante et supprimer les doublons
    const uniqueSortedColors = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);

    return uniqueSortedColors;
}

app.post('/api/analyze', async (req, res) => {
    let { url, maxVisualCount = 10 } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'L\'URL est requise.' });
    }

    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }

    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // User Agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

        // Naviguer
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

        // Screenshot base64 (jpeg pour optimiser Vibrant)
        const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });
        const screenshotBase64 = `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;

        // Récupération du HTML + extraction CSS Inline & Linked
        const pageContent = await page.evaluate(() => {
            let cssText = '';
            // Stylesheets
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        cssText += rule.cssText + ' ';
                    }
                } catch (e) {
                    // Ignorer les erreurs CORS pour les feuilles de style externes
                }
            }
            // HTML
            const htmlText = document.documentElement.outerHTML;
            return { htmlText, cssText };
        });

        // 1. Extraction via Vibrant (Visuelle)
        const palette = await Vibrant.from(screenshotBuffer).getPalette();
        const visualColors = [];
        
        // Vibrant retourne 6 swatches majeurs. On les ajoute.
        for (const swatch in palette) {
            if (palette[swatch]) {
                visualColors.push({
                    name: swatch,
                    hex: palette[swatch].hex,
                    rgb: `rgb(${Math.round(palette[swatch].r)}, ${Math.round(palette[swatch].g)}, ${Math.round(palette[swatch].b)})`,
                    population: palette[swatch].population
                });
            }
        }
        
        visualColors.sort((a, b) => b.population - a.population);

        // 2. Extraction via Regex (Code)
        const fullText = pageContent.htmlText + ' ' + pageContent.cssText;
        const codeColors = extractColorsFromText(fullText).slice(0, 50); // Limiter à top 50

        await browser.close();

        return res.json({
            url,
            screenshot: screenshotBase64,
            visualColors: visualColors.slice(0, maxVisualCount),
            codeColors
        });

    } catch (error) {
        if (browser) await browser.close();
        console.error("Erreur Puppeteer:", error);
        return res.status(500).json({ error: 'Erreur lors de l\'analyse du site. Vérifiez l\'URL ou réessayez.' });
    }
});

app.get('/api/screenshot', async (req, res) => {
    let { url } = req.query;
    if (!url) return res.status(400).send('URL missing');
    if (!url.startsWith('http')) url = 'https://' + url;

    try {
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
        const buffer = await page.screenshot({ type: 'jpeg', quality: 90 });
        await browser.close();

        res.set('Content-Type', 'image/jpeg');
        res.send(buffer);
    } catch (error) {
        res.status(500).send('Screenshot error');
    }
});

app.listen(PORT, () => {
    console.log(`Serveur Backend ColorExtractor démarré sur http://localhost:${PORT}`);
});
