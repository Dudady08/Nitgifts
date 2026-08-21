/* ==========================================================================
  Nit Gifts - Forgot Password Pipeline Control
  ========================================================================== */

function initForgotPasswordForm() {
 const form = document.getElementById('forgot-password-form');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');
 const successBox = document.getElementById('success-confirmation');

 if (!form || !submitBtn) return;

 form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Set loading visual states (Disable button, show spinner, update label text)
  submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (btnText) btnText.textContent = 'Enviando...';

  // Simulate async resetting call (1.2 seconds, matching React lifecycle)
  setTimeout(() => {
   // Revert loading states
   submitBtn.disabled = false;
   if (spinner) spinner.style.display = 'none';
   if (btnText) btnText.textContent = 'Enviar link de recuperação';

   // Transition layouts (Hide form, show success confirmation message card)
   form.style.display = 'none';
   if (successBox) {
    successBox.style.display = 'block';

    // Add a smooth fade-in animation to the success box
    successBox.style.opacity = '0';
    successBox.style.transform = 'translateY(10px)';
    successBox.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';

    setTimeout(() => {
     successBox.style.opacity = '1';
     successBox.style.transform = 'translateY(0)';
    }, 10);
   }
  }, 1200);
 });
}

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Bind password resetting form submissions
 initForgotPasswordForm();

 // Parse static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
