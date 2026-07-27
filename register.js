import { auth, db, createUserWithEmailAndPassword, doc, setDoc, getDoc, GoogleAuthProvider, signInWithPopup } from './firebase-config.js';

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

// 2. Stage 1: Registration Form Handling
function initRegisterForm() {
 const form = document.getElementById('register-form');
 const googleBtn = document.getElementById('google-login-btn');
 const errorBox = document.getElementById('register-error-box');
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

 if (form && submitBtn) {
  form.addEventListener('submit', async (e) => {
   e.preventDefault();

   if (errorBox) errorBox.style.display = 'none';

   // Dados Pessoais
   const name = document.getElementById('name').value;
   const email = document.getElementById('email').value;
   const phone = document.getElementById('phone').value;
   const password = document.getElementById('password').value;
   const confirmPassword = document.getElementById('confirm-password').value;

   // Endereço
   const cep = document.getElementById('cep').value;
   const address = document.getElementById('address').value;
   const number = document.getElementById('number').value;
   const complement = document.getElementById('complement').value;
   const city = document.getElementById('city').value;
   const state = document.getElementById('state').value;

   // Rule Check: Password Matching
   if (password !== confirmPassword) {
    if (errorBox) {
     errorBox.textContent = 'As senhas não coincidem';
     errorBox.style.display = 'block';
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

   try {
    // 1. Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Salvar dados adicionais no Firestore
    await setDoc(doc(db, "users", user.uid), {
     uid: user.uid,
     name: name,
     email: email,
     phone: phone,
     address: {
      cep: cep,
      street: address,
      number: number,
      complement: complement,
      city: city,
      state: state
     },
     createdAt: new Date().toISOString()
    });

    // 3. Sucesso!
    showToast("Sucesso!", "Sua conta foi criada. Redirecionando...");

    // Redirecionar para index ou checkout
    setTimeout(() => {
     window.location.replace('index.html');
    }, 1500);

   } catch (error) {
    console.error("Erro no Firebase:", error);
    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = 'Criar conta';

    if (errorBox) {
     // Traduzir erros comuns do Firebase
     let errorMsg = "Ocorreu um erro ao criar a conta.";
     if (error.code === 'auth/email-already-in-use') {
      errorMsg = "Este e-mail já está sendo usado por outra conta.";
     } else if (error.code === 'auth/weak-password') {
      errorMsg = "A senha é muito fraca. Use pelo menos 6 caracteres.";
     } else if (error.code === 'auth/invalid-email') {
      errorMsg = "E-mail inválido.";
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

// Initializer Lifecycle
document.addEventListener('DOMContentLoaded', () => {
 initRegisterForm();

 // Render static Lucide icons
 if (window.lucide) {
  window.lucide.createIcons();
 }
});
