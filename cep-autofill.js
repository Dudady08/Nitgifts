/* ==========================================================================
  Nit Gifts - CEP Auto-fill (ViaCEP)
  Funciona em QUALQUER página que tenha campos de CEP.
  Basta adicionar <script src="cep-autofill.js"></script> no HTML.
  ========================================================================== */

(function () {
 // Mapeamento dos IDs de campo por página
 var configs = [
  // Páginas: register.html e complete-profile.html
  { cep: 'cep', street: 'address', number: 'number', city: 'city', state: 'state' },
  // Página: account.html (Minha Conta)
  { cep: 'input-cep', street: 'input-street', number: 'input-number', city: 'input-city', state: 'input-state' }
 ];

 var buscando = false;

 function buscarCEP(cepInput, config) {
  var digits = cepInput.value.replace(/\D/g, '');
  if (digits.length !== 8 || buscando) return;

  var streetInput = document.getElementById(config.street);
  var numberInput = document.getElementById(config.number);
  var cityInput = document.getElementById(config.city);
  var stateInput = document.getElementById(config.state);

  // Feedback visual
  if (streetInput) streetInput.placeholder = 'Buscando endereço...';
  buscando = true;

  fetch('https://viacep.com.br/ws/' + digits + '/json/')
   .then(function (res) { return res.json(); })
   .then(function (data) {
    buscando = false;

    if (data.erro) {
     alert('CEP não encontrado. Verifique o código e tente novamente.');
     if (streetInput) streetInput.placeholder = 'Rua / Avenida';
     return;
    }

    // Preenche os campos automaticamente
    if (streetInput) {
     streetInput.value = data.logradouro || '';
     streetInput.placeholder = 'Rua / Avenida';
    }
    if (cityInput) cityInput.value = data.localidade || '';
    if (stateInput) stateInput.value = data.uf || '';

    // Foca no campo de número para o utilizador preencher
    if (numberInput) numberInput.focus();
   })
   .catch(function (err) {
    buscando = false;
    console.error('Erro ao buscar CEP:', err);
    if (streetInput) streetInput.placeholder = 'Rua / Avenida';
   });
 }

 function ligarEventos(config) {
  var cepInput = document.getElementById(config.cep);
  if (!cepInput) return;
  if (cepInput.dataset.cepAutoFill) return; // Já ligado
  cepInput.dataset.cepAutoFill = 'true';

  // Quando o campo perde o foco (blur)
  cepInput.addEventListener('blur', function () {
   buscarCEP(cepInput, config);
  });

  // Quando o 8º dígito é digitado (instantâneo)
  cepInput.addEventListener('input', function () {
   var digits = cepInput.value.replace(/\D/g, '');
   if (digits.length === 8) {
    buscarCEP(cepInput, config);
   }
  });

  console.log('CEP Auto-fill ativado para o campo #' + config.cep);
 }

 function inicializar() {
  for (var i = 0; i < configs.length; i++) {
   ligarEventos(configs[i]);
  }
 }

 // Inicializa quando o DOM estiver pronto
 if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
 } else {
  inicializar();
 }

 // Para a página account.html (campos aparecem só ao clicar no lápis)
 // Observa mudanças no DOM para detectar quando o formulário de edição aparece
 var observer = new MutationObserver(function () {
  for (var i = 0; i < configs.length; i++) {
   var cepEl = document.getElementById(configs[i].cep);
   if (cepEl && !cepEl.dataset.cepAutoFill) {
    ligarEventos(configs[i]);
   }
  }
 });

 observer.observe(document.documentElement, { childList: true, subtree: true });
})();
