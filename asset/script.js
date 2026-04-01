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

document.addEventListener('DOMContentLoaded', () => {
  buildToc();
  highlightNav();
});
