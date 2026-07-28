import { auth, db, doc, setDoc, onAuthStateChanged } from './firebase-config.js';

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

document.addEventListener('DOMContentLoaded', () => {
 const form = document.getElementById('complete-profile-form');
 const errorBox = document.getElementById('profile-error-box');
 const submitBtn = document.getElementById('submit-btn');
 const spinner = document.getElementById('submit-spinner');
 const btnText = document.getElementById('submit-btn-text');
 
 let currentUser = null;

 // Wait for auth state to confirm user is logged in (from Google)
 onAuthStateChanged(auth, (user) => {
  if (user) {
   currentUser = user;
  } else {
   // Se não estiver logado, não faz sentido estar nesta tela
   window.location.replace('login.html');
  }
 });

 if (form && submitBtn) {
  form.addEventListener('submit', async (e) => {
   e.preventDefault();

   if (!currentUser) {
    showToast("Aguarde", "Verificando autenticação...");
    return;
   }

   if (errorBox) errorBox.style.display = 'none';

   const phone = document.getElementById('phone').value;
   const cep = document.getElementById('cep').value;
   const address = document.getElementById('address').value;
   const number = document.getElementById('number').value;
   const complement = document.getElementById('complement').value;
   const city = document.getElementById('city').value;
   const state = document.getElementById('state').value;

   submitBtn.disabled = true;
   if (spinner) spinner.style.display = 'inline-block';
   if (btnText) btnText.textContent = 'Salvando...';

   try {
    // Save to Firestore
    await setDoc(doc(db, "users", currentUser.uid), {
     uid: currentUser.uid,
     name: currentUser.displayName || 'Usuário',
     email: currentUser.email || '',
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
    }, { merge: true });

    console.log("Perfil salvo no Firestore com sucesso!");
    showToast("Sucesso!", "Seu perfil foi atualizado.");
    
    setTimeout(() => {
     window.location.replace('index.html');
    }, 1500);

   } catch (error) {
    console.error("⚠️ ERRO AO SALVAR PERFIL NO FIRESTORE:", error);
    console.error("Verifique as regras de segurança do Firestore no console do Firebase.");
    submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (btnText) btnText.textContent = 'Salvar Meu Perfil';

    if (errorBox) {
     errorBox.textContent = "Erro ao salvar seus dados. Verifique se as permissões do Firestore estão configuradas.";
     errorBox.style.display = 'block';
     errorBox.style.animation = 'none';
     errorBox.offsetHeight;
     errorBox.style.animation = 'shakeAlert 0.4s ease-out';
    }
   }
  });
 }

 if (window.lucide) {
  window.lucide.createIcons();
 }
});
