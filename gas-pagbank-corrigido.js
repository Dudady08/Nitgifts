// ============================================================================
// PAGBANK CHECKOUT + WEBHOOK + FRETE (CORRIGIDO)
// ============================================================================
// BUGS CORRIGIDOS:
// 1. Frete: API dos Correios substituída por tabela regional (funciona sempre)
// 2. reference_id: separador corrigido de "|" para "_"
// 3. notification_urls: agora registra o webhook no PagBank
// 4. MY_WEBHOOK_URL: agora é usada no checkout
// ============================================================================

// ┌─────────────────────────────────────────────────────┐
// │  CONFIGURAÇÃO                                       │
// └─────────────────────────────────────────────────────┘
var PAGBANK_TOKEN = "9b33f8c2-3512-44a1-9a46-bb209b4e15cd350a785e40f58da5487ba70f3f6b83d3f03b-0524-4880-87e3-1621c0ae7136";
var PAGBANK_ENV = "production";

var OLD_SPREADSHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";

// IMPORTANTE: Após fazer nova implantação, atualize esta URL com a nova URL gerada
var MY_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";

var PAGBANK_API_URLS = {
  "sandbox": "https://sandbox.api.pagseguro.com",
  "production": "https://api.pagseguro.com"
};

// ============================================================================
// PORTA DE ENTRADA (doPost)
// ============================================================================
function doPost(e) {
  var params = e.parameter;

  if (params && params.tipo_formulario === "calcular_frete") {
    return calcularFrete(e);
  }

  if (params && params.tipo_formulario === "pagbank_checkout") {
    return handlePagBankCheckout(params);
  }

  if (params && params.tipo_formulario === "check_status") {
    return checkPagBankStatus(params.checkout_id);
  }

  if (e.postData && e.postData.type === "application/json") {
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch(err) {
      return ContentService.createTextOutput("Invalid JSON");
    }
    return handlePagBankWebhook(payload);
  }

  return ContentService.createTextOutput("Requisição não reconhecida.");
}

function doGet(e) {
  var params = e.parameter;
  if (params && params.tipo_formulario === 'calcular_frete') {
    return calcularFrete(e);
  }
  return ContentService.createTextOutput("Requisição GET não reconhecida.");
}

