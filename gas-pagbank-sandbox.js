// ============================================================================
// PAGBANK CHECKOUT + WEBHOOK + MELHOR ENVIO (FRETE)
// ============================================================================

// ┌─────────────────────────────────────────────────────┐
// │  CONFIGURAÇÃO DO PAGBANK                            │
// └─────────────────────────────────────────────────────┘
var PAGBANK_TOKEN = "19f762a6-33c3-4687-b75c-7bf889c1aac16b1710db46a4ac61ace0b3ca8bb638260397-571f-4e6c-a6d4-af1aae47e5f2";
var PAGBANK_ENV = "sandbox";

var OLD_SPREADSHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUrmbaRzwqRku-QT7j_V1tqNMuheBB4zkNDJynJy7iV7bnF3FJ4JE6hgeZ2vTuN5bDfA/exec";

// IMPORTANTE: Após fazer nova implantação, atualize esta URL com a nova URL gerada
var MY_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxwuC7xGX5YJX9u8DYxi0zm6hxKSF2GxevgkAtrkWscb1srBA3KIjvxy-NYZtWDfWJ8vQ/exec";

var PAGBANK_API_URLS = {
  "sandbox": "https://sandbox.api.pagseguro.com",
  "production": "https://api.pagseguro.com"
};

// ┌─────────────────────────────────────────────────────┐
// │  CONFIGURAÇÃO DO MELHOR ENVIO                       │
// └─────────────────────────────────────────────────────┘
var MELHOR_ENVIO_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiZGQyMTlmNDEzMjZjNmZlNzZjZWQ3NzBiNzM0N2RiOTg4ZTMyOTVhMWM0NmRlNWI5YTYxNjdiMTllNzkwNzExOGJkYzIxNGYyN2U0ZDdlNTAiLCJpYXQiOjE3ODc3MTk1NjIuNDk2ODkzLCJuYmYiOjE3ODc3MTk1NjIuNDk2ODk0LCJleHAiOjE4MTkyNTU1NjIuNDg3NjY5LCJzdWIiOiJhMjk3MzNjNS1iMTc3LTQzZGUtYjU1Yi00NWM3MTFjZWE1NzciLCJzY29wZXMiOlsic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY29tcGFuaWVzIl19.oguQLtX14hd5-yYr_USYp66A_4y8tAJs9u40Eys7pHZubsHIs5_yxJt6fxtX7SiWlUU2z6zdsTi152QgWdhVcxGD720ZWGlsNss1zHs6pGDMA0b3BrkAP-OEXgX7h_v3WQ1fnIpwCZqhcC4WYTGGtCkbFxoCYZTBt-6JschUbheQWmg7vuE8JaxaDhxCbpYefHQzq07zNE-1Mck0X4G1Wis53FhiUbL1kTfZTIbgCLHiuaA-qCTb98OT_-k4C53PC1pZGd3EDpJx-gp6QuQSELL-B-40syr6OQEZd-JJIm9bDFX0raqq-lAxy5ir3jr4A3e1pjv6sijkMvzBHNUnv8QjXuhnhF0giiWzXQMQBA1dbLeI_ServXfeTJl_pOFtBTkRQrTC4HafjmbAwBK6h0Mv2A35LGs-iQ-YZMzBULK3EOYuVIFu3UtSnYzoQwe9JZJftrGNaQ41clAORgjQ_dBJRoxcES26l-XHwowemYnzl7CI5lu1qT9Q_XJUMo9ttUolAONGTW1RB_5je-mHXWWMRaLLAxiE_EWrLox6rq5rvn-3cfpfyvWzOoV7eSZ0VRqBQM7cpTxybr5E0cf0ZBiSacVZLx0ZdKoaZ6rYn79n2xuOufLmkx28E-QdqevqBlWFHACYEuJPZSY4d9KigAoANwMeS2KpOj6AXMs5swM";
// Use URL oficial (Production) do Melhor Envio
var MELHOR_ENVIO_API_URL = "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";
// Filtro de Transportadoras: 1=PAC, 2=SEDEX, 3=Jadlog Package, 4=Jadlog .Com, 17=Mini Envios
var MELHOR_ENVIO_SERVICOS = [1, 2, 3, 4];

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
// 3. CÁLCULO DE FRETE — MELHOR ENVIO (Principal) + TABELA REGIONAL (Plano B)
// ============================================================================
var TABELA_FRETE = [
  // Fallback: Faixas de CEP oficiais, Niterói - RJ -> Brasil
  { ini: 1000,  fim: 19999, uf: 'SP',  pac: 22.90, pac_d: 5,  sedex: 34.90, sedex_d: 2 },
  { ini: 20000, fim: 28999, uf: 'RJ',  pac: 16.90, pac_d: 3,  sedex: 22.90, sedex_d: 1 },
  { ini: 29000, fim: 29999, uf: 'ES',  pac: 24.90, pac_d: 5,  sedex: 36.90, sedex_d: 2 },
  { ini: 30000, fim: 39999, uf: 'MG',  pac: 22.90, pac_d: 5,  sedex: 34.90, sedex_d: 2 },
  { ini: 40000, fim: 48999, uf: 'BA',  pac: 32.90, pac_d: 8,  sedex: 48.90, sedex_d: 4 },
  { ini: 49000, fim: 49999, uf: 'SE',  pac: 35.90, pac_d: 9,  sedex: 52.90, sedex_d: 4 },
  { ini: 50000, fim: 56999, uf: 'PE',  pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },
  { ini: 57000, fim: 57999, uf: 'AL',  pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },
  { ini: 58000, fim: 58999, uf: 'PB',  pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },
  { ini: 59000, fim: 59999, uf: 'RN',  pac: 35.90, pac_d: 10, sedex: 52.90, sedex_d: 5 },
  { ini: 60000, fim: 63999, uf: 'CE',  pac: 37.90, pac_d: 11, sedex: 54.90, sedex_d: 5 },
  { ini: 64000, fim: 64999, uf: 'PI',  pac: 37.90, pac_d: 12, sedex: 54.90, sedex_d: 6 },
  { ini: 65000, fim: 65999, uf: 'MA',  pac: 39.90, pac_d: 12, sedex: 56.90, sedex_d: 6 },
  { ini: 66000, fim: 68899, uf: 'PA',  pac: 42.90, pac_d: 14, sedex: 62.90, sedex_d: 6 },
  { ini: 68900, fim: 68999, uf: 'AP',  pac: 44.90, pac_d: 15, sedex: 64.90, sedex_d: 7 },
  { ini: 69000, fim: 69299, uf: 'AM',  pac: 44.90, pac_d: 15, sedex: 64.90, sedex_d: 7 },
  { ini: 69300, fim: 69399, uf: 'RR',  pac: 46.90, pac_d: 16, sedex: 66.90, sedex_d: 8 },
  { ini: 69400, fim: 69899, uf: 'AM',  pac: 44.90, pac_d: 15, sedex: 64.90, sedex_d: 7 },
  { ini: 69900, fim: 69999, uf: 'AC',  pac: 46.90, pac_d: 16, sedex: 66.90, sedex_d: 8 },
  { ini: 70000, fim: 73699, uf: 'DF',  pac: 33.90, pac_d: 9,  sedex: 49.90, sedex_d: 4 },
  { ini: 73700, fim: 76799, uf: 'GO',  pac: 33.90, pac_d: 9,  sedex: 49.90, sedex_d: 4 },
  { ini: 76800, fim: 76999, uf: 'GO',  pac: 33.90, pac_d: 9,  sedex: 49.90, sedex_d: 4 },
  { ini: 77000, fim: 77999, uf: 'TO',  pac: 38.90, pac_d: 12, sedex: 56.90, sedex_d: 6 },
  { ini: 78000, fim: 78899, uf: 'MT',  pac: 38.90, pac_d: 12, sedex: 56.90, sedex_d: 6 },
  { ini: 78900, fim: 78999, uf: 'RO',  pac: 42.90, pac_d: 14, sedex: 62.90, sedex_d: 7 },
  { ini: 79000, fim: 79999, uf: 'MS',  pac: 33.90, pac_d: 9,  sedex: 49.90, sedex_d: 4 },
  { ini: 80000, fim: 87999, uf: 'PR',  pac: 28.90, pac_d: 7,  sedex: 42.90, sedex_d: 3 },
  { ini: 88000, fim: 89999, uf: 'SC',  pac: 29.90, pac_d: 8,  sedex: 44.90, sedex_d: 3 },
  { ini: 90000, fim: 99999, uf: 'RS',  pac: 31.90, pac_d: 8,  sedex: 46.90, sedex_d: 3 }
];

