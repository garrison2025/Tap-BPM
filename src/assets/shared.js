export function notify(message) {
  const el = document.querySelector('[data-toast]');
  if (!el) return;
  el.textContent = message;
  el.classList.add('shown');
  clearTimeout(window.__toastTimeout);
  window.__toastTimeout = setTimeout(() => el.classList.remove('shown'), 2300);
}

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(String(text));
    } else {
      const node = document.createElement('textarea');
      node.value = String(text);
      node.style.position = 'fixed';
      node.style.left = '-9999px';
      document.body.append(node);
      node.select();
      const ok = document.execCommand('copy');
      node.remove();
      if (!ok) throw new Error('Copy denied');
    }
    return true;
  } catch {
    return false;
  }
}

const nav = document.querySelector('[data-mobile-nav]');
const navBtn = document.querySelector('[data-nav-toggle]');
if (nav && navBtn) {
  navBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navBtn.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navBtn.setAttribute('aria-expanded', 'false');
  }));
}
