function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

function buildToc() {
  const content = document.querySelector('.doc-content');
  const toc = document.querySelector('.toc');
  if (!content || !toc) return;

  const headings = Array.from(content.querySelectorAll('h1, h2, h3'));
  if (headings.length === 0) return;

  const ul = document.createElement('ul');
  headings.forEach((h) => {
    if (!h.id) h.id = slugify(h.textContent || '');
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent || '';
    a.dataset.level = h.tagName;
    a.style.paddingLeft = h.tagName === 'H3' ? '12px' : h.tagName === 'H2' ? '6px' : '0px';
    li.appendChild(a);
    ul.appendChild(li);
  });
  toc.appendChild(ul);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = toc.querySelector(`a[href=\"#${entry.target.id}\"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          toc.querySelectorAll('a').forEach((a) => a.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 }
  );
  headings.forEach((h) => observer.observe(h));
}

function highlightNav() {
  const path = window.location.pathname.split('/').pop();
  const links = document.querySelectorAll('.nav a');
  links.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const hrefFile = href.split('/').pop();
    if (hrefFile === path) a.classList.add('active');
  });
}

function setupSidebarToggles() {
  const sections = document.querySelectorAll('.nav-section');
  sections.forEach((section) => {
    const next = section.nextElementSibling;
    if (!next || !next.classList.contains('nav-list')) return;
    const caret = section.querySelector('.nav-section-caret');
    const link = section.querySelector('.nav-section-link');
    if (caret) {
      caret.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const willCollapse = !section.classList.contains('collapsed');
        section.classList.toggle('collapsed');
        next.classList.toggle('collapsed');
        if (willCollapse) {
          next.style.maxHeight = '0px';
        } else {
          next.style.maxHeight = next.scrollHeight + 'px';
        }
      });
    }
    // Click on the section (not caret) navigates to the section link
    section.addEventListener('click', (e) => {
      if (e.target && (e.target === caret || (caret && caret.contains(e.target)))) return;
      if (link) {
        const href = link.getAttribute('href');
        if (href) window.location.href = href;
      }
    });
    // initialize height for animation
    if (!next.classList.contains('collapsed')) {
      next.style.maxHeight = next.scrollHeight + 'px';
    } else {
      next.style.maxHeight = '0px';
    }
  });

  const active = document.querySelector('.nav a.active');
  if (active) {
    const list = active.closest('.nav-list');
    if (list) {
      const section = list.previousElementSibling;
      if (section && section.classList.contains('nav-section')) {
        section.classList.remove('collapsed');
        list.classList.remove('collapsed');
        list.style.maxHeight = list.scrollHeight + 'px';
      }
    }
  }
}

function transformLinkListsToCards() {
  const content = document.querySelector('.doc-content');
  if (!content) return;
  const h1 = content.querySelector('h1');
  if (!h1) return;
  const next = h1.nextElementSibling;
  if (!next || next.tagName !== 'UL') return;

  const items = Array.from(next.querySelectorAll('li'));
  if (items.length === 0) return;
  const allLinks = items.every((li) => li.querySelector('a') && li.textContent.trim() === li.querySelector('a').textContent.trim());
  if (!allLinks) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'cards';
  items.forEach((li) => {
    const a = li.querySelector('a');
    const card = document.createElement('a');
    card.className = 'card';
    card.href = a.getAttribute('href') || '#';
    const text = document.createElement('div');
    text.className = 'card-text';
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = a.textContent || '';
    text.appendChild(title);
    card.appendChild(text);
    const arrow = document.createElement('div');
    arrow.className = 'card-arrow';
    arrow.textContent = '›';
    card.appendChild(arrow);
    wrapper.appendChild(card);
  });
  next.replaceWith(wrapper);
}

function addSidebarFooter() {
  const sidebar = document.querySelector('.site-sidebar');
  if (!sidebar) return;
  if (sidebar.querySelector('.sidebar-footer')) return;
  const footer = document.createElement('div');
  footer.className = 'sidebar-footer';
  footer.innerHTML = '<div class=\"powered\">Powered by GitBook</div>';
  sidebar.appendChild(footer);
}

function resolveNavLinks() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const path = window.location.pathname;
  const base = path.includes('/whitepaper/') ? path.split('/whitepaper/')[0] + '/whitepaper/' : './';
  nav.querySelectorAll('[data-href]').forEach((el) => {
    const target = el.getAttribute('data-href');
    if (!target) return;
    el.setAttribute('href', base + target);
  });
}

async function loadNav() {
  const slot = document.querySelector('.nav-container');
  if (!slot) return;
  const path = window.location.pathname;
  const base = path.includes('/whitepaper/') ? path.split('/whitepaper/')[0] + '/whitepaper/' : './';
  try {
    const res = await fetch(base + 'navi.html', { cache: 'no-store' });
    if (!res.ok) return;
    const html = await res.text();
    slot.innerHTML = html;
    resolveNavLinks();
    highlightNav();
    setupSidebarToggles();
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  buildToc();
  loadNav();
  transformLinkListsToCards();
  addSidebarFooter();
});
