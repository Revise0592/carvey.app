// Theme toggle
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('carvey-theme', theme); } catch (_) {}
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

// Nav border once scrolled
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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
        text.textContent = d.tag_name;
        if (d.html_url) badge.href = d.html_url;
        return;
      }
    }
    const t = await fetch('https://api.github.com/repos/Revise0592/Carvey/tags');
    if (t.ok) {
      const tags = await t.json();
      if (tags.length) text.textContent = tags[0].name;
    }
  } catch (_) {}
}
loadVersion();

// Install tabs + copy
const rawCode = {
  compose: `services:\n  carvey:\n    image: ghcr.io/revise0592/carvey:latest\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - TZ=Europe/London\n    restart: unless-stopped`,
  run: `docker run -d \\\n  --name carvey \\\n  -p 3000:3000 \\\n  -v ./data:/app/data \\\n  -e TZ=Europe/London \\\n  --restart unless-stopped \\\n  ghcr.io/revise0592/carvey:latest`,
};

const copyBtn = document.getElementById('copy-btn');
let activeTab = 'compose';

document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    activeTab = btn.dataset.tab;
    document.querySelectorAll('.tab').forEach(b => {
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
  const targets = document.querySelectorAll('.window, .strip-item, .section-head, .card, .feature, .install > *, .faq-list, .cta');
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
