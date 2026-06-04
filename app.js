// Encapsulé dans une IIFE : évite toute collision de variables globales
// (ex. Lenis déclare un `var y` global non encapsulé).
(() => {
// ===== Année =====
const y = new Date().getFullYear();
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = y;
document.querySelectorAll('.year2').forEach(el => el.textContent = y);

// ===== Utilitaires =====
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const map = (v, a, b, c, d) => c + ((v - a) * (d - c)) / (b - a);
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => t * t * (3 - 2 * t);

// ===== Son doux (Web Audio, déclenché par geste utilisateur) =====
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}
// tonalité courte et douce (sinus + enveloppe lissée)
function blip(freq = 523, dur = 0.22, gain = 0.035) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + dur + 0.03);
}
// gamme pentatonique douce
const PENTA = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77, 1046.50];

// swoosh doux (bruit filtré + balayage de fréquence)
function swoosh(dir = 1, dur = 0.5, gain = 0.06) {
  if (!audioCtx) return;
  const t = audioCtx.currentTime;
  const buffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = audioCtx.createBufferSource(); src.buffer = buffer;
  const filt = audioCtx.createBiquadFilter(); filt.type = 'bandpass'; filt.Q.value = 0.7;
  const f0 = dir > 0 ? 420 : 1500, f1 = dir > 0 ? 1700 : 320;
  filt.frequency.setValueAtTime(f0, t);
  filt.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.07);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filt); filt.connect(g); g.connect(audioCtx.destination);
  src.start(t); src.stop(t + dur);
}

// état d'entrée + sons des mots du hero (une fois chacun)
let entered = false;
const heroSoundPlayed = new Set();

// ===== HERO : animation pilotée par le scroll =====
const heroTrack    = document.querySelector('.hero-track');
const heroClip     = document.getElementById('heroClip');
const heroBg       = document.getElementById('heroBg');
const introWords   = document.querySelectorAll('.hero-intro span');
const titleWords   = document.querySelectorAll('.hero-title span');
const heroIntroEl  = document.querySelector('.hero-intro');
const heroTitleEl  = document.querySelector('.hero-title');
const heroBaseline = document.getElementById('heroBaseline');
const pillInline   = document.querySelector('.pill-inline');
const heroBgFade   = document.querySelector('.hero-bg-fade');

let heroProgress = 0;   // avancement de l'animation hero (0 -> 1)
let heroAutoProgress = 0;
let heroAutoStarted = false;

function updateHero() {
  const rect = heroTrack.getBoundingClientRect();
  const total = heroTrack.offsetHeight - window.innerHeight;
  const scrollProgress = clamp(-rect.top / total, 0, 1);
  const scrollFromAuto = heroAutoStarted
    ? clamp(heroAutoProgress + scrollProgress * 1.08, 0, 1)
    : scrollProgress;
  const progress = Math.max(scrollFromAuto, heroAutoProgress);
  heroProgress = progress;

  introWords.forEach((w, i) => {
    const start = 0.04 + i * 0.06;
    const o = clamp(map(progress, start, start + 0.05, 0, 1), 0, 1);
    w.style.opacity = o;
    if (entered && o > 0.6 && !heroSoundPlayed.has('i' + i)) {
      heroSoundPlayed.add('i' + i); blip(PENTA[i % PENTA.length], 0.24, 0.03);
    }
  });
  titleWords.forEach((w, i) => {
    const start = 0.32 + i * 0.05;
    const o = clamp(map(progress, start, start + 0.05, 0, 1), 0, 1);
    w.style.opacity = o;
    if (entered && o > 0.6 && !heroSoundPlayed.has('t' + i)) {
      heroSoundPlayed.add('t' + i); blip(PENTA[(i + 2) % PENTA.length] / 2, 0.3, 0.035);
    }
  });

  // l'image rétrécit en une petite carte arrondie
  const rawShrink = clamp(map(progress, 0.56, 0.985, 0, 1), 0, 1);
  const p = smoothstep(rawShrink);
  const pillW = pillInline ? pillInline.offsetWidth || 96 : 96;
  const pillH = pillInline ? pillInline.offsetHeight || 56 : 56;
  const layoutW = document.documentElement.clientWidth || window.innerWidth;
  const targetScaleX = pillW / layoutW;
  const targetScaleY = pillH / window.innerHeight;
  const scaleX = lerp(1, targetScaleX, p);
  const scaleY = lerp(1, targetScaleY, p);
  const pillRect = pillInline ? pillInline.getBoundingClientRect() : null;
  const targetX = pillRect ? (pillRect.left + pillRect.width / 2) - (layoutW / 2) : 0;
  const targetY = pillRect ? (pillRect.top + pillRect.height / 2) - (window.innerHeight / 2) : 0;
  const visualRadius = pillInline ? parseFloat(getComputedStyle(pillInline).borderRadius) || 14 : 14;
  const radius = p ? visualRadius / Math.max(Math.min(scaleX, scaleY), 0.001) : 0;
  heroClip.style.transform = `translate(${targetX * p}px, ${targetY * p}px) scale(${scaleX}, ${scaleY})`;
  heroClip.style.borderRadius = radius + 'px';
  heroBg.style.transform = `scale(${1 + p * 0.08})`;
  // on retire le voile blanc du bas pendant le rétrécissement : la carte reste bleu nuit
  if (heroBgFade) heroBgFade.style.opacity = 1 - p;

  // ...puis se fond, juste avant de "devenir" la vignette dans le texte
  heroClip.style.opacity = 1 - clamp(map(progress, 0.985, 1, 0, 1), 0, 1);

  // les textes clairs s'effacent quand l'image rétrécit
  const fade = 1 - clamp(map(progress, 0.60, 0.86, 0, 1), 0, 1);
  heroIntroEl.style.opacity = fade;
  heroTitleEl.style.opacity = fade;
  heroTitleEl.style.transform = `translateX(-50%) scale(${1 + Math.sin(p * Math.PI) * 0.035})`;

  // la phrase apparaît au centre, là où l'image a rétréci -> passage de relais
  const reveal = clamp(map(progress, 0.72, 1, 0, 1), 0, 1);
  heroBaseline.style.opacity = reveal;
  heroBaseline.style.transform = 'translate(-50%, -50%)';
  const baselineText = heroBaseline.querySelector('p');
  if (baselineText) baselineText.style.transform = 'none';
  // la vignette grandit dans la phrase, juste après la disparition de l'image
  if (pillInline) pillInline.style.opacity = clamp(map(progress, 0.97, 1, 0, 1), 0, 1);
}

