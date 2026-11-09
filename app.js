// Theme toggle
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('carvey-theme', theme); } catch (_) {}
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Live version badge: latest release tag from GitHub, falling back to tags
async function loadVersion() {
  const badge = document.getElementById('version-badge');
  const text = document.getElementById('version-text');
  if (!badge || !text) return;
  try {
    const r = await fetch('https://api.github.com/repos/Revise0592/Carvey/releases/latest');
    if (r.ok) {
      const d = await r.json();
      if (d.tag_name) {
        text.textContent = d.tag_name + ' is out';
        if (d.html_url) badge.href = d.html_url;
        return;
      }
    }
    const t = await fetch('https://api.github.com/repos/Revise0592/Carvey/tags');
    if (t.ok) {
      const tags = await t.json();
      if (tags.length) text.textContent = tags[0].name + ' is out';
    }
  } catch (_) {}
}
loadVersion();

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

// Screen tour: segmented control swaps screenshot + caption
document.querySelectorAll('.seg').forEach(btn => {
  btn.addEventListener('click', () => {
    const shot = btn.dataset.shot;
    document.querySelectorAll('.seg').forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
    document.querySelectorAll('.shot, .caption').forEach(el => {
      el.classList.toggle('active', el.dataset.shot === shot);
    });
  });
});

// Install tabs + copy
const rawCode = {
  compose: `services:\n  carvey:\n    image: ghcr.io/revise0592/carvey:latest\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - TZ=Europe/London\n    restart: unless-stopped`,
  run: `docker run -d \\\n  --name carvey \\\n  -p 3000:3000 \\\n  -v ./data:/app/data \\\n  -e TZ=Europe/London \\\n  --restart unless-stopped \\\n  ghcr.io/revise0592/carvey:latest`,
};

const copyBtn = document.getElementById('copy-btn');
let activeTab = 'compose';

document.querySelectorAll('.code-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.code-tab').forEach(b => {
      const on = b === btn;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
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
    const label = copyBtn.querySelector('span');
    copyBtn.classList.add('copied');
    label.textContent = 'Copied';
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      label.textContent = 'Copy';
    }, 1800);
  } catch (_) {}
});

// Gentle reveal on scroll
if ('IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.stat, .section-head, .segmented, .tour, .mobile-copy, .phones, .card, .feature, .install > *, .faq-list, .cta');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  targets.forEach(el => { el.classList.add('reveal'); io.observe(el); });
}
