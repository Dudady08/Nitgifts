/* ==========================================================================
  Nit Gifts - Contact Form Interactions
  ========================================================================== */

// 1. Dynamic Toast Notification System
function showToast(title, description = "") {
 let container = document.getElementById('toast-container');
 if (!container) {
  container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
 }

 const toastCard = document.createElement('div');
 toastCard.className = 'toast-card';
 toastCard.style.flexDirection = 'column';
 toastCard.style.alignItems = 'flex-start';
 toastCard.style.gap = '4px';

 let descHTML = '';
 if (description) {
  descHTML = `<span style="font-size: 12px; color: rgba(255,255,255,0.7); font-weight: 400;">${description}</span>`;
 }

 toastCard.innerHTML = `
  <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
   <i data-lucide="check" class="icon-sm" style="color: var(--color-accent);"></i>
   <span style="font-weight: 700;">${title}</span>
  </div>
  ${descHTML}
 `;

 container.appendChild(toastCard);

 if (window.lucide) {
  window.lucide.createIcons();
 }

 // Trigger visual slide-in
 setTimeout(() => {
  toastCard.classList.add('show');
 }, 10);

 // Trigger dismissal and cleanup after 4 seconds
 setTimeout(() => {
  toastCard.classList.remove('show');
  toastCard.classList.add('hide');

  toastCard.addEventListener('transitionend', () => {
   toastCard.remove();
  });
 }, 4000);
}

// 2. Contact Form Submittal (Google Apps Script Integration)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzMOV8P62wf8zmQuAG_3rDXpHEfdVCP16PhZUQtda5m3yEXyt3YQtCcD_ftjLHlHSaryg/exec";

function initContactForm() {
 const form = document.getElementById('contact-form');
 const submitBtn = document.getElementById('submit-contact-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');
 
 const nameInput = document.getElementById('contact-name');
 const emailInput = document.getElementById('contact-email');
 const subjectInput = document.getElementById('contact-subject');
 const messageInput = document.getElementById('contact-message');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Set sending status layout states
  submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.style.display = 'none';

  // Prepara os dados (x-www-form-urlencoded)
  const formData = new URLSearchParams();
  formData.append('nome', nameInput.value);
  formData.append('email', emailInput.value);
  formData.append('assunto', subjectInput.value);
  formData.append('mensagem', messageInput.value);

  console.log("Enviando para o Google Apps Script...", formData.toString());

  // Envia os dados sem esperar pela resposta (dispare e esqueça)
  fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      body: formData.toString()
  }).then(() => console.log("Fetch enviado."))
    .catch(err => console.error("Erro no fetch:", err));

  // Simulate async server delivery response (1.5 seconds)
  setTimeout(() => {
   // Restore submit button visual states
   submitBtn.disabled = false;
   if (spinner) spinner.style.display = 'none';
   if (btnText) btnText.style.display = 'flex';

   // Clear input fields
   form.reset();

   // Show success feedback
   showToast("Mensagem enviada!", "Retornaremos em breve.");
  }, 1500);
 });
}

// 3. Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Bind form pipeline
 initContactForm();

 // Parse static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
