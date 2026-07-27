import { auth, db, doc, getDoc, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from './firebase-config.js';

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

 setTimeout(() => {
  toastCard.classList.add('show');
 }, 10);

 setTimeout(() => {
  toastCard.classList.remove('show');
  toastCard.classList.add('hide');

  toastCard.addEventListener('transitionend', () => {
   toastCard.remove();
  });
 }, 4000);
}

function initLoginForm() {
 const form = document.getElementById('login-form');
 const googleBtn = document.getElementById('google-login-btn');
 const errorBox = document.getElementById('login-error-box');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');

 // Google Login Flow
 if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
   const provider = new GoogleAuthProvider();
   try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user has a profile in Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists() && userDoc.data().address) {
     // Usuário já completou o perfil anteriormente
     window.location.replace('index.html');
    } else {
     // Primeiro acesso via Google (perfil incompleto)
     window.location.replace('complete-profile.html');
    }
    
   } catch (error) {
    console.error("Erro no login com Google:", error);
    if (error.code !== 'auth/popup-closed-by-user') {
     showToast("Erro", "Falha ao fazer login com o Google.");
    }
   }
  });
 }

 // Email/Password Flow
 if (form && submitBtn) {
  form.addEventListener('submit', async (e) => {
   e.preventDefault();

   if (errorBox) errorBox.style.display = 'none';

   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   submitBtn.disabled = true;
   if (spinner) spinner.style.display = 'inline-block';
   if (btnText) btnText.textContent = 'Entrando...';

   try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Verificar se o perfil está completo (pode ser o caso de alguém que usou Google e depois cadastrou senha)
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (userDoc.exists() && userDoc.data().address) {
     window.location.replace('index.html');
    } else {
     window.location.replace('complete-profile.html');
    }

   } catch (error) {
    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = 'Entrar';

    if (errorBox) {
     let errorMsg = "E-mail ou senha inválidos.";
     if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      errorMsg = "E-mail ou senha inválidos.";
     } else if (error.code === 'auth/too-many-requests') {
      errorMsg = "Muitas tentativas falhas. Tente novamente mais tarde.";
     }
     
     errorBox.textContent = errorMsg;
     errorBox.style.display = 'block';
     errorBox.style.animation = 'none';
     errorBox.offsetHeight; 
     errorBox.style.animation = 'shakeAlert 0.4s ease-out';
    }
   }
  });
 }
}

document.addEventListener('DOMContentLoaded', () => {
 initLoginForm();
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
