const url = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";
const params = new URLSearchParams();
params.append('tipo_formulario', 'calcular_frete');
params.append('cep_origem', '24360220');
params.append('cep_destino', '24360220');
params.append('peso_g', '500');
params.append('comprimento', '15');
params.append('largura', '15');
params.append('altura', '15');

fetch(url, { method: 'POST', body: params })
  .then(res => res.text())
  .then(text => console.log("RESPONSE:", text))
  .catch(err => console.error("ERROR:", err));
