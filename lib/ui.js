// /lib/ui.js
// Helpers UI : notifications, modal, navigateTo (DOM helpers)
export function afficherNotification(message, type = 'info', timeout = 3500) {
  const containerId = 'global-notification';
  let el = document.getElementById(containerId);
  if (!el) {
    el = document.createElement('div');
    el.id = containerId;
    el.className = 'notification';
    document.body.appendChild(el);
  }
  el.innerText = message;
  el.style.background = type === 'error' ? '#D32F2F' : type === 'success' ? '#4CAF50' : '#2196F3';
  el.classList.add('show');
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => el.classList.remove('show'), timeout);
}

export function openModal(htmlContent) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;
  content.innerHTML = htmlContent;
  modal.classList.add('active');
}

export function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.remove('active');
}

export function navigateTo(tab) {
  if (window.navigateTo) return window.navigateTo(tab);
  const evt = new CustomEvent('navigateTo', { detail: tab });
  window.dispatchEvent(evt);
}