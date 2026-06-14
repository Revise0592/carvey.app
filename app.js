// Live version badge — fetches latest release tag from GitHub API
async function loadVersion() {
  const el = document.getElementById('version-badge');
  if (!el) return;
  try {
    const r = await fetch('https://api.github.com/repos/Revise0592/Carvey/releases/latest');
    const text = document.getElementById('version-text');
    if (r.ok) {
      const d = await r.json();
      if (d.tag_name) {
        text.textContent = d.tag_name;
        el.href = d.html_url;
        return;
      }
    }
    // Fallback: tags list (for repos without formal releases)
    const t = await fetch('https://api.github.com/repos/Revise0592/Carvey/tags');
    if (t.ok) {
      const tags = await t.json();
      if (tags.length) text.textContent = tags[0].name;
    }
  } catch (_) {}
}

// Tabs — Getting Started section
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + tab)?.classList.add('active');
  });
});

// Copy buttons
const rawCode = {
  compose: `services:\n  carvey:\n    image: ghcr.io/revise0592/carvey:latest\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./data:/app/data\n    environment:\n      - TZ=Europe/London\n    restart: unless-stopped`,
  run: `docker run -d \\\n  --name carvey \\\n  -p 3000:3000 \\\n  -v ./data:/app/data \\\n  -e TZ=Europe/London \\\n  --restart unless-stopped \\\n  ghcr.io/revise0592/carvey:latest`,
};

document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const key = btn.dataset.copy;
    try {
      await navigator.clipboard.writeText(rawCode[key]);
      btn.classList.add('copied');
      btn.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      const text = btn.childNodes[btn.childNodes.length - 1];
      text.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.querySelector('svg').innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
        text.textContent = 'Copy';
      }, 2000);
    } catch (_) {}
  });
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

document.querySelectorAll('.screenshot-slot:not(.screenshot-placeholder-slot)').forEach(slot => {
  slot.addEventListener('click', () => {
    const src = slot.dataset.src;
    const alt = slot.querySelector('img')?.alt || '';
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// Nav background on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.borderBottomColor = window.scrollY > 10 ? 'var(--border)' : 'transparent';
}, { passive: true });

loadVersion();