function startHeroAutoplay() {
  if (heroAutoStarted) return;
  heroAutoStarted = true;
  const from = heroAutoProgress;
  const target = 0.48;
  const duration = 2600;
  const start = performance.now();

  function step(now) {
    const t = clamp((now - start) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    heroAutoProgress = from + (target - from) * eased;
    requestTick();
    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// ===== Reveal au scroll =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ===== Points de progression =====
const dotsWrap = document.getElementById('scrollDots');
const dots = dotsWrap.querySelectorAll('div');
const dotSections = [
  document.getElementById('services'),
  document.getElementById('portfolio'),
  document.getElementById('faq')
];
function updateDots() {
  const center = window.scrollY + window.innerHeight / 2;
  let active = -1;
  dotSections.forEach((s, i) => {
    if (!s) return;
    if (center >= s.offsetTop && center < s.offsetTop + s.offsetHeight) active = i;
  });
  dots.forEach((d, i) => d.classList.toggle('active', i === active));
  dotsWrap.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
}

// ===== Boucle d'animation (hero + points) =====
let ticking = false;
function onFrame() { updateHero(); updateDots(); syncDock(); ticking = false; }
function requestTick() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
window.addEventListener('resize', requestTick, { passive: true });

// ===== Lenis : scroll fluide et doux (avec repli natif) =====
let lenis = null;
if (typeof Lenis !== 'undefined') {
  lenis = new Lenis({
    duration: 1.25,                                       // plus long = plus doux
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', requestTick);
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
} else {
  window.addEventListener('scroll', requestTick, { passive: true });
}

// ===== Dock flottant : entrée en cascade (centre -> paire interne -> paire externe) =====
// Visible sur la page principale, masqué dès qu'une page annexe (détail, réseaux, legal) s'ouvre.
const dock = document.getElementById('dock');
let dockTimers = [];
let dockShown = false;      // état réel d'affichage (évite de relancer la cascade)
let sheetActive = false;    // une fenêtre annexe / le formulaire est ouvert

function showDock() {
  if (dockShown) return;
  dockShown = true;
  dockTimers.forEach(clearTimeout); dockTimers = [];
  dock.classList.add('show');
  dock.setAttribute('aria-hidden', 'false');
  dock.querySelectorAll('[tabindex]').forEach(el => el.setAttribute('tabindex', '0'));
  // 1) le bouton du milieu arrive en premier
  dock.querySelectorAll('.dock-center').forEach(el => el.classList.add('in'));
  // 2) la paire intérieure
  dockTimers.push(setTimeout(() => dock.querySelectorAll('.dock-inner').forEach(el => el.classList.add('in')), 130));
  // 3) la paire extérieure
  dockTimers.push(setTimeout(() => dock.querySelectorAll('.dock-outer').forEach(el => el.classList.add('in')), 260));
}
function hideDock() {
  if (!dockShown) return;
  dockShown = false;
  dockTimers.forEach(clearTimeout); dockTimers = [];
  dock.classList.remove('show');
  dock.setAttribute('aria-hidden', 'true');
  dock.querySelectorAll('.in').forEach(el => el.classList.remove('in'));
  dock.querySelectorAll('[tabindex]').forEach(el => el.setAttribute('tabindex', '-1'));
}

// le dock n'apparaît QUE lorsque l'animation hero est terminée (image rangée dans le texte),
// et jamais pendant l'intro ou quand une fenêtre annexe est ouverte.
function syncDock() {
  const heroDone = heroProgress >= 0.985;
  if (entered && !sheetActive && heroDone) showDock();
  else hideDock();
}

// ===== Bottom sheets =====
const GLASS_LAYERS = ['socialLayer', 'legalLayer'];
function openSheet(id) {
  const layer = document.getElementById(id);
  layer.classList.add('open');
  // les fenêtres liquid glass ne scalent/grisent pas le fond
  if (!GLASS_LAYERS.includes(id)) document.body.classList.add('sheet-open');
  if (lenis) lenis.stop();                 // fige le fond pendant l'ouverture
  sheetActive = true; syncDock();          // le dock s'efface sur les pages annexes
  initAudio(); swoosh(1);                  // swoosh à l'ouverture
}
function closeSheets() {
  const wasOpen = document.querySelector('.sheet-layer.open');
  document.querySelectorAll('.sheet-layer.open').forEach(l => l.classList.remove('open'));
  document.body.classList.remove('sheet-open');
  if (lenis) lenis.start();
  sheetActive = false; syncDock();         // réapparaît si l'animation hero est terminée
  if (wasOpen) swoosh(-1, 0.42, 0.045);   // swoosh inverse, plus doux, à la fermeture
}
const openSocialBtn = document.getElementById('openSocial');
if (openSocialBtn) openSocialBtn.addEventListener('click', () => openSheet('socialLayer'));
const openCalendarBtn = document.getElementById('openCalendar');
if (openCalendarBtn) openCalendarBtn.addEventListener('click', () => {
  initAudio(); swoosh(1);
  window.open('https://cal.com/ostiro-network/30min', '_blank', 'noopener,noreferrer');
});
const openTelegramBtn = document.getElementById('openTelegram');
if (openTelegramBtn) openTelegramBtn.addEventListener('click', () => {
  initAudio(); swoosh(1);
  window.open('https://t.me/OstiroNetworkSupportBot', '_blank', 'noopener,noreferrer');
});
const openLegalBtn = document.getElementById('openLegal');
if (openLegalBtn) openLegalBtn.addEventListener('click', () => openSheet('legalLayer'));
document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openSheet(b.dataset.open)));
let suppressSheetCloseClickUntil = 0;
document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => {
  if (Date.now() < suppressSheetCloseClickUntil) return;
  closeSheets();
}));

// ===== Formulaire de contact : se déploie depuis "Commencer" =====
const contactLayer = document.getElementById('contactLayer');
const openContactBtn = document.getElementById('openContact');
const contactForm = document.getElementById('contactForm');
function openContact() {
  if (!contactLayer) return;
  dock.classList.add('form-open');          // les ronds + Commencer disparaissent
  contactLayer.classList.add('open');
  contactLayer.setAttribute('aria-hidden', 'false');
  initAudio(); swoosh(1);                    // même swoosh à l'ouverture
  if (lenis) lenis.stop();
  const first = contactForm && contactForm.querySelector('input');
  if (first) setTimeout(() => first.focus(), 420);
}
function closeContact() {
  if (!contactLayer || !contactLayer.classList.contains('open')) return;
  contactLayer.classList.remove('open');
  contactLayer.setAttribute('aria-hidden', 'true');
  dock.classList.remove('form-open');       // le dock revient
  if (lenis) lenis.start();
  swoosh(-1, 0.42, 0.045);
}
if (openContactBtn) openContactBtn.addEventListener('click', openContact);
document.querySelectorAll('[data-contact-close]').forEach(b => b.addEventListener('click', closeContact));
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (!f.checkValidity()) {
      f.reportValidity();
      return;
    }
    const clean = (value, max = 500) => String(value || '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
    const sujet = encodeURIComponent('Nouveau projet — ' + (clean(f.nom.value, 80) || 'Ostiro Network'));
    const corps = encodeURIComponent(
      'Nom : ' + clean(f.nom.value, 80) +
      '\nEmail : ' + clean(f.email.value, 120) +
      '\nTéléphone : ' + clean(f.tel.value, 32) +
      '\nEntreprise : ' + clean(f.entreprise.value, 100) +
      '\n\nProjet :\n' + clean(f.projet.value, 1200)
    );
    window.location.href = 'mailto:ostiro.network@gmail.com?subject=' + sujet + '&body=' + corps;
    f.reset();
    closeContact();
  });
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheets(); closeContact(); } });

