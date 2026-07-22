/* ==========================================================================
  Nit Gifts - Reset Password Pipeline Control
  ========================================================================== */

function checkResetToken() {
 const params = new URLSearchParams(window.location.search);
 const resetToken = params.get('token');

 const form = document.getElementById('reset-password-form');
 const invalidBox = document.getElementById('invalid-link-box');
 const footerContainer = document.getElementById('auth-footer-container');

 const headerBadge = document.getElementById('auth-header-badge');
 const headerTitle = document.getElementById('auth-header-title');
 const headerSubtitle = document.getElementById('auth-header-subtitle');

 if (!resetToken) {
  // 1. INVALID LINK STATE: Token is missing
  if (form) form.style.display = 'none';
  if (invalidBox) invalidBox.style.display = 'block';
  if (footerContainer) footerContainer.style.display = 'block';

  // Update Header Content
  if (headerTitle) headerTitle.textContent = 'Link de redefinição inválido';
  if (headerSubtitle) headerSubtitle.textContent = 'Este link de redefinição de senha está ausente ou é inválido';

  // Change top badge icon to alert-triangle
  if (headerBadge) {
   headerBadge.innerHTML = `<i data-lucide="alert-triangle" id="auth-header-icon"></i>`;
   if (window.lucide) {
    window.lucide.createIcons();
   }
  }
 } else {
  // 2. VALID LINK STATE: Token is present
  if (form) form.style.display = 'block';
  if (invalidBox) invalidBox.style.display = 'none';
  if (footerContainer) footerContainer.style.display = 'none'; // hide request link footer since reset is possible

  initResetForm();
 }
}

function initResetForm() {
 const form = document.getElementById('reset-password-form');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');
 const errorBox = document.getElementById('reset-error-box');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (errorBox) errorBox.style.display = 'none';

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  // Rule Check: Password Matching
  if (password !== confirmPassword) {
   if (errorBox) {
    errorBox.textContent = 'As senhas não coincidem';
    errorBox.style.display = 'block';
    // Shake alert animation
    errorBox.style.animation = 'none';
    errorBox.offsetHeight; // trigger reflow
    errorBox.style.animation = 'shakeAlert 0.4s ease-out';
   }
   return;
  }

  // Set re-setting loading states
  submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.textContent = 'Redefinindo...';

  // Simulate async redefinition API endpoint (1.2 seconds)
  setTimeout(() => {
   // Revert loading states (though redirecting immediately)
   submitBtn.disabled = false;
   if (spinner) spinner.style.display = 'none';
   if (btnText) btnText.textContent = 'Redefinir senha';

   // Redirect back to login page
   window.location.replace('login.html');
  }, 1200);
 });
}

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Check parameter tokens
 checkResetToken();

 // Render static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
