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
    section.addEventListener('click', () => {
      section.classList.toggle('collapsed');
      next.classList.toggle('collapsed');
    });
  });

  // Expand section that contains active link
  const active = document.querySelector('.nav a.active');
  if (active) {
    const list = active.closest('.nav-list');
    if (list) {
      const section = list.previousElementSibling;
      if (section && section.classList.contains('nav-section')) {
        section.classList.remove('collapsed');
        list.classList.remove('collapsed');
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
    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = a.textContent || '';
    card.appendChild(title);
    const sub = document.createElement('div');
    sub.className = 'card-sub';
    sub.textContent = 'Open section';
    card.appendChild(sub);
    wrapper.appendChild(card);
  });
  next.replaceWith(wrapper);
}

document.addEventListener('DOMContentLoaded', () => {
  buildToc();
  highlightNav();
  setupSidebarToggles();
  transformLinkListsToCards();
});