// Barre du haut draggable : souris + tactile, avec fermeture au tirage vers le bas.
document.querySelectorAll('.sheet').forEach(sheet => {
  const handle = sheet.querySelector('.sheet-handle');
  if (!handle) return;

  let dragging = false, startY = 0, currentY = 0, lastY = 0, lastT = 0, velocity = 0, lastPointerDown = 0;

  function setSheetOffset(y) {
    const resisted = y < 0 ? y * 0.18 : y;
    sheet.style.transform = `translateX(-50%) translateY(${resisted}px)`;
  }

  function beginDrag(y) {
    if (dragging) return;
    dragging = true;
    startY = currentY = lastY = y;
    lastT = performance.now();
    velocity = 0;
    sheet.classList.add('dragging');
  }

  function moveDrag(y, e) {
    if (!dragging) return;
    if (e && e.cancelable) e.preventDefault();
    const now = performance.now();
    currentY = y;
    const dt = Math.max(1, now - lastT);
    velocity = (currentY - lastY) / dt;
    lastY = currentY;
    lastT = now;
    setSheetOffset(currentY - startY);
  }

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    sheet.classList.remove('dragging');
    if (e && e.pointerId != null && handle.hasPointerCapture && handle.hasPointerCapture(e.pointerId)) {
      handle.releasePointerCapture(e.pointerId);
    }

    const delta = currentY - startY;
    if (Math.abs(delta) > 4) suppressSheetCloseClickUntil = Date.now() + 450;
    if (delta > 120 || velocity > 0.65) {
      sheet.style.transform = '';
      closeSheets();
    } else {
      sheet.style.transform = '';
    }
  }

  handle.addEventListener('pointerdown', e => {
    if (e.button !== undefined && e.button !== 0) return;
    lastPointerDown = Date.now();
    beginDrag(e.clientY);
    if (handle.setPointerCapture) {
      try { handle.setPointerCapture(e.pointerId); } catch (err) {}
    }
  });
  handle.addEventListener('pointermove', e => moveDrag(e.clientY, e));
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  handle.addEventListener('mousedown', e => {
    if (Date.now() - lastPointerDown < 500 || e.button !== 0) return;
    beginDrag(e.clientY);
  });
  document.addEventListener('mousemove', e => moveDrag(e.clientY, e));
  document.addEventListener('mouseup', endDrag);

  handle.addEventListener('touchstart', e => {
    if (Date.now() - lastPointerDown < 500 || !e.touches[0]) return;
    beginDrag(e.touches[0].clientY);
  }, { passive: true });
  document.addEventListener('touchmove', e => {
    if (!e.touches[0]) return;
    moveDrag(e.touches[0].clientY, e);
  }, { passive: false });
  document.addEventListener('touchend', endDrag);
  document.addEventListener('touchcancel', endDrag);
});

