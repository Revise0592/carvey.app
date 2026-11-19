// Theme toggle
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('carvey-theme', theme); } catch (_) {}
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Mobile menu
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
function setMenu(open) {
  mobileMenu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
}
menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

// Latest release tag from GitHub, falling back to tags
async function loadRelease() {
  const link = document.getElementById('release');
  const tag = document.getElementById('release-tag');
  if (!link || !tag) return;
  try {
    const r = await fetch('https://api.github.com/repos/Revise0592/Carvey/releases/latest');
    if (r.ok) {
      const d = await r.json();
      if (d.tag_name) {
        tag.textContent = d.tag_name;
        if (d.html_url) link.href = d.html_url;
        return;
      }
    }
    const t = await fetch('https://api.github.com/repos/Revise0592/Carvey/tags');
    if (t.ok) {
      const tags = await t.json();
      if (tags.length) tag.textContent = tags[0].name;
    }
  } catch (_) {}
}
loadRelease();

// Highlight the nav link for the section in view
const navLinks = [...document.querySelectorAll('.nav-links a')];
if ('IntersectionObserver' in window && navLinks.length) {
  const byId = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('active', a === byId.get(e.target.id)));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

// Screen tour: segmented control swaps screenshot and caption
const segs = [...document.querySelectorAll('.seg')];
segs.forEach(btn => {
  btn.addEventListener('click', () => {
    const shot = btn.dataset.shot;
    segs.forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.shot, .caption').forEach(el => {
      el.classList.toggle('active', el.dataset.shot === shot);
    });
  });
});

// Install tabs and copy
const rawCode = {
  compose: `services:\n  carvey:\n    image: ghcr.io/revise0592/carvey:latest\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      TZ: Europe/London\n    restart: unless-stopped`,
  run: `docker run -d \\\n  --name carvey \\\n  -p 3000:3000 \\\n  -v ./data:/app/data \\\n  -e TZ=Europe/London \\\n  --restart unless-stopped \\\n  ghcr.io/revise0592/carvey:latest`,
};

const copyBtn = document.getElementById('copy-btn');
const copyLabel = copyBtn.querySelector('span');
let activeTab = 'compose';

document.querySelectorAll('.code-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.code-tab').forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', String(on));
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === 'tab-' + activeTab);
    });
    copyBtn.hidden = !rawCode[activeTab];
  });
});

copyBtn.addEventListener('click', async () => {
  const code = rawCode[activeTab];
  if (!code) return;
  try {
    await navigator.clipboard.writeText(code);
    copyBtn.classList.add('copied');
    copyLabel.textContent = 'Copied';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyLabel.textContent = 'Copy';
    }, 1800);
  } catch (_) {}
});
