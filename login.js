/* ==========================================================================
  Nit Gifts - Login Process Controller
  ========================================================================== */

function initLoginForm() {
 const form = document.getElementById('login-form');
 const googleBtn = document.getElementById('google-login-btn');
 const errorBox = document.getElementById('login-error-box');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 // 1. Google OAuth Provider Login Simulation
 if (googleBtn) {
  googleBtn.addEventListener('click', () => {
   // Direct redirection to the homepage
   window.location.replace('index.html');
  });
 }

 // 2. Email & Password Login Submittal Pipeline
 if (form && submitBtn) {
  form.addEventListener('submit', (e) => {
   e.preventDefault();

   // Clear any active error card alerts
   if (errorBox) errorBox.style.display = 'none';

   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   // Enable submit loading states
   submitBtn.disabled = true;
   if (spinner) spinner.style.display = 'inline-block';
   if (btnText) btnText.textContent = 'Entrando...';

   // Simulate async credentials check against base44 database (1.2 seconds)
   setTimeout(() => {
    // Validation Rule: demo@nitgift.com.br / 12345678 (Standard mock testing credentials)
    if (email === 'demo@nitgift.com.br' && password === '12345678') {
     // Success redirection
     window.location.replace('index.html');
    } else {
     // Restore button visual states
     submitBtn.disabled = false;
     if (spinner) spinner.style.display = 'none';
     if (btnText) btnText.textContent = 'Entrar';

     // Display credentials error banner
     if (errorBox) {
      errorBox.style.display = 'block';

      // Re-trigger shake animation if already displayed
      errorBox.style.animation = 'none';
      errorBox.offsetHeight; /* trigger reflow */
      errorBox.style.animation = 'shakeAlert 0.4s ease-out';
     }
    }
   }, 1200);
  });
 }
}

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Bind form and OAuth actions
 initLoginForm();

 // Render static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
