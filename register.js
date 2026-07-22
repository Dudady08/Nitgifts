/* ==========================================================================
  Nit Gifts - Registration & OTP Verification Controllers
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

// 2. Stage 1: Registration Form Handling
function initRegisterForm() {
 const form = document.getElementById('register-form');
 const googleBtn = document.getElementById('google-login-btn');
 const errorBox = document.getElementById('register-error-box');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 // Google Login redirect
 if (googleBtn) {
  googleBtn.addEventListener('click', () => {
   window.location.replace('index.html');
  });
 }

 if (form && submitBtn) {
  form.addEventListener('submit', (e) => {
   e.preventDefault();

   if (errorBox) errorBox.style.display = 'none';

   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;
   const confirmPassword = document.getElementById('confirm-password').value;

   // Rule Check: Password Matching
   if (password !== confirmPassword) {
    if (errorBox) {
     errorBox.textContent = 'As senhas não coincidem';
     errorBox.style.display = 'block';
     // Shake effect
     errorBox.style.animation = 'none';
     errorBox.offsetHeight; // trigger reflow
     errorBox.style.animation = 'shakeAlert 0.4s ease-out';
    }
    return;
   }

   // Enable loading layout states
   submitBtn.disabled = true;
   if (spinner) spinner.style.display = 'inline-block';
   if (btnText) btnText.textContent = 'Criando conta...';

   // Simulate registration API endpoint (1.2 seconds)
   setTimeout(() => {
    // Revert submit button states
    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = 'Criar conta';

    // Transition layouts to OTP stage
    switchToOTPStage(email);
   }, 1200);
  });
 }
}

// 3. Stage Transition: Switch UI to OTP verification view
function switchToOTPStage(email) {
 const regForm = document.getElementById('register-form');
 const otpBox = document.getElementById('otp-verification-box');

 const headerBadge = document.getElementById('auth-header-badge');
 const headerTitle = document.getElementById('auth-header-title');
 const headerSubtitle = document.getElementById('auth-header-subtitle');
 const footerContainer = document.getElementById('auth-footer-container');

 if (regForm) regForm.style.display = 'none';
 if (otpBox) otpBox.style.display = 'block';
 if (footerContainer) footerContainer.style.display = 'none';

 // Update header content dynamically
 if (headerTitle) headerTitle.textContent = 'Verifique seu e-mail';
 if (headerSubtitle) headerSubtitle.textContent = `Enviamos um código para ${email}`;

 if (headerBadge) {
  headerBadge.innerHTML = `<i data-lucide="mail" id="auth-header-icon"></i>`;
  if (window.lucide) {
   window.lucide.createIcons();
  }
 }

 // Setup OTP interaction listeners
 initOTPInputs(email);
}

// 4. Stage 2: OTP Slots Interaction and Verification Handling
function initOTPInputs(email) {
 const slots = Array.from(document.querySelectorAll('.otp-slot'));
 const verifyBtn = document.getElementById('verify-otp-btn');
 const verifySpinner = document.getElementById('verify-spinner');
 const verifyBtnText = document.getElementById('verify-btn-text');
 const resendBtn = document.getElementById('resend-otp-btn');
 const errorBox = document.getElementById('register-error-box');

 if (slots.length === 0 || !verifyBtn) return;

 // Auto-focus first slot
 slots[0].focus();

 // Check if all 6 inputs are filled to toggle verify button status
 const checkOTPValidity = () => {
  const code = slots.map(s => s.value).join('');
  verifyBtn.disabled = code.length < 6;
 };

 slots.forEach((slot, idx) => {
  // Character input event
  slot.addEventListener('input', (e) => {
   // Allow only numbers
   slot.value = slot.value.replace(/[^0-9]/g, '');

   if (slot.value.length > 0) {
    // Move focus to next input field
    if (idx < 5) {
     slots[idx + 1].focus();
    }
   }
   checkOTPValidity();
  });

  // Keys event (Backspace navigation helper)
  slot.addEventListener('keydown', (e) => {
   if (e.key === 'Backspace') {
    if (slot.value === '') {
     // Focus and clear previous input
     if (idx > 0) {
      slots[idx - 1].focus();
      slots[idx - 1].value = '';
     }
    } else {
     slot.value = '';
    }
    checkOTPValidity();
   }
  });

  // Paste event helper (supports typing or copying 6-digit codes)
  slot.addEventListener('paste', (e) => {
   e.preventDefault();
   const pasted = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);

   if (pasted) {
    pasted.split('').forEach((char, i) => {
     if (slots[i]) {
      slots[i].value = char;
     }
    });

    // Focus the appropriate field
    const focusIdx = Math.min(pasted.length, 5);
    slots[focusIdx].focus();
    checkOTPValidity();
   }
  });
 });

 // Verify OTP button submittal simulation (1.2 seconds)
 verifyBtn.addEventListener('click', () => {
  verifyBtn.disabled = true;
  if (verifySpinner) verifySpinner.style.display = 'inline-block';
  if (verifyBtnText) verifyBtnText.textContent = 'Verificando...';
  if (errorBox) errorBox.style.display = 'none';

  setTimeout(() => {
   const code = slots.map(s => s.value).join('');
   // Mock validation rule: if code starts with 999, simulate verification error
   if (code.startsWith('999')) {
    verifyBtn.disabled = false;
    if (verifySpinner) verifySpinner.style.display = 'none';
    if (verifyBtnText) verifyBtnText.textContent = 'Verificar';

    if (errorBox) {
     errorBox.textContent = 'Código de verificação inválido';
     errorBox.style.display = 'block';
     errorBox.style.animation = 'none';
     errorBox.offsetHeight; // trigger reflow
     errorBox.style.animation = 'shakeAlert 0.4s ease-out';
    }
   } else {
    // Redirection to the homepage
    window.location.replace('index.html');
   }
  }, 1200);
 });

 // Resend OTP action trigger
 if (resendBtn) {
  resendBtn.addEventListener('click', () => {
   if (errorBox) errorBox.style.display = 'none';

   // Re-trigger visual Toast notifications
   showToast("Código enviado", "Verifique seu e-mail para obter o novo código.");
  });
 }
}

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 // Bind Stage 1 registration fields
 initRegisterForm();

 // Render static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