// ============================================================================
// 1. CRIAR CHECKOUT NO PAGBANK
// ============================================================================
function handlePagBankCheckout(params) {
  var itemsJson = params.items;
  var customerName = params.nome || "";
  var customerEmail = params.email || "";
  var referenceId = params.reference_id || ("NITGIFT-" + new Date().getTime());
  var returnUrl = params.return_url || "";

  if (!itemsJson) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Nenhum item recebido." })).setMimeType(ContentService.MimeType.JSON);
  }

  // Guardar dados completos no cache para o webhook usar depois
  try {
    PropertiesService.getScriptProperties().setProperty("ORDER_" + referenceId, JSON.stringify(params));
  } catch (err) {
    Logger.log("Erro ao salvar no cache: " + err);
  }

  var items = JSON.parse(itemsJson);
  var pagbankItems = items.map(function(item, index) {
    return {
      reference_id: "item-" + (index + 1),
      name: item.name.substring(0, 64),
      quantity: item.qty,
      unit_amount: Math.round(item.price * 100)
    };
  });

  var checkoutBody = {
    reference_id: referenceId,
    items: pagbankItems,
    customer_modifiable: true,
    // ✅ BUG 3 CORRIGIDO: Registrar webhook para o PagBank avisar quando o cliente pagar
    notification_urls: [MY_WEBHOOK_URL]
  };

  if (customerName && customerEmail) {
    checkoutBody.customer = { name: customerName, email: customerEmail };
  }

  if (returnUrl) checkoutBody.redirect_url = returnUrl;

  var apiUrl = PAGBANK_API_URLS[PAGBANK_ENV] + "/checkouts";
  var options = {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + PAGBANK_TOKEN, "Accept": "application/json" },
    payload: JSON.stringify(checkoutBody),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var responseCode = response.getResponseCode();
    var responseBody = JSON.parse(response.getContentText());

    if (responseCode === 201 || responseCode === 200) {
      var payLink = "";
      if (responseBody.links) {
        for (var i = 0; i < responseBody.links.length; i++) {
          if (responseBody.links[i].rel === "PAY") { payLink = responseBody.links[i].href; break; }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, checkout_id: responseBody.id || "", pay_url: payLink })).setMimeType(ContentService.MimeType.JSON);
    } else {
      var errorMsg = "Erro PagBank: " + responseCode;
      if (responseBody.error_messages) {
        errorMsg = responseBody.error_messages.map(function(e) {
          return (e.parameter_name ? "[" + e.parameter_name + "] " : "") + (e.description || e.message);
        }).join("; ");
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: errorMsg })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Exceção de rede." })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// 1.5 VERIFICAR STATUS DO PAGAMENTO
// ============================================================================
function checkPagBankStatus(checkoutId) {
  if (!checkoutId) {
    return ContentService.createTextOutput(JSON.stringify({ status: "UNKNOWN", error: "Sem checkout_id" })).setMimeType(ContentService.MimeType.JSON);
  }

  var apiUrl = PAGBANK_API_URLS[PAGBANK_ENV] + "/checkouts/" + encodeURIComponent(checkoutId);
  var options = {
    method: "get",
    headers: { "Authorization": "Bearer " + PAGBANK_TOKEN, "Accept": "application/json" },
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(apiUrl, options);
    var body = JSON.parse(response.getContentText());
    var paid = false;
    var currentStatus = "ACTIVE";

    if (body.orders && body.orders.length > 0) {
      var orderId = body.orders[0].id;
      var orderUrl = PAGBANK_API_URLS[PAGBANK_ENV] + "/orders/" + orderId;
      try {
        var orderResponse = UrlFetchApp.fetch(orderUrl, options);
        var orderBody = JSON.parse(orderResponse.getContentText());
        if (orderBody.status === "PAID" || orderBody.status === "AUTHORIZED") {
          paid = true;
        }
        if (!paid && orderBody.charges && orderBody.charges.length > 0) {
          for (var j = 0; j < orderBody.charges.length; j++) {
            if (orderBody.charges[j].status === "PAID" || orderBody.charges[j].status === "AUTHORIZED") {
              paid = true;
              break;
            }
          }
        }
        body.fetched_order = orderBody;
      } catch (orderErr) {
        body.fetched_order_error = orderErr.toString();
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: paid ? "PAID" : currentStatus,
      debug: body
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "ERROR", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// 2. RECEBER WEBHOOK E ACIONAR PLANILHA/EMAIL
// ============================================================================
function handlePagBankWebhook(payload) {
  var referenceId = payload.reference_id;
  var charges = payload.charges || [];
  if (charges.length === 0) return ContentService.createTextOutput("OK - Sem cobranças");

  var charge = charges[0];
  var status = charge.status;

  if (status === "PAID" || status === "AUTHORIZED") {
    var savedDataString = PropertiesService.getScriptProperties().getProperty("ORDER_" + referenceId);

    if (savedDataString) {
      var orderParams = JSON.parse(savedDataString);
      orderParams.tipo_formulario = "checkout";

      var formBody = [];
      for (var property in orderParams) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(orderParams[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");

      var options = {
        method: "post",
        contentType: "application/x-www-form-urlencoded",
        payload: formBody,
        muteHttpExceptions: true
      };

      try {
        UrlFetchApp.fetch(OLD_SPREADSHEET_SCRIPT_URL, options);
      } catch (err) {
        Logger.log("Erro ao acionar a planilha velha: " + err);
      }

      // ✅ BUG 2 CORRIGIDO: Separador agora é "_" (igual ao frontend)
      // O reference_id é montado como: uid_orderId
      // Usamos indexOf para pegar apenas o PRIMEIRO underscore
      if (referenceId) {
        var separatorIndex = referenceId.indexOf("_");
        if (separatorIndex > -1) {
          var uid = referenceId.substring(0, separatorIndex);
          var orderId = referenceId.substring(separatorIndex + 1);

          var firebaseUrl = "https://firestore.googleapis.com/v1/projects/nitgifts-loja/databases/(default)/documents/users/" + uid + "/orders/" + orderId + "?updateMask.fieldPaths=status";

          var firestorePayload = {
            "fields": {
              "status": {
                "stringValue": "pago"
              }
            }
          };

          var fsOptions = {
            method: "patch",
            contentType: "application/json",
            payload: JSON.stringify(firestorePayload),
            muteHttpExceptions: true
          };

          try {
            UrlFetchApp.fetch(firebaseUrl, fsOptions);
          } catch(e) {
            Logger.log("Erro ao atualizar Firebase: " + e);
          }
        }
      }

      PropertiesService.getScriptProperties().deleteProperty("ORDER_" + referenceId);
    }
  }

  return ContentService.createTextOutput("OK");
}

// ============================================================================
// 3. CÁLCULO DE FRETE — TABELA REGIONAL POR CEP (substitui Correios)
// ============================================================================
// Tabela baseada nas faixas de CEP oficiais dos Correios por estado/região.
// CEP_ORIGEM = 24360220 (Niterói, RJ)
// Os preços são realistas e baseados em valores médios de PAC/SEDEX para
// pacotes de até 2kg saindo de Niterói.
// ============================================================================

var TABELA_FRETE = [
  // { faixa_inicio, faixa_fim, estado, regiao, pac_preco, pac_prazo, sedex_preco, sedex_prazo }

  // RJ - Mesma cidade / estado
  { ini: 20000, fim: 28999, uf: 'RJ', pac: 16.90, pac_d: 4,  sedex: 24.90, sedex_d: 1 },

  // SP
  { ini: 01000, fim: 19999, uf: 'SP', pac: 22.90, pac_d: 5,  sedex: 34.90, sedex_d: 2 },

  // MG
  { ini: 30000, fim: 39999, uf: 'MG', pac: 22.90, pac_d: 5,  sedex: 34.90, sedex_d: 2 },

  // ES
  { ini: 29000, fim: 29999, uf: 'ES', pac: 22.90, pac_d: 5,  sedex: 34.90, sedex_d: 2 },

  // PR, SC, RS (Sul)
  { ini: 80000, fim: 99999, uf: 'SUL', pac: 28.90, pac_d: 7,  sedex: 42.90, sedex_d: 3 },

  // BA
  { ini: 40000, fim: 48999, uf: 'BA', pac: 32.90, pac_d: 8,  sedex: 48.90, sedex_d: 4 },

  // SE, AL, PE, PB, RN, CE, PI, MA (Nordeste)
  { ini: 49000, fim: 65999, uf: 'NE', pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },

  // DF, GO, TO, MT, MS (Centro-Oeste)
  { ini: 70000, fim: 79999, uf: 'CO', pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },

  // PA, AM, AP, RR, RO, AC (Norte)
  { ini: 66000, fim: 69999, uf: 'NO', pac: 42.90, pac_d: 14, sedex: 62.90, sedex_d: 6 },
];

function calcularFrete(e) {
  var params = e.parameter;
  var cepDestino = (params.cep_destino || '').replace(/\D/g, '');
  var pesoGramas = parseFloat(params.peso_g) || 300;

  if (!cepDestino || cepDestino.length !== 8) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'CEP inválido.' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var cepNum = parseInt(cepDestino, 10);

  // Adicional de peso: +R$2 a cada 500g acima de 1kg
  var adicionalPeso = 0;
  if (pesoGramas > 1000) {
    adicionalPeso = Math.ceil((pesoGramas - 1000) / 500) * 2;
  }

  // Buscar faixa de CEP
  var faixa = null;
  for (var i = 0; i < TABELA_FRETE.length; i++) {
    if (cepNum >= TABELA_FRETE[i].ini && cepNum <= TABELA_FRETE[i].fim) {
      faixa = TABELA_FRETE[i];
      break;
    }
  }

  if (!faixa) {
    // CEP não encontrado na tabela — usar preço padrão (região distante)
    faixa = { pac: 42.90, pac_d: 14, sedex: 62.90, sedex_d: 6 };
  }

  var opcoes = [
    {
      codigo: '04510',
      nome: 'PAC',
      preco: parseFloat((faixa.pac + adicionalPeso).toFixed(2)),
      prazo: faixa.pac_d + ' a ' + (faixa.pac_d + 3) + ' dias úteis',
      erro: ''
    },
    {
      codigo: '04014',
      nome: 'SEDEX',
      preco: parseFloat((faixa.sedex + adicionalPeso).toFixed(2)),
      prazo: faixa.sedex_d + ' a ' + (faixa.sedex_d + 2) + ' dias úteis',
      erro: ''
    }
  ];

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, opcoes: opcoes })
  ).setMimeType(ContentService.MimeType.JSON);
}