function calcularFrete(e) {
  var params = e.parameter;
  var cepDestino = (params.cep_destino || '').replace(/\D/g, '');
  var cepOrigem = (params.cep_origem || '24360220').replace(/\D/g, '');
  
  // O Melhor Envio pede dimensões mínimas e peso em KG
  var pesoGramas = parseFloat(params.peso_g) || 300;
  var pesoKg = Math.max(0.1, pesoGramas / 1000);
  
  var comp = Math.max(16, parseFloat(params.comprimento) || 16);
  var larg = Math.max(11, parseFloat(params.largura) || 11);
  var alt  = Math.max(10, parseFloat(params.altura) || 10);

  if (!cepDestino || cepDestino.length !== 8) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: 'CEP inválido.' })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var opcoes = [];

  // TENTATIVA 1: API do Melhor Envio
  if (MELHOR_ENVIO_TOKEN) {
    var payloadME = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cepDestino },
      package: {
        weight: pesoKg,
        width: larg,
        height: alt,
        length: comp
      }
    };

    var optionsME = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Accept": "application/json",
        "Authorization": "Bearer " + MELHOR_ENVIO_TOKEN,
        "User-Agent": "NitGifts (suporte@nitgifts.com)"
      },
      payload: JSON.stringify(payloadME),
      muteHttpExceptions: true
    };

    try {
      var responseME = UrlFetchApp.fetch(MELHOR_ENVIO_API_URL, optionsME);
      var jsonME = JSON.parse(responseME.getContentText());
      
      if (Array.isArray(jsonME)) {
        for (var i = 0; i < jsonME.length; i++) {
          var svc = jsonME[i];
          // Só adiciona se não tem erro, tem preço, e se o serviço estiver na lista permitida
          if (!svc.error && svc.price && MELHOR_ENVIO_SERVICOS.indexOf(svc.id) !== -1) {
            opcoes.push({
              codigo: svc.id.toString(),
              nome: svc.company.name + " " + svc.name,
              preco: parseFloat(svc.price),
              prazo: svc.delivery_time + " dias úteis",
              erro: ""
            });
          }
        }
      }
    } catch(err) {
      Logger.log("Erro API Melhor Envio: " + err);
    }
  }

  // TENTATIVA 2 (Fallback): Se a API falhou ou não retornou nada, usa Tabela Fixa
  if (opcoes.length === 0) {
    var cepNum = parseInt(cepDestino, 10);
    var adicionalPeso = 0;
    if (pesoGramas > 1000) {
      adicionalPeso = Math.ceil((pesoGramas - 1000) / 500) * 2;
    }

    var faixa = null;
    for (var k = 0; k < TABELA_FRETE.length; k++) {
      if (cepNum >= TABELA_FRETE[k].ini && cepNum <= TABELA_FRETE[k].fim) {
        faixa = TABELA_FRETE[k];
        break;
      }
    }

    if (!faixa) {
      faixa = { pac: 42.90, pac_d: 14, sedex: 62.90, sedex_d: 6 };
    }

    opcoes = [
      {
        codigo: '04510',
        nome: 'Correios PAC',
        preco: parseFloat((faixa.pac + adicionalPeso).toFixed(2)),
        prazo: faixa.pac_d + ' a ' + (faixa.pac_d + 3) + ' dias úteis',
        erro: ''
      },
      {
        codigo: '04014',
        nome: 'Correios SEDEX',
        preco: parseFloat((faixa.sedex + adicionalPeso).toFixed(2)),
        prazo: faixa.sedex_d + ' a ' + (faixa.sedex_d + 2) + ' dias úteis',
        erro: ''
      }
    ];
  }

  // Ordenar sempre pelo mais barato primeiro
  opcoes.sort(function(a, b) {
    return a.preco - b.preco;
  });

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, opcoes: opcoes })
  ).setMimeType(ContentService.MimeType.JSON);
}