// ===== Écran d'entrée : "Entrer" -> nuée de mots (avec son) -> site =====
const intro = document.getElementById('intro');
const introEnter = document.getElementById('introEnter');
const introWordEls = intro ? [...intro.querySelectorAll('.intro-words span')] : [];

// scroll verrouillé tant qu'on n'est pas entré
if (lenis) lenis.stop();

function enterSite() {
  if (entered || !intro) return;
  entered = true;
  initAudio();
  intro.classList.add('entering');

  // les mots apparaissent un par un, chacun avec un son doux
  const step = 78;
  introWordEls.forEach((w, i) => {
    setTimeout(() => {
      w.classList.add('in');
      blip(PENTA[i % PENTA.length], 0.2, i === introWordEls.length - 1 ? 0.05 : 0.032);
    }, 160 + i * step);
  });

  // puis on bascule vers le site
  const revealAt = 160 + introWordEls.length * step + 520;
  setTimeout(() => {
    intro.classList.add('exiting');
    blip(392, 0.7, 0.045);                 // léger accord de transition
    intro.classList.add('done');
    if (lenis) { lenis.start(); lenis.scrollTo(0, { immediate: true }); }
    // le dock n'apparaît pas tout de suite : il attend la fin de l'animation hero (cf. syncDock)
    setTimeout(() => { intro.style.display = 'none'; startHeroAutoplay(); onFrame(); }, 850);
  }, revealAt);
}

if (introEnter) {
  introEnter.addEventListener('click', enterSite);
} else {
  // pas d'intro -> le site démarre directement
  entered = true;
  if (lenis) lenis.start();
  setTimeout(() => { startHeroAutoplay(); onFrame(); }, 350);
}
})();
