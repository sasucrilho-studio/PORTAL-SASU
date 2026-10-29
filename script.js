
// ------------------------------------------------------------
// ALTERNÂNCIA DE TEMA (escuro padrão / claro branco e laranja)
// A preferência fica salva neste navegador e vale para as duas páginas.
// ------------------------------------------------------------
const themeToggle = document.getElementById('theme-toggle');
const themeKey = 'sasucrilhos-site-theme';

function applyTheme(theme) {
  const light = theme === 'light';
  document.body.classList.toggle('light-mode', light);
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Ativar modo escuro' : 'Ativar modo claro');
    const icon = themeToggle.querySelector('.theme-icon');
    const label = themeToggle.querySelector('.theme-label');
    if (icon) icon.textContent = light ? '☾' : '☀';
    if (label) label.textContent = light ? 'Modo escuro' : 'Modo claro';
  }
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.setAttribute('content', light ? '#fffaf4' : '#0b0908');
}

let savedTheme = 'dark';
try { savedTheme = localStorage.getItem(themeKey) || 'dark'; } catch {}
applyTheme(savedTheme);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
    applyTheme(nextTheme);
    try { localStorage.setItem(themeKey, nextTheme); } catch {}
  });
}

const year = document.getElementById('year');
const toast = document.getElementById('toast');
if (year) year.textContent = new Date().getFullYear();

// ------------------------------------------------------------
// SONS PERSONALIZÁVEIS DOS BOTÕES
// ------------------------------------------------------------
// Troque estes arquivos para personalizar o som do site.
// Também é possível usar data-hover-sound em um botão para dar
// a ele um som próprio.
const SITE_SOUNDS = {
  hover: 'assets/sounds/hover.wav',
  click: 'assets/sounds/click.wav'
};

let audioUnlocked = false;
const audioCache = new Map();

function getSound(src) {
  if (!audioCache.has(src)) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.set(src, audio);
  }
  return audioCache.get(src);
}

function playSound(src, volume = 0.16) {
  if (!audioUnlocked) return;
  try {
    const original = getSound(src);
    const sound = original.cloneNode();
    sound.volume = volume;
    sound.play().catch(() => {});
  } catch {}
}

document.addEventListener('pointerdown', () => {
  audioUnlocked = true;
}, { once: true, passive: true });

document.querySelectorAll('.sound-button').forEach((button) => {
  button.addEventListener('pointerenter', () => {
    const src = button.dataset.hoverSound || SITE_SOUNDS.hover;
    playSound(src, 0.12);
  });
  button.addEventListener('click', () => {
    audioUnlocked = true;
    playSound(SITE_SOUNDS.click, 0.15);
  });
});

// ------------------------------------------------------------
// VÍDEO FIXO DO YOUTUBE
// ------------------------------------------------------------
// O vídeo da seção "MAIS ASSISTIDO NO YOUTUBE" é fixo, sem API,
// sem chave e sem dependência do YouTube Data API.

// ------------------------------------------------------------
// ANIMAÇÕES DE ENTRADA
// ------------------------------------------------------------
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add('visible'));
}

// ------------------------------------------------------------
// PARTÍCULAS DE FUNDO
// ------------------------------------------------------------
const canvas = document.getElementById('particles');
const ctx = canvas ? canvas.getContext('2d') : null;
let particles = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const amount = Math.min(72, Math.max(28, Math.floor(width / 18)));
  particles = Array.from({ length: amount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + .35,
    vx: (Math.random() - .5) * .18,
    vy: (Math.random() - .5) * .18,
    a: Math.random() * .35 + .08
  }));
}

function drawParticles() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    const lightTheme = document.body.classList.contains('light-mode');
    ctx.fillStyle = lightTheme ? `rgba(232, 117, 36, ${Math.min(.62, p.a + .12)})` : `rgba(227, 173, 104, ${p.a})`;
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 115) {
        const lightTheme = document.body.classList.contains('light-mode');
        const alpha = (1 - distance / 115) * (lightTheme ? .19 : .055);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = lightTheme ? `rgba(232, 117, 36, ${alpha})` : `rgba(210, 154, 88, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);
